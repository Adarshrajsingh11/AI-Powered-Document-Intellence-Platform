export default function DashboardStats({ stats }) {
  const items = [
    { label: 'Total documents', value: stats.total },
    { label: 'Ready', value: stats.ready },
    { label: 'Processing', value: stats.processing },
    { label: 'Failed', value: stats.failed },
  ];
  return (
    <div className="stats-grid">
      {items.map((i) => (
        <div key={i.label} className="card stat">
          <div className="stat-value">{i.value}</div>
          <div className="muted">{i.label}</div>
        </div>
      ))}
    </div>
  );
}
