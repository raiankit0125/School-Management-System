from pathlib import Path
import re
import sys
import textwrap


PAGE_WIDTH = 595
PAGE_HEIGHT = 842
MARGIN_X = 54
MARGIN_TOP = 54
MARGIN_BOTTOM = 54
BODY_SIZE = 10
LINE_HEIGHT = 14


def escape_pdf_text(value):
    value = value.encode("latin-1", "replace").decode("latin-1")
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def clean_markdown(value):
    value = re.sub(r"`([^`]+)`", r"\1", value)
    value = re.sub(r"\*\*([^*]+)\*\*", r"\1", value)
    value = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", value)
    return value


def render_lines(markdown):
    in_code = False
    lines = []

    for raw in markdown.splitlines():
        line = raw.rstrip()
        stripped = line.strip()

        if stripped.startswith("```"):
            in_code = not in_code
            continue

        if in_code:
            if stripped:
                lines.append(("code", stripped))
            else:
                lines.append(("blank", ""))
            continue

        if not stripped:
            lines.append(("blank", ""))
            continue

        if stripped.startswith("# "):
            lines.append(("title", clean_markdown(stripped[2:])))
        elif stripped.startswith("## "):
            lines.append(("h2", clean_markdown(stripped[3:])))
        elif stripped.startswith("### "):
            lines.append(("h3", clean_markdown(stripped[4:])))
        elif stripped.startswith("- "):
            lines.append(("bullet", clean_markdown(stripped[2:])))
        else:
            lines.append(("body", clean_markdown(stripped)))

    return lines


def wrap_text(text, style):
    widths = {
        "title": 44,
        "h2": 58,
        "h3": 66,
        "bullet": 82,
        "body": 88,
        "code": 76,
    }
    return textwrap.wrap(text, width=widths.get(style, 88), break_long_words=False) or [""]


def layout_pages(markdown):
    pages = []
    current = []
    y = PAGE_HEIGHT - MARGIN_TOP

    def add_page():
        nonlocal current, y
        if current:
            pages.append(current)
        current = []
        y = PAGE_HEIGHT - MARGIN_TOP

    for style, text in render_lines(markdown):
        if style == "blank":
            y -= 8
            if y < MARGIN_BOTTOM:
                add_page()
            continue

        font_size = {
            "title": 22,
            "h2": 15,
            "h3": 12,
            "code": 9,
        }.get(style, BODY_SIZE)
        spacing_before = {
            "title": 4,
            "h2": 12,
            "h3": 8,
            "bullet": 1,
            "code": 1,
        }.get(style, 1)
        line_height = {
            "title": 27,
            "h2": 20,
            "h3": 16,
            "code": 12,
        }.get(style, LINE_HEIGHT)

        wrapped = wrap_text(text, style)
        block_height = spacing_before + (len(wrapped) * line_height)
        if y - block_height < MARGIN_BOTTOM:
            add_page()

        y -= spacing_before
        for index, part in enumerate(wrapped):
            x = MARGIN_X
            rendered = part
            if style == "bullet":
                x += 12
                rendered = ("- " if index == 0 else "  ") + part
            current.append((style, x, y, font_size, rendered))
            y -= line_height

    if current:
        pages.append(current)
    return pages


def build_pdf(markdown):
    pages = layout_pages(markdown)
    objects = []

    def add_object(content):
        objects.append(content)
        return len(objects)

    font_regular = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    font_bold = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
    font_code = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>")

    page_ids = []
    content_ids = []
    for page_number, page in enumerate(pages, start=1):
        stream_lines = ["BT"]
        for style, x, y, font_size, text in page:
            font = "F1"
            if style in {"title", "h2", "h3"}:
                font = "F2"
            if style == "code":
                font = "F3"
            stream_lines.append(f"/{font} {font_size} Tf")
            stream_lines.append(f"1 0 0 1 {x} {y} Tm")
            stream_lines.append(f"({escape_pdf_text(text)}) Tj")
        stream_lines.append("/F1 8 Tf")
        stream_lines.append(f"1 0 0 1 {PAGE_WIDTH - 110} 28 Tm")
        stream_lines.append(f"(Page {page_number} of {len(pages)}) Tj")
        stream_lines.append("ET")
        stream = "\n".join(stream_lines)
        content_ids.append(add_object(f"<< /Length {len(stream.encode('latin-1'))} >>\nstream\n{stream}\nendstream"))
        page_ids.append(None)

    pages_id = len(objects) + len(pages) + 1
    for index, content_id in enumerate(content_ids):
        page_ids[index] = add_object(
            f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 {PAGE_WIDTH} {PAGE_HEIGHT}] "
            f"/Resources << /Font << /F1 {font_regular} 0 R /F2 {font_bold} 0 R /F3 {font_code} 0 R >> >> "
            f"/Contents {content_id} 0 R >>"
        )

    kids = " ".join(f"{page_id} 0 R" for page_id in page_ids)
    pages_obj_id = add_object(f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>")
    catalog_id = add_object(f"<< /Type /Catalog /Pages {pages_obj_id} 0 R >>")

    output = ["%PDF-1.4\n"]
    offsets = [0]
    for obj_id, obj in enumerate(objects, start=1):
        offsets.append(sum(len(part.encode("latin-1")) for part in output))
        output.append(f"{obj_id} 0 obj\n{obj}\nendobj\n")

    xref_offset = sum(len(part.encode("latin-1")) for part in output)
    output.append(f"xref\n0 {len(objects) + 1}\n")
    output.append("0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.append(f"{offset:010d} 00000 n \n")
    output.append(
        f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\n"
        f"startxref\n{xref_offset}\n%%EOF\n"
    )
    return "".join(output).encode("latin-1")


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python scripts/generate_pdf.py input.md output.pdf")

    source = Path(sys.argv[1])
    target = Path(sys.argv[2])
    markdown = source.read_text(encoding="utf-8")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(build_pdf(markdown))
    print(f"Generated {target}")


if __name__ == "__main__":
    main()
