import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loadCollection, saveCollection, nextId } from './storage';
import { seedIfNeeded } from './seed';
import { todayIso, generateInstallments } from '../utils/calc';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  seedIfNeeded();

  const [products, setProducts] = useState(() => loadCollection('products'));
  const [customers, setCustomers] = useState(() => loadCollection('customers'));
  const [stockEntries, setStockEntries] = useState(() => loadCollection('stockEntries'));
  const [sales, setSales] = useState(() => loadCollection('sales'));
  const [consignments, setConsignments] = useState(() => loadCollection('consignments'));
  const [history, setHistory] = useState(() => loadCollection('history'));

  useEffect(() => saveCollection('products', products), [products]);
  useEffect(() => saveCollection('customers', customers), [customers]);
  useEffect(() => saveCollection('stockEntries', stockEntries), [stockEntries]);
  useEffect(() => saveCollection('sales', sales), [sales]);
  useEffect(() => saveCollection('consignments', consignments), [consignments]);
  useEffect(() => saveCollection('history', history), [history]);

  const addHistory = useCallback((entry) => {
    setHistory((h) => [{ id: nextId(h), date: todayIso(), ...entry }, ...h]);
  }, []);

  // ---------- Produtos ----------
  const addProduct = (product) => {
    setProducts((list) => [...list, { ...product, id: nextId(list), createdAt: todayIso() }]);
  };
  const updateProduct = (id, patch) => {
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const deleteProduct = (id) => {
    setProducts((list) => list.filter((p) => p.id !== id));
  };
  const adjustStock = (productId, delta) => {
    setProducts((list) => list.map((p) => (p.id === productId ? { ...p, stock: p.stock + delta } : p)));
  };

  // ---------- Clientes ----------
  const addCustomer = (customer) => {
    setCustomers((list) => [...list, { ...customer, id: nextId(list), createdAt: todayIso() }]);
  };
  const updateCustomer = (id, patch) => {
    setCustomers((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };
  const deleteCustomer = (id) => {
    setCustomers((list) => list.filter((c) => c.id !== id));
  };

  // ---------- Entrada de estoque ----------
  const registerStockEntry = (entry) => {
    setStockEntries((list) => [...list, { ...entry, id: nextId(list), date: todayIso() }]);
    adjustStock(entry.productId, entry.qty);
    addHistory({ type: 'Entrada', ref: entry.name, value: entry.qty * entry.costValue, qty: entry.qty });
  };

  // ---------- Vendas ----------
  const registerSale = (sale) => {
    setSales((list) => [...list, { ...sale, id: nextId(list), date: todayIso() }]);
    sale.items.forEach((item) => adjustStock(item.productId, -item.qty));
    const customerName = sale.customerId
      ? customers.find((c) => c.id === sale.customerId)?.name
      : 'Venda balcão';
    addHistory({ type: 'Venda', ref: customerName || 'Venda balcão', value: sale.total, qty: sale.items.reduce((s, i) => s + i.qty, 0) });
  };

  // ---------- Consignações / Parcelamentos ----------
  const registerConsignment = ({ customerId, items, total, installmentsCount, firstDueDate, periodicity }) => {
    const installments = generateInstallments(total, installmentsCount, firstDueDate, periodicity);
    const record = {
      id: nextId(consignments),
      customerId,
      date: todayIso(),
      items,
      total,
      installmentsCount,
      installmentValue: installments[0]?.value || 0,
      firstDueDate,
      periodicity,
      installments,
    };
    setConsignments((list) => [...list, record]);
    items.forEach((item) => adjustStock(item.productId, -item.qty));
    const customerName = customers.find((c) => c.id === customerId)?.name || 'Cliente';
    addHistory({ type: 'Consignação', ref: customerName, value: total, qty: items.reduce((s, i) => s + i.qty, 0) });
  };

  const registerPayment = (consignmentId, installmentN, paidValue, paidDate) => {
    setConsignments((list) =>
      list.map((c) => {
        if (c.id !== consignmentId) return c;
        const installments = c.installments.map((inst) =>
          inst.n === installmentN ? { ...inst, status: 'Pago', paidValue, paidDate } : inst
        );
        return { ...c, installments };
      })
    );
    const consignment = consignments.find((c) => c.id === consignmentId);
    const customerName = customers.find((c) => c.id === consignment?.customerId)?.name || 'Cliente';
    addHistory({ type: 'Pagamento', ref: `${customerName} - Parcela ${installmentN}/${consignment?.installmentsCount}`, value: paidValue, qty: null });
  };

  const value = {
    products, addProduct, updateProduct, deleteProduct,
    customers, addCustomer, updateCustomer, deleteCustomer,
    stockEntries, registerStockEntry,
    sales, registerSale,
    consignments, registerConsignment, registerPayment,
    history,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData deve ser usado dentro de DataProvider');
  return ctx;
}
