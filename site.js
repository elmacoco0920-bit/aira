'use strict';
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let language = 'zh';
let paused = motionQuery.matches;
try { language = localStorage.getItem('aira-language') || 'zh'; const pref = localStorage.getItem('aira-motion'); if (pref !== null) paused = pref === 'paused'; } catch (_) {}
function setLanguage(next) {
  language = next === 'en' ? 'en' : 'zh';
  document.documentElement.lang = language === 'en' ? 'en' : 'zh-Hant';
  document.querySelectorAll('[data-zh][data-en]').forEach(el => { el.textContent = el.dataset[language]; });
  document.querySelectorAll('.language-toggle').forEach(button => {
    button.textContent = language === 'en' ? '中' : 'EN';
    button.setAttribute('aria-label', language === 'en' ? '切換為中文' : 'Switch to English');
  });
  document.querySelectorAll('button.play-button').forEach(button => {
    button.setAttribute('aria-label', (language === 'en' ? 'Play ' : '播放：') + button.dataset.title);
  });
  updateMotionButton();
  try { localStorage.setItem('aira-language', language); } catch (_) {}
}
function updateMotionButton() {
  document.querySelectorAll('.motion-toggle').forEach(button => {
    button.textContent = paused ? '▷' : 'Ⅱ';
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', language === 'en' ? (paused ? 'Resume animation' : 'Pause animation') : (paused ? '繼續動畫' : '暫停動畫'));
    button.title = button.getAttribute('aria-label');
  });
}
function setMotion(value) {
  paused = value;
  document.documentElement.classList.toggle('motion-paused', paused);
  updateMotionButton();
  try { localStorage.setItem('aira-motion', paused ? 'paused' : 'playing'); } catch (_) {}
}
document.querySelectorAll('.language-toggle').forEach(button => button.addEventListener('click', () => setLanguage(language === 'zh' ? 'en' : 'zh')));
document.querySelectorAll('.motion-toggle').forEach(button => button.addEventListener('click', () => setMotion(!paused)));
motionQuery.addEventListener('change', event => setMotion(event.matches));
setLanguage(language); setMotion(paused);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: .06 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  document.documentElement.classList.add('js-motion');
}
// Videos load only on request so the long photo journal remains lightweight.
document.querySelectorAll('button.play-button').forEach(button => button.addEventListener('click', () => {
  const frame = document.createElement('iframe');
  frame.src = button.dataset.src;
  frame.title = button.dataset.title;
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  const container = button.parentElement;
  container.classList.remove('no-poster');
  container.replaceChildren(frame);
  frame.focus();
}));
const lightbox = document.querySelector('.lightbox');
const galleryLinks = Array.from(document.querySelectorAll('[data-gallery]'));
let selectedPhoto = 0;
if (lightbox && typeof lightbox.showModal === 'function') {
  const photo = lightbox.querySelector('img');
  const name = lightbox.querySelector('[data-photo-name]');
  const original = lightbox.querySelector('[data-photo-original]');
  function showPhoto(index) {
    selectedPhoto = (index + galleryLinks.length) % galleryLinks.length;
    const link = galleryLinks[selectedPhoto];
    const thumbnail = link.querySelector('img');
    photo.src = link.href; photo.alt = thumbnail.alt;
    name.textContent = `${String(selectedPhoto + 1).padStart(2, '0')} / ${galleryLinks.length} · ${link.dataset.label}`;
    original.href = link.dataset.original;
  }
  galleryLinks.forEach((link, index) => link.addEventListener('click', event => {
    event.preventDefault(); showPhoto(index); lightbox.showModal();
    document.body.style.overflow = 'hidden';
  }));
  lightbox.querySelector('[data-close]').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('[data-prev]').addEventListener('click', () => showPhoto(selectedPhoto - 1));
  lightbox.querySelector('[data-next]').addEventListener('click', () => showPhoto(selectedPhoto + 1));
  lightbox.addEventListener('close', () => { document.body.style.overflow = ''; });
  lightbox.addEventListener('click', event => { if (event.target === lightbox) { const r = lightbox.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) lightbox.close(); } });
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(selectedPhoto - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(selectedPhoto + 1); }
  });
}
