/**
 * Mangalam HDPE Pipes - Product Detail Page
 * Interactive features: sticky header, carousel with zoom,
 * manufacturing tabs, FAQ accordion, modal, mobile nav
 */

(function () {
  'use strict';

  /* =====================================================
     DOM REFERENCES
     ===================================================== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const heroSection      = $('#heroSection');
  const stickyHeader     = $('#stickyHeader');
  const hamburger        = $('#hamburger');
  const mainNav          = $('#mainNav');
  const carouselViewport = $('#carouselViewport');
  const carouselPrev     = $('#carouselPrev');
  const carouselNext     = $('#carouselNext');
  const carouselThumbs   = $('#carouselThumbs');
  const zoomLens         = $('#zoomLens');
  const zoomResult       = $('#zoomResult');
  const processTabs      = $('#processTabs');
  const faqList          = $('#faqList');
  const openCatalogue    = $('#openCatalogue');
  const catalogueModal   = $('#catalogueModal');
  const closeModal       = $('#closeModal');
  const contactForm      = $('#contactForm');
  const catalogueForm    = $('#catalogueForm');

  /* =====================================================
     1. STICKY HEADER
     Appears when user scrolls past the hero section
     and disappears when scrolling back up to the hero.
     ===================================================== */
  let lastScrollY = 0;
  let ticking = false;

  function handleStickyHeader() {
    const scrollY = window.scrollY;
    const heroBottom = heroSection
      ? heroSection.offsetTop + heroSection.offsetHeight
      : 600;

    if (scrollY > heroBottom && scrollY > lastScrollY) {
      stickyHeader.classList.add('visible');
      stickyHeader.setAttribute('aria-hidden', 'false');
    } else {
      stickyHeader.classList.remove('visible');
      stickyHeader.setAttribute('aria-hidden', 'true');
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(handleStickyHeader);
      ticking = true;
    }
  }, { passive: true });

  /* =====================================================
     2. MOBILE HAMBURGER MENU
     ===================================================== */
  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close nav on link click
    $$('.nav-link', mainNav).forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* =====================================================
     3. IMAGE CAROUSEL
     Supports arrow navigation, thumbnail selection,
     and auto-advance every 5 seconds.
     ===================================================== */
  const images = $$('.carousel-image', carouselViewport);
  const thumbs = $$('.thumb', carouselThumbs);
  let currentIndex = 0;
  let autoplayInterval;

  function goToSlide(index) {
    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;

    images.forEach(img => img.classList.remove('active'));
    thumbs.forEach(th => th.classList.remove('active'));

    images[index].classList.add('active');
    thumbs[index].classList.add('active');
    currentIndex = index;
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(() => goToSlide(currentIndex + 1), 5000);
  }

  function stopAutoplay() {
    if (autoplayInterval) clearInterval(autoplayInterval);
  }

  carouselPrev?.addEventListener('click', () => {
    goToSlide(currentIndex - 1);
    startAutoplay();
  });

  carouselNext?.addEventListener('click', () => {
    goToSlide(currentIndex + 1);
    startAutoplay();
  });

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      goToSlide(Number(thumb.dataset.index));
      startAutoplay();
    });
  });

  startAutoplay();

  /* =====================================================
     4. IMAGE ZOOM / MAGNIFIER
     On hover, a circular lens tracks the cursor on the
     image, and a floating zoomed preview window appears
     next to the cursor like a magnifying glass popup.
     ===================================================== */
  const carouselMain = $('#carouselMain');
  const ZOOM_FACTOR = 2.5;
  const FLOAT_OFFSET_X = 20;   // px gap between cursor and floating preview
  const FLOAT_OFFSET_Y = -40;  // slight upward offset

  if (carouselMain && zoomLens && zoomResult) {
    carouselMain.addEventListener('mouseenter', () => {
      if (window.innerWidth < 1200) return;
      zoomLens.classList.add('active');
      zoomResult.classList.add('active');
    });

    carouselMain.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 1200) return;

      const rect = carouselMain.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const lensR = zoomLens.offsetWidth / 2;

      // Clamp lens within carousel bounds
      const clampedX = Math.max(lensR, Math.min(x, rect.width - lensR));
      const clampedY = Math.max(lensR, Math.min(y, rect.height - lensR));
      zoomLens.style.left = `${clampedX - lensR}px`;
      zoomLens.style.top  = `${clampedY - lensR}px`;

      // Position floating preview next to the cursor (fixed to viewport)
      const resultW = zoomResult.offsetWidth;
      const resultH = zoomResult.offsetHeight;
      let floatX = e.clientX + FLOAT_OFFSET_X;
      let floatY = e.clientY + FLOAT_OFFSET_Y;

      // Keep the floating preview within the viewport
      if (floatX + resultW > window.innerWidth - 12) {
        floatX = e.clientX - resultW - FLOAT_OFFSET_X;
      }
      if (floatY < 8) floatY = 8;
      if (floatY + resultH > window.innerHeight - 8) {
        floatY = window.innerHeight - resultH - 8;
      }

      zoomResult.style.left = `${floatX}px`;
      zoomResult.style.top  = `${floatY}px`;

      // Set zoomed background from the active carousel image
      const activeImg = images[currentIndex];
      if (!activeImg) return;

      zoomResult.style.backgroundImage = `url('${activeImg.src}')`;
      zoomResult.style.backgroundSize  = `${rect.width * ZOOM_FACTOR}px ${rect.height * ZOOM_FACTOR}px`;

      const bgX = -(x * ZOOM_FACTOR - resultW / 2);
      const bgY = -(y * ZOOM_FACTOR - resultH / 2);
      zoomResult.style.backgroundPosition = `${bgX}px ${bgY}px`;
    });

    carouselMain.addEventListener('mouseleave', () => {
      zoomLens.classList.remove('active');
      zoomResult.classList.remove('active');
      zoomResult.style.backgroundImage = '';
    });
  }

  /* =====================================================
     5. MANUFACTURING PROCESS TABS
     ===================================================== */
  if (processTabs) {
    const tabs = $$('.process-tab', processTabs);
    const panels = $$('.process-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = `panel-${tab.dataset.tab}`;

        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        panels.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });
  }

  /* =====================================================
     6. FAQ ACCORDION
     ===================================================== */
  if (faqList) {
    $$('.faq-question', faqList).forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        // Close all others
        $$('.faq-item', faqList).forEach(i => {
          i.classList.remove('open');
          i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        // Toggle current
        if (!isOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* =====================================================
     7. CATALOGUE MODAL
     ===================================================== */
  function openModal() {
    catalogueModal?.classList.add('open');
    catalogueModal?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModalFn() {
    catalogueModal?.classList.remove('open');
    catalogueModal?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openCatalogue?.addEventListener('click', openModal);
  closeModal?.addEventListener('click', closeModalFn);

  catalogueModal?.addEventListener('click', (e) => {
    if (e.target === catalogueModal) closeModalFn();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModalFn();
  });

  /* =====================================================
     8. FORM HANDLING (Prevent default + visual feedback)
     ===================================================== */
  [contactForm, catalogueForm].forEach(form => {
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      // Simulate API call
      setTimeout(() => {
        btn.textContent = '✓ Submitted!';
        btn.style.background = '#059669';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
          form.reset();
          if (form === catalogueForm) closeModalFn();
        }, 2000);
      }, 1000);
    });
  });

  /* =====================================================
     9. SMOOTH SCROLL FOR ANCHOR LINKS
     ===================================================== */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* =====================================================
     10. MODERN VANILLA JS: SCROLL REVEAL (IntersectionObserver)
     Adds beautiful slide-up animations natively when elements
     enter the viewport screen.
     ===================================================== */
  const revealElements = $$(
    '.section-heading, .section-sub, .benefit-card, .process-card, .app-card, .testimonial-card, .specs-table-wrap, .catalogue-cta-card, .trusted-logo'
  );

  // Add initial state class to hide elements
  revealElements.forEach(el => el.classList.add('reveal-node'));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        // Unobserve to animate only once
        observer.unobserve(entry.target);
      }
    });
  }, { root: null, threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

  revealElements.forEach(el => revealObserver.observe(el));

  // Stagger animation delay in grids for a 'waterfall' style reveal effect
  $$('.benefits-grid, .applications-grid, .testimonials-grid, .trusted-logos').forEach(grid => {
    Array.from(grid.children).forEach((child, index) => {
      child.style.animationDelay = `${index * 0.12}s`;
    });
  });

  /* =====================================================
     11. MODERN VANILLA JS: 3D CARD TILT EFFECT
     Calculates cursor relative to center to achieve 3D rotation
     on hover, giving a premium 'glass' tactile feel.
     ===================================================== */
  const tiltCards = $$('.benefit-card, .app-card');

  tiltCards.forEach(card => {
    card.classList.add('tilt-card');
    
    card.addEventListener('mousemove', (e) => {
      // Don't tilt if we are on tablet/mobile where hover isn't natural
      if (window.innerWidth < 1024) return;
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation (max tilt +/- 8 degrees)
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = 'transform 0.1s ease-out';
      card.style.zIndex = '10';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      card.style.transition = 'transform 0.5s ease-out';
      card.style.zIndex = '1';
    });
  });

  /* =====================================================
     12. DYNAMIC FOOTER YEAR
     ===================================================== */
  const yearSpan = $('#currentYear');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

})();
