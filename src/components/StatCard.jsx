export default function StatCard({ label, value, icon, tone = 'pink' }) {
  const tones = {
    pink: { bg: 'linear-gradient(135deg, var(--pink-400), var(--pink-600))', color: '#fff' },
    soft: { bg: 'var(--pink-100)', color: 'var(--pink-700)' },
    danger: { bg: 'rgba(216,70,90,0.12)', color: '#b8283f' },
    warn: { bg: 'rgba(230,165,40,0.16)', color: '#9a6a0a' },
  };
  const t = tones[tone] || tones.pink;

  return (
    <div className="glass card-pad stat-card">
      <div className="stat-icon" style={{ background: t.bg, color: t.color }}>{icon}</div>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}
