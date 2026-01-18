export default function Button({ children, variant = "primary", ...props }) {
  const base = "px-4 py-2 rounded-xl font-semibold transition";
  const styles =
    variant === "danger"
      ? "bg-red-500 hover:bg-red-600 text-white"
      : variant === "outline"
      ? "border hover:bg-gray-50"
      : "bg-indigo-600 hover:bg-indigo-700 text-white";

  return (
    <button {...props} className={`${base} ${styles} ${props.className || ""}`}>
      {children}
    </button>
  );
}
