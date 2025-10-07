const MOBILE_BREAKPOINT = 960;

export function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.getElementById('hamburger');
  const sentinel = document.getElementById('nav-sentinel');
  const navLinks = document.querySelectorAll('.navbar .nav-link');

  if (!navbar) return;

  const closeMobileMenu = () => {
    navbar.classList.remove('mobile-open');
    if (hamburger) {
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  };

  if (hamburger) {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.addEventListener('click', () => {
      const isOpen = !navbar.classList.contains('mobile-open');
      navbar.classList.toggle('mobile-open', isOpen);
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      closeMobileMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMobileMenu();
    }
  });

  if (sentinel && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        navbar.classList.toggle('scrolled', !entry.isIntersecting);
      },
      {
        rootMargin: `-${navbar.offsetHeight}px 0px 0px 0px`,
      }
    );

    observer.observe(sentinel);
  } else {
    const toggleScrolled = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    };
    toggleScrolled();
    window.addEventListener('scroll', toggleScrolled, { passive: true });
  }
}

export function initCountdown() {
  const countdownEl = document.getElementById('countdown');
  if (!countdownEl) return;

  // Ajuste la date/heure cible ici
  const target = new Date('2025-11-21T18:00:00+02:00').getTime();

  const pad = n => String(n).padStart(2,'0');

  function tick(){
    const now = Date.now();
    let diff = Math.max(0, target - now);

    if (diff <= 0) {
      countdownEl.textContent = '� C\'est le grand soir !';
      return;
    }

    const days  = Math.floor(diff / (1000*60*60*24)); diff -= days*24*60*60*1000;
    const hours = Math.floor(diff / (1000*60*60));    diff -= hours*60*60*1000;
    const mins  = Math.floor(diff / (1000*60));       diff -= mins*60*1000;
    const secs  = Math.floor(diff / 1000);

    countdownEl.textContent = `J-${days} ${pad(hours)}h${pad(mins)}m${pad(secs)}s`;
  }
  
  tick();
  setInterval(tick, 1000);
}
