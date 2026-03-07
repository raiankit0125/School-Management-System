export default function PageTitle({ title, subtitle }) {
  return (
    <div className="mb-6 rounded-[28px] border border-white/70 bg-white/60 px-5 py-5 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.38)] backdrop-blur">
      <p className="label text-sky-700/80">Academic Workspace</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p> : null}
    </div>
  );
}
