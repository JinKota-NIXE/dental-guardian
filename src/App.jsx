import { useState } from "react";

export default function App() {
  const [start, setStart] = useState(false);
  return start ? (
    <h2 style={{ textAlign: "center", marginTop: "40vh" }}>🚀 Game Screen (あとでCanvasを入れる)</h2>
  ) : (
    <div style={{ textAlign: "center", marginTop: "40vh" }}>
      <h1>Dental Guardian</h1>
      <button onClick={() => setStart(true)}>START</button>
    </div>
  );
}
