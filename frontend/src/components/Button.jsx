export default function Button({ children, variant = "primary", ...props }) {
  const base = "btn";
  const styles =
    variant === "danger"
      ? "btn-danger"
      : variant === "outline"
      ? "btn-outline"
      : "btn-primary";

  return (
    <button {...props} className={`${base} ${styles} ${props.className || ""}`}>
      {children}
    </button>
  );
}
