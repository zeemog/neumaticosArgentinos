# 🚗 Neumáticos Argentinos - Web Comercial & Buscador por Vehículo

> Aplicación web comercial de alto impacto para gomerías y centros integrales de neumáticos, con **buscador interactivo de medidas por vehículo** y **cotización automática vía WhatsApp con mensaje pre-armado**.

![Preview](assets/images/hero-tire.jpg)

---

## 🌟 Características Principales

- **Buscador de Neumáticos en 3 Pasos**:
  1. **Marca**: Selección asistida (*Toyota, Volkswagen, Ford, Fiat, Chevrolet, Renault, Peugeot, Citroën, Honda, Nissan, etc.*) con chips de acceso rápido para móviles.
  2. **Modelo**: Desplegable dinámico reactivo según la marca seleccionada.
  3. **Año / Versión / Motor**: Identificación de variantes para diferenciar llantas de distinto rodado.
- **Tarjeta de Resultado Técnica & Didáctica**:
  - Medida homologada oficial (ej: `175/65 R14 82T`).
  - Desglose didáctico: **175** (Ancho en mm) • **65** (Perfil %) • **R14** (Rodado en pulgadas).
  - Presión recomendada de inflado y carga.
  - Previsualización del mensaje exacto de WhatsApp.
- **Cotización Automática por WhatsApp**:
  - Botón de conversión directa que abre `wa.me` con el mensaje pre-armado:
    > *"Hola, estoy interesado en cotizar cubiertas para mi Toyota Etios 2018 1.5. La medida recomendada es 175/65 R14. ¿Podrían pasarme opciones y precios?"*
  - **Número de WhatsApp centralizado**: definido en un único archivo de configuración (`js/config.js`), sin números dispersos en el código.
- **Arquitectura Desacoplada lista para Google Sheets**:
  - Servicio `VehicleService` que abstrae el origen de datos.
  - Función `getVehicleData()` preparada para alternar entre catálogo local (`data/vehicles.json`) y **Google Sheets API** sin reconstruir la interfaz.
- **Secciones Comerciales Completas**:
  - **Header**: Logo automotriz y botón directo de WhatsApp.
  - **Hero**: Banner de conversión y acceso rápido al buscador.
  - **Empresa**: Trayectoria, pilares y contadores animados (+15 años, +5.000 clientes, etc.).
  - **Categorías**: Autos, SUV, Camionetas 4x4 y Utilitarios de carga.
  - **Servicios**: Alineación 3D, Balanceo digital, Vulcanizado y Sensores TPMS.
  - **Contacto**: Horarios semanales, teléfonos, dirección en Warnes e Instagram.
  - **Botón Flotante de WhatsApp**: Accesible en todo momento.

---

## 🚀 Cómo Ejecutar el Proyecto

### Opción 1: Con Vite / Node.js
```bash
npm install
npm run dev
```
Abre en tu navegador: `http://localhost:5173/`

### Opción 2: Con el Lanzador de 1 Clic (Windows)
Doble clic en:
```
start-server.bat
```
Detecta automáticamente el mejor servidor disponible (Vite, Python o PowerShell) y abre el navegador por ti.

### Opción 3: Servidor de PowerShell o Python
```powershell
# Con PowerShell
powershell -ExecutionPolicy Bypass -File server.ps1

# Con Python
python -m http.server 8080
```

---

## 📁 Estructura del Proyecto

```
├── index.html                   # Maquetado semántico y SEO
├── package.json                 # Configuración de dependencias y scripts Vite
├── start-server.bat             # Script de lanzamiento 1-click
├── server.ps1                   # Servidor HTTP nativo en PowerShell
│
├── data/
│   ├── vehicles.json            # Base de datos simulada en JSON (52 variantes)
│   └── vehicles.data.js         # Wrapper para respaldo offline/estático
│
├── js/
│   ├── config.js                # Configuración de contacto, WhatsApp y Google Sheets
│   ├── app.js                   # Punto de entrada y orquestación
│   ├── services/
│   │   ├── vehicleService.js    # Capa de datos desacoplada (Google Sheets ready)
│   │   └── whatsappService.js   # Generador de enlaces de WhatsApp
│   └── components/
│       ├── vehicleSearch.js     # Buscador de vehículos y tarjeta de resultado
│       └── uiAnimations.js      # Contadores, menú móvil y micro-interacciones
│
├── css/
│   └── style.css                # Sistema de diseño automotriz (grafito, ámbar y verde WhatsApp)
│
└── assets/
    └── images/                  # Fotografía comercial para banners y líneas de cubiertas
```

---

## ⚙️ Configuración

Para cambiar el número de WhatsApp, nombre o redes, edita únicamente:
`js/config.js`

```javascript
export const SITE_CONFIG = {
  companyName: "NEUMÁTICOS ARGENTINOS",
  whatsappNumber: "5491134567890",      // Tu número en formato internacional (sin + ni guiones)
  whatsappDisplay: "+54 9 11 3456-7890", // Lo que ve el usuario en pantalla
  phone: "011 4855-9200",
  address: "Av. Warnes 1420, CABA, Buenos Aires",
  // ...
};
```

---

## 📄 Licencia

Proyecto desarrollado como DEMO Comercial / MVP para gomerías y distribuidoras de neumáticos.
