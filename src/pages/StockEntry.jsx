import { useState } from 'react';
import { useData } from '../data/DataContext';
import ProductFinder from '../components/ProductFinder';
import { formatMoney, formatDate } from '../utils/calc';

export default function StockEntry() {
  const { stockEntries, registerStockEntry } = useData();
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [cost, setCost] = useState('');
  const [message, setMessage] = useState('');

  const handleSelect = (product) => {
    setSelected(product);
    setCost(product.costPrice);
    setQty(1);
    setMessage('');
  };

  const handleSubmit = () => {
    if (!selected || qty <= 0) return;
    registerStockEntry({ productId: selected.id, code: selected.code, name: selected.name, qty: Number(qty), costValue: Number(cost) });
    setMessage(`Entrada registrada: +${qty} ${selected.name}`);
    setSelected(null);
    setQty(1);
    setCost('');
  };

  const recent = [...stockEntries].reverse().slice(0, 8);

  return (
    <div>
      <h1 className="page-title">Entrada de Estoque</h1>
      <p className="page-sub">Registre a chegada de novos produtos.</p>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="glass card-pad">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Localizar produto</h3>
          <ProductFinder onSelect={handleSelect} placeholder="Código de barras ou nome do produto" />

          {message && <p style={{ color: '#1d7a4c', fontSize: 13, marginTop: 12 }}>{message}</p>}

          {selected && (
            <div className="glass" style={{ marginTop: 18, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <strong>{selected.name}</strong>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{selected.code} · Estoque atual: {selected.stock}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Quantidade</label>
                  <input className="input" type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
                </div>
                <div className="field">
                  <label>Valor de custo (unitário)</label>
                  <input className="input" type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} />
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit}>Registrar Entrada</button>
            </div>
          )}
        </div>

        <div className="glass card-pad">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Histórico de entradas</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Data</th><th>Produto</th><th>Qtd.</th><th>Custo</th></tr></thead>
              <tbody>
                {recent.map((e) => (
                  <tr key={e.id}>
                    <td>{formatDate(e.date)}</td>
                    <td>{e.name}</td>
                    <td>+{e.qty}</td>
                    <td>{formatMoney(e.costValue)}</td>
                  </tr>
                ))}
                {recent.length === 0 && <tr><td colSpan={4}><p className="empty-state">Nenhuma entrada registrada.</p></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
