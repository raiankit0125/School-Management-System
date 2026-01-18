export default function Table({ columns = [], data = [] }) {
  return (
    <div className="overflow-auto border rounded-2xl bg-white shadow">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="p-4 text-sm text-gray-600 font-semibold">
                {c.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="p-4 text-gray-500" colSpan={columns.length}>
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="border-b last:border-b-0 hover:bg-gray-50">
                {columns.map((c) => (
                  <td key={c.key} className="p-4 text-sm text-gray-800">
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
