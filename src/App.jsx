import { useState } from "react";
import GameCanvas from "./GameCanvas";

export default function App() {
  const [started, setStarted] = useState(false);

  return started ? (
    <GameCanvas />
  ) : (
    <div style={{ textAlign: "center", marginTop: "40vh" }}>
      <h1>Dental Guardian</h1>
      <button onClick={() => setStarted(true)}>START</button>
    </div>
  );
}
