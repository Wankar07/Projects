import { LoaderCircle, SearchX } from "lucide-react";
export const Button = ({ children, variant = "", ...props }) => (
  <button className={`btn ${variant}`} {...props}>
    {children}
  </button>
);
export const PageHeader = ({ eyebrow, title, description, action }) => (
  <div className="page-header">
    <div>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
    {action}
  </div>
);
export const Loading = () => (
  <div className="state">
    <LoaderCircle className="spin" />
    <p>Loading live data…</p>
  </div>
);
export const Empty = ({
  title = "Nothing here yet",
  message = "New records will appear here.",
}) => (
  <div className="state">
    <SearchX />
    <h3>{title}</h3>
    <p>{message}</p>
  </div>
);
export const Badge = ({ children, tone = "neutral" }) => (
  <span className={`badge ${tone}`}>{children}</span>
);
export const Modal = ({ title, subtitle, onClose, children }) => (
  <div className="modal-backdrop" onMouseDown={onClose}>
    <section
      className="modal"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="modal-head">
        <div>
          <span className="eyebrow">QUICK ACTION</span>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button className="icon-btn" onClick={onClose}>
          ×
        </button>
      </div>
      {children}
    </section>
  </div>
);
export const Field = ({ label, children, hint }) => (
  <label className="field">
    <span>{label}</span>
    {children}
    {hint && <small>{hint}</small>}
  </label>
);
export function DataTable({ columns, rows, keyField = "id", emptyMessage }) {
  if (!rows.length) return <Empty message={emptyMessage} />;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[keyField]}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
