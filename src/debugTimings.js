// 로딩 측정 화면 — 주소 끝에 ?debug 를 붙였을 때만 켜져요.
// 페이지가 받은 모든 파일·서버 요청이 각각 몇 초 걸렸는지 화면 아래에 보여줘요.
const ON = typeof window !== "undefined" && /[?&]debug/.test(window.location.search);
const marks = [];

export const mark = (label) => {
  if (!ON) return;
  marks.push({ label, t: performance.now() });
};

if (ON) {
  const box = document.createElement("div");
  box.style.cssText =
    "position:fixed;left:0;right:0;bottom:0;max-height:55vh;overflow:auto;z-index:99999;" +
    "background:rgba(20,24,40,.94);color:#fff;font:12px/1.45 monospace;padding:10px 12px;white-space:pre-wrap";
  const short = (u) => {
    try { const x = new URL(u); return x.host.replace("pykyqwhhopmmgidqtamw.", "") + x.pathname.slice(0, 40) + (x.search ? "?" + x.search.slice(1, 30) : ""); }
    catch { return u.slice(0, 60); }
  };
  const draw = () => {
    const now = performance.now();
    const nav = performance.getEntriesByType("navigation")[0];
    const res = performance.getEntriesByType("resource")
      .map((r) => ({ s: r.startTime, e: r.responseEnd, d: r.duration, n: short(r.name) }))
      .sort((a, b) => b.d - a.d).slice(0, 15);
    const f = (ms) => (ms / 1000).toFixed(2) + "초";
    let out = `⏱ 오늘의 빛 로딩 측정  (지금 ${f(now)})\n`;
    if (nav) out += `HTML 받음 ${f(nav.responseEnd)} · 화면준비 ${f(nav.domContentLoadedEventEnd)}\n`;
    out += `\n[단계]\n` + marks.map((m) => `${f(m.t).padStart(7)}  ${m.label}`).join("\n");
    out += `\n\n[오래 걸린 요청 순]  시작→끝 (걸린 시간)\n` +
      res.map((r) => `${f(r.d).padStart(7)}  ${f(r.s)}→${f(r.e)}  ${r.n}`).join("\n");
    box.textContent = out;
  };
  const start = () => { document.body.appendChild(box); draw(); setInterval(draw, 1000); };
  if (document.body) start(); else window.addEventListener("DOMContentLoaded", start);
  box.onclick = () => {
    try { navigator.clipboard.writeText(box.textContent); box.style.outline = "3px solid #D9A441"; } catch {}
  };
}
