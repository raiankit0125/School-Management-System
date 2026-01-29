import { useState } from "react";

export default function Input({ label, type, className, showToggle = true, ...props }) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showToggle ? (reveal ? "text" : "password") : type;

  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <div className="relative mt-1">
        <input
          {...props}
          type={inputType}
          className={`input-field ${isPassword && showToggle ? "pr-20" : ""} ${className || ""}`}
        />
        {isPassword && showToggle ? (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            aria-label={reveal ? "Hide password" : "Show password"}
          >
            {reveal ? "Hide" : "Show"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
