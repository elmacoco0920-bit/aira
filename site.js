'use strict';
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let language = 'zh';
let paused = motionQuery.matches;
try {
  language = localStorage.getItem('aira-language') === 'en' ? 'en' : 'zh';
  const preference = localStorage.getItem('aira-motion');
  if (preference !== null) paused = preference === 'paused';
} catch (_) {}

function updateMotionButton() {
  document.querySelectorAll('.motion-toggle').forEach(button => {
    button.textContent = language === 'en'
      ? (paused ? '✧ Motion: off' : '✦ Motion: on')
      : (paused ? '✧ 動畫：關' : '✦ 動畫：開');
    button.setAttribute('aria-pressed', String(!paused));
    button.setAttribute('aria-label', language === 'en'
      ? (paused ? 'Enable animation' : 'Pause animation')
      : (paused ? '開啟動畫' : '暫停動畫'));
    button.title = button.getAttribute('aria-label');
  });
}
function setLanguage(next) {
  language = next === 'en' ? 'en' : 'zh';
  document.documentElement.lang = language === 'en' ? 'en' : 'zh-Hant';
  document.querySelectorAll('[data-zh][data-en]').forEach(el => { el.textContent = el.dataset[language]; });
  document.querySelectorAll('.language-toggle').forEach(button => {
    button.textContent = language === 'en' ? '中' : 'EN';
    button.setAttribute('aria-label', language === 'en' ? '切換為中文' : 'Switch to English');
  });
  updateMotionButton();
  try { localStorage.setItem('aira-language', language); } catch (_) {}
}
function setMotion(value, persist = true) {
  paused = value;
  document.documentElement.classList.toggle('motion-paused', paused);
  // Explicitly enabling motion overrides the operating system's default.
  document.documentElement.classList.toggle('motion-enabled', !paused);
  updateMotionButton();
  if (persist) { try { localStorage.setItem('aira-motion', paused ? 'paused' : 'playing'); } catch (_) {} }
}
document.querySelectorAll('.language-toggle').forEach(button => button.addEventListener('click', () => setLanguage(language === 'zh' ? 'en' : 'zh')));
document.querySelectorAll('.motion-toggle').forEach(button => button.addEventListener('click', () => setMotion(!paused)));
if (typeof motionQuery.addEventListener === 'function') motionQuery.addEventListener('change', event => setMotion(event.matches));
else if (typeof motionQuery.addListener === 'function') motionQuery.addListener(event => setMotion(event.matches));
setLanguage(language);
setMotion(paused, false);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: .06 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  document.documentElement.classList.add('js-motion');
}


// Natural editorial pointer interactions.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const collage = document.querySelector('.cover-collage');
  const portrait = document.querySelector('.cover-portrait');
  if (collage && portrait) {
    collage.addEventListener('pointermove', (event) => {
      const r = collage.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - .5;
      const y = (event.clientY - r.top) / r.height - .5;
      collage.style.transform = `rotateX(${(-y*2.4).toFixed(2)}deg) rotateY(${(x*3.2).toFixed(2)}deg)`;
      portrait.style.transform = `rotate(-3deg) translate(${(x*10).toFixed(1)}px,${(y*8).toFixed(1)}px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg)`;
    });
    collage.addEventListener('pointerleave', () => {
      collage.style.transform = '';
      portrait.style.transform = '';
    });
  }
})();
