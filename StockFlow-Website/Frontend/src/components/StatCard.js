import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StatCard({
  label,
  value,
  caption,
  icon: Icon,
  tone = "violet",
  to,
  onClick,
}) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (to) {
      navigate(to);
    }
  };

  const isClickable = Boolean(to || onClick);

  return (
    <article
      className={`stat-card ${tone} ${isClickable ? "cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]" : ""}`}
      onClick={handleClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === "Enter" && handleClick(e) : undefined}
    >
      <div className="stat-top">
        <span>{label}</span>
        <i>
          <Icon size={19} />
        </i>
      </div>
      <strong>{value}</strong>
      <div className="stat-caption">
        <ArrowUpRight size={14} />
        {caption}
      </div>
    </article>
  );
}
