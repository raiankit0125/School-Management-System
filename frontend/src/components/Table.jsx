export default function Table({ columns = [], data = [] }) {
  return (
    <div className="table-wrap">
      <table className="min-w-full text-left">
        <thead className="table-head border-b border-slate-200/70">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="p-4 text-[11px] font-semibold">
                {c.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="p-6 text-slate-500" colSpan={columns.length}>
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
              >
                {columns.map((c) => (
                  <td key={c.key} className="p-4 text-sm text-slate-700">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
