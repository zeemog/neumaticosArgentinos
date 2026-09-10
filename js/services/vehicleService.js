/**
 * VEHICLE SERVICE - Capa de Abstracción de Datos de Vehículos
 * 
 * Este servicio desacopla completamente la interfaz de usuario de la fuente de datos.
 * La UI solo interactúa con los métodos aquí provistos y no conoce si la información
 * proviene de un archivo JSON local, de una base de datos o de Google Sheets.
 */

import { SITE_CONFIG } from '../config.js';

class VehicleService {
  constructor() {
    this.vehiclesCache = null;
    this.isLoading = false;
    this.listeners = [];
  }

  /**
   * Obtiene todos los vehículos desde la fuente configurada.
   * Si está configurado 'google_sheets', consulta la hoja de cálculo.
   * Si está en 'local', lee data/vehicles.json (con fallback a window.DEFAULT_VEHICLES_DATA).
   * 
   * @returns {Promise<Array>} Lista normalizada de vehículos
   */
  async getVehicleData() {
    if (this.vehiclesCache && this.vehiclesCache.length > 0) {
      return this.vehiclesCache;
    }

    const mode = SITE_CONFIG.dataSource?.mode || 'local';

    try {
      if (mode === 'google_sheets') {
        this.vehiclesCache = await this.fetchFromGoogleSheets(SITE_CONFIG.dataSource.googleSheets);
      } else {
        this.vehiclesCache = await this.fetchFromLocal();
      }
    } catch (error) {
      console.warn('Fallo al obtener datos por fetch, usando fallback estático:', error);
      if (typeof window !== 'undefined' && window.DEFAULT_VEHICLES_DATA) {
        this.vehiclesCache = window.DEFAULT_VEHICLES_DATA;
      } else {
        throw new Error('No se pudo cargar la base de datos de vehículos.');
      }
    }

    return this.vehiclesCache;
  }

  /**
   * Carga los datos locales desde data/vehicles.json
   */
  async fetchFromLocal() {
    try {
      const response = await fetch('./data/vehicles.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return this.normalizeVehicles(data);
    } catch (err) {
      // Si estamos abriendo vía file:// o falla el fetch, intentamos window.DEFAULT_VEHICLES_DATA
      if (typeof window !== 'undefined' && window.DEFAULT_VEHICLES_DATA) {
        return this.normalizeVehicles(window.DEFAULT_VEHICLES_DATA);
      }
      throw err;
    }
  }

  /**
   * Conector preparado para GOOGLE SHEETS
   * 
   * Transforma las filas de una planilla de Google Sheets pública en el formato estándar.
   * Columnas esperadas en Google Sheets (Fila 1 = Encabezados):
   * A: Marca | B: Modelo | C: Año Desde | D: Año Hasta | E: Versión | F: Motor | G: Medida | H: Índice | I: Presión | J: Categoría
   */
  async fetchFromGoogleSheets(config) {
    if (!config || !config.sheetId) {
      throw new Error('Configuración de Google Sheets incompleta: falta sheetId');
    }

    const tabName = encodeURIComponent(config.sheetTabName || 'Sheet1');
    const url = `https://docs.google.com/spreadsheets/d/${config.sheetId}/gviz/tq?tqx=out:json&sheet=${tabName}`;

    const response = await fetch(url);
    const text = await response.text();
    
    // Google Sheets GViz API devuelve un string con envoltorio: "/*O_o*/ google.visualization.Query.setResponse({...})"
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Formato de respuesta inválido de Google Sheets');
    }
    
    const parsed = JSON.parse(text.substring(jsonStart, jsonEnd));
    const rows = parsed.table?.rows || [];

    const vehicles = rows.map((row, index) => {
      const c = row.c || [];
      const val = (idx) => (c[idx] && c[idx].v !== null && c[idx].v !== undefined) ? String(c[idx].v).trim() : '';

      return {
        id: `gsheet-${index + 1}`,
        brand: val(0),
        model: val(1),
        year_from: parseInt(val(2), 10) || 2000,
        year_to: parseInt(val(3), 10) || new Date().getFullYear(),
        version: val(4) || 'Estándar',
        engine: val(5) || '',
        tire_size: val(6),
        load_speed_index: val(7) || '',
        recommended_pressure: val(8) || '32 PSI',
        vehicle_category: val(9) || 'Auto'
      };
    }).filter(v => v.brand && v.model && v.tire_size);

    return this.normalizeVehicles(vehicles);
  }

  /**
   * Normaliza y valida la estructura de cada vehículo
   */
  normalizeVehicles(data) {
    if (!Array.isArray(data)) return [];
    return data.map((item, idx) => ({
      id: item.id || `veh-${idx}`,
      brand: (item.brand || '').trim(),
      model: (item.model || '').trim(),
      year_from: Number(item.year_from) || 2000,
      year_to: Number(item.year_to) || new Date().getFullYear(),
      version: (item.version || 'Estándar').trim(),
      engine: (item.engine || '').trim(),
      tire_size: (item.tire_size || '').trim(),
      load_speed_index: (item.load_speed_index || '').trim(),
      recommended_pressure: (item.recommended_pressure || '32 PSI').trim(),
      vehicle_category: (item.vehicle_category || 'Auto').trim()
    }));
  }

  /**
   * Devuelve la lista ordenada de todas las marcas únicas disponibles.
   */
  async getBrands() {
    const data = await this.getVehicleData();
    const brandsSet = new Set(data.map(v => v.brand).filter(Boolean));
    return Array.from(brandsSet).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }

  /**
   * Devuelve la lista ordenada de modelos para una marca específica.
   */
  async getModels(brand) {
    if (!brand) return [];
    const data = await this.getVehicleData();
    const brandLower = brand.toLowerCase();
    const modelsSet = new Set(
      data
        .filter(v => v.brand.toLowerCase() === brandLower)
        .map(v => v.model)
        .filter(Boolean)
    );
    return Array.from(modelsSet).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }

  /**
   * Devuelve las variantes (año, versión, motor, medida) disponibles para una marca y modelo dados.
   */
  async getVariants(brand, model) {
    if (!brand || !model) return [];
    const data = await this.getVehicleData();
    const brandLower = brand.toLowerCase();
    const modelLower = model.toLowerCase();

    return data.filter(v => 
      v.brand.toLowerCase() === brandLower && 
      v.model.toLowerCase() === modelLower
    );
  }

  /**
   * Busca un vehículo por su identificador único.
   */
  async getVehicleById(id) {
    const data = await this.getVehicleData();
    return data.find(v => v.id === id) || null;
  }

  /**
   * Desglosa técnicamente una medida de neumático en sus componentes:
   * Ejemplo: "175/65 R14" -> { width: "175", profile: "65", rim: "R14", rimDiameter: "14", raw: "175/65 R14" }
   */
  parseTireSize(tireSize) {
    if (!tireSize) return null;
    const clean = tireSize.trim();
    // Expresión regular para medidas comunes: 175/65 R14, 205/55R16, 265/60 R18, etc.
    const match = clean.match(/^(\d{3})\/(\d{2,3})\s*(R\d{2})/i);
    
    if (match) {
      return {
        width: match[1],         // Ancho en mm
        profile: match[2],       // Relación de aspecto (perfil en %)
        rim: match[3].toUpperCase(), // Rodado radial (ej: R14)
        rimDiameter: match[3].toUpperCase().replace('R', ''),
        raw: clean
      };
    }

    // Fallback si la medida tiene un formato especial (ej: 31x10.5 R15)
    return {
      width: clean.split('/')[0] || clean,
      profile: (clean.split('/')[1] || '').split(' ')[0] || '',
      rim: clean.match(/R\d{2}/i)?.[0]?.toUpperCase() || 'R',
      rimDiameter: (clean.match(/R(\d{2})/i)?.[1]) || '',
      raw: clean
    };
  }
}

export const vehicleService = new VehicleService();

// Asignación global
if (typeof window !== 'undefined') {
  window.vehicleService = vehicleService;
}
