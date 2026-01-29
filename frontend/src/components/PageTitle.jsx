export default function PageTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <p className="label text-teal-600/80">School Management</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
        {title}
      </h2>
      {subtitle ? <p className="text-slate-500 mt-1">{subtitle}</p> : null}
    </div>
  );
}
