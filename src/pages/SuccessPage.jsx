import { Link } from 'react-router-dom';

export default function SuccessPage() {
  return (
    <main style={{ textAlign: 'center', padding: '4rem' }}>
      <h1>🎉 Pedido confirmado!</h1>
      <p>Seu pagamento foi realizado com sucesso.</p>

      <Link to="/">
        Voltar para loja
      </Link>
    </main>
  );
}