/* A small leaky integrate-and-fire network for the hero.
   Neurons sit in a few clustered regions, each wired to its nearest neighbours
   with a conduction delay proportional to distance. About a fifth are inhibitory.
   The pointer injects current; spikes travel along edges as visible pulses.
   window.Brain.start(canvas, onRate) — onRate(spikesPerSecond, normalised 0..1). */
(function () {
  const EMBER = [255, 138, 91];
  const MOON = [246, 231, 193];
  const MIST = [143, 184, 186];

  function start(canvas, onRate) {
    const ctx = canvas.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, dpr = 1;
    let N = [], edges = [], pulses = [], edgeLayer = null;
    let pointer = null, wander = { x: 0.5, y: 0.5, a: 0 };
    let spikeTimes = [];
    let rateSmooth = 0, last = performance.now();

    function build() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      const count = Math.round(Math.min(1100, Math.max(380, (W * H) / 1500)));
      // regions: loose blobs, like lobes
      const regions = [];
      const nr = W < 700 ? 4 : 6;
      for (let i = 0; i < nr; i++)
        regions.push({ x: W * (0.12 + Math.random() * 0.76), y: H * (0.12 + Math.random() * 0.62), r: Math.min(W, H) * (0.16 + Math.random() * 0.14) });
      N = [];
      for (let i = 0; i < count; i++) {
        const g = regions[i % nr];
        const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * g.r;
        N.push({
          x: g.x + Math.cos(a) * d * 1.4,
          y: g.y + Math.sin(a) * d,
          v: Math.random() * 0.5,
          ref: 0,
          lastSpike: -1e9,
          inh: Math.random() < 0.2,
          out: [],
        });
      }
      // nearest-neighbour wiring with a few long-range axons
      edges = [];
      const cell = 60, grid = new Map();
      N.forEach((n, i) => {
        const k = ((n.x / cell) | 0) + "," + ((n.y / cell) | 0);
        (grid.get(k) || grid.set(k, []).get(k)).push(i);
      });
      N.forEach((n, i) => {
        const cx = (n.x / cell) | 0, cy = (n.y / cell) | 0, near = [];
        for (let dx = -1; dx <= 1; dx++)
          for (let dy = -1; dy <= 1; dy++)
            for (const j of grid.get(cx + dx + "," + (cy + dy)) || [])
              if (j !== i) near.push([j, Math.hypot(N[j].x - n.x, N[j].y - n.y)]);
        near.sort((a, b) => a[1] - b[1]);
        const k = n.inh ? 10 : 6;
        for (const [j, d] of near.slice(0, k)) addEdge(i, j, d);
        if (Math.random() < 0.05) {
          const j = (Math.random() * N.length) | 0;
          addEdge(i, j, Math.hypot(N[j].x - n.x, N[j].y - n.y));
        }
      });
      function addEdge(i, j, d) {
        const e = { a: i, b: j, d, delay: 40 + d * 4, w: N[i].inh ? -0.55 : 0.32 + Math.random() * 0.18 };
        edges.push(e);
        N[i].out.push(e);
      }
      // cache the wiring as one layer
      edgeLayer = document.createElement("canvas");
      edgeLayer.width = W * dpr;
      edgeLayer.height = H * dpr;
      const ec = edgeLayer.getContext("2d");
      ec.scale(dpr, dpr);
      ec.lineWidth = 0.6;
      for (const e of edges) {
        const A = N[e.a], B = N[e.b];
        ec.strokeStyle = e.w < 0 ? "rgba(143,184,186,.10)" : "rgba(246,231,193,.08)";
        ec.beginPath();
        ec.moveTo(A.x, A.y);
        ec.lineTo(B.x, B.y);
        ec.stroke();
      }
      pulses = [];
    }

    function step(now, dt) {
      const tau = 18; // ms membrane time constant
      const decay = Math.exp(-dt / tau);
      let stim = pointer;
      if (!stim && !reduce) {
        wander.a += dt * 0.0004;
        stim = {
          x: W * (0.5 + Math.cos(wander.a) * 0.32 + Math.sin(wander.a * 2.3) * 0.08),
          y: H * (0.45 + Math.sin(wander.a * 1.3) * 0.24),
          soft: true,
        };
      }
      const R = Math.min(W, H) * (stim && stim.soft ? 0.09 : 0.12);
      // deliver arrived pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        if (now >= p.t + p.e.delay) {
          const t = N[p.e.b];
          if (t.ref <= 0) t.v += p.e.w;
          pulses[i] = pulses[pulses.length - 1];
          pulses.pop();
        }
      }
      for (const n of N) {
        n.v *= decay;
        if (n.ref > 0) { n.ref -= dt; continue; }
        n.v += (Math.random() < 0.0008 * dt ? 0.6 : 0); // spontaneous background
        if (stim) {
          const d = Math.hypot(n.x - stim.x, n.y - stim.y);
          if (d < R) n.v += (1 - d / R) * dt * (stim.soft ? 0.11 : 0.17);
        }
        if (n.v > 1) {
          n.v = 0;
          n.ref = 30;
          n.lastSpike = now;
          spikeTimes.push(now);
          if (pulses.length < 2400) for (const e of n.out) pulses.push({ e, t: now });
        }
      }
      while (spikeTimes.length && spikeTimes[0] < now - 1000) spikeTimes.shift();
    }

    function draw(now) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(edgeLayer, 0, 0, W, H);
      // travelling pulses
      for (const p of pulses) {
        const f = (now - p.t) / p.e.delay;
        const A = N[p.e.a], B = N[p.e.b];
        const c = p.e.w < 0 ? MIST : EMBER;
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.55 * (1 - f * 0.5)})`;
        ctx.fillRect(A.x + (B.x - A.x) * f - 1, A.y + (B.y - A.y) * f - 1, 2, 2);
      }
      // neurons
      for (const n of N) {
        const since = now - n.lastSpike;
        if (since < 260) {
          const k = 1 - since / 260;
          const c = n.inh ? MIST : EMBER;
          ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.18 * k})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 4 + 9 * k, 0, 7);
          ctx.fill();
          ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 1.6 + k * 1.6, 0, 7);
          ctx.fill();
        } else {
          const c = n.inh ? MIST : MOON;
          ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.22 + Math.min(n.v, 1) * 0.5})`;
          ctx.fillRect(n.x - 0.9, n.y - 0.9, 1.8, 1.8);
        }
      }
    }

    let visible = true;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

    function frame(now) {
      const dt = Math.min(now - last, 50);
      last = now;
      if (visible && !document.hidden) {
        // two half-steps per frame keep the dynamics stable
        step(now - dt / 2, dt / 2);
        step(now, dt / 2);
        draw(now);
        const rate = spikeTimes.length;
        rateSmooth += (rate - rateSmooth) * 0.06;
        onRate && onRate(Math.round(rateSmooth), Math.min(1, rateSmooth / (N.length * 0.6)), N.length);
      }
      requestAnimationFrame(frame);
    }

    function toLocal(e) {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    canvas.addEventListener("pointermove", (e) => (pointer = toLocal(e)));
    canvas.addEventListener("pointerdown", (e) => (pointer = toLocal(e)));
    canvas.addEventListener("pointerleave", () => (pointer = null));
    canvas.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") pointer = null; });

    let rt;
    addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (Math.abs(canvas.clientWidth - W) > 40 || Math.abs(canvas.clientHeight - H) > 120) build();
      }, 200);
    });

    build();
    // warm up for a second and a half so the first frame is already alive
    const t0 = performance.now() - 1500;
    for (let t = 0; t < 1500; t += 8) step(t0 + t, 8);
    rateSmooth = spikeTimes.length;
    requestAnimationFrame((t) => { last = t; frame(t); });
  }

  window.Brain = { start };
})();
