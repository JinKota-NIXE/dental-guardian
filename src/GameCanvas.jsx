import { useEffect, useRef, useState } from "react";

const W = 360, H = 640;
const MAX_LIFE = 3;              // ライフ上限

export default function GameCanvas() {
  const cvsRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);   // React state で結果画面に切替
  const gameClearRef = useRef(false); // ゲームクリア状態を管理
  const bossRef = useRef(false); // ボス出現状態を管理
  const flashAlphaRef = useRef(false); // ダメージ時のフラッシュ状態を管理

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
    const bossImg = new Image();

    bgImg.src     = "/img/bg_tooth_surface.png";
    playerImg.src = "/img/player_tbrush.png";
    bulletImg.src = "/img/weapon_brush_shot.png";
    enemyImg.src  = "/img/enemy_cavity_a.png";
    bossImg.src = "/img/_dammy___afloimagemart_215016841.webp";

    /* === 状態 === */
    let px = W / 2 - 60, py = H - 120;
    const bullets = [], enemies = [];
    let score = 0, frame = 0, enemiesCount = 0, boss = null, bossHP = 10;

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

        // 敵出現
        if (frame % 60 === 0 && !bossRef.current && !gameClearRef.current) {
          console.log("true1");
          enemies.push({ x: Math.random() * (W - 100), y: -100 });
        }
        enemies.forEach((e) => (e.y += 2));

        // ボス出現（スコア50ごとに(初回は20から)、ボスがまだ出現していない場合）
        let ifFlag = false;
        if (score === 20 && !bossRef.current) {
          console.log("if ... true1");
          ifFlag = true;
        } else if (score !== 0 && score % 30 === 0 && !bossRef.current) {
          console.log("if ... true2");
          ifFlag = true;
        }
        if (ifFlag) {
          console.log("true2");
          boss = { x: W / 2 - 100, y: -200 }; // 初期位置は画面外上
          bossRef.current = true;
        }

        // ボス出現時の動作
        if (bossRef.current) {
          console.log("true3");
          if (boss.y < 50) {
            boss.y += 1; // ゆっくり降りてくる
          }
        }

        /* 当たり判定（弾→敵） */
        bullets.forEach((b, bi) => {
          enemies.forEach((e, ei) => {
            if (rectHit(b.x, b.y, 32, 32, e.x, e.y, 100, 100)) {
              bullets.splice(bi, 1);
              enemies.splice(ei, 1);
              score++;
              /*
              if (score >= 10) {
                gameClearRef.current = true; // ゲームクリアフラグ更新
                setTimeout(() => {
                  gameClearRef.current = false;
                }, 5000); // 5000ms後に戻す
              }
              */
            }
          });
        });

        /* 当たり判定（弾→ボス） */
        if (bossRef.current) {
          bullets.forEach((b, bi) => {
            console.log("true4");
            if (rectHit(b.x, b.y, 32, 32, boss.x, boss.y, 200, 200)) {
              bullets.splice(bi, 1);
              bossHP--;
              console.log("before/bossHP ... " + bossHP);
              if (bossHP <= 0) {
                boss = null;
                bossHP = 10;
                score = score + 10;
                bossRef.current = false; // ボス出現フラグ更新
                gameClearRef.current = true;  // ゲームクリアフラグ更新
                setTimeout(() => gameClearRef.current = false, 5000);
                console.log("after/bossHP ... " + bossHP);
              }
            }
          });
        }

        /* 当たり判定（敵→プレイヤー） */
        enemies.forEach((e, ei) => {
          if (rectHit(px, py, 120, 120, e.x, e.y, 100, 100)) {
            enemies.splice(ei, 1); // 敵を消す
            life--; // ライフを減らす
            flashAlphaRef.current = true; // フラッシュ演出フラグ更新
            setTimeout(() => {
              flashAlphaRef.current = false;
            }, 100); // 100ms後に戻す
            if (life <= 0) {
              setGameOver(true); // ゲームオーバーフラグ更新
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
        
        // ボスの描画
        if (bossRef.current) {
          console.log("true5");
          ctx.save();
          ctx.drawImage(bossImg, boss.x, boss.y, 200, 200);
          ctx.restore();
        }

        // スコア
        ctx.fillStyle = "#000";
        ctx.font = "20px sans-serif";
        ctx.fillText("Score: " + score, 10, 30);

        // ライフゲージ
        ctx.fillText("HP: " + "❤️".repeat(life), 10, 55);

        // ステージクリア演出
        if (gameClearRef.current) {
          ctx.save();
          ctx.fillStyle = "#000";
          ctx.font = "30px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("MISSION COMPLETE", W/2, H/2);
          ctx.restore();
        }

        // フラッシュ演出
        if (flashAlphaRef.current) {
          ctx.save();
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = "red";
          ctx.fillRect(0, 0, W, H);
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
  }, [gameOver]);

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
  /*
  } else if (gameClear) {
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
        <h1>MISSION COMPLETE</h1>
        <button onClick={() => window.location.reload()}>TRY AGAIN</button>
      </div>
    );
  }
  */

  /* 通常時はキャンバス */
  return <canvas ref={cvsRef}></canvas>;
}
