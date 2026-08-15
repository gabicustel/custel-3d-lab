import { useState } from 'react';
import { useData } from '../data/DataContext';
import Modal from '../components/Modal';
import { formatMoney, matchesSearch, stockStatus, stockStatusBadge } from '../utils/calc';

const emptyForm = { code: '', name: '', description: '', category: '', costPrice: '', salePrice: '', stock: '', minStock: '' };

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const categories = ['Todas', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const filtered = products.filter((p) =>
    (category === 'Todas' || p.category === category) && matchesSearch(search, p.code, p.name)
  );

  const openNew = () => { setForm(emptyForm); setEditingId(null); setError(''); setModalOpen(true); };
  const openEdit = (p) => {
    setForm({ ...p, costPrice: p.costPrice, salePrice: p.salePrice, stock: p.stock, minStock: p.minStock });
    setEditingId(p.id); setError(''); setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) { setError('Código e nome são obrigatórios.'); return; }
    const duplicate = products.find((p) => p.code === form.code.trim() && p.id !== editingId);
    if (duplicate) { setError('Já existe um produto com esse código.'); return; }

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description,
      category: form.category || 'Geral',
      costPrice: Number(form.costPrice) || 0,
      salePrice: Number(form.salePrice) || 0,
      stock: Number(form.stock) || 0,
      minStock: Number(form.minStock) || 0,
    };

    if (editingId) updateProduct(editingId, payload);
    else addProduct(payload);
    setModalOpen(false);
  };

  const handleDelete = (p) => {
    if (confirm(`Excluir o produto "${p.name}"?`)) deleteProduct(p.id);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Produtos</h1>
          <p className="page-sub">Cadastre e gerencie os produtos da loja.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Novo Produto</button>
      </div>

      <div className="glass card-pad" style={{ marginBottom: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input className="input" style={{ maxWidth: 320 }} placeholder="Pesquisar por código ou nome" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" style={{ maxWidth: 200 }} value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="glass table-wrap">
        <table>
          <thead>
            <tr><th>Código</th><th>Produto</th><th>Categoria</th><th>Custo</th><th>Venda</th><th>Estoque</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.code}</td>
                <td><strong>{p.name}</strong></td>
                <td>{p.category}</td>
                <td>{formatMoney(p.costPrice)}</td>
                <td>{formatMoney(p.salePrice)}</td>
                <td>{p.stock}</td>
                <td><span className={`badge ${stockStatusBadge(stockStatus(p))}`}>{stockStatus(p)}</span></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>Excluir</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8}><p className="empty-state">Nenhum produto encontrado.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editingId ? 'Editar Produto' : 'Novo Produto'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Código (único)</label>
              <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="field">
              <label>Nome</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Descrição</label>
              <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="field">
              <label>Categoria</label>
              <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Preço de custo</label>
                <input className="input" type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
              </div>
              <div className="field">
                <label>Preço de venda</label>
                <input className="input" type="number" step="0.01" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
              </div>
              <div className="field">
                <label>Estoque atual</label>
                <input className="input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div className="field">
                <label>Estoque mínimo</label>
                <input className="input" type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} />
              </div>
            </div>
            {error && <p style={{ color: '#b8283f', fontSize: 13, marginBottom: 10 }}>{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Salvar</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
