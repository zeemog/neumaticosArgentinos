/**
 * WHATSAPP SERVICE - Generador Centralizado de Enlaces de Cotización
 * 
 * Gestiona de forma uniforme todas las interacciones de WhatsApp del sitio,
 * consumiendo siempre el número configurado en js/config.js.
 */

import { SITE_CONFIG } from '../config.js';

export class WhatsAppService {
  /**
   * Obtiene el número oficial de WhatsApp limpio para la API
   */
  static getCleanNumber() {
    return (SITE_CONFIG.whatsappNumber || '').replace(/\D/g, '');
  }

  /**
   * Genera el enlace directo a WhatsApp (wa.me) con el mensaje codificado
   * @param {string} message - Texto del mensaje sin codificar
   * @returns {string} URL completa de wa.me
   */
  static buildUrl(message) {
    const number = this.getCleanNumber();
    const encodedMessage = encodeURIComponent(message.trim());
    return `https://wa.me/${number}?text=${encodedMessage}`;
  }

  /**
   * Genera el mensaje específico y enlace de cotización para un vehículo consultado
   * Cumple con el formato exacto requerido por el cliente:
   * 
   * "Hola, estoy interesado en cotizar cubiertas para mi Toyota Etios 2018 1.5.
   *  La medida recomendada es 175/65 R14.
   *  ¿Podrían pasarme opciones y precios?"
   * 
   * @param {Object} vehicle - Objeto del vehículo encontrado
   * @param {number|string} [selectedYear] - Año seleccionado opcional por el usuario
   * @returns {Object} { url, messageText }
   */
  static generateVehicleQuote(vehicle, selectedYear = null) {
    if (!vehicle) {
      return {
        url: this.buildUrl(SITE_CONFIG.defaultContactMessage),
        messageText: SITE_CONFIG.defaultContactMessage
      };
    }

    // Determinamos la representación del año o rango
    const yearDisplay = selectedYear 
      ? selectedYear 
      : (vehicle.year_from === vehicle.year_to ? `${vehicle.year_from}` : `${vehicle.year_from}-${vehicle.year_to}`);

    // Versión y motor limpios
    const versionDisplay = [vehicle.version, vehicle.engine].filter(Boolean).join(' ');

    // Construcción del mensaje exacto
    const message = `Hola, estoy interesado en cotizar cubiertas para mi ${vehicle.brand} ${vehicle.model} ${yearDisplay} ${versionDisplay}.\n\nLa medida recomendada es ${vehicle.tire_size}.\n\n¿Podrían pasarme opciones y precios?`;

    return {
      url: this.buildUrl(message),
      messageText: message
    };
  }

  /**
   * Cotización rápida por categoría de neumático (Auto, SUV, Camioneta, Utilitario)
   */
  static generateCategoryQuote(categoryName) {
    const message = `Hola, me contacto desde su sitio web. Quisiera cotizar opciones y precios de neumáticos para la categoría: ${categoryName}. ¿Qué marcas y promociones tienen disponibles?`;
    return {
      url: this.buildUrl(message),
      messageText: message
    };
  }

  /**
   * Cotización de servicios mecánicos / de gomería (Alineación, Balanceo, etc.)
   */
  static generateServiceQuote(serviceName) {
    const message = `Hola, quisiera consultar precios y turnos disponibles para el servicio de: ${serviceName}. ¿Podrían asesorarme?`;
    return {
      url: this.buildUrl(message),
      messageText: message
    };
  }

  /**
   * Abre directamente la ventana de WhatsApp
   */
  static openChat(url) {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}

if (typeof window !== 'undefined') {
  window.WhatsAppService = WhatsAppService;
}
