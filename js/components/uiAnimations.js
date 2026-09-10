/**
 * UI ANIMATIONS & COMPONENT HELPERS
 * 
 * Contadores animados, menú móvil, sticky header y enlace automático
 * de la configuración global (SITE_CONFIG) al DOM.
 */

import { SITE_CONFIG } from '../config.js';
import { WhatsAppService } from '../services/whatsappService.js';

export class UIController {
  static init() {
    this.populateSiteConfig();
    this.initMobileNav();
    this.initStickyHeader();
    this.initStatCounters();
    this.initSmoothScroll();
    this.initCategoryCtaButtons();
    this.initServiceCtaButtons();
  }

  /**
   * Inyecta automáticamente los valores de SITE_CONFIG en todos los elementos
   * del HTML que tengan atributos data-config-* para que nunca haya datos desincronizados.
   */
  static populateSiteConfig() {
    // Nombre de la empresa
    document.querySelectorAll('[data-config="companyName"]').forEach(el => {
      el.textContent = SITE_CONFIG.companyName;
    });

    // Teléfono
    document.querySelectorAll('[data-config="phone"]').forEach(el => {
      el.textContent = SITE_CONFIG.phone;
      if (el.tagName === 'A') {
        el.href = `tel:${SITE_CONFIG.phoneRaw}`;
      }
    });

    // WhatsApp
    document.querySelectorAll('[data-config="whatsappDisplay"]').forEach(el => {
      el.textContent = SITE_CONFIG.whatsappDisplay;
    });

    // Dirección
    document.querySelectorAll('[data-config="address"]').forEach(el => {
      el.textContent = SITE_CONFIG.address;
    });

    // Instagram
    document.querySelectorAll('[data-config="instagram"]').forEach(el => {
      el.textContent = SITE_CONFIG.instagram;
      if (el.tagName === 'A') {
        el.href = SITE_CONFIG.instagramUrl;
      }
    });

    // Horarios
    document.querySelectorAll('[data-config="scheduleWeekdays"]').forEach(el => {
      el.textContent = SITE_CONFIG.schedule.weekdays;
    });
    document.querySelectorAll('[data-config="scheduleSaturdays"]').forEach(el => {
      el.textContent = SITE_CONFIG.schedule.saturdays;
    });

    // Botones generales de WhatsApp
    document.querySelectorAll('.js-whatsapp-general-btn').forEach(btn => {
      btn.href = WhatsAppService.buildUrl(SITE_CONFIG.defaultContactMessage);
    });

    // Botón flotante de WhatsApp
    const floatingBtn = document.getElementById('floating-whatsapp-btn');
    if (floatingBtn) {
      floatingBtn.href = WhatsAppService.buildUrl('Hola, me comunico desde su sitio web. Quisiera hacer una consulta sobre neumáticos.');
    }
  }

  /**
   * Menú móvil responsive con drawer
   */
  static initMobileNav() {
    const hamburger = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('main-nav-menu');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-menu-link');

    if (!hamburger || !navMenu) return;

    const toggleMenu = () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
      document.body.classList.toggle('no-scroll', navMenu.classList.contains('active'));
    };

    hamburger.addEventListener('click', toggleMenu);

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
    });
  }

  /**
   * Header translúcido al hacer scroll
   */
  static initStickyHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /**
   * Animación numérica suave para las estadísticas de la empresa
   */
  static initStatCounters() {
    const statElements = document.querySelectorAll('.stat-number[data-target]');
    if (statElements.length === 0) return;

    let hasRun = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasRun) {
          hasRun = true;
          statElements.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            const prefix = stat.getAttribute('data-prefix') || '';
            const suffix = stat.getAttribute('data-suffix') || '';
            const duration = 1800;
            const startTime = performance.now();

            const updateCount = (now) => {
              const progress = Math.min((now - startTime) / duration, 1);
              // Easing easeOutExpo
              const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              const currentVal = Math.floor(ease * target);

              stat.textContent = `${prefix}${currentVal.toLocaleString('es-AR')}${suffix}`;

              if (progress < 1) {
                requestAnimationFrame(updateCount);
              } else {
                stat.textContent = `${prefix}${target.toLocaleString('es-AR')}${suffix}`;
              }
            };

            requestAnimationFrame(updateCount);
          });
        }
      });
    }, { threshold: 0.2 });

    const statsSection = document.querySelector('.company-stats-strip');
    if (statsSection) {
      observer.observe(statsSection);
    }
  }

  /**
   * Scroll suave al hacer clic en enlaces de anclaje (ej: "Buscar mi cubierta")
   */
  static initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  /**
   * Botones de cotización rápida en tarjetas de categorías
   */
  static initCategoryCtaButtons() {
    document.querySelectorAll('[data-category-quote]').forEach(btn => {
      const category = btn.getAttribute('data-category-quote');
      btn.href = WhatsAppService.generateCategoryQuote(category).url;
    });
  }

  /**
   * Botones de cotización rápida en servicios de taller
   */
  static initServiceCtaButtons() {
    document.querySelectorAll('[data-service-quote]').forEach(btn => {
      const service = btn.getAttribute('data-service-quote');
      btn.href = WhatsAppService.generateServiceQuote(service).url;
    });
  }
}
