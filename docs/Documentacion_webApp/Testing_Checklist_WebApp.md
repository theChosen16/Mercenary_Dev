# **Testing Checklist - Mercenary Web Application**

## **📋 Estado General del Testing**
- **Fecha de Inicio**: 4 de Agosto, 2025
- **Plataforma**: Next.js 15.4.4 con TypeScript
- **URL de Producción**: https://mercenary-dev.vercel.app
- **URL Local**: http://localhost:3000
- **Base de Datos**: SQLite (desarrollo) / PostgreSQL (producción)

---

## **🔐 1. SISTEMA DE AUTENTICACIÓN**

### **1.1 Registro de Usuarios**
- [ ] **Registro básico con email/password**
  - [ ] Validación de email único
  - [ ] Validación de contraseña fuerte
  - [ ] Hash seguro de contraseñas
  - [ ] Confirmación por email
- [ ] **Tipos de usuario**
  - [ ] Registro como Oferente
  - [ ] Registro como Mercenario
  - [ ] Diferenciación de permisos
- [ ] **Validaciones de formulario**
  - [ ] Campos obligatorios
  - [ ] Formato de email válido
  - [ ] Longitud mínima de contraseña
  - [ ] Confirmación de contraseña

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

### **1.2 Inicio de Sesión**
- [ ] **Login básico**
  - [ ] Autenticación con email/password
  - [ ] Generación de JWT tokens
  - [ ] Redirección al dashboard
- [ ] **Autenticación de dos factores (2FA)**
  - [ ] Configuración inicial con QR code
  - [ ] Validación TOTP (Google Authenticator)
  - [ ] Códigos de respaldo
  - [ ] Desactivación de 2FA
- [ ] **Gestión de sesiones**
  - [ ] Límite de 5 sesiones activas
  - [ ] Device fingerprinting
  - [ ] Detección de anomalías IP
  - [ ] Cierre automático de sesiones

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

### **1.3 Recuperación de Contraseña**
- [ ] **Proceso de recuperación**
  - [ ] Solicitud de reset por email
  - [ ] Validación de token temporal
  - [ ] Cambio de contraseña
  - [ ] Invalidación de sesiones activas

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

## **🏠 2. NAVEGACIÓN Y UI PRINCIPAL**

### **2.1 Homepage**
- [x] **Elementos visuales**
  - [x] Hero section con CTA - ✅ Visible y funcional
  - [x] Navegación responsive - ✅ Menú superior completo
  - [x] Footer completo - ✅ Enlaces y información presente
- [x] **Funcionalidad**
  - [x] Enlaces a registro/login - ✅ "Iniciar Sesión" visible
  - [ ] Redirección según estado de autenticación - ⚠️ Pendiente por errores NextAuth
  - [x] Carga rápida de recursos - ✅ Página carga correctamente

**Estado**: ✅ **PROBLEMAS VISUALES CORREGIDOS**
**Notas**: 
- ✅ **ROOT CAUSE IDENTIFICADO Y SOLUCIONADO:**
  - **Problema**: Variables CSS faltantes en globals.css (--primary, --card, --muted, etc.)
  - **Síntomas**: Bloques en blanco, símbolos mal dimensionados, espaciado inconsistente
  - **Solución**: Implementación completa del sistema de variables CSS en globals.css
- ✅ **CORRECCIONES IMPLEMENTADAS:**
  - Variables CSS completas para light/dark mode
  - Colores primary, secondary, muted, card, accent definidos
  - Border radius y variables de input configuradas
  - Iconos Lucide React ahora renderizando correctamente
- ✅ **DEPENDENCIAS CORREGIDAS:**
  - jsonwebtoken y @types/jsonwebtoken instalados
  - @radix-ui/react-tabs instalado
  - Componente tabs.tsx creado
- 🚀 **SERVIDOR DE DESARROLLO:**
  - Ejecutándose en http://localhost:3001
  - Browser preview disponible en http://127.0.0.1:62307
  - Compilación exitosa con warnings menores 

---

### **2.2 Dashboard Principal**
- [ ] **Acceso protegido**
  - [ ] Redirección si no autenticado
  - [ ] Carga de datos del usuario
- [ ] **Elementos del dashboard**
  - [ ] Estadísticas personales
  - [ ] Proyectos activos
  - [ ] Notificaciones recientes
  - [ ] Accesos rápidos

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

## **📊 3. SISTEMA DE PROYECTOS**

### **3.1 Creación de Proyectos**
- [ ] **Formulario de creación**
  - [ ] Título y descripción
  - [ ] Categorías disponibles
  - [ ] Presupuesto y plazo
  - [ ] Archivos adjuntos
- [ ] **Validaciones**
  - [ ] Campos obligatorios
  - [ ] Límites de caracteres
  - [ ] Formatos de archivo válidos
  - [ ] Rangos de presupuesto

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

### **3.2 Búsqueda y Filtrado**
- [ ] **Sistema de búsqueda**
  - [ ] Búsqueda por texto
  - [ ] Filtros por categoría
  - [ ] Filtros por presupuesto
  - [ ] Filtros por ubicación
- [ ] **Resultados**
  - [ ] Paginación correcta
  - [ ] Ordenamiento por relevancia
  - [ ] Vista de lista/tarjetas

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

### **3.3 Gestión de Propuestas**
- [ ] **Envío de propuestas**
  - [ ] Formulario de propuesta
  - [ ] Presupuesto personalizado
  - [ ] Tiempo de entrega
  - [ ] Portfolio adjunto
- [ ] **Evaluación de propuestas**
  - [ ] Lista de propuestas recibidas
  - [ ] Comparación de ofertas
  - [ ] Aceptación/rechazo
  - [ ] Comunicación con postulantes

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

## **🎮 4. SISTEMA DE GAMIFICACIÓN**

### **4.1 Sistema de Rachas**
- [ ] **Cálculo de rachas**
  - [ ] Trabajos completados consecutivos
  - [ ] Ventana de 7 días entre trabajos
  - [ ] Visualización de racha actual
- [ ] **Badges de racha**
  - [ ] Iniciador (3 trabajos)
  - [ ] Constante (5 trabajos)
  - [ ] Dedicado (10 trabajos)
  - [ ] Imparable (20 trabajos)
  - [ ] Leyenda (50 trabajos)

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

### **4.2 Sistema de Logros**
- [ ] **Categorías de logros**
  - [ ] STREAK (rachas)
  - [ ] COMPLETION (completación)
  - [ ] SPEED (velocidad)
  - [ ] SOCIAL (social)
  - [ ] SPECIAL (especiales)
- [ ] **Niveles de rareza**
  - [ ] Common (50 XP)
  - [ ] Rare (100 XP)
  - [ ] Epic (200 XP)
  - [ ] Legendary (500 XP)

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

### **4.3 Misiones Diarias**
- [ ] **Misiones automáticas**
  - [ ] Completar perfil
  - [ ] Responder mensajes
  - [ ] Enviar propuesta
- [ ] **Recompensas**
  - [ ] 25-40 XP por misión
  - [ ] Progreso visual
  - [ ] Reset diario

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

### **4.4 Leaderboards**
- [ ] **Categorías de ranking**
  - [ ] Por XP total
  - [ ] Por rachas
  - [ ] Por trabajos completados
- [ ] **Visualización**
  - [ ] Top 10 usuarios
  - [ ] Posición personal
  - [ ] Actualización en tiempo real

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

## **💰 5. SISTEMA DE SUSCRIPCIONES**

### **5.1 Planes de Suscripción**
- [ ] **Plan Gratuito**
  - [ ] 2 trabajos máximo
  - [ ] 1 publicación máximo
  - [ ] Funcionalidades básicas
- [ ] **Plan Profesional ($9,990 CLP/mes)**
  - [ ] 10 trabajos
  - [ ] 5 publicaciones
  - [ ] Perfiles detallados
  - [ ] 20% descuento
- [ ] **Plan Elite ($19,990 CLP/mes)**
  - [ ] Trabajos ilimitados
  - [ ] Publicaciones ilimitadas
  - [ ] 35% descuento
  - [ ] Soporte VIP

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

### **5.2 Integración MercadoPago**
- [ ] **Procesamiento de pagos**
  - [ ] Creación de preferencias
  - [ ] Redirección a MercadoPago
  - [ ] Confirmación de pago
  - [ ] Activación de suscripción
- [ ] **Monedas soportadas**
  - [ ] CLP (Pesos Chilenos)
  - [ ] USD (Dólares)
  - [ ] ARS (Pesos Argentinos)

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

## **🔒 6. SISTEMAS DE SEGURIDAD**

### **6.1 Rate Limiting**
- [ ] **Límites por endpoint**
  - [ ] /auth: Protección contra brute force
  - [ ] /api: Límites generales de API
  - [ ] /payments: Protección de transacciones
- [ ] **Detección de fraude**
  - [ ] Scoring 0-100
  - [ ] Análisis de IP
  - [ ] Análisis de comportamiento
  - [ ] Acciones automáticas (ALLOW/CHALLENGE/BLOCK)

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

### **6.2 Encriptación de Chats**
- [ ] **End-to-End Encryption**
  - [ ] RSA 2048-bit para intercambio
  - [ ] AES-256-GCM para mensajes
  - [ ] Perfect Forward Secrecy
  - [ ] Rotación de claves
- [ ] **Funcionalidad de chat**
  - [ ] Envío de mensajes encriptados
  - [ ] Recepción y desencriptación
  - [ ] Historial seguro

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

### **6.3 Sistema de Auditoría**
- [ ] **Logging de eventos**
  - [ ] Eventos de autenticación
  - [ ] Cambios de datos críticos
  - [ ] Accesos sospechosos
- [ ] **Niveles de severidad**
  - [ ] LOW: Eventos normales
  - [ ] MEDIUM: Eventos de atención
  - [ ] HIGH: Eventos críticos
  - [ ] CRITICAL: Eventos de emergencia

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

### **6.4 Prevención de Abuso**
- [ ] **Sistema de reportes**
  - [ ] SPAM
  - [ ] HARASSMENT
  - [ ] FRAUD
  - [ ] INAPPROPRIATE_CONTENT
  - [ ] FAKE_PROFILE
  - [ ] SCAM
- [ ] **Trust Score automático**
  - [ ] Cálculo basado en 5 factores
  - [ ] Moderación automática
  - [ ] Escalación de reportes críticos

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

## **🔔 7. SISTEMA DE NOTIFICACIONES**

### **7.1 Notificaciones Web**
- [ ] **Tipos de notificación**
  - [ ] Nuevas propuestas
  - [ ] Mensajes de chat
  - [ ] Cambios de estado de proyecto
  - [ ] Pagos procesados
- [ ] **Configuración de usuario**
  - [ ] Activar/desactivar por tipo
  - [ ] Frecuencia de notificaciones
  - [ ] Canales preferidos

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

### **7.2 Notificaciones Cross-Platform**
- [ ] **Integración móvil**
  - [ ] Push notifications
  - [ ] Sincronización con app móvil
  - [ ] Estado de lectura compartido

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

## **📱 8. RESPONSIVIDAD Y UX**

### **8.1 Diseño Responsive**
- [ ] **Breakpoints**
  - [ ] Mobile (< 768px)
  - [ ] Tablet (768px - 1024px)
  - [ ] Desktop (> 1024px)
- [ ] **Elementos adaptativos**
  - [ ] Navegación móvil
  - [ ] Formularios responsive
  - [ ] Tablas adaptativas
  - [ ] Imágenes escalables

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

### **8.2 Accesibilidad**
- [ ] **Estándares WCAG**
  - [ ] Contraste de colores
  - [ ] Navegación por teclado
  - [ ] Screen reader compatibility
  - [ ] Alt text en imágenes

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

## **⚡ 9. RENDIMIENTO Y OPTIMIZACIÓN**

### **9.1 Métricas de Rendimiento**
- [ ] **Core Web Vitals**
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] FID (First Input Delay) < 100ms
  - [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] **Optimizaciones**
  - [ ] Lazy loading de imágenes
  - [ ] Code splitting
  - [ ] Caching estratégico
  - [ ] Compresión de assets

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

### **9.2 SEO y Meta Tags**
- [ ] **Meta información**
  - [ ] Títulos únicos por página
  - [ ] Descripciones meta
  - [ ] Open Graph tags
  - [ ] Schema markup
- [ ] **Sitemap y robots.txt**
  - [ ] Sitemap XML generado
  - [ ] Robots.txt configurado
  - [ ] Indexación correcta

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

## **🧪 10. TESTING AUTOMATIZADO**

### **10.1 Tests Unitarios**
- [ ] **Componentes React**
  - [ ] Renderizado correcto
  - [ ] Props y estados
  - [ ] Eventos de usuario
- [ ] **Funciones utilitarias**
  - [ ] Validaciones
  - [ ] Formateo de datos
  - [ ] Cálculos de gamificación

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

### **10.2 Tests de Integración**
- [ ] **API Endpoints**
  - [ ] Autenticación
  - [ ] CRUD operations
  - [ ] Manejo de errores
- [ ] **Flujos completos**
  - [ ] Registro → Login → Dashboard
  - [ ] Creación → Propuesta → Contratación
  - [ ] Pago → Activación de suscripción

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

### **10.3 Tests E2E (Playwright)**
- [ ] **Flujos críticos**
  - [ ] Registro de usuario completo
  - [ ] Proceso de contratación
  - [ ] Sistema de pagos
  - [ ] Chat en tiempo real

**Estado**: ⏳ **PENDIENTE**
**Notas**: 

---

## **📊 RESUMEN DE PROGRESO**

### **Estadísticas Generales**
- **Total de Tests**: 0/150+ ⏳
- **Sistemas Críticos**: 0/10 ⏳
- **Funcionalidades Core**: 0/25 ⏳
- **Tests de Seguridad**: 0/20 ⏳

### **Próximos Pasos**
1. **Configurar entorno de testing local**
2. **Iniciar con sistema de autenticación**
3. **Probar funcionalidades básicas**
4. **Validar sistemas de seguridad**
5. **Ejecutar tests de rendimiento**

### **Notas del Tester**
- Fecha de última actualización: 4 de Agosto, 2025
- Responsable: [Nombre del tester]
- Entorno de pruebas: Local + Producción
- Herramientas: Manual + Playwright + Vitest

---

**🎯 OBJETIVO**: Validar que todos los sistemas implementados funcionan correctamente según las especificaciones técnicas y los requisitos de usuario.
