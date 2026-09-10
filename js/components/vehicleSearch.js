/**
 * VEHICLE SEARCH COMPONENT - Buscador Interactivo de Neumáticos
 * 
 * Gestiona la experiencia paso a paso del usuario:
 * Paso 1: Marca
 * Paso 2: Modelo
 * Paso 3: Año / Versión / Motor
 * Resultado: Medida, desglose técnico de dimensiones y enlace a WhatsApp pre-armado.
 */

import { vehicleService } from '../services/vehicleService.js';
import { WhatsAppService } from '../services/whatsappService.js';
import { SITE_CONFIG } from '../config.js';

export class VehicleSearchComponent {
  constructor(containerId = 'vehicle-search-container') {
    this.container = document.getElementById(containerId);
    this.selectedBrand = '';
    this.selectedModel = '';
    this.selectedVariantId = '';
    this.selectedYear = '';
    this.variantsList = [];
    this.currentResult = null;
    this.state = 'idle'; // 'idle' | 'loading' | 'success' | 'empty' | 'error' | 'validation_error'
    this.validationMessage = '';
  }

  async init() {
    if (!this.container) return;
    this.renderSkeleton();
    try {
      await vehicleService.getVehicleData();
      await this.render();
      this.bindEvents();
    } catch (error) {
      console.error('Error al inicializar el buscador:', error);
      this.state = 'error';
      this.render();
    }
  }

  renderSkeleton() {
    this.container.innerHTML = `
      <div class="search-box-card skeleton-loading">
        <div class="search-skeleton-bar" style="width: 60%; height: 28px; margin-bottom: 20px;"></div>
        <div class="search-grid-skeleton">
          <div class="search-skeleton-bar" style="height: 52px;"></div>
          <div class="search-skeleton-bar" style="height: 52px;"></div>
          <div class="search-skeleton-bar" style="height: 52px;"></div>
        </div>
      </div>
    `;
  }

  async render() {
    const brands = await vehicleService.getBrands();

    let popularBrands = ['Toyota', 'Volkswagen', 'Ford', 'Fiat', 'Chevrolet', 'Renault', 'Peugeot'];
    popularBrands = popularBrands.filter(pb => brands.includes(pb));

    this.container.innerHTML = `
      <div class="search-box-card" id="search-card">
        <!-- Encabezado de Pasos -->
        <div class="search-steps-header">
          <div class="step-indicator ${this.selectedBrand ? 'completed' : 'active'}" data-step="1">
            <span class="step-num">1</span>
            <span class="step-text">Marca</span>
          </div>
          <div class="step-line ${this.selectedBrand ? 'active' : ''}"></div>
          <div class="step-indicator ${!this.selectedBrand ? '' : (this.selectedModel ? 'completed' : 'active')}" data-step="2">
            <span class="step-num">2</span>
            <span class="step-text">Modelo</span>
          </div>
          <div class="step-line ${this.selectedModel ? 'active' : ''}"></div>
          <div class="step-indicator ${this.selectedVariantId ? 'completed' : (this.selectedModel ? 'active' : '')}" data-step="3">
            <span class="step-num">3</span>
            <span class="step-text">Año / Versión</span>
          </div>
        </div>

        <!-- Alerta de validación o error -->
        ${this.validationMessage ? `
          <div class="search-alert-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>${this.validationMessage}</span>
          </div>
        ` : ''}

        <!-- Formulario de Selección -->
        <form class="search-form-grid" id="vehicle-search-form" onsubmit="return false;">
          
          <!-- PASO 1: MARCA -->
          <div class="form-group">
            <label for="select-brand" class="form-label">
              <span class="label-step-badge">Paso 1</span>
              Seleccioná la marca:
            </label>
            <div class="select-wrapper">
              <select id="select-brand" class="custom-select ${this.selectedBrand ? 'has-value' : ''}">
                <option value="">-- Seleccionar Marca --</option>
                ${brands.map(b => `<option value="${b}" ${b === this.selectedBrand ? 'selected' : ''}>${b}</option>`).join('')}
              </select>
              <span class="select-arrow">▼</span>
            </div>

            <!-- Accesos rápidos para móvil -->
            <div class="popular-brands-chips">
              <span class="chips-title">Populares:</span>
              <div class="chips-list">
                ${popularBrands.map(pb => `
                  <button type="button" class="brand-chip ${pb === this.selectedBrand ? 'active' : ''}" data-brand="${pb}">
                    ${pb}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- PASO 2: MODELO -->
          <div class="form-group">
            <label for="select-model" class="form-label ${!this.selectedBrand ? 'disabled' : ''}">
              <span class="label-step-badge">Paso 2</span>
              Seleccioná el modelo:
            </label>
            <div class="select-wrapper ${!this.selectedBrand ? 'disabled' : ''}">
              <select id="select-model" class="custom-select ${this.selectedModel ? 'has-value' : ''}" ${!this.selectedBrand ? 'disabled' : ''}>
                <option value="">${this.selectedBrand ? '-- Seleccionar Modelo --' : '-- Primero elegí marca --'}</option>
              </select>
              <span class="select-arrow">▼</span>
            </div>
          </div>

          <!-- PASO 3: AÑO / VERSIÓN -->
          <div class="form-group">
            <label for="select-variant" class="form-label ${!this.selectedModel ? 'disabled' : ''}">
              <span class="label-step-badge">Paso 3</span>
              Año / Versión / Motor:
            </label>
            <div class="select-wrapper ${!this.selectedModel ? 'disabled' : ''}">
              <select id="select-variant" class="custom-select ${this.selectedVariantId ? 'has-value' : ''}" ${!this.selectedModel ? 'disabled' : ''}>
                <option value="">${this.selectedModel ? '-- Seleccionar Versión --' : '-- Primero elegí modelo --'}</option>
              </select>
              <span class="select-arrow">▼</span>
            </div>
          </div>

        </form>

        <!-- Botones de Acción de Búsqueda -->
        <div class="search-actions-bar">
          <button type="button" id="btn-submit-search" class="btn btn-primary btn-search-action">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Ver Medida Recomendada</span>
          </button>

          ${(this.selectedBrand || this.selectedModel) ? `
            <button type="button" id="btn-reset-search" class="btn btn-outline-secondary btn-reset-action" title="Reiniciar búsqueda">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              <span>Limpiar</span>
            </button>
          ` : ''}
        </div>

        <!-- Contenedor Dinámico de Resultados / Estados -->
        <div id="search-result-area" class="search-result-area">
          ${this.renderCurrentState()}
        </div>

      </div>
    `;

    // Si ya teníamos marca y modelo seleccionados, repoblamos sus selects
    if (this.selectedBrand) {
      await this.populateModels(this.selectedBrand, false);
    }
    if (this.selectedModel) {
      await this.populateVariants(this.selectedBrand, this.selectedModel, false);
    }

    this.bindDynamicEvents();
  }

  renderCurrentState() {
    switch (this.state) {
      case 'loading':
        return `
          <div class="search-loading-state">
            <div class="automotive-spinner">
              <div class="tire-wheel-animation"></div>
            </div>
            <p class="loading-text">Buscando especificaciones oficiales del fabricante...</p>
          </div>
        `;

      case 'success':
        return this.renderResultCard();

      case 'empty':
        return `
          <div class="search-empty-state">
            <div class="empty-icon-wrapper">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h4 class="empty-title">¿No encontraste tu versión exacta?</h4>
            <p class="empty-desc">
              Tenemos stock para más de 1.200 configuraciones y vehículos especiales o importados. 
              Consultá directamente con un asesor técnico ahora mismo.
            </p>
            <a href="${WhatsAppService.buildUrl('Hola, no encontré la medida de mi vehículo en la web. ¿Podrían asesorarme?')}" 
               target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp-compact">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
              Consultar con un Asesor Técnico
            </a>
          </div>
        `;

      case 'error':
        return `
          <div class="search-error-state">
            <p>Ocurrió un inconveniente al cargar la información. Por favor reintenta o comunícate vía WhatsApp.</p>
          </div>
        `;

      default:
        return `
          <div class="search-prompt-state">
            <div class="prompt-icon">🚗</div>
            <p>Completá los 3 pasos para descubrir la medida original y homologada para tu vehículo.</p>
          </div>
        `;
    }
  }

  renderResultCard() {
    if (!this.currentResult) return '';

    const v = this.currentResult;
    const parsed = vehicleService.parseTireSize(v.tire_size) || {
      width: '---',
      profile: '--',
      rim: 'R--',
      rimDiameter: '--'
    };

    const quoteData = WhatsAppService.generateVehicleQuote(v, this.selectedYear || null);

    return `
      <div class="result-card-container animate-fade-in" id="result-card">
        
        <!-- Header del Resultado -->
        <div class="result-header">
          <div class="result-vehicle-info">
            <span class="vehicle-category-badge">${v.vehicle_category}</span>
            <h3 class="result-vehicle-title">
              ${v.brand.toUpperCase()} ${v.model.toUpperCase()}
            </h3>
            <p class="result-vehicle-subtitle">
              Años: <strong>${v.year_from} - ${v.year_to}</strong> | Versión: <strong>${v.version}</strong> ${v.engine ? `(${v.engine})` : ''}
            </p>
          </div>
          <div class="result-badge-homologated">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Medida Homologada</span>
          </div>
        </div>

        <!-- Bloque Principal de Medida -->
        <div class="result-tire-showcase">
          <div class="showcase-label">MEDIDA RECOMENDADA DE FÁBRICA:</div>
          <div class="tire-size-display">
            <span class="size-main">${v.tire_size}</span>
            ${v.load_speed_index ? `<span class="size-index">${v.load_speed_index}</span>` : ''}
          </div>
        </div>

        <!-- Desglose Didáctico de la Medida (175 = ancho, 65 = perfil, R14 = rodado) -->
        <div class="tire-anatomy-grid">
          
          <div class="anatomy-card">
            <div class="anatomy-value">${parsed.width}</div>
            <div class="anatomy-title">ANCHO</div>
            <div class="anatomy-desc">Milímetros de contacto con el asfalto</div>
          </div>

          <div class="anatomy-card">
            <div class="anatomy-value">${parsed.profile}</div>
            <div class="anatomy-title">PERFIL</div>
            <div class="anatomy-desc">% de altura respecto del ancho</div>
          </div>

          <div class="anatomy-card highlight">
            <div class="anatomy-value">${parsed.rim}</div>
            <div class="anatomy-title">RODADO</div>
            <div class="anatomy-desc">Construcción radial en ${parsed.rimDiameter}"</div>
          </div>

        </div>

        <!-- Ficha técnica complementaria -->
        <div class="result-specs-strip">
          <div class="spec-item">
            <span class="spec-label">Presión recomendada:</span>
            <span class="spec-value">${v.recommended_pressure || '32 PSI'}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Índice Carga / Vel:</span>
            <span class="spec-value">${v.load_speed_index || 'Estándar'}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Colocación:</span>
            <span class="spec-value text-accent">Gratis en nuestro taller</span>
          </div>
        </div>

        <!-- Mensaje pre-armado que se enviará -->
        <div class="quote-preview-box">
          <div class="preview-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Mensaje preparado para WhatsApp:</span>
          </div>
          <p class="preview-text">"${quoteData.messageText.replace(/\n/g, '<br>')}"</p>
        </div>

        <!-- BOTÓN PRINCIPAL DE COTIZACIÓN -->
        <div class="result-cta-section">
          <a href="${quoteData.url}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp-cta" id="btn-request-quote">
            <span class="whatsapp-icon-pulse">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.367-12.513c-.282-.466-.779-.742-1.323-.742-1.127 0-2.457 1.156-3.033 2.054-1.189 1.854-2.181 3.906-2.936 6.096-.289.837-.849 1.488-1.639 1.895-.399.206-.729.508-.956.883-.357.589-.452 1.298-.266 1.964.331 1.182 1.157 2.164 2.275 2.705.807.39 1.716.48 2.584.256 1.159-.299 2.196-.988 2.983-1.979 1.241-1.565 2.234-3.324 2.946-5.204.301-.796.22-1.688-.222-2.417z"/>
              </svg>
            </span>
            <div class="cta-text-group">
              <span class="cta-title">SOLICITAR COTIZACIÓN POR WHATSAPP</span>
              <span class="cta-subtitle">Respuesta inmediata con opciones de marcas y precios</span>
            </div>
            <span class="cta-arrow">→</span>
          </a>

          <p class="cta-guarantee-note">
            🔒 Atención directa por WhatsApp oficial (${SITE_CONFIG.whatsappDisplay}) • Sin compromiso de compra
          </p>
        </div>

      </div>
    `;
  }

  bindEvents() {
    // Delegación o eventos principales
  }

  bindDynamicEvents() {
    const brandSelect = document.getElementById('select-brand');
    const modelSelect = document.getElementById('select-model');
    const variantSelect = document.getElementById('select-variant');
    const submitBtn = document.getElementById('btn-submit-search');
    const resetBtn = document.getElementById('btn-reset-search');

    // Cambio de Marca
    if (brandSelect) {
      brandSelect.addEventListener('change', async (e) => {
        this.validationMessage = '';
        this.selectedBrand = e.target.value;
        this.selectedModel = '';
        this.selectedVariantId = '';
        this.currentResult = null;
        this.state = 'idle';
        await this.render();
      });
    }

    // Clicks en chips de marcas populares
    const chips = this.container.querySelectorAll('.brand-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', async () => {
        const brand = chip.getAttribute('data-brand');
        this.validationMessage = '';
        this.selectedBrand = brand;
        this.selectedModel = '';
        this.selectedVariantId = '';
        this.currentResult = null;
        this.state = 'idle';
        await this.render();
      });
    });

    // Cambio de Modelo
    if (modelSelect) {
      modelSelect.addEventListener('change', async (e) => {
        this.validationMessage = '';
        this.selectedModel = e.target.value;
        this.selectedVariantId = '';
        this.currentResult = null;
        this.state = 'idle';
        await this.populateVariants(this.selectedBrand, this.selectedModel, true);
        this.updateStepIndicators();
      });
    }

    // Cambio de Variante
    if (variantSelect) {
      variantSelect.addEventListener('change', (e) => {
        this.validationMessage = '';
        this.selectedVariantId = e.target.value;
        this.updateStepIndicators();
        // Si el usuario selecciona la variante, podemos ejecutar la búsqueda directamente
        if (this.selectedVariantId) {
          this.executeSearch();
        }
      });
    }

    // Botón Buscar
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        this.executeSearch();
      });
    }

    // Botón Reset / Limpiar
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        this.selectedBrand = '';
        this.selectedModel = '';
        this.selectedVariantId = '';
        this.selectedYear = '';
        this.currentResult = null;
        this.state = 'idle';
        this.validationMessage = '';
        await this.render();
      });
    }
  }

  async populateModels(brand, updateDOM = true) {
    const modelSelect = document.getElementById('select-model');
    if (!modelSelect) return;

    if (!brand) {
      modelSelect.innerHTML = '<option value="">-- Primero elegí marca --</option>';
      modelSelect.disabled = true;
      return;
    }

    const models = await vehicleService.getModels(brand);
    modelSelect.innerHTML = `
      <option value="">-- Seleccionar Modelo (${models.length}) --</option>
      ${models.map(m => `<option value="${m}" ${m === this.selectedModel ? 'selected' : ''}>${m}</option>`).join('')}
    `;
    modelSelect.disabled = false;
  }

  async populateVariants(brand, model, autoSelectIfSingle = true) {
    const variantSelect = document.getElementById('select-variant');
    if (!variantSelect) return;

    if (!brand || !model) {
      variantSelect.innerHTML = '<option value="">-- Primero elegí modelo --</option>';
      variantSelect.disabled = true;
      return;
    }

    this.variantsList = await vehicleService.getVariants(brand, model);

    if (this.variantsList.length === 0) {
      variantSelect.innerHTML = '<option value="">Sin variantes registradas</option>';
      variantSelect.disabled = true;
      return;
    }

    variantSelect.innerHTML = `
      <option value="">-- Seleccionar Año / Versión (${this.variantsList.length} opciones) --</option>
      ${this.variantsList.map(v => {
        const yearStr = `${v.year_from}-${v.year_to}`;
        const label = `${yearStr} • ${v.version} ${v.engine ? `(${v.engine})` : ''} → [${v.tire_size}]`;
        return `<option value="${v.id}" ${v.id === this.selectedVariantId ? 'selected' : ''}>${label}</option>`;
      }).join('')}
    `;
    variantSelect.disabled = false;

    // Si solo hay 1 variante para este modelo (ej. Corolla con una versión base o Corsa), la auto-seleccionamos
    if (this.variantsList.length === 1 && autoSelectIfSingle) {
      this.selectedVariantId = this.variantsList[0].id;
      variantSelect.value = this.selectedVariantId;
      this.executeSearch();
    }
  }

  updateStepIndicators() {
    const step1 = this.container.querySelector('[data-step="1"]');
    const step2 = this.container.querySelector('[data-step="2"]');
    const step3 = this.container.querySelector('[data-step="3"]');

    if (step1) {
      step1.className = `step-indicator ${this.selectedBrand ? 'completed' : 'active'}`;
    }
    if (step2) {
      step2.className = `step-indicator ${!this.selectedBrand ? '' : (this.selectedModel ? 'completed' : 'active')}`;
    }
    if (step3) {
      step3.className = `step-indicator ${this.selectedVariantId ? 'completed' : (this.selectedModel ? 'active' : '')}`;
    }
  }

  async executeSearch() {
    // Validaciones de entrada
    if (!this.selectedBrand) {
      this.validationMessage = 'Por favor seleccioná la marca de tu vehículo (Paso 1).';
      await this.render();
      document.getElementById('select-brand')?.focus();
      return;
    }

    if (!this.selectedModel) {
      this.validationMessage = `Por favor seleccioná el modelo de tu ${this.selectedBrand} (Paso 2).`;
      await this.render();
      document.getElementById('select-model')?.focus();
      return;
    }

    if (!this.selectedVariantId) {
      // Si el usuario no eligió versión pero hay variantes, podemos tomar la primera o pedirle que la elija
      if (this.variantsList.length > 0) {
        this.selectedVariantId = this.variantsList[0].id;
      } else {
        this.validationMessage = 'Por favor seleccioná el año o versión correspondiente (Paso 3).';
        await this.render();
        return;
      }
    }

    this.validationMessage = '';
    this.state = 'loading';
    this.updateResultArea();

    // Pequeña simulación realista de búsqueda para feedback visual placentero (400ms)
    setTimeout(async () => {
      const vehicle = await vehicleService.getVehicleById(this.selectedVariantId);

      if (!vehicle) {
        this.state = 'empty';
      } else {
        this.currentResult = vehicle;
        this.state = 'success';
      }

      this.updateResultArea();

      // Scroll suave hacia el resultado si está en pantalla pequeña
      const resultEl = document.getElementById('result-card');
      if (resultEl && window.innerWidth < 768) {
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 380);
  }

  updateResultArea() {
    const area = document.getElementById('search-result-area');
    if (area) {
      area.innerHTML = this.renderCurrentState();
    }
  }
}

if (typeof window !== 'undefined') {
  window.VehicleSearchComponent = VehicleSearchComponent;
}
