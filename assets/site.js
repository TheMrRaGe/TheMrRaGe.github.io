(function () {
  const P = window.PROJECTS || [];
  const ME = window.PROFILE || {};
  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const fine = matchMedia("(pointer: fine)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const when = (p) => `${p.status}, ${p.year}`;

  function art(p, seed, cls) {
    if (p.image) {
      const img = new Image();
      img.src = p.image;
      img.alt = "";
      img.loading = "lazy";
      if (cls) img.className = cls;
      img.onerror = () => img.replaceWith(art({ ...p, image: null }, seed, cls));
      return img;
    }
    const cv = document.createElement("canvas");
    if (cls) cv.className = cls;
    cv.setAttribute("aria-hidden", "true");
    window.drawArt(cv, p.art, seed || p.id);
    return cv;
  }

  /* ---------- hero network ---------- */
  const net = document.getElementById("net");
  if (net && window.Brain) {
    const h1 = document.querySelector(".hero h1");
    const out = document.getElementById("rate");
    let lastPaint = 0;
    const cnt = document.getElementById("count");
    window.Brain.start(net, (rate, k, n) => {
      if (cnt && n) cnt.textContent = n.toLocaleString();
      const now = performance.now();
      if (now - lastPaint < 120) return;
      lastPaint = now;
      out.textContent = rate.toLocaleString();
      const w = Math.round(300 + Math.pow(k, 0.7) * 500);
      h1.style.fontVariationSettings = `"wght" ${w}, "wdth" ${100 - Math.round(k * 12)}, "opsz" 96`;
    });
    const hint = document.getElementById("hint");
    if (hint && !fine) hint.textContent = "Drag across the network to make it fire.";
  }

  /* ---------- home: selected work ---------- */
  const work = document.getElementById("work");
  if (work) {
    const peek = document.createElement("div");
    peek.className = "peek";
    document.body.appendChild(peek);
    let px = 0, py = 0, tx = 0, ty = 0, raf = 0;
    const follow = () => {
      px += (tx - px) * 0.18; py += (ty - py) * 0.18;
      peek.style.transform = `translate(${px + 24}px, ${py - 90}px)`;
      raf = Math.abs(tx - px) + Math.abs(ty - py) > 0.5 ? requestAnimationFrame(follow) : 0;
    };
    P.filter((p) => p.featured).forEach((p) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.className = "row";
      a.href = "gallery.html#" + p.id;
      a.appendChild(art(p, p.id, "mini"));
      a.insertAdjacentHTML("beforeend", `<h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p><span class="when">${esc(when(p))}</span>`);
      if (fine) {
        a.addEventListener("mouseenter", (e) => {
          peek.replaceChildren(art(p));
          px = tx = e.clientX; py = ty = e.clientY;
          follow();
          peek.classList.add("on");
        });
        a.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(follow); });
        a.addEventListener("mouseleave", () => peek.classList.remove("on"));
      }
      li.appendChild(a);
      work.appendChild(li);
    });
  }

  const all = document.getElementById("all");
  if (all) all.textContent = `See all ${P.length} projects`;

  const skills = document.getElementById("skills");
  if (skills && ME.skills) skills.innerHTML = ME.skills.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
  const mail = document.getElementById("mail");
  if (mail) { if (ME.email) { mail.href = "mailto:" + ME.email; mail.textContent = ME.email; } else mail.closest("li, p")?.remove(); }

  /* ---------- gallery ---------- */
  const wall = document.getElementById("wall");
  let sheet;
  function openSheet(p, from) {
    if (!sheet) {
      sheet = document.createElement("dialog");
      sheet.className = "sheet";
      sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });
      sheet.addEventListener("close", () => {
        history.replaceState(null, "", location.pathname);
        sheet.returnTo && sheet.returnTo.focus();
      });
      document.body.appendChild(sheet);
    }
    sheet.returnTo = from;
    const links = [
      p.live && `<a class="button hot" href="${esc(p.live)}" target="_blank" rel="noopener">Open the live demo</a>`,
      p.repo && `<a class="button" href="${esc(p.repo)}" target="_blank" rel="noopener">Read the source</a>`,
    ].filter(Boolean).join("");
    sheet.innerHTML = `<button class="shut" aria-label="Close">×</button>`;
    sheet.querySelector(".shut").onclick = () => sheet.close();
    sheet.appendChild(art(p, p.id, "art"));
    const body = document.createElement("div");
    body.className = "body";
    body.innerHTML = `
      <p class="when">${esc(when(p))}</p>
      <h2>${esc(p.title)}</h2>
      <p class="lede">${esc(p.summary)}</p>
      ${p.details.length ? `<ul class="points">${p.details.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>` : ""}
      <ul class="stack" aria-label="Built with">${p.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
      ${links ? `<div class="actions">${links}</div>` : `<p class="note">The code is private. I'm glad to walk through it on a call.</p>`}`;
    sheet.appendChild(body);
    history.replaceState(null, "", "#" + p.id);
    sheet.showModal();
    sheet.scrollTop = 0;
  }

  if (wall) {
    const labels = { all: "Everything", ai: "AI", games: "Games", research: "Research", trading: "Trading", web3: "Web3", web: "Web" };
    const filters = document.getElementById("filters");
    let current = "all";
    const counts = { all: P.length };
    P.forEach((p) => p.tags.forEach((t) => (counts[t] = (counts[t] || 0) + 1)));

    function tile(p) {
      const b = document.createElement("button");
      b.className = "tile" + (p.featured ? " big" : "");
      b.type = "button";
      const frame = document.createElement("div");
      frame.className = "frame";
      let cur = art(p, p.id);
      frame.appendChild(cur);
      b.appendChild(frame);
      b.insertAdjacentHTML("beforeend", `<div class="cap"><h3>${esc(p.title)}</h3><span>${esc(when(p))}</span></div>`);
      b.setAttribute("aria-label", `${p.title}, ${when(p)}. Open details`);
      b.onclick = () => openSheet(p, b);
      // repaint on hover, the way Moodscape repaints a scene
      if (!p.image && fine && !reduce) {
        let n = 0, busy = false;
        b.addEventListener("mouseenter", () => {
          if (busy) return;
          busy = true;
          const next = art(p, p.id + "-" + ++n, "next");
          frame.appendChild(next);
          requestAnimationFrame(() => requestAnimationFrame(() => { next.style.opacity = 1; cur.style.opacity = 0; }));
          setTimeout(() => { cur.remove(); next.classList.remove("next"); next.style.opacity = ""; cur = next; busy = false; }, 650);
        });
      }
      return b;
    }

    function render() {
      wall.replaceChildren(...(current === "all" ? P : P.filter((p) => p.tags.includes(current))).map(tile));
      filters.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.k === current));
    }
    Object.keys(labels).filter((k) => counts[k]).forEach((k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.k = k;
      b.innerHTML = `${labels[k]}<sup>${counts[k]}</sup>`;
      b.onclick = () => { current = k; render(); };
      filters.appendChild(b);
    });
    render();
    const hit = P.find((p) => p.id === location.hash.slice(1));
    if (hit) openSheet(hit);
  }

  document.querySelectorAll("[data-year]").forEach((n) => (n.textContent = new Date().getFullYear()));
})();
