import { useState, useMemo } from 'react';
import { useData } from '../data/DataContext';
import { formatMoney, formatDate, stockStatus, consignmentSummary } from '../utils/calc';

const TABS = ['Estoque', 'Entradas', 'Vendas', 'A receber', 'Parcelas atrasadas'];

export default function Reports() {
  const { products, stockEntries, sales, consignments, customers } = useData();
  const [tab, setTab] = useState('Estoque');

  const rows = useMemo(() => {
    if (tab === 'Estoque') {
      return {
        headers: ['Código', 'Produto', 'Categoria', 'Estoque', 'Status', 'Preço'],
        data: products.map((p) => [p.code, p.name, p.category, p.stock, stockStatus(p), formatMoney(p.salePrice)]),
      };
    }
    if (tab === 'Entradas') {
      return {
        headers: ['Data', 'Produto', 'Quantidade', 'Valor de custo'],
        data: stockEntries.map((e) => [formatDate(e.date), e.name, e.qty, formatMoney(e.costValue)]),
      };
    }
    if (tab === 'Vendas') {
      return {
        headers: ['Data', 'Cliente', 'Itens', 'Pagamento', 'Total'],
        data: sales.map((s) => [
          formatDate(s.date),
          s.customerId ? customers.find((c) => c.id === s.customerId)?.name || '-' : 'Venda balcão',
          s.items.map((i) => `${i.qty}x ${i.name}`).join(', '),
          s.paymentMethod,
          formatMoney(s.total),
        ]),
      };
    }
    if (tab === 'A receber') {
      return {
        headers: ['Cliente', 'Total', 'Pago', 'Restante', 'Próx. vencimento'],
        data: consignments.map((c) => {
          const s = consignmentSummary(c);
          const customer = customers.find((cu) => cu.id === c.customerId)?.name || '-';
          return [customer, formatMoney(c.total), formatMoney(s.totalPaid), formatMoney(s.totalRemaining), s.nextDueDate ? formatDate(s.nextDueDate) : '-'];
        }),
      };
    }
    // Parcelas atrasadas
    const overdue = [];
    consignments.forEach((c) => {
      const s = consignmentSummary(c);
      const customer = customers.find((cu) => cu.id === c.customerId)?.name || '-';
      s.installments.filter((i) => i.status === 'Atrasado').forEach((i) => {
        overdue.push([customer, `${i.n}/${c.installmentsCount}`, formatDate(i.dueDate), formatMoney(i.value)]);
      });
    });
    return { headers: ['Cliente', 'Parcela', 'Vencimento', 'Valor'], data: overdue };
  }, [tab, products, stockEntries, sales, consignments, customers]);

  const handlePrint = () => window.print();

  const handleExportCsv = () => {
    const csv = [rows.headers.join(';'), ...rows.data.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${tab.toLowerCase().replace(/\s/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="page-title">Relatórios</h1>
      <p className="page-sub">Relatórios simples para acompanhamento da loja.</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {TABS.map((t) => (
          <button key={t} className={t === tab ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="glass card-pad">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ fontSize: 16 }}>Relatório de {tab.toLowerCase()}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={handleExportCsv}>Exportar CSV</button>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>Imprimir</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>{rows.headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.data.map((r, idx) => (
                <tr key={idx}>{r.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
              ))}
              {rows.data.length === 0 && <tr><td colSpan={rows.headers.length}><p className="empty-state">Nenhum dado disponível.</p></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
