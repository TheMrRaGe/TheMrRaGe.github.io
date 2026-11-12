/* Generative thumbnails. Each project names a motif; drawArt(canvas, motif, seed)
   paints it. Deterministic per seed, so a card always looks the same. */
(function () {
  function rng(seed) {
    let h = 2166136261;
    for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return function () {
      h += 0x6d2b79f5;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const INK = "#0f2128";
  const LIME = "#ff8a5b";

  const motifs = {
    landscape(c, w, h, r) {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#14303a");
      g.addColorStop(1, "#4d7d7f");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      const sx = w * (0.55 + r() * 0.2), sy = h * 0.42;
      const glow = c.createRadialGradient(sx, sy, 0, sx, sy, h * 0.6);
      glow.addColorStop(0, "rgba(250,236,200,.55)");
      glow.addColorStop(1, "rgba(250,236,200,0)");
      c.fillStyle = glow;
      c.fillRect(0, 0, w, h);
      c.fillStyle = "#fbecc8";
      c.beginPath();
      c.arc(sx, sy, h * 0.12, 0, 7);
      c.fill();
      const layers = ["#3f6f72", "#29525a", "#173941", "#0e252c"];
      layers.forEach((col, i) => {
        c.fillStyle = col;
        c.beginPath();
        const base = h * (0.55 + i * 0.12);
        c.moveTo(0, h);
        for (let x = 0; x <= w; x += 8)
          c.lineTo(x, base + Math.sin(x / (60 + i * 25) + r() * 0.2 + i) * (14 - i * 2));
        c.lineTo(w, h);
        c.fill();
      });
    },

    maze(c, w, h, r) {
      c.fillStyle = "#100808";
      c.fillRect(0, 0, w, h);
      const s = 22;
      c.strokeStyle = "#5a1f1a";
      c.lineWidth = 3;
      c.lineCap = "square";
      for (let y = 0; y < h + s; y += s)
        for (let x = 0; x < w + s; x += s) {
          c.beginPath();
          if (r() < 0.5) { c.moveTo(x, y); c.lineTo(x + s, y + s); }
          else { c.moveTo(x + s, y); c.lineTo(x, y + s); }
          c.stroke();
        }
      const v = c.createRadialGradient(w / 2, h / 2, h * 0.05, w / 2, h / 2, w * 0.6);
      v.addColorStop(0, "rgba(230,200,150,.35)");
      v.addColorStop(0.35, "rgba(16,8,8,.2)");
      v.addColorStop(1, "rgba(0,0,0,.95)");
      c.fillStyle = v;
      c.fillRect(0, 0, w, h);
      // ooze
      c.fillStyle = "#050303";
      for (let i = 0; i < 14; i++) {
        const x = r() * w, len = 20 + r() * 70, wd = 3 + r() * 6;
        c.fillRect(x, 0, wd, len);
        c.beginPath();
        c.arc(x + wd / 2, len, wd * 0.9, 0, 7);
        c.fill();
      }
    },

    neurons(c, w, h, r) {
      c.fillStyle = INK;
      c.fillRect(0, 0, w, h);
      const pts = [];
      for (let i = 0; i < 70; i++) pts.push([r() * w, r() * h, r()]);
      c.lineWidth = 0.7;
      for (const a of pts)
        for (const b of pts) {
          const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
          if (d < 70 && r() < 0.5) {
            c.strokeStyle = `rgba(255,138,91,${0.5 - d / 160})`;
            c.beginPath();
            c.moveTo(a[0], a[1]);
            c.quadraticCurveTo((a[0] + b[0]) / 2 + 10, (a[1] + b[1]) / 2 - 10, b[0], b[1]);
            c.stroke();
          }
        }
      for (const p of pts) {
        c.fillStyle = p[2] > 0.85 ? LIME : "rgba(246,231,193,.75)";
        c.beginPath();
        c.arc(p[0], p[1], p[2] > 0.85 ? 3.5 : 1.6, 0, 7);
        c.fill();
      }
    },

    swarm(c, w, h, r) {
      c.fillStyle = "#13282e";
      c.fillRect(0, 0, w, h);
      c.strokeStyle = "rgba(255,138,91,.12)";
      for (let x = 0; x < w; x += 24) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
      for (let y = 0; y < h; y += 24) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
      for (let i = 0; i < 9; i++) {
        let x = r() * w, y = r() * h, a = r() * 6.28;
        c.strokeStyle = `rgba(246,231,193,${0.25 + r() * 0.4})`;
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(x, y);
        for (let k = 0; k < 40; k++) {
          a += (r() - 0.5) * 0.7;
          x += Math.cos(a) * 5; y += Math.sin(a) * 5;
          c.lineTo(x, y);
        }
        c.stroke();
        c.fillStyle = LIME;
        c.beginPath();
        c.ellipse(x, y, 4, 2.4, a, 0, 7);
        c.fill();
      }
    },

    chart(c, w, h, r) {
      c.fillStyle = INK;
      c.fillRect(0, 0, w, h);
      let y = h * 0.7;
      const pts = [];
      for (let x = 0; x <= w; x += 6) {
        y += (r() - 0.46) * 14;
        y = Math.max(h * 0.12, Math.min(h * 0.9, y));
        pts.push([x, y]);
      }
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(255,138,91,.35)");
      g.addColorStop(1, "rgba(255,138,91,0)");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(0, h);
      pts.forEach((p) => c.lineTo(p[0], p[1]));
      c.lineTo(w, h);
      c.fill();
      c.strokeStyle = LIME;
      c.lineWidth = 2;
      c.beginPath();
      pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
      c.stroke();
      c.fillStyle = "rgba(246,231,193,.5)";
      c.font = "11px 'IBM Plex Mono', monospace";
      ["SCAN", "RUG", "SIZE", "EXEC", "LOG", "EQ"].forEach((t, i) => c.fillText(t, 10 + i * (w / 6), 18));
    },

    candles(c, w, h, r) {
      c.fillStyle = "#10232a";
      c.fillRect(0, 0, w, h);
      let p = h / 2;
      for (let x = 10; x < w; x += 14) {
        const o = p, cl = p + (r() - 0.5) * 30;
        const hi = Math.min(o, cl) - r() * 14, lo = Math.max(o, cl) + r() * 14;
        const up = cl < o;
        c.strokeStyle = c.fillStyle = up ? LIME : "#e0573f";
        c.beginPath(); c.moveTo(x + 4, hi); c.lineTo(x + 4, lo); c.stroke();
        c.fillRect(x, Math.min(o, cl), 8, Math.max(2, Math.abs(cl - o)));
        p = Math.max(30, Math.min(h - 30, cl));
      }
    },

    moon(c, w, h, r) {
      const g = c.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#1c1230");
      g.addColorStop(1, "#3a1d3f");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      for (let i = 0; i < 60; i++) {
        c.fillStyle = `rgba(255,240,220,${r() * 0.7})`;
        c.fillRect(r() * w, r() * h, 1.5, 1.5);
      }
      const n = 5, cy = h * 0.32;
      for (let i = 0; i < n; i++) {
        const cx = w * (0.18 + i * 0.16), rad = 13, ph = i / (n - 1);
        c.fillStyle = "#f2e2b8";
        c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fill();
        c.fillStyle = "#24163a";
        c.beginPath(); c.arc(cx + (ph * 2 - 1) * rad * 1.6 + 0.01, cy, rad, 0, 7); c.fill();
      }
      // cauldron
      c.fillStyle = "#0b0710";
      c.beginPath(); c.ellipse(w / 2, h * 0.78, 56, 40, 0, 0, 7); c.fill();
      c.fillStyle = "#7cf2a0";
      c.beginPath(); c.ellipse(w / 2, h * 0.63, 46, 8, 0, 0, 7); c.fill();
      for (let i = 0; i < 6; i++) {
        c.strokeStyle = `rgba(124,242,160,${0.2 + r() * 0.3})`;
        c.beginPath(); c.arc(w / 2 + (r() - 0.5) * 60, h * 0.52 - r() * 30, 3 + r() * 6, 0, 7); c.stroke();
      }
    },

    cards(c, w, h, r) {
      c.fillStyle = "#152a33";
      c.fillRect(0, 0, w, h);
      const cols = ["#e9c46a", "#e76f51", "#2a9d8f", "#a8dadc", LIME];
      for (let i = 0; i < 5; i++) {
        c.save();
        c.translate(w / 2 + (i - 2) * 34, h * 0.62);
        c.rotate((i - 2) * 0.16);
        c.fillStyle = "#f4f1e8";
        c.fillRect(-34, -88, 68, 96);
        c.fillStyle = cols[i];
        c.fillRect(-28, -82, 56, 48);
        c.fillStyle = "#152a33";
        c.font = "bold 10px 'IBM Plex Mono', monospace";
        c.fillText(i === 4 ? "PSA 10" : "#" + Math.floor(r() * 300), -26, -2);
        c.restore();
      }
    },

    grid(c, w, h, r) {
      c.fillStyle = INK;
      c.fillRect(0, 0, w, h);
      const s = 18;
      for (let y = 0; y < h; y += s)
        for (let x = 0; x < w; x += s) {
          const v = r();
          c.fillStyle = v > 0.92 ? LIME : `rgba(246,231,193,${v * 0.18})`;
          c.fillRect(x + 2, y + 2, s - 4, s - 4);
        }
    },

    flow(c, w, h, r) {
      c.fillStyle = "#10232a";
      c.fillRect(0, 0, w, h);
      const labels = ["CARD", "SWAP", "WALLET"];
      labels.forEach((t, i) => {
        const x = w * (0.17 + i * 0.33), y = h / 2;
        c.strokeStyle = LIME; c.lineWidth = 2;
        c.strokeRect(x - 34, y - 20, 68, 40);
        c.fillStyle = "#f6e7c1";
        c.font = "11px 'IBM Plex Mono', monospace";
        c.textAlign = "center";
        c.fillText(t, x, y + 4);
        if (i < 2) {
          c.beginPath(); c.moveTo(x + 38, y); c.lineTo(x + w * 0.33 - 40, y); c.stroke();
          c.beginPath(); c.moveTo(x + w * 0.33 - 46, y - 5); c.lineTo(x + w * 0.33 - 40, y); c.lineTo(x + w * 0.33 - 46, y + 5); c.stroke();
        }
      });
      c.textAlign = "start";
    },

    orbit(c, w, h, r) {
      c.fillStyle = "#10232a";
      c.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      for (let i = 1; i <= 4; i++) {
        c.strokeStyle = "rgba(246,231,193,.15)";
        c.beginPath(); c.ellipse(cx, cy, i * 34, i * 20, -0.3, 0, 7); c.stroke();
        const a = r() * 6.28;
        c.fillStyle = i === 2 ? LIME : "#f6e7c1";
        c.beginPath();
        c.arc(cx + Math.cos(a) * i * 34 * Math.cos(-0.3) - Math.sin(a) * i * 20 * Math.sin(-0.3),
              cy + Math.cos(a) * i * 34 * Math.sin(-0.3) + Math.sin(a) * i * 20 * Math.cos(-0.3), 4, 0, 7);
        c.fill();
      }
      c.fillStyle = LIME; c.beginPath(); c.arc(cx, cy, 9, 0, 7); c.fill();
    },

    dots(c, w, h, r) {
      c.fillStyle = "#132a31";
      c.fillRect(0, 0, w, h);
      for (let y = 12; y < h; y += 16)
        for (let x = 12; x < w; x += 16) {
          const v = r();
          c.fillStyle = v > 0.9 ? LIME : `rgba(246,231,193,${0.1 + v * 0.3})`;
          c.beginPath(); c.arc(x, y, 1 + v * 4, 0, 7); c.fill();
        }
    },

    rings(c, w, h, r) {
      c.fillStyle = INK;
      c.fillRect(0, 0, w, h);
      for (let i = 0; i < 9; i++) {
        c.strokeStyle = i % 3 === 0 ? LIME : "rgba(246,231,193,.35)";
        c.lineWidth = 1 + (i % 3 === 0);
        c.beginPath(); c.arc(w / 2, h / 2, 10 + i * 13, 0, 7); c.stroke();
      }
    },

    snake(c, w, h, r) {
      c.fillStyle = "#10232a";
      c.fillRect(0, 0, w, h);
      const s = 16;
      let x = 4, y = 4;
      const path = [];
      for (let i = 0; i < 30; i++) {
        path.push([x, y]);
        const d = Math.floor(r() * 4);
        x = Math.max(1, Math.min(Math.floor(w / s) - 2, x + [1, 0, -1, 0][d]));
        y = Math.max(1, Math.min(Math.floor(h / s) - 2, y + [0, 1, 0, -1][d]));
      }
      path.forEach(([px, py], i) => {
        c.fillStyle = i === path.length - 1 ? LIME : `rgba(255,138,91,${0.15 + (i / path.length) * 0.6})`;
        c.fillRect(px * s + 1, py * s + 1, s - 2, s - 2);
      });
      c.fillStyle = "#e0573f";
      c.fillRect(Math.floor(r() * (w / s)) * s + 4, Math.floor(r() * (h / s)) * s + 4, s - 8, s - 8);
    },

    pong(c, w, h, r) {
      c.fillStyle = INK;
      c.fillRect(0, 0, w, h);
      c.setLineDash([6, 8]);
      c.strokeStyle = "rgba(246,231,193,.3)";
      c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.stroke();
      c.setLineDash([]);
      c.fillStyle = "#f6e7c1";
      c.fillRect(18, h * (0.2 + r() * 0.4), 8, 46);
      c.fillRect(w - 26, h * (0.2 + r() * 0.4), 8, 46);
      c.fillStyle = LIME;
      c.fillRect(w * (0.3 + r() * 0.4), h * (0.2 + r() * 0.6), 9, 9);
    },
  };

  window.drawArt = function (canvas, motif, seed) {
    const dpr = Math.max(2, Math.min(window.devicePixelRatio || 1, 3));
    const w = 320, h = 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const c = canvas.getContext("2d");
    c.scale(dpr, dpr);
    (motifs[motif] || motifs.grid)(c, w, h, rng(seed || motif));
  };
})();
