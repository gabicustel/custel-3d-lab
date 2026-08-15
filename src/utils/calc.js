// Funções puras e reutilizáveis: estoque, parcelas, totais e buscas.

export function stockStatus(product) {
  if (product.stock <= 0) return 'Sem estoque';
  if (product.stock <= product.minStock) return 'Estoque baixo';
  return 'Normal';
}

export function stockStatusBadge(status) {
  if (status === 'Sem estoque') return 'badge-danger';
  if (status === 'Estoque baixo') return 'badge-warn';
  return 'badge-ok';
}

export function formatMoney(value) {
  return (Number(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(isoDate) {
  if (!isoDate) return '-';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function addMonthsIso(isoDate, months) {
  const d = new Date(isoDate + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

// Recalcula o status de cada parcela (marca como Atrasado se venceu e não foi paga).
export function refreshInstallmentStatus(installments) {
  const today = todayIso();
  return installments.map((inst) => {
    if (inst.status === 'Pago') return inst;
    if (inst.dueDate < today) return { ...inst, status: 'Atrasado' };
    return { ...inst, status: 'Pendente' };
  });
}

export function consignmentSummary(consignment) {
  const installments = refreshInstallmentStatus(consignment.installments);
  const paid = installments.filter((i) => i.status === 'Pago');
  const pending = installments.filter((i) => i.status !== 'Pago');
  const overdue = installments.filter((i) => i.status === 'Atrasado');
  const totalPaid = paid.reduce((s, i) => s + (i.paidValue || i.value), 0);
  const totalRemaining = consignment.total - totalPaid;
  const nextDue = pending
    .slice()
    .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1))[0];
  return {
    installments,
    paidCount: paid.length,
    pendingCount: pending.length,
    overdueCount: overdue.length,
    totalPaid,
    totalRemaining,
    nextDueDate: nextDue ? nextDue.dueDate : null,
  };
}

export function matchesSearch(term, ...fields) {
  if (!term) return true;
  const t = term.trim().toLowerCase();
  return fields.some((f) => (f || '').toString().toLowerCase().includes(t));
}

export function generateInstallments(total, count, firstDueDate, periodicity) {
  const value = Math.round((total / count) * 100) / 100;
  const step = periodicity === 'Quinzenal' ? 0.5 : periodicity === 'Semanal' ? 0.25 : 1;
  const installments = [];
  for (let n = 1; n <= count; n++) {
    let due;
    if (periodicity === 'Mensal') due = addMonthsIso(firstDueDate, n - 1);
    else {
      const d = new Date(firstDueDate + 'T00:00:00');
      const daysStep = periodicity === 'Semanal' ? 7 : periodicity === 'Quinzenal' ? 15 : 30;
      d.setDate(d.getDate() + daysStep * (n - 1));
      due = d.toISOString().slice(0, 10);
    }
    // Ajusta a última parcela para bater exatamente com o total (arredondamentos).
    const isLast = n === count;
    const accumulated = value * (count - 1);
    const finalValue = isLast ? Math.round((total - accumulated) * 100) / 100 : value;
    installments.push({ n, value: finalValue, dueDate: due, status: 'Pendente', paidDate: null, paidValue: 0 });
  }
  return installments;
}
