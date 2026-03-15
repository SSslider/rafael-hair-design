document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.classList.toggle('active');
      const isExpanded = navLinks.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', isExpanded);
    });
  }

  // Sticky Header with smart hide/show on scroll
  const header = document.querySelector('.site-header');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 50) {
      header.classList.add('scrolled');
      header.classList.remove('hide');
    } else {
      header.classList.remove('scrolled');
      header.classList.remove('hide');
    }

    lastScrollY = currentScrollY;
  });

  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize GSAP Animations if motion is allowed
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Animation
    gsap.from('.hero-content > *', {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power3.out',
      delay: 0.2
    });

    // Hero Image Parallax
    if (document.querySelector('.hero-bg')) {
      gsap.to('.hero-bg', {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });
    }

    // Fade up sections
    gsap.utils.toArray('.fade-up').forEach(section => {
      gsap.from(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out'
      });
    });

    // Staggered cards
    gsap.utils.toArray('.stagger-container').forEach(container => {
      const children = container.querySelectorAll('.stagger-item');
      gsap.from(children, {
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power4.out'
      });
    });

    // Special Wow effect for specific sections
    const aboutImg = document.querySelector('.about-image img');
    if (aboutImg) {
      gsap.fromTo(aboutImg,
        { scale: 1.2 },
        {
          scale: 1,
          scrollTrigger: {
            trigger: '.about-image-wrapper',
            start: 'top 80%',
            end: 'bottom top',
            scrub: 1
          }
        }
      );
    }
  }

  // Smooth Scrolling for Nav Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        // Close mobile menu if open
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');

        const headerOffset = 100;
        const elementPosition = targetSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Dynamic Active Nav State via Intersection Observer
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -40% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Comprehensive Accessibility Widget (Compliant with Israeli Law)
  const a11yBtn = document.getElementById('a11y-widget-btn');
  if (a11yBtn) {
    // Inject widget HTML
    const widgetHTML = `
      <div id="a11y-menu" class="a11y-menu" aria-hidden="true">
        <div class="a11y-header">
          <h3>תפריט נגישות</h3>
          <button id="a11y-close" aria-label="סגור תפריט נגישות">&times;</button>
        </div>
        <div class="a11y-body">
          <button class="a11y-option" data-action="toggle-contrast">ניגודיות גבוהה</button>
          <button class="a11y-option" data-action="toggle-grayscale">גווני אפור</button>
          <button class="a11y-option" data-action="toggle-light-bg">רקע בהיר</button>
          <button class="a11y-option" data-action="increase-text">הגדלת טקסט</button>
          <button class="a11y-option" data-action="decrease-text">הקטנת טקסט</button>
          <button class="a11y-option" data-action="readable-font">פונט קריא</button>
          <button class="a11y-option" data-action="highlight-links">הדגשת קישורים</button>
          <button class="a11y-option" data-action="stop-animations">עצירת אנימציות</button>
          <button class="a11y-reset" id="a11y-reset">איפוס הגדרות</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // Inject widget CSS
    const widgetCSS = `
      <style id="a11y-styles">
        .a11y-menu {
          position: fixed; bottom: 90px; left: 20px; width: 320px;
          background: #ffffff; border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          z-index: 10001; opacity: 0; visibility: hidden;
          transform: translateY(20px); transition: all 0.3s ease;
          border: 1px solid #e0e0e0;
          color: #333; font-family: Arial, sans-serif;
          max-height: 80vh; overflow-y: auto;
        }
        .a11y-menu.open {
          opacity: 1; visibility: visible; transform: translateY(0);
        }
        .a11y-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 15px 20px; background: #0056b3; color: white;
          border-radius: 11px 11px 0 0;
        }
        .a11y-header h3 { margin: 0; font-size: 1.2em; font-weight: bold; }
        .a11y-header button {
          background: none; border: none; color: white; font-size: 24px;
          cursor: pointer; line-height: 1; padding: 0;
        }
        .a11y-body { padding: 15px; display: grid; gap: 10px; }
        .a11y-option {
          background: #f5f5f5; border: 1px solid #ddd;
          padding: 12px; border-radius: 6px; cursor: pointer;
          font-size: 1em; text-align: right; transition: 0.2s;
          color: #333;
        }
        .a11y-option:hover, .a11y-option.active { background: #e9ecef; border-color: #0056b3; }
        .a11y-option.active { border-width: 2px; }
        .a11y-reset {
          background: #ffebee; color: #c62828; border: 1px solid #ffcdd2;
          padding: 12px; border-radius: 6px; cursor: pointer;
          font-size: 1em; text-align: center; margin-top: 10px; font-weight: bold;
        }
        /* A11y applied classes */
        body.a11y-contrast { background: #000 !important; color: #fff !important; }
        body.a11y-contrast * { background: #000 !important; color: #fff !important; border-color: #fff !important; }
        body.a11y-grayscale { filter: grayscale(100%) !important; }
        body.a11y-light-bg { background: #fff !important; color: #000 !important; }
        body.a11y-readable * { font-family: Arial, Helvetica, sans-serif !important; }
        body.a11y-links-highlight a { text-decoration: underline !important; background: #fff000 !important; color: #000 !important; padding: 2px !important; }
        body.a11y-no-animations * { transition: none !important; animation: none !important; transform: none !important; }
      </style>
    `;
    document.head.insertAdjacentHTML('beforeend', widgetCSS);

    const menu = document.getElementById('a11y-menu');
    const closeBtn = document.getElementById('a11y-close');
    const resetBtn = document.getElementById('a11y-reset');
    let textSizeMultiplier = 1;

    a11yBtn.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      menu.setAttribute('aria-hidden', !isOpen);
      a11yBtn.setAttribute('aria-expanded', isOpen);
    });

    closeBtn.addEventListener('click', () => {
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      a11yBtn.setAttribute('aria-expanded', 'false');
    });

    document.querySelectorAll('.a11y-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;

        if (action === 'toggle-contrast') {
          document.body.classList.toggle('a11y-contrast');
          e.target.classList.toggle('active');
        } else if (action === 'toggle-grayscale') {
          document.body.classList.toggle('a11y-grayscale');
          e.target.classList.toggle('active');
        } else if (action === 'toggle-light-bg') {
          document.body.classList.toggle('a11y-light-bg');
          e.target.classList.toggle('active');
        } else if (action === 'readable-font') {
          document.body.classList.toggle('a11y-readable');
          e.target.classList.toggle('active');
        } else if (action === 'highlight-links') {
          document.body.classList.toggle('a11y-links-highlight');
          e.target.classList.toggle('active');
        } else if (action === 'stop-animations') {
          document.body.classList.toggle('a11y-no-animations');
          e.target.classList.toggle('active');
          if (typeof gsap !== 'undefined') {
            document.body.classList.contains('a11y-no-animations') ? gsap.globalTimeline.pause() : gsap.globalTimeline.play();
          }
        } else if (action === 'increase-text') {
          textSizeMultiplier = Math.min(textSizeMultiplier + 0.2, 1.6);
          document.documentElement.style.fontSize = Math.round(16 * textSizeMultiplier) + 'px';
        } else if (action === 'decrease-text') {
          textSizeMultiplier = Math.max(textSizeMultiplier - 0.2, 0.8);
          document.documentElement.style.fontSize = Math.round(16 * textSizeMultiplier) + 'px';
        }
      });
    });

    resetBtn.addEventListener('click', () => {
      document.body.className = document.body.className.replace(/a11y-[^\s]+/g, '');
      textSizeMultiplier = 1;
      document.documentElement.style.fontSize = '';
      document.querySelectorAll('.a11y-option').forEach(btn => btn.classList.remove('active'));
      if (typeof gsap !== 'undefined') gsap.globalTimeline.play();
    });
  }
});
