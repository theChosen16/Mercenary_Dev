# Guía de Automatización del Desarrollo Local con Windsurf IDE, GitHub y LangChain

## Introducción

En el dinámico mundo del desarrollo de software, la eficiencia y la automatización son claves para el éxito. Esta guía está diseñada para desarrolladores que buscan optimizar su flujo de trabajo local aprovechando la potencia de herramientas modernas como Windsurf IDE, las capacidades de CI/CD de GitHub, y el poder de modelos de lenguaje con LangChain. Nuestro objetivo es proporcionar un camino claro y práctico para integrar estas tecnologías, permitiendo un ciclo de desarrollo más rápido, consistente y colaborativo, directamente desde tu máquina de desarrollo.

Este enfoque prioriza la creación de un entorno de desarrollo local robusto y automatizado. Usaremos Windsurf IDE y su agente de IA, Cascade, para acelerar la codificación y la automatización de tareas. GitHub y GitHub Actions servirán como la columna vertebral para el control de versiones y la Integración Continua (CI), asegurando que cada cambio en el código sea probado automáticamente. Finalmente, exploraremos cómo LangChain puede ser integrado para construir aplicaciones inteligentes impulsadas por modelos de lenguaje.

## Tabla de Contenidos

1.  **Core Tools: Windsurf IDE, GitHub y LangChain**
2.  **Configuración del Entorno de Desarrollo Local**
    *   Clonando el Repositorio `Mercenary_Dev`
    *   Instalación de Dependencias con `bootstrap.ps1`
3.  **Scripts de Automatización Local**
    *   Uso de `lint.ps1` para Calidad de Código
    *   Uso de `test.ps1` para Pruebas Automatizadas
4.  **Integración Continua (CI) con GitHub Actions**
    *   Análisis del Flujo de Trabajo `ci.yml`
5.  **Flujo de Trabajo de Desarrollo con IA**
    *   Interactuando con Cascade en Windsurf IDE
    *   Integración de LangChain y MCP Servers
    *   Automatización de GitHub con MCP Server
6.  **(Futuro) Despliegue en un Servidor Remoto (Google Cloud VM)**
    *   Configuración de la VM y SSH
    *   Flujo de Trabajo de Despliegue Continuo (CD)

---

## 1. Core Tools: Windsurf IDE, GitHub y LangChain

*   **Windsurf IDE**: Un entorno de desarrollo avanzado con un agente de IA, **Cascade**, que entiende el contexto de tu código para automatizar tareas, generar código y acelerar la depuración.
*   **GitHub**: La plataforma para alojar nuestro código, gestionar el control de versiones con Git y colaborar.
*   **GitHub Actions**: La herramienta de CI/CD integrada en GitHub que usaremos para automatizar las pruebas de nuestro código en cada `push` y `pull request`.
*   **LangChain**: Un framework para desarrollar aplicaciones impulsadas por modelos de lenguaje, que se puede integrar en nuestros proyectos para añadir funcionalidades inteligentes.

---

## 2. Configuración del Entorno de Desarrollo Local

El primer paso es establecer nuestro entorno de desarrollo en nuestra máquina local.

### Clonando el Repositorio `Mercenary_Dev`

Todo nuestro trabajo se basará en el monorepo `Mercenary_Dev`. Lo clonamos desde GitHub para tener la base del código.

```bash
# Clonar el repositorio usando la URL SSH (recomendado)
git clone git@github.com:theChosen16/Mercenary_Dev.git

# Navegar al directorio del proyecto
cd Mercenary_Dev
```

### Instalación de Dependencias con `bootstrap.ps1`

El monorepo contiene múltiples proyectos (backend, web-app, etc.), cada uno con sus propias dependencias. Para simplificar la instalación, hemos creado un script de PowerShell que se encarga de todo.

Desde la raíz del directorio `Mercenary_Dev`, ejecuta:

```powershell
./scripts/bootstrap.ps1
```

Este script instalará las dependencias de Python para el backend y las dependencias de Node.js para la aplicación web, preparando el entorno para el desarrollo.

---

## 3. Scripts de Automatización Local

Para mantener la consistencia y la calidad del código, hemos creado scripts que automatizan tareas comunes de desarrollo.

### Uso de `lint.ps1` para Calidad de Código

El linting nos ayuda a encontrar errores y problemas de estilo en nuestro código. Para revisar todos los proyectos del monorepo, ejecuta:

```powershell
./scripts/lint.ps1
```

Este script ejecutará `make lint` para el backend de Python y `npm run lint` para el frontend de Node.js.

### Uso de `test.ps1` para Pruebas Automatizadas

Antes de integrar cualquier cambio, es crucial asegurarse de que todas las pruebas pasen. Para ejecutar las suites de pruebas de todos los proyectos, usa:

```powershell
./scripts/test.ps1
```

Este comando orquesta `make test` para el backend y `npm run test` para el frontend.

---

## 4. Integración Continua (CI) con GitHub Actions

La Integración Continua (CI) es una práctica que consiste en fusionar e integrar cambios de código de forma frecuente y automática. Nuestro repositorio está configurado con un flujo de trabajo de GitHub Actions para lograr esto.

### Análisis del Flujo de Trabajo `ci.yml`

El archivo `.github/workflows/ci.yml` define nuestro pipeline de CI. Este flujo de trabajo se activa automáticamente en cada `push` o `pull request` a la rama `main` y realiza los siguientes pasos:

1.  **Checkout Code**: Descarga la última versión del código.
2.  **Setup Environment**: Configura el entorno del runner (ejecutor) con las herramientas necesarias, como PowerShell.
3.  **Bootstrap**: Ejecuta el script `./scripts/bootstrap.ps1` para instalar todas las dependencias.
4.  **Lint**: Ejecuta `./scripts/lint.ps1` para asegurar la calidad del código.
5.  **Test**: Ejecuta `./scripts/test.ps1` para verificar que todos los tests pasan.

Si alguno de estos pasos falla, GitHub nos notificará, permitiéndonos corregir el problema antes de que se integre en la rama principal.

---

## 5. Flujo de Trabajo de Desarrollo con IA

Con Windsurf IDE y Cascade, podemos llevar nuestro desarrollo al siguiente nivel.

### Interactuando con Cascade en Windsurf IDE

Cascade es tu asistente de codificación personal. Puedes pedirle que:

*   **Escriba código**: "Crea una función en FastAPI que reciba un ID de usuario y devuelva sus datos".
*   **Depure errores**: "Estoy recibiendo un error 500 en este endpoint, ¿puedes ayudarme a encontrar la causa?"
*   **Refactorice código**: "Refactoriza este componente de React para que use React Hooks en lugar de clases".
*   **Automatice tareas**: "Crea un nuevo script de PowerShell que ejecute la migración de la base de datos del backend".

### Integración de LangChain y MCP Servers

Para funcionalidades más avanzadas, podemos usar LangChain para construir cadenas de IA complejas dentro de nuestra aplicación. Además, podemos aprovechar los **MCP (Model Context Protocol) Servers** de Windsurf para conectar a Cascade con APIs externas (como la de GitHub), permitiéndole realizar acciones como crear pull requests o comentar en issues directamente desde el IDE.

### Automatización de GitHub con MCP Server

El `github-mcp-server` permite a Cascade interactuar directamente con la API de GitHub. Esto nos permite automatizar tareas repetitivas del flujo de trabajo de Git, como la creación de ramas y Pull Requests, directamente desde el IDE.

Por ejemplo, para iniciar una nueva funcionalidad, puedes pedirle a Cascade:

1.  **Crear una nueva rama**: "Crea una nueva rama llamada `feature/nombre-funcionalidad` desde `main`."
2.  **Realizar cambios y commits**: (Realizas tus cambios en el código)
3.  **Crear un Pull Request**: "Crea un Pull Request desde la rama actual a `main` con el título 'Implementación de nueva funcionalidad'."

Este proceso agiliza el ciclo de desarrollo y reduce el cambio de contexto entre el editor de código y la interfaz de GitHub.

---

## 6. (Futuro) Despliegue en un Servidor Remoto (Google Cloud VM)

Una vez que el desarrollo local esté maduro y la aplicación esté lista para ser desplegada, el siguiente paso será configurar un entorno de producción en un servidor remoto, como una Google Cloud VM.

Esta sección se completará en una fase posterior del proyecto y cubrirá:

*   **Configuración de la VM**: Preparar una VM en Google Cloud con todas las dependencias necesarias (Python, Node.js, Docker, Nginx, etc.).
*   **Gestión de Claves SSH**: Crear y configurar claves SSH para permitir que GitHub Actions se conecte de forma segura a la VM para el despliegue.
*   **Flujo de Trabajo de Despliegue Continuo (CD)**: Crear un nuevo flujo de trabajo de GitHub Actions (`deploy.yml`) que, tras el éxito de la CI, se conecte a la VM y despliegue la nueva versión de la aplicación.
