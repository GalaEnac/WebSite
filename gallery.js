// gallery.js - Galerie par édition (onglets 2025 / 2024) + visionneuse plein écran

function initGalleryTabs(section) {
  const tabs = Array.from(section.querySelectorAll('[role="tab"]'));
  if (!tabs.length) return;

  const select = (tab, focus = false) => {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
    if (focus) tab.focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (event) => {
      let next = null;
      if (event.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (event.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (event.key === 'Home') next = tabs[0];
      else if (event.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        event.preventDefault();
        select(next, true);
      }
    });
  });
}

function initLightbox(section) {
  const dialog = section.querySelector('.lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return; // sans <dialog>, les liens ouvrent l'image directement

  const img = dialog.querySelector('.lightbox-img');
  const text = dialog.querySelector('.lightbox-text');
  const counter = dialog.querySelector('.lightbox-counter');
  let items = [];
  let index = 0;
  let opener = null;

  const show = (i) => {
    index = (i + items.length) % items.length;
    const item = items[index];
    img.src = item.href;
    img.alt = item.querySelector('img')?.alt ?? '';
    text.textContent = item.dataset.caption ?? '';
    counter.textContent = `${index + 1} / ${items.length}`;
  };

  section.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      items = Array.from(item.closest('.gallery-grid').querySelectorAll('.gallery-item'));
      opener = item;
      show(items.indexOf(item));
      dialog.showModal();
    });
  });

  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lightbox-prev').addEventListener('click', () => show(index - 1));
  dialog.querySelector('.lightbox-next').addEventListener('click', () => show(index + 1));

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(index - 1);
    else if (event.key === 'ArrowRight') show(index + 1);
  });

  // Clic sur le fond (hors image et boutons) : fermer
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target.classList.contains('lightbox-figure')) dialog.close();
  });

  // Balayage horizontal sur mobile
  let touchX = null;
  dialog.addEventListener('touchstart', (event) => { touchX = event.touches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', (event) => {
    if (touchX === null) return;
    const dx = event.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(dx < 0 ? index + 1 : index - 1);
    touchX = null;
  });

  dialog.addEventListener('close', () => {
    img.src = '';
    opener?.focus();
  });
}

export function initGallery() {
  const section = document.getElementById('gallery');
  if (!section) return;
  initGalleryTabs(section);
  initLightbox(section);
}
