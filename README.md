# CUSTEL 3D LAB

Sistema de controle de estoque, vendas e consignações/parcelamentos.

## Como instalar

```bash
npm install
```

## Como executar (desenvolvimento)

```bash
npm run dev
```

O sistema abrirá em `http://localhost:5173`.

## Usuário e senha padrão

- **Usuário:** admin
- **Senha:** admin123

(Pode ser alterado em `src/data/authConfig.js`.)

## Como gerar a versão de produção

```bash
npm run build
```

Os arquivos finais ficam na pasta `dist/`.

## Observações

- Os dados são armazenados no LocalStorage do navegador. A camada de acesso
  a dados está isolada em `src/data/storage.js` e `src/data/DataContext.jsx`,
  para facilitar a troca futura por um banco de dados online.
- O sistema já vem com dados de exemplo para teste imediato.
