import { useEffect, useMemo, useRef } from "react";
import Button from "./Button";

const initialsFromName = (name = "") =>
  String(name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

export default function ProfileImagePicker({
  label = "Profile Picture",
  name = "",
  imageUrl = "",
  file = null,
  removed = false,
  onChange,
  onRemove,
  size = "large",
  framed = true,
}) {
  const inputRef = useRef(null);
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  const previewUrl = removed ? "" : objectUrl || imageUrl;
  const avatarSize = size === "compact" ? "h-24 w-24" : "h-36 w-36";

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const pickImage = () => inputRef.current?.click();
  const wrapperClass = framed
    ? "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
    : "";

  const removeImage = () => {
    if (inputRef.current) inputRef.current.value = "";
    onRemove?.();
  };

  return (
    <div className={wrapperClass}>
      <p className="label">{label}</p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className={`${avatarSize} flex shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 text-3xl font-semibold text-slate-500 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.65)] ring-1 ring-slate-200`}
        >
          {previewUrl ? (
            <img src={previewUrl} alt={name || "Profile"} className="h-full w-full object-cover" />
          ) : (
            <span>{initialsFromName(name)}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{name || "Profile photo"}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Upload a clear square photo. It will appear in dashboards, lists, and messages.
          </p>
          {file ? <p className="mt-2 truncate text-xs font-semibold text-teal-700">{file.name}</p> : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={pickImage}>
              {previewUrl ? "Change Photo" : "Upload Photo"}
            </Button>
            {previewUrl || file ? (
              <Button type="button" variant="outline" onClick={removeImage}>
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(event) => onChange?.(event.target.files?.[0] || null)}
        className="hidden"
      />
    </div>
  );
}
