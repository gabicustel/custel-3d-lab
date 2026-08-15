import { saveCollection, isSeeded, markSeeded } from './storage';

// Datas relativas a hoje, para que o dashboard sempre mostre exemplos
// coerentes (parcela paga, pendente e atrasada) não importa quando o
// sistema for aberto.
function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function seedIfNeeded() {
  if (isSeeded()) return;

  const products = [
    { id: 1, code: '789123456789', name: 'Camiseta Rosa', description: 'Camiseta 100% algodão, estampa personalizada', category: 'Vestuário', costPrice: 28, salePrice: 80, stock: 14, minStock: 5, createdAt: addDays(-40) },
    { id: 2, code: '789123456790', name: 'Caneca Personalizada', description: 'Caneca de cerâmica 325ml com impressão UV', category: 'Personalizados', costPrice: 12, salePrice: 35, stock: 3, minStock: 5, createdAt: addDays(-35) },
    { id: 3, code: '789123456791', name: 'Chaveiro 3D', description: 'Chaveiro impresso em 3D, PLA colorido', category: 'Personalizados', costPrice: 4, salePrice: 20, stock: 0, minStock: 3, createdAt: addDays(-30) },
    { id: 4, code: '789123456792', name: 'Enfeite Decorativo', description: 'Enfeite decorativo impresso em 3D', category: 'Decoração', costPrice: 15, salePrice: 45, stock: 22, minStock: 4, createdAt: addDays(-20) },
  ];

  const customers = [
    { id: 1, name: 'Fulano da Silva', phone: '(11) 98888-1234', cpf: '111.222.333-44', notes: '', createdAt: addDays(-25) },
    { id: 2, name: 'Maria Oliveira', phone: '(11) 97777-5678', cpf: '', notes: 'Cliente frequente', createdAt: addDays(-18) },
  ];

  const stockEntries = [
    { id: 1, date: addDays(-38), productId: 1, code: '789123456789', name: 'Camiseta Rosa', qty: 20, costValue: 28 },
    { id: 2, date: addDays(-33), productId: 2, code: '789123456790', name: 'Caneca Personalizada', qty: 15, costValue: 12 },
    { id: 3, date: addDays(-15), productId: 4, code: '789123456792', name: 'Enfeite Decorativo', qty: 25, costValue: 15 },
  ];

  const sales = [
    {
      id: 1,
      date: addDays(-10),
      customerId: 2,
      items: [{ productId: 2, code: '789123456790', name: 'Caneca Personalizada', qty: 2, price: 35 }],
      subtotal: 70, discount: 0, total: 70,
      paymentMethod: 'PIX',
    },
    {
      id: 2,
      date: addDays(-3),
      customerId: null,
      items: [
        { productId: 1, code: '789123456789', name: 'Camiseta Rosa', qty: 1, price: 80 },
        { productId: 3, code: '789123456791', name: 'Chaveiro 3D', qty: 3, price: 20 },
      ],
      subtotal: 140, discount: 10, total: 130,
      paymentMethod: 'Cartão',
    },
  ];

  // Consignação de exemplo: Fulano da Silva, 6 parcelas.
  // Parcela 1: paga | Parcela 2: pendente (a vencer) | Parcela 3: atrasada
  const consignmentInstallments = [
    { n: 1, value: 100, dueDate: addDays(-20), status: 'Pago', paidDate: addDays(-19), paidValue: 100 },
    { n: 2, value: 100, dueDate: addDays(10), status: 'Pendente', paidDate: null, paidValue: 0 },
    { n: 3, value: 100, dueDate: addDays(-5), status: 'Atrasado', paidDate: null, paidValue: 0 },
    { n: 4, value: 100, dueDate: addDays(40), status: 'Pendente', paidDate: null, paidValue: 0 },
    { n: 5, value: 100, dueDate: addDays(70), status: 'Pendente', paidDate: null, paidValue: 0 },
    { n: 6, value: 100, dueDate: addDays(100), status: 'Pendente', paidDate: null, paidValue: 0 },
  ];

  const consignments = [
    {
      id: 1,
      customerId: 1,
      date: addDays(-20),
      items: [{ productId: 4, name: 'Enfeite Decorativo', qty: 2, price: 45 }, { productId: 1, name: 'Camiseta Rosa', qty: 5, price: 62 }],
      total: 600,
      installmentsCount: 6,
      installmentValue: 100,
      firstDueDate: addDays(-20),
      periodicity: 'Mensal',
      installments: consignmentInstallments,
    },
  ];

  const history = [
    { id: 1, date: addDays(-38), type: 'Entrada', ref: 'Camiseta Rosa', value: 560, qty: 20 },
    { id: 2, date: addDays(-33), type: 'Entrada', ref: 'Caneca Personalizada', value: 180, qty: 15 },
    { id: 3, date: addDays(-20), type: 'Consignação', ref: 'Fulano da Silva', value: 600, qty: null },
    { id: 4, date: addDays(-19), type: 'Pagamento', ref: 'Fulano da Silva - Parcela 1/6', value: 100, qty: null },
    { id: 5, date: addDays(-15), type: 'Entrada', ref: 'Enfeite Decorativo', value: 375, qty: 25 },
    { id: 6, date: addDays(-10), type: 'Venda', ref: 'Maria Oliveira', value: 70, qty: 2 },
    { id: 7, date: addDays(-3), type: 'Venda', ref: 'Venda balcão', value: 130, qty: 4 },
  ];

  saveCollection('products', products);
  saveCollection('customers', customers);
  saveCollection('stockEntries', stockEntries);
  saveCollection('sales', sales);
  saveCollection('consignments', consignments);
  saveCollection('history', history);
  markSeeded();
}
