import { useEffect, useRef } from "react";

export default function GameCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // ステージ初期化（サイズなど）
    canvas.width = 360;
    canvas.height = 640;

    // 背景描画（仮）
    ctx.fillStyle = "#e0f7fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 歯ブラシプレイヤー（仮の四角）
    ctx.fillStyle = "#00796b";
    ctx.fillRect(150, 550, 60, 60);
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
