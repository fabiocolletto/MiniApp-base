export default function Home({ navigate }) {
  return (
    <div style={{ padding: 20 }}>
      <h1>Home</h1>
      <button onClick={() => navigate("miniapps")}>Miniapps</button>
    </div>
  );
}