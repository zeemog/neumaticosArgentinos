/**
 * CONFIGURACIÓN CENTRAL DEL SITIO - NEUMÁTICOS ARGENTINOS
 * 
 * Modifica los valores en este archivo para actualizar en TODA la web
 * el número de WhatsApp, datos de contacto, redes sociales y conexión a datos.
 * NO es necesario modificar los componentes de la interfaz.
 */

export const SITE_CONFIG = {
  // Información Comercial
  companyName: "NEUMÁTICOS ARGENTINOS",
  companyShortName: "Neumáticos Argentinos",
  slogan: "Centro Integral de Neumáticos & Servicios Automotrices",
  experienceYears: 15,
  satisfiedClients: 5000,

  // WhatsApp Principal para Cotizaciones (Formato internacional sin + ni guiones para enlace wa.me)
  // Ejemplo Argentina: 549 + código de área sin 0 + número sin 15 -> ej: 5491134567890
  whatsappNumber: "5493525405771",
  whatsappDisplay: "+54 9 3525 40-5771",

  // Canales de Contacto Directo
  phone: "011 4855-9200",
  phoneRaw: "01148559200",
  email: "ventas@neumaticosargentinos.com.ar",
  address: "Av. Warnes 1420, CABA, Buenos Aires",
  addressNotes: "A 3 cuadras de Av. Juan B. Justo - Estacionamiento propio para clientes",
  googleMapsUrl: "https://maps.google.com/?q=Av.+Warnes+1420,+Buenos+Aires",

  // Horarios de Atención
  schedule: {
    weekdays: "Lunes a Viernes: 08:00 a 18:30 hs",
    saturdays: "Sábados: 08:30 a 13:30 hs",
    sundays: "Domingos y Feriados: Cerrado"
  },

  // Redes Sociales
  instagram: "@neumaticosargentinos",
  instagramUrl: "https://instagram.com/neumaticosargentinos",
  facebookUrl: "https://facebook.com/neumaticosargentinos",

  // Mensaje por defecto cuando el usuario contacta sin vehículo seleccionado
  defaultContactMessage: "Hola, me comunico desde la web de Neumáticos Argentinos. Quisiera hacerles una consulta comercial.",

  // Configuración de la Fuente de Datos (Google Sheets o Local)
  dataSource: {
    // Modo actual: 'local' (usa data/vehicles.json). Cambiar a 'google_sheets' cuando esté listo.
    mode: 'local',

    // Configuración para futura integración directa con Google Sheets:
    googleSheets: {
      // ID del Google Sheet público (extraído de la URL https://docs.google.com/spreadsheets/d/TU_ID_AQUI/edit)
      sheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms", // ID de ejemplo
      sheetTabName: "Vehiculos", // Nombre de la hoja o pestaña
      // Si usas API Key de Google Cloud:
      apiKey: "",
      // Si usas Google Visualization API pública (sin API key):
      // https://docs.google.com/spreadsheets/d/{sheetId}/gviz/tq?tqx=out:json&sheet={sheetTabName}
      useGvizPublicFeed: true
    }
  }
};

// Asignación global para compatibilidad tanto en módulos ES como en scripts tradicionales
if (typeof window !== 'undefined') {
  window.SITE_CONFIG = SITE_CONFIG;
}
