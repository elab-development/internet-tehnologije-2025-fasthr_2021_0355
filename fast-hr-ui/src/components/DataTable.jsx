import { Table } from "react-bootstrap";

export default function DataTable({ columns, rows, onRowClick }) {
  return (
    <div className="hr-table">
      <Table responsive className="mb-0">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={onRowClick ? "table-row-clickable" : ""}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
