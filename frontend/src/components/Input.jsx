export default function Input({ label, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="text-sm text-gray-600">{label}</label>}
      <input
        {...props}
        className="w-full border rounded-xl p-3 mt-1 outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
