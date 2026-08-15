import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../data/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '◆', end: true },
  { to: '/produtos', label: 'Produtos', icon: '◧' },
  { to: '/entrada', label: 'Entrada', icon: '↧' },
  { to: '/vendas', label: 'Vendas / Saídas', icon: '↥' },
  { to: '/estoque', label: 'Estoque', icon: '▤' },
  { to: '/clientes', label: 'Clientes', icon: '◍' },
  { to: '/consignacoes', label: 'Consignações / Parcelamentos', icon: '◔' },
  { to: '/relatorios', label: 'Relatórios', icon: '▥' },
  { to: '/configuracoes', label: 'Configurações', icon: '⚙' },
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar desktop */}
      <aside className="sidebar-desktop glass" style={sidebarStyle}>
        <Brand />
        <nav style={{ marginTop: 30, flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </nav>
        <button className="btn btn-ghost" style={{ width: '100%' }} onClick={handleLogout}>
          ⏻ Sair
        </button>
      </aside>

      {/* Mobile topbar */}
      <div className="topbar-mobile glass" style={topbarStyle}>
        <Brand small />
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>☰ Menu</button>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)} style={{ alignItems: 'stretch', justifyContent: 'flex-end', padding: 0 }}>
          <div className="glass-strong" onClick={(e) => e.stopPropagation()} style={{ width: 270, height: '100%', padding: 22, display: 'flex', flexDirection: 'column', borderRadius: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Brand />
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>✕</button>
            </div>
            <nav style={{ marginTop: 24, flex: 1 }}>
              {NAV_ITEMS.map((item) => (
                <NavItem key={item.to} item={item} onClick={() => setOpen(false)} />
              ))}
            </nav>
            <button className="btn btn-ghost" style={{ width: '100%' }} onClick={handleLogout}>⏻ Sair</button>
          </div>
        </div>
      )}

      <main className="main-content" style={mainStyle}>{children}</main>
    </div>
  );
}

function Brand({ small }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: small ? 30 : 38, height: small ? 30 : 38, borderRadius: 11,
        background: 'linear-gradient(135deg, var(--pink-400), var(--pink-600))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: small ? 15 : 18,
        boxShadow: '0 4px 14px rgba(214,82,143,0.4)',
      }}>C</div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: small ? 15 : 17, lineHeight: 1.1 }}>CUSTEL</div>
        <div style={{ fontSize: small ? 9.5 : 10.5, letterSpacing: '.12em', color: 'var(--pink-600)', fontWeight: 700 }}>3D LAB</div>
      </div>
    </div>
  );
}

function NavItem({ item, onClick }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 14px', borderRadius: 12, marginBottom: 3,
        fontSize: 13.5, fontWeight: 600,
        color: isActive ? '#fff' : 'var(--ink-soft)',
        background: isActive ? 'linear-gradient(135deg, var(--pink-500), var(--pink-600))' : 'transparent',
        boxShadow: isActive ? '0 4px 14px rgba(214,82,143,0.35)' : 'none',
        transition: 'all .15s ease',
      })}
    >
      <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{item.icon}</span>
      {item.label}
    </NavLink>
  );
}

const sidebarStyle = {
  width: 250, padding: '24px 18px', display: 'flex', flexDirection: 'column',
  position: 'sticky', top: 16, height: 'calc(100vh - 32px)', margin: 16, marginRight: 0,
};

const topbarStyle = {
  display: 'none', padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between',
  position: 'sticky', top: 0, zIndex: 40, margin: '10px 10px 0',
};

const mainStyle = { flex: 1, padding: '28px 32px', minWidth: 0 };
