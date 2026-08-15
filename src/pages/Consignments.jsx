import { useState, useMemo } from 'react';
import { useData } from '../data/DataContext';
import Modal from '../components/Modal';
import ProductFinder from '../components/ProductFinder';
import { formatMoney, formatDate, consignmentSummary, todayIso } from '../utils/calc';

export default function Consignments() {
  const { consignments, customers } = useData();
  const [newOpen, setNewOpen] = useState(false);
  const [payModal, setPayModal] = useState(null); // { consignment, installment }
  const [expanded, setExpanded] = useState(null);

  const items = useMemo(
    () => consignments.map((c) => ({ c, summary: consignmentSummary(c), customer: customers.find((cu) => cu.id === c.customerId) })),
    [consignments, customers]
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Consignações / Parcelamentos</h1>
          <p className="page-sub">Controle de vendas parceladas e vencimentos.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setNewOpen(true)}>+ Nova Consignação</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
        {items.length === 0 && <div className="glass card-pad"><p className="empty-state">Nenhuma consignação registrada.</p></div>}

        {items.map(({ c, summary, customer }) => (
          <div key={c.id} className="glass card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 17 }}>{customer?.name || 'Cliente removido'}</h3>
                <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
                  {c.items.map((i) => `${i.qty}x ${i.name}`).join(', ')} — {formatDate(c.date)}
                </p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                {expanded === c.id ? 'Ocultar parcelas' : 'Ver parcelas'}
              </button>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', marginTop: 16 }}>
              <MiniStat label="Compra" value={formatMoney(c.total)} />
              <MiniStat label="Pago" value={formatMoney(summary.totalPaid)} />
              <MiniStat label="Restante" value={formatMoney(summary.totalRemaining)} />
              <MiniStat label="Parcelas" value={`${summary.paidCount}/${c.installmentsCount} pagas`} />
              <MiniStat label="Próximo vencimento" value={summary.nextDueDate ? formatDate(summary.nextDueDate) : '—'} />
            </div>

            {summary.overdueCount > 0 && (
              <p style={{ color: '#b8283f', fontWeight: 700, fontSize: 13, marginTop: 12 }}>⚠ {summary.overdueCount} parcela(s) atrasada(s)</p>
            )}

            {expanded === c.id && (
              <div className="table-wrap" style={{ marginTop: 16 }}>
                <table>
                  <thead><tr><th>Parcela</th><th>Vencimento</th><th>Valor</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {summary.installments.map((inst) => (
                      <tr key={inst.n}>
                        <td>{inst.n}/{c.installmentsCount}</td>
                        <td>{formatDate(inst.dueDate)}</td>
                        <td>{formatMoney(inst.value)}</td>
                        <td>
                          <span className={`badge ${inst.status === 'Pago' ? 'badge-ok' : inst.status === 'Atrasado' ? 'badge-danger' : 'badge-warn'}`}>
                            {inst.status}
                          </span>
                        </td>
                        <td>
                          {inst.status !== 'Pago' && (
                            <button className="btn btn-primary btn-sm" onClick={() => setPayModal({ consignment: c, installment: inst, customerName: customer?.name })}>
                              Registrar pagamento
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {newOpen && <NewConsignmentModal onClose={() => setNewOpen(false)} />}
      {payModal && <PaymentModal data={payModal} onClose={() => setPayModal(null)} />}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="glass" style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.5)' }}>
      <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 15.5, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function NewConsignmentModal({ onClose }) {
  const { customers, registerConsignment } = useData();
  const [customerId, setCustomerId] = useState('');
  const [picked, setPicked] = useState(null);
  const [pickQty, setPickQty] = useState(1);
  const [cart, setCart] = useState([]);
  const [installmentsCount, setInstallmentsCount] = useState(3);
  const [firstDueDate, setFirstDueDate] = useState(todayIso());
  const [periodicity, setPeriodicity] = useState('Mensal');
  const [error, setError] = useState('');

  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
  const installmentPreview = installmentsCount > 0 ? total / installmentsCount : 0;

  const addToCart = () => {
    if (!picked) return;
    setCart((c) => {
      const existing = c.find((i) => i.productId === picked.id);
      if (existing) return c.map((i) => (i.productId === picked.id ? { ...i, qty: i.qty + Number(pickQty) } : i));
      return [...c, { productId: picked.id, name: picked.name, price: picked.salePrice, qty: Number(pickQty) }];
    });
    setPicked(null);
    setPickQty(1);
  };

  const removeItem = (productId) => setCart((c) => c.filter((i) => i.productId !== productId));

  const handleSubmit = () => {
    if (!customerId) { setError('Selecione um cliente.'); return; }
    if (cart.length === 0) { setError('Adicione ao menos um produto.'); return; }
    if (!firstDueDate) { setError('Informe a data do primeiro vencimento.'); return; }
    registerConsignment({ customerId: Number(customerId), items: cart, total, installmentsCount: Number(installmentsCount), firstDueDate, periodicity });
    onClose();
  };

  return (
    <Modal title="Nova Consignação / Parcelamento" onClose={onClose} width={620}>
      <div className="field">
        <label>Cliente</label>
        <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
          <option value="">Selecione...</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <label>Produtos</label>
      <ProductFinder onSelect={(p) => { setPicked(p); setPickQty(1); }} />
      {picked && (
        <div className="glass" style={{ marginTop: 10, padding: 14, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div><strong>{picked.name}</strong><div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{formatMoney(picked.salePrice)}</div></div>
          <div className="field" style={{ marginBottom: 0, width: 90 }}>
            <label>Qtd.</label>
            <input className="input" type="number" min="1" value={pickQty} onChange={(e) => setPickQty(e.target.value)} />
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={addToCart}>Adicionar</button>
        </div>
      )}

      {cart.length > 0 && (
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table>
            <thead><tr><th>Produto</th><th>Qtd.</th><th>Preço</th><th>Total</th><th></th></tr></thead>
            <tbody>
              {cart.map((i) => (
                <tr key={i.productId}>
                  <td>{i.name}</td><td>{i.qty}</td><td>{formatMoney(i.price)}</td><td>{formatMoney(i.qty * i.price)}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => removeItem(i.productId)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 16 }}>
        <div className="field"><label>Parcelas</label><input className="input" type="number" min="1" value={installmentsCount} onChange={(e) => setInstallmentsCount(e.target.value)} /></div>
        <div className="field"><label>1º vencimento</label><input className="input" type="date" value={firstDueDate} onChange={(e) => setFirstDueDate(e.target.value)} /></div>
        <div className="field">
          <label>Periodicidade</label>
          <select className="input" value={periodicity} onChange={(e) => setPeriodicity(e.target.value)}>
            <option>Mensal</option><option>Quinzenal</option><option>Semanal</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '14px 0', fontSize: 14 }}>
        <span>Valor total: <strong>{formatMoney(total)}</strong></span>
        <span>{installmentsCount}x de <strong>{formatMoney(installmentPreview)}</strong></span>
      </div>

      {error && <p style={{ color: '#b8283f', fontSize: 13, marginBottom: 10 }}>{error}</p>}
      <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit}>Criar Consignação</button>
    </Modal>
  );
}

function PaymentModal({ data, onClose }) {
  const { registerPayment } = useData();
  const { consignment, installment, customerName } = data;
  const [paidValue, setPaidValue] = useState(installment.value);
  const [paidDate, setPaidDate] = useState(todayIso());

  const handleSubmit = () => {
    registerPayment(consignment.id, installment.n, Number(paidValue), paidDate);
    onClose();
  };

  return (
    <Modal title="Registrar Pagamento" onClose={onClose}>
      <div className="glass" style={{ padding: 14, marginBottom: 16 }}>
        <p style={{ fontSize: 13 }}>Cliente: <strong>{customerName}</strong></p>
        <p style={{ fontSize: 13 }}>Parcela: <strong>{installment.n}/{consignment.installmentsCount}</strong></p>
        <p style={{ fontSize: 13 }}>Vencimento: <strong>{formatDate(installment.dueDate)}</strong></p>
        <p style={{ fontSize: 13 }}>Valor da parcela: <strong>{formatMoney(installment.value)}</strong></p>
      </div>
      <div className="field"><label>Valor pago</label><input className="input" type="number" step="0.01" value={paidValue} onChange={(e) => setPaidValue(e.target.value)} /></div>
      <div className="field"><label>Data do pagamento</label><input className="input" type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} /></div>
      <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit}>Confirmar pagamento</button>
    </Modal>
  );
}
