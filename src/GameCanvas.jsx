import { useEffect, useRef, useState } from "react";

const W = 360, H = 640;
const MAX_LIFE = 3;              // ライフ上限

export default function GameCanvas() {
  const cvsRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);   // React state で結果画面に切替
  // const [flashAlpha, setFlashAlpha] = useState(false); // ダメージ時のフラッシュ状態を管理
  const flashAlphaRef = useRef(false);

  // ダメージ時に呼ばれる関数
  /*
  function handlePlayerDamage() {
    setFlashAlpha(0.5); // 一瞬赤くする
    setTimeout(() => setFlashAlpha(0), 100); // 100ms後に戻す
  }
  */

  useEffect(() => {
    if (gameOver) return;        // 終了後にループを走らせない

    const cvs = cvsRef.current;
    const ctx = cvs.getContext("2d");
    cvs.width = W; cvs.height = H;

    /* === 画像 === */
    const bgImg     = new Image();
    const playerImg = new Image();
    const bulletImg = new Image();
    const enemyImg  = new Image();

    bgImg.src     = "/img/bg_tooth_surface.png";
    playerImg.src = "/img/player_tbrush.png";
    bulletImg.src = "/img/weapon_brush_shot.png";
    enemyImg.src  = "/img/enemy_cavity_a.png";

    /* === 状態 === */
    let px = W / 2 - 60, py = H - 120;
    const bullets = [], enemies = [];
    let score = 0, frame = 0;

    /* ライフとゲームオーバーフラグ */
    let life = MAX_LIFE;
    let bgScale = 1.0, ZOOM_SPEED = 0.00003;

    /* === 入力 === */
    const move = (e) => {
      const r = cvs.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      px = Math.max(0, Math.min(x - 60, W - 120));
    };
    cvs.addEventListener("mousemove", move);
    cvs.addEventListener("touchmove", move);

    const shoot = () => bullets.push({ x: px + 44, y: py - 10 });
    window.addEventListener("keydown", (e) => e.code === "Space" && shoot());
    cvs.addEventListener("click", shoot);

    /* === メインループ === */
    enemyImg.onload = () => {
      const loop = () => {
        frame++;

        /* --- 更新 --- */
        bgScale += ZOOM_SPEED;

        bullets.forEach((b) => (b.y -= 8));
        if (frame % 60 === 0) enemies.push({ x: Math.random() * (W - 100), y: -100 });
        enemies.forEach((e) => (e.y += 2));

        /* 当たり判定（弾→敵） */
        bullets.forEach((b, bi) => {
          enemies.forEach((e, ei) => {
            if (rectHit(b.x, b.y, 32, 32, e.x, e.y, 100, 100)) {
              bullets.splice(bi, 1);
              enemies.splice(ei, 1);
              score++;
            }
          });
        });

        /* 当たり判定（敵→プレイヤー） */
        enemies.forEach((e, ei) => {
          if (rectHit(px, py, 120, 120, e.x, e.y, 100, 100)) {
            enemies.splice(ei, 1);   // 敵を消す
            life--;                  // ライフを減らす
            flashAlphaRef.current = true;
            setTimeout(() => {
              flashAlphaRef.current = false;
            }, 100);
            if (life <= 0) {
              setGameOver(true);     // React state 更新
            }
          }
        });

        

        /* --- 描画 --- */
        // 背景（ゆっくり拡大）
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);
        const bw = bgImg.width * bgScale;
        const bh = bgImg.height * bgScale;
        ctx.drawImage(bgImg, (W - bw) / 2, (H - bh) / 2, bw, bh);

        // ゲームオブジェクト
        ctx.drawImage(playerImg, px, py, 120, 120);
        bullets.forEach((b) => ctx.drawImage(bulletImg, b.x, b.y, 32, 32));
        enemies.forEach((e) => ctx.drawImage(enemyImg, e.x, e.y, 100, 100));

        // スコア
        ctx.fillStyle = "#000";
        ctx.font = "20px sans-serif";
        ctx.fillText("Score: " + score, 10, 30);

        // ライフゲージ（シンプルに❤️テキスト）
        ctx.fillText("HP: " + "❤️".repeat(life), 10, 55);
        
        // フラッシュ演出（Canvasの最後に描画）
        if (flashAlphaRef.current) {
          ctx.save();
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = "red";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
        
        if (!gameOver) requestAnimationFrame(loop);
      };
      loop();
    };

    /* --- クリーンアップ --- */
    return () => {
      cvs.removeEventListener("mousemove", move);
      cvs.removeEventListener("touchmove", move);
      cvs.removeEventListener("click", shoot);
      window.removeEventListener("keydown", shoot);
    };
  }, [gameOver, flashAlphaRef]);

  /* ユーティリティ：矩形ヒット判定 */
  const rectHit = (x1, y1, w1, h1, x2, y2, w2, h2) =>
    x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;

  /* ゲームオーバー画面 */
  if (gameOver) {
    return (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#000",
          color: "#fff",
        }}
      >
        <h1>GAME OVER</h1>
        <button onClick={() => window.location.reload()}>TRY AGAIN</button>
      </div>
    );
  }

  /* 通常時はキャンバス */
  return <canvas ref={cvsRef}></canvas>;
}
