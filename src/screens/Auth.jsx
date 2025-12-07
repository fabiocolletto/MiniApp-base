export default function Auth({ navigate }) {
  return (
    <div style={{ padding: 20 }}>
      <h1>Autenticação</h1>
      <button onClick={() => navigate("home")}>Entrar</button>
    </div>
  );
}