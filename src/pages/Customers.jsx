import { useState } from 'react';
import { useData } from '../data/DataContext';
import Modal from '../components/Modal';
import { formatMoney, formatDate, matchesSearch, consignmentSummary } from '../utils/calc';

const emptyForm = { name: '', phone: '', cpf: '', notes: '' };

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, sales, consignments } = useData();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [detailsCustomer, setDetailsCustomer] = useState(null);

  const filtered = customers.filter((c) => matchesSearch(search, c.name, c.phone));

  const openNew = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (c) => { setForm(c); setEditingId(c.id); setModalOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) updateCustomer(editingId, form);
    else addCustomer(form);
    setModalOpen(false);
  };

  const handleDelete = (c) => {
    if (confirm(`Excluir o cliente "${c.name}"?`)) deleteCustomer(c.id);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-sub">Cadastro e histórico de clientes.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Cadastrar Cliente</button>
      </div>

      <div className="glass card-pad" style={{ marginBottom: 18 }}>
        <input className="input" style={{ maxWidth: 320 }} placeholder="Pesquisar por nome ou telefone" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="glass table-wrap">
        <table>
          <thead><tr><th>Nome</th><th>Telefone</th><th>CPF</th><th></th></tr></thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td><button className="btn-link" style={linkStyle} onClick={() => setDetailsCustomer(c)}>{c.name}</button></td>
                <td>{c.phone}</td>
                <td>{c.cpf || '-'}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>Excluir</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4}><p className="empty-state">Nenhum cliente encontrado.</p></td></tr>}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editingId ? 'Editar Cliente' : 'Cadastrar Cliente'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            <div className="field"><label>Nome</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label>Telefone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="field"><label>CPF (opcional)</label><input className="input" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} /></div>
            <div className="field"><label>Observações</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Salvar</button>
          </form>
        </Modal>
      )}

      {detailsCustomer && (
        <CustomerDetails
          customer={detailsCustomer}
          sales={sales.filter((s) => s.customerId === detailsCustomer.id)}
          consignments={consignments.filter((c) => c.customerId === detailsCustomer.id)}
          onClose={() => setDetailsCustomer(null)}
        />
      )}
    </div>
  );
}

function CustomerDetails({ customer, sales, consignments, onClose }) {
  const totalSalesValue = sales.reduce((s, sale) => s + sale.total, 0);
  const summaries = consignments.map((c) => consignmentSummary(c));
  const totalPurchasedConsig = consignments.reduce((s, c) => s + c.total, 0);
  const totalPaid = summaries.reduce((s, sm) => s + sm.totalPaid, 0);
  const totalPending = summaries.reduce((s, sm) => s + sm.totalRemaining, 0);
  const overdue = summaries.reduce((s, sm) => s + sm.overdueCount, 0);
  const nextDue = summaries.map((sm) => sm.nextDueDate).filter(Boolean).sort()[0];

  return (
    <Modal title={customer.name} onClose={onClose} width={640}>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 16 }}>{customer.phone} {customer.cpf ? `· ${customer.cpf}` : ''}</p>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 18 }}>
        <MiniStat label="Total comprado" value={formatMoney(totalSalesValue + totalPurchasedConsig)} />
        <MiniStat label="Total pago (parcelado)" value={formatMoney(totalPaid)} />
        <MiniStat label="Total pendente" value={formatMoney(totalPending)} tone={totalPending > 0 ? 'danger' : undefined} />
      </div>

      {overdue > 0 && <p style={{ color: '#b8283f', fontWeight: 700, fontSize: 13, marginBottom: 10 }}>⚠ {overdue} parcela(s) atrasada(s)</p>}
      {nextDue && <p style={{ fontSize: 13, marginBottom: 14 }}>Próximo vencimento: <strong>{formatDate(nextDue)}</strong></p>}

      <h4 style={{ fontSize: 14, marginBottom: 8 }}>Compras à vista</h4>
      {sales.length === 0 ? <p className="empty-state">Nenhuma compra à vista.</p> : (
        <ul style={{ margin: '0 0 16px', paddingLeft: 18, fontSize: 13 }}>
          {sales.map((s) => <li key={s.id}>{formatDate(s.date)} — {s.items.map((i) => `${i.qty}x ${i.name}`).join(', ')} — {formatMoney(s.total)}</li>)}
        </ul>
      )}

      <h4 style={{ fontSize: 14, marginBottom: 8 }}>Compras parceladas</h4>
      {consignments.length === 0 ? <p className="empty-state">Nenhuma compra parcelada.</p> : (
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
          {consignments.map((c) => <li key={c.id}>{formatDate(c.date)} — {c.items.map((i) => `${i.qty}x ${i.name}`).join(', ')} — {formatMoney(c.total)} em {c.installmentsCount}x</li>)}
        </ul>
      )}
    </Modal>
  );
}

function MiniStat({ label, value, tone }) {
  return (
    <div className="glass" style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.03em' }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: tone === 'danger' ? '#b8283f' : 'var(--ink)' }}>{value}</div>
    </div>
  );
}

const linkStyle = { background: 'none', border: 'none', padding: 0, color: 'var(--pink-600)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' };
