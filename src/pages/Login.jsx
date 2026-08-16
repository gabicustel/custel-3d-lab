import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../data/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={blob1} />
      <div style={blob2} />

      <form onSubmit={handleSubmit} className="glass-strong" style={{ width: '100%', maxWidth: 380, padding: '38px 34px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 26 }}>
          <div style={{
            width: 58, height: 58, borderRadius: 18,
            background: 'linear-gradient(135deg, var(--pink-400), var(--pink-600))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26,
            boxShadow: '0 8px 24px rgba(214,82,143,0.45)', marginBottom: 14,
          }}>C</div>
          <h1 style={{ fontSize: 24 }}>CUSTEL</h1>0
          <span style={{ fontSize: 11.5, letterSpacing: '.16em', color: 'var(--pink-600)', fontWeight: 700 }}>3D LAB</span>
        </div>

        <div className="field">
          <label>Usuário</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" autoFocus />
        </div>
        <div className="field">
          <label>Senha</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        {error && <p style={{ color: '#b8283f', fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px 18px', marginTop: 6 }}>
          Entrar
        </button>

        
      </form>
    </div>
  );
}

const blob1 = {
  position: 'absolute', width: 480, height: 480, borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(240,168,201,0.55), transparent 70%)',
  top: -160, left: -140, filter: 'blur(10px)',
};
const blob2 = {
  position: 'absolute', width: 420, height: 420, borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(214,82,143,0.35), transparent 70%)',
  bottom: -140, right: -120, filter: 'blur(10px)',
};
