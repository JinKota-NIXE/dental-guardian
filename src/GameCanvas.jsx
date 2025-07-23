import { useEffect, useRef } from "react";

const W = 360, H = 640;

export default function GameCanvas() {
  const cvsRef = useRef(null);

  useEffect(() => {
    const cvs = cvsRef.current;
    const ctx = cvs.getContext("2d");
    cvs.width = W; cvs.height = H;

    // 画像
    const playerImg = new Image();
    playerImg.src = "/img/player_tbrush.png";
    const bulletImg = new Image();
    bulletImg.src = "/img/weapon_brush_shot.png";
    const enemyImg = new Image();
    enemyImg.src = "/img/enemy_cavity_a.png";

    // 状態変数
    let px = W / 2 - 60, py = H - 120;
    const bullets = [];  // {x,y}
    const enemies = [];  // {x,y}
    let score = 0, frame = 0;

    // 入力：移動
    const move = e => {
      const rect = cvs.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      px = Math.max(0, Math.min(x - 60, W - 120)); // 画面外に出ない
    };
    cvs.addEventListener("mousemove", move);
    cvs.addEventListener("touchmove", move);

    // 入力：弾発射（スペース or タップ）
    const shoot = () => bullets.push({ x: px + 44, y: py - 10 });
    window.addEventListener("keydown", e => e.code === "Space" && shoot());
    cvs.addEventListener("click", shoot);

    // 画像ロード後メインループ
    enemyImg.onload = () => {
      const loop = () => {
        frame++;

        /* 更新 ---------- */
        // 弾
        bullets.forEach(b => b.y -= 8);
        // 敵
        if (frame % 60 === 0)                      // 1 秒ごと
          enemies.push({ x: Math.random() * (W-100), y: -100 });
        enemies.forEach(e => e.y += 2);

        // 当たり判定（矩形）
        bullets.forEach((b, bi) => {
          enemies.forEach((e, ei) => {
            if (b.x < e.x+100 && b.x+32 > e.x && b.y < e.y+100 && b.y+32 > e.y) {
              bullets.splice(bi,1); enemies.splice(ei,1);
              score++;
            }
          });
        });

        // 画面外を削除
        bullets.filter(b => b.y > -32);
        enemies.filter(e => e.y < H+100);

        /* 描画 ---------- */
        ctx.fillStyle = "#f4faff";
        ctx.fillRect(0,0,W,H);

        // 背景が欲しければここで drawImage(bg, ...) も可

        ctx.drawImage(playerImg, px, py, 120, 120);
        bullets.forEach(b => ctx.drawImage(bulletImg, b.x, b.y, 32, 32));
        enemies.forEach(e => ctx.drawImage(enemyImg, e.x, e.y, 100, 100));

        // スコア
        ctx.fillStyle = "#000";
        ctx.font = "20px sans-serif";
        ctx.fillText("Score: "+score, 10, 30);

        requestAnimationFrame(loop);
      };
      loop();
    };

    return () => {
      cvs.removeEventListener("mousemove", move);
      cvs.removeEventListener("touchmove", move);
      window.removeEventListener("keydown", shoot);
      cvs.removeEventListener("click", shoot);
    };
  }, []);

  return <canvas ref={cvsRef}></canvas>;
}
