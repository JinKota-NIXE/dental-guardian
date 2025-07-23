import { useEffect, useRef } from "react";

const W = 360;
const H = 640;

export default function GameCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    const ctx = cvs.getContext("2d");
    cvs.width = W;
    cvs.height = H;

    // 歯ブラシ画像を読み込む（public/img にあるので先頭は /img/）
    const playerImg = new Image();
    playerImg.src = "/img/player_tbrush.png";

    let x = W / 2 - 60;
    const y = H - 120;

    // 指･マウスで左右移動
    const move = (e) => {
      const rect = cvs.getBoundingClientRect();
      const posX =
        (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      x = posX - 60; // 画像幅 120px の半分
    };
    cvs.addEventListener("mousemove", move);
    cvs.addEventListener("touchmove", move);

    // 画像が読み込めたらゲームループ開始
    playerImg.onload = () => {
      const loop = () => {
        ctx.fillStyle = "#f4faff";        // 背景クリア
        ctx.fillRect(0, 0, W, H);

        ctx.drawImage(playerImg, x, y, 120, 120); // プレイヤー

        requestAnimationFrame(loop);
      };
      loop();
    };

    // 後片付け
    return () => {
      cvs.removeEventListener("mousemove", move);
      cvs.removeEventListener("touchmove", move);
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}




