export default function Miniapps({ navigate }) {
  return (
    <div style={{ padding: 20 }}>
      <h1>Miniapps</h1>
      <button onClick={() => navigate("loader")}>Abrir Miniapp</button>
    </div>
  );
}