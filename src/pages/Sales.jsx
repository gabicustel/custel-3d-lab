import { useState, useMemo } from 'react';
import { useData } from '../data/DataContext';
import ProductFinder from '../components/ProductFinder';
import { formatMoney } from '../utils/calc';

const PAYMENT_METHODS = ['Dinheiro', 'PIX', 'Cartão', 'Consignação / Parcelado'];

export default function Sales() {
  const { registerSale, registerConsignment, customers } = useData();
  const [picked, setPicked] = useState(null);
  const [pickQty, setPickQty] = useState(1);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [customerId, setCustomerId] = useState('');
  const [payment, setPayment] = useState('Dinheiro');
  const [installmentsCount, setInstallmentsCount] = useState(2);
  const [firstDueDate, setFirstDueDate] = useState('');
  const [periodicity, setPeriodicity] = useState('Mensal');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const inCartQty = (productId) => cart.filter((i) => i.productId === productId).reduce((s, i) => s + i.qty, 0);

  const handleSelect = (product) => {
    setPicked(product);
    setPickQty(1);
    setError('');
  };

  const addToCart = () => {
    if (!picked) return;
    const already = inCartQty(picked.id);
    if (already + Number(pickQty) > picked.stock) {
      setError('Quantidade insuficiente em estoque.');
      return;
    }
    setCart((c) => {
      const existing = c.find((i) => i.productId === picked.id);
      if (existing) {
        return c.map((i) => (i.productId === picked.id ? { ...i, qty: i.qty + Number(pickQty) } : i));
      }
      return [...c, { productId: picked.id, code: picked.code, name: picked.name, price: picked.salePrice, qty: Number(pickQty) }];
    });
    setPicked(null);
    setPickQty(1);
    setError('');
  };

  const removeItem = (productId) => setCart((c) => c.filter((i) => i.productId !== productId));

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.qty * i.price, 0), [cart]);
  const total = Math.max(0, subtotal - Number(discount || 0));

  const finalizeSale = () => {
    if (cart.length === 0) { setError('Adicione ao menos um produto à venda.'); return; }
    setError('');

    if (payment === 'Consignação / Parcelado') {
      if (!customerId) { setError('Selecione um cliente para venda parcelada.'); return; }
      if (!firstDueDate) { setError('Informe a data do primeiro vencimento.'); return; }
      registerConsignment({
        customerId: Number(customerId),
        items: cart.map((i) => ({ productId: i.productId, name: i.name, qty: i.qty, price: i.price })),
        total,
        installmentsCount: Number(installmentsCount),
        firstDueDate,
        periodicity,
      });
      setSuccess('Venda parcelada registrada com sucesso!');
    } else {
      registerSale({
        customerId: customerId ? Number(customerId) : null,
        items: cart,
        subtotal, discount: Number(discount) || 0, total,
        paymentMethod: payment,
      });
      setSuccess('Venda finalizada com sucesso!');
    }

    setCart([]);
    setDiscount(0);
    setCustomerId('');
    setPayment('Dinheiro');
    setFirstDueDate('');
    setInstallmentsCount(2);
  };

  return (
    <div>
      <h1 className="page-title">Venda / Saída</h1>
      <p className="page-sub">Registre uma nova venda de produtos.</p>

      <div className="glass card-pad" style={{ marginBottom: 18 }}>
        <label>Código do produto</label>
        <ProductFinder onSelect={handleSelect} placeholder="Escaneie o código de barras ou digite o nome" />

        {picked && (
          <div className="glass" style={{ marginTop: 14, padding: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <strong>{picked.name}</strong>
              <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{picked.code} · Estoque: {picked.stock} · {formatMoney(picked.salePrice)}</div>
            </div>
            <div className="field" style={{ marginBottom: 0, width: 100 }}>
              <label>Quantidade</label>
              <input className="input" type="number" min="1" value={pickQty} onChange={(e) => setPickQty(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={addToCart}>Adicionar à venda</button>
          </div>
        )}
      </div>

      <div className="glass card-pad" style={{ marginBottom: 18 }}>
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Itens da venda</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Produto</th><th>Quantidade</th><th>Preço</th><th>Total</th><th></th></tr></thead>
            <tbody>
              {cart.map((i) => (
                <tr key={i.productId}>
                  <td>{i.name}</td>
                  <td>{i.qty}</td>
                  <td>{formatMoney(i.price)}</td>
                  <td>{formatMoney(i.qty * i.price)}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => removeItem(i.productId)}>Remover</button></td>
                </tr>
              ))}
              {cart.length === 0 && <tr><td colSpan={5}><p className="empty-state">Nenhum item adicionado ainda.</p></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass card-pad">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 }}>
          <div className="field">
            <label>Cliente (opcional)</label>
            <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Venda balcão</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Forma de pagamento</label>
            <select className="input" value={payment} onChange={(e) => setPayment(e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {payment === 'Consignação / Parcelado' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 8 }}>
            <div className="field">
              <label>Quantidade de parcelas</label>
              <input className="input" type="number" min="1" value={installmentsCount} onChange={(e) => setInstallmentsCount(e.target.value)} />
            </div>
            <div className="field">
              <label>Primeiro vencimento</label>
              <input className="input" type="date" value={firstDueDate} onChange={(e) => setFirstDueDate(e.target.value)} />
            </div>
            <div className="field">
              <label>Periodicidade</label>
              <select className="input" value={periodicity} onChange={(e) => setPeriodicity(e.target.value)}>
                <option>Mensal</option>
                <option>Quinzenal</option>
                <option>Semanal</option>
              </select>
            </div>
          </div>
        )}

        {payment !== 'Consignação / Parcelado' && (
          <div className="field" style={{ maxWidth: 200 }}>
            <label>Desconto (R$)</label>
            <input className="input" type="number" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 26, marginTop: 10, marginBottom: 16, fontSize: 14 }}>
          <span>Subtotal: <strong>{formatMoney(subtotal)}</strong></span>
          {payment !== 'Consignação / Parcelado' && <span>Desconto: <strong>{formatMoney(discount)}</strong></span>}
          <span style={{ fontSize: 17 }}>TOTAL: <strong style={{ color: 'var(--pink-600)' }}>{formatMoney(total)}</strong></span>
        </div>

        {error && <p style={{ color: '#b8283f', fontSize: 13, marginBottom: 10 }}>{error}</p>}
        {success && <p style={{ color: '#1d7a4c', fontSize: 13, marginBottom: 10 }}>{success}</p>}

        <button className="btn btn-primary" style={{ width: '100%', padding: '13px 18px' }} onClick={finalizeSale}>
          Finalizar venda
        </button>
      </div>
    </div>
  );
}
