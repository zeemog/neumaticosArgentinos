/**
 * APLICACIÓN PRINCIPAL - NEUMÁTICOS ARGENTINOS
 * Inicializa los módulos y componentes de la web.
 */

import { VehicleSearchComponent } from './components/vehicleSearch.js';
import { UIController } from './components/uiAnimations.js';
import { SITE_CONFIG } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log(`%c🚗 ${SITE_CONFIG.companyName} - Web Comercial Activa`, 'background: #f59e0b; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 4px;');

  // 1. Inicializar animaciones, eventos de interfaz y datos de la empresa
  UIController.init();

  // 2. Inicializar el buscador interactivo de vehículos
  const searchComponent = new VehicleSearchComponent('vehicle-search-container');
  await searchComponent.init();

  // 3. Manejo de año de copyright dinámico
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
