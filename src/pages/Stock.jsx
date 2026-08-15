import { useState } from 'react';
import { useData } from '../data/DataContext';
import { formatMoney, matchesSearch, stockStatus, stockStatusBadge } from '../utils/calc';

const FILTERS = ['Todos', 'Normal', 'Estoque baixo', 'Sem estoque'];

export default function Stock() {
  const { products } = useData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const categories = ['Todas', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const filtered = products.filter((p) => {
    const status = stockStatus(p);
    return (
      matchesSearch(search, p.code, p.name) &&
      (category === 'Todas' || p.category === category) &&
      (statusFilter === 'Todos' || status === statusFilter)
    );
  });

  return (
    <div>
      <h1 className="page-title">Estoque</h1>
      <p className="page-sub">Visão consolidada de todos os produtos.</p>

      <div className="glass card-pad" style={{ marginBottom: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input className="input" style={{ maxWidth: 300 }} placeholder="Pesquisar por código ou nome" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" style={{ maxWidth: 180 }} value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" style={{ maxWidth: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {FILTERS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="glass table-wrap">
        <table>
          <thead>
            <tr><th>Código</th><th>Produto</th><th>Categoria</th><th>Estoque</th><th>Mínimo</th><th>Status</th><th>Preço</th></tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.code}</td>
                <td><strong>{p.name}</strong></td>
                <td>{p.category}</td>
                <td>{p.stock}</td>
                <td>{p.minStock}</td>
                <td><span className={`badge ${stockStatusBadge(stockStatus(p))}`}>{stockStatus(p)}</span></td>
                <td>{formatMoney(p.salePrice)}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7}><p className="empty-state">Nenhum produto encontrado.</p></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
