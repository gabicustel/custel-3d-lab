import { useState } from 'react';
import { useData } from '../data/DataContext';
import { matchesSearch, formatMoney, stockStatus, stockStatusBadge } from '../utils/calc';

// Campo de busca de produto por código ou nome.
// Compatível com leitores de código de barras USB: eles digitam o código
// e enviam "Enter" automaticamente, então basta escutar onKeyDown/Enter.
export default function ProductFinder({ onSelect, placeholder = 'Código de barras ou nome do produto' }) {
  const { products } = useData();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const runSearch = () => {
    setNotFound(false);
    if (!term.trim()) { setResults(null); return; }

    const exact = products.find((p) => p.code === term.trim());
    if (exact) {
      onSelect(exact);
      setTerm('');
      setResults(null);
      return;
    }

    const matches = products.filter((p) => matchesSearch(term, p.code, p.name));
    if (matches.length === 1) {
      onSelect(matches[0]);
      setTerm('');
      setResults(null);
    } else if (matches.length > 1) {
      setResults(matches);
    } else {
      setResults(null);
      setNotFound(true);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          className="input"
          autoFocus
          placeholder={placeholder}
          value={term}
          onChange={(e) => { setTerm(e.target.value); setNotFound(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
        />
        <button type="button" className="btn btn-primary" onClick={runSearch}>Buscar</button>
      </div>

      {notFound && (
        <p style={{ color: '#b8283f', fontSize: 13, marginTop: 8 }}>Produto não encontrado.</p>
      )}

      {results && results.length > 1 && (
        <div className="glass" style={{ marginTop: 10, padding: 6, maxHeight: 220, overflowY: 'auto' }}>
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onSelect(p); setTerm(''); setResults(null); }}
              style={{
                display: 'flex', justifyContent: 'space-between', width: '100%',
                padding: '10px 12px', background: 'transparent', border: 'none',
                borderRadius: 10, cursor: 'pointer', textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(251,230,240,0.5)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span>
                <strong>{p.name}</strong>
                <span style={{ color: 'var(--ink-soft)', fontSize: 12.5, display: 'block' }}>{p.code}</span>
              </span>
              <span style={{ textAlign: 'right' }}>
                <span className={`badge ${stockStatusBadge(stockStatus(p))}`}>{p.stock} un.</span>
                <span style={{ display: 'block', fontSize: 12.5, marginTop: 4 }}>{formatMoney(p.salePrice)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
