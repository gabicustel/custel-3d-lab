import { Link } from 'react-router-dom';
import { useData } from '../data/DataContext';
import StatCard from '../components/StatCard';
import { formatMoney, formatDate, stockStatus, stockStatusBadge, consignmentSummary, todayIso } from '../utils/calc';

export default function Dashboard() {
  const { products, sales, consignments, customers } = useData();

  const totalProducts = products.length;
  const totalStockQty = products.reduce((s, p) => s + p.stock, 0);
  const lowStock = products.filter((p) => stockStatus(p) === 'Estoque baixo');
  const outOfStock = products.filter((p) => stockStatus(p) === 'Sem estoque');
  const stockValue = products.reduce((s, p) => s + p.stock * p.costPrice, 0);
  const totalSales = sales.reduce((s, sale) => s + sale.total, 0);

  const summaries = consignments.map((c) => ({ c, summary: consignmentSummary(c) }));
  const totalReceivable = summaries.reduce((s, { summary }) => s + summary.totalRemaining, 0);
  const overdueCount = summaries.reduce((s, { summary }) => s + summary.overdueCount, 0);

  const today = todayIso();
  const in7 = new Date();
  in7.setDate(in7.getDate() + 7);
  const in7Iso = in7.toISOString().slice(0, 10);

  const upcomingInstallments = summaries
    .flatMap(({ c, summary }) =>
      summary.installments
        .filter((i) => i.status !== 'Pago' && i.dueDate <= in7Iso)
        .map((i) => ({ ...i, customerName: customers.find((cu) => cu.id === c.customerId)?.name || '—', consignmentId: c.id }))
    )
    .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1));

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Visão geral da loja, atualizada em tempo real.</p>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', marginBottom: 22 }}>
        <StatCard label="Total de produtos" value={totalProducts} icon="◧" />
        <StatCard label="Qtd. total em estoque" value={totalStockQty} icon="▤" />
        <StatCard label="Estoque baixo" value={lowStock.length} icon="⚠" tone="warn" />
        <StatCard label="Sem estoque" value={outOfStock.length} icon="✕" tone="danger" />
        <StatCard label="Valor estimado do estoque" value={formatMoney(stockValue)} icon="◆" tone="soft" />
        <StatCard label="Total de vendas/saídas" value={formatMoney(totalSales)} icon="↥" tone="soft" />
        <StatCard label="Total a receber" value={formatMoney(totalReceivable)} icon="◔" />
        <StatCard label="Parcelas atrasadas" value={overdueCount} icon="!" tone="danger" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        <div className="glass card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16 }}>Parcelamentos próximos do vencimento</h3>
            <Link to="/consignacoes" className="btn btn-ghost btn-sm">Ver todas</Link>
          </div>
          {upcomingInstallments.length === 0 ? (
            <p className="empty-state">Nenhuma parcela vencendo nos próximos 7 dias. 🎉</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Cliente</th><th>Parcela</th><th>Vencimento</th><th>Valor</th><th>Status</th></tr></thead>
                <tbody>
                  {upcomingInstallments.slice(0, 6).map((i) => (
                    <tr key={`${i.consignmentId}-${i.n}`}>
                      <td>{i.customerName}</td>
                      <td>{i.n}</td>
                      <td>{formatDate(i.dueDate)}</td>
                      <td>{formatMoney(i.value)}</td>
                      <td><span className={`badge ${i.status === 'Atrasado' ? 'badge-danger' : 'badge-warn'}`}>{i.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="glass card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16 }}>Produtos com estoque baixo</h3>
            <Link to="/estoque" className="btn btn-ghost btn-sm">Ver estoque</Link>
          </div>
          {lowStock.length === 0 && outOfStock.length === 0 ? (
            <p className="empty-state">Estoque saudável em todos os produtos. 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...outOfStock, ...lowStock].map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 4px', borderBottom: '1px solid rgba(232,228,234,0.6)' }}>
                  <div>
                    <strong style={{ fontSize: 13.5 }}>{p.name}</strong>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{p.code}</div>
                  </div>
                  <span className={`badge ${stockStatusBadge(stockStatus(p))}`}>{stockStatus(p)} · {p.stock} un.</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
