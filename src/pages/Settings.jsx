import { useAuth } from '../data/AuthContext';
import { DEFAULT_CREDENTIALS } from '../data/authConfig';

export default function Settings() {
  const { user } = useAuth();

  const handleReset = () => {
    if (confirm('Isso vai apagar todos os dados salvos neste navegador e recarregar os dados de exemplo. Deseja continuar?')) {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('custel_'))
        .forEach((k) => localStorage.removeItem(k));
      window.location.href = '/';
    }
  };

  return (
    <div>
      <h1 className="page-title">Configurações</h1>
      <p className="page-sub">Informações gerais do sistema.</p>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', maxWidth: 800 }}>
        <div className="glass card-pad">
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Conta</h3>
          <p style={{ fontSize: 13.5, marginBottom: 6 }}>Usuário logado: <strong>{user}</strong></p>
          <p style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>
            Usuário e senha padrão: <strong>{DEFAULT_CREDENTIALS.username}</strong> / <strong>{DEFAULT_CREDENTIALS.password}</strong>
          </p>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 8 }}>
            Para alterar, edite o arquivo <code>src/data/authConfig.js</code>.
          </p>
        </div>

        <div className="glass card-pad">
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Armazenamento</h3>
          <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 14 }}>
            Os dados são salvos localmente no navegador (LocalStorage). Para reiniciar o sistema com os dados de exemplo, use o botão abaixo.
          </p>
          <button className="btn btn-danger" onClick={handleReset}>Restaurar dados de exemplo</button>
        </div>
      </div>
    </div>
  );
}
