# Guía de Automatización del Desarrollo Local con Windsurf IDE, GitHub y LangChain

## Introducción

En el dinámico mundo del desarrollo de software, la eficiencia y la automatización son claves para el éxito. Esta guía está diseñada para desarrolladores que buscan optimizar su flujo de trabajo local aprovechando la potencia de herramientas modernas como Windsurf IDE, las capacidades de CI/CD de GitHub, y el poder de modelos de lenguaje con LangChain. Nuestro objetivo es proporcionar un camino claro y práctico para integrar estas tecnologías, permitiendo un ciclo de desarrollo más rápido, consistente y colaborativo, directamente desde tu máquina de desarrollo.

Este enfoque prioriza la creación de un entorno de desarrollo local robusto y automatizado. Usaremos Windsurf IDE y su agente de IA, Cascade, para acelerar la codificación y la automatización de tareas. GitHub y GitHub Actions servirán como la columna vertebral para el control de versiones y la Integración Continua (CI), asegurando que cada cambio en el código sea probado automáticamente. Finalmente, exploraremos cómo LangChain puede ser integrado para construir aplicaciones inteligentes impulsadas por modelos de lenguaje.

## Tabla de Contenidos

1. **Core Tools: Windsurf IDE, GitHub y LangChain**
2. **Configuración del Entorno de Desarrollo Local**
3. **Scripts de Automatización Local**
4. **Integración Continua (CI) con GitHub Actions**
5. **Flujo de Trabajo de Desarrollo con IA**
6. **Automatización Avanzada con GitHub CLI**
7. **Observabilidad con LangSmith**
8. **(Futuro) Despliegue en un Servidor Remoto (Google Cloud VM)**
9. **Conclusión**

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

## 5. Estructura del Proyecto y Flujo de Trabajo

Esta sección describe la organización del monorepo `Mercenary_Dev` y el flujo de trabajo estándar para desarrollar nuevas funcionalidades o corregir errores, utilizando las herramientas de automatización que hemos configurado.

### Organización del Repositorio

El proyecto está organizado como un monorepo para facilitar la gestión de código compartido y la coherencia entre las distintas partes de la aplicación. La estructura principal es la siguiente:

*   `backend/`: Contiene el servidor de la aplicación, construido con FastAPI (Python). Aquí reside toda la lógica de negocio, APIs y la conexión a la base de datos.
*   `web-app/`: La aplicación web principal (Single Page Application) con la que los usuarios interactúan. Probablemente construida con un framework como React, Vue o Svelte.
*   `mobile-app/`: La aplicación móvil, posiblemente desarrollada con un framework multiplataforma como React Native o Flutter.
*   `web-informative/`: Un sitio web estático o de marketing que sirve como la cara pública del proyecto.
*   `docs/`: Un directorio central que consolida toda la documentación del proyecto, incluyendo manuales de arquitectura, guías de API, hojas de ruta y notas de desarrollo.
*   `scripts/`: Contiene los scripts de automatización de PowerShell (`bootstrap.ps1`, `lint.ps1`, `test.ps1`) para estandarizar las tareas de desarrollo.
*   `.github/workflows/`: Define los pipelines de Integración Continua (CI) con GitHub Actions.

### Flujo de Trabajo de Desarrollo Estándar

Aquí se presenta un ciclo de desarrollo típico para añadir una nueva funcionalidad:

1.  **Crear una Rama**: Utiliza el GitHub CLI para crear una nueva rama desde `main` con un nombre descriptivo.
    ```powershell
    # Asegúrate de estar en la rama 'main' y tener la última versión
    git checkout main
    git pull

    # Crea y cambia a la nueva rama
    gh pr checkout -b feature/nombre-de-la-funcionalidad
    ```

2.  **Desarrollar y Codificar**: Realiza los cambios necesarios en el código. Puedes apoyarte en **Cascade** para generar código, refactorizar o depurar.
    > *Ejemplo de prompt para Cascade: "En el backend, crea un nuevo endpoint en FastAPI en `backend/app/api/v1/endpoints/items.py` que acepte una petición POST para crear un nuevo ítem."*

3.  **Verificar Localmente**: Antes de confirmar tus cambios, utiliza los scripts de automatización para asegurar la calidad del código.
    ```powershell
    # Instalar dependencias si es necesario
    ./scripts/bootstrap.ps1

    # Revisar el estilo del código
    ./scripts/lint.ps1

    # Ejecutar todas las pruebas
    ./scripts/test.ps1
    ```

4.  **Confirmar y Subir Cambios**: Haz commit de tus cambios con un mensaje claro y súbelos a GitHub.
    ```bash
    git add .
    git commit -m "feat: Añade endpoint para crear ítems"
    git push --set-upstream origin feature/nombre-de-la-funcionalidad
    ```

5.  **Crear un Pull Request**: Usa el GitHub CLI para abrir un pull request y que tu equipo pueda revisar los cambios.
    ```powershell
    gh pr create --title "feat: Añade endpoint para crear ítems" --body "Este PR introduce la funcionalidad para crear nuevos ítems a través de la API."
    ```
    GitHub Actions ejecutará automáticamente el workflow de CI para verificar que tus cambios no rompen nada.

### Trabajando con Agentes de IA: Cascade y Jules

Este proyecto está diseñado para maximizar la productividad utilizando agentes de IA especializados.

*   **Cascade (Desarrollo Interactivo)**: Utiliza a Cascade dentro de Windsurf IDE para un pair programming constante. Es ideal para tareas que requieren contexto del código y una interacción rápida, como la escritura de funciones, la depuración de errores en tiempo real o la refactorización de código existente.

*   **Jules (Desarrollo Asíncrono)**: Para tareas que pueden ser delegadas, como la corrección de un bug documentado en un issue o la implementación de una pequeña funcionalidad, puedes usar un agente asíncrono como Jules. Como se ve en la imagen, puedes asignarle una tarea directamente desde su interfaz, seleccionar el repositorio y la rama base, y Jules trabajará en ella de forma autónoma, generando un plan y finalmente un pull request para tu revisión.

    > *Ejemplo de tarea para Jules: "Diagnose this memory leak issue #123 and provide a fix."*

Esta combinación te permite mantener el flujo en tareas complejas con Cascade, mientras delegas otras a Jules, optimizando tu tiempo y acelerando el ciclo de desarrollo.

---

## 6. Flujo de Trabajo de Desarrollo con IA

Con Windsurf IDE y Cascade, podemos llevar nuestro desarrollo al siguiente nivel.

### Interactuando con Cascade en Windsurf IDE

Cascade es tu asistente de codificación personal. Puedes pedirle que:

*   **Escriba código**: "Crea una función en FastAPI que reciba un ID de usuario y devuelva sus datos".
*   **Depure errores**: "Estoy recibiendo un error 500 en este endpoint, ¿puedes ayudarme a encontrar la causa?"
*   **Refactorice código**: "Refactoriza este componente de React para que use React Hooks en lugar de clases".
*   **Automatice tareas**: "Crea un nuevo script de PowerShell que ejecute la migración de la base de datos del backend".

### Integración de LangChain y MCP Servers

Para funcionalidades más avanzadas, podemos usar LangChain para construir cadenas de IA complejas dentro de nuestra aplicación. Además, podemos aprovechar los **MCP (Model Context Protocol) Servers** de Windsurf para conectar a Cascade con APIs externas (como la de GitHub), permitiéndole realizar acciones como crear pull requests o comentar en issues directamente desde el IDE.

---

## 6. Automatización Avanzada con GitHub CLI

GitHub CLI (`gh`) es una herramienta de línea de comandos que lleva el poder de GitHub a tu terminal. Te permite gestionar repositorios, pull requests, issues y GitHub Actions directamente, agilizando tu flujo de trabajo.

### Verificación e Instalación

Primero, verifica si `gh` ya está instalado:

```powershell
gh --version
```

Si no está instalado, puedes hacerlo usando `winget`:

```powershell
winget install --id GitHub.cli
```

### Autenticación

Una vez instalado, autentícate con tu cuenta de GitHub. Se recomienda usar el protocolo SSH y la autenticación web para una configuración más segura y sencilla.

```powershell
gh auth login --hostname github.com --git-protocol ssh --web
gh auth status
```

### Comandos Útiles

*   **Repositorios**:
    ```powershell
    # Clonar un repositorio
    gh repo clone theChosen16/Mercenary_Dev

    # Crear un nuevo repositorio desde un directorio local
    gh repo create mi-nuevo-proyecto --private --source . --push
    ```

*   **Pull Requests**:
    ```powershell
    # Crear un pull request
    gh pr create --title "feat: Nueva funcionalidad" --body "Descripción detallada del PR."

    # Ver el estado de tus pull requests
    gh pr status

    # Abrir un PR en el navegador
    gh pr view --web
    ```

*   **GitHub Actions**:
    ```powershell
    # Listar los flujos de trabajo del repositorio
    gh workflow list

    # Iniciar un flujo de trabajo manualmente
    gh workflow run ci.yml

    # Monitorear la ejecución de un flujo de trabajo en tiempo real
    gh run watch
    ```

---

## 7. Observabilidad con LangSmith

LangSmith (`smith.langchain.com`) es una plataforma para depurar, probar, evaluar y monitorear aplicaciones construidas con LangChain. Es esencial para entender el comportamiento de los modelos de lenguaje y asegurar su calidad.

### Configuración

Para habilitar el seguimiento con LangSmith, necesitas configurar las siguientes variables de entorno:

```powershell
$env:LANGCHAIN_TRACING_V2="true"
$env:LANGCHAIN_ENDPOINT="https://api.smith.langchain.com"
$env:LANGCHAIN_API_KEY="<TU_API_KEY>"  # Obtén tu clave desde la configuración de LangSmith
$env:LANGCHAIN_PROJECT="mercenary-dev" # Opcional: para agrupar las trazas por proyecto
```

En un entorno de CI/CD, la `LANGCHAIN_API_KEY` debe ser almacenada de forma segura como un secreto en GitHub Actions.

### Integración en el Código

**Python**:
```python
import os
from langsmith import traceable

# Las variables de entorno activan el tracing automáticamente

@traceable
def mi_funcion_inteligente(entrada: str) -> str:
    # Lógica con LLMs
    return f"Respuesta para: {entrada}"
```

**JavaScript/TypeScript**:
```typescript
// Las variables de entorno activan el tracing automáticamente
import { traceable } from "langsmith/traceable";

const miFuncionInteligente = traceable(async (entrada: string) => {
  // Lógica con LLMs
  return `Respuesta para: ${entrada}`;
});
```

---

## 8. (Futuro) Despliegue en un Servidor Remoto (Google Cloud VM)

Una vez que el desarrollo local esté maduro y la aplicación esté lista para ser desplegada, el siguiente paso será configurar un entorno de producción en un servidor remoto, como una Google Cloud VM.

Esta sección se completará en una fase posterior del proyecto y cubrirá:

*   **Configuración de la VM**: Preparar una VM en Google Cloud con todas las dependencias necesarias (Python, Node.js, Docker, Nginx, etc.).
*   **Gestión de Claves SSH**: Crear y configurar claves SSH para permitir que GitHub Actions se conecte de forma segura a la VM para el despliegue.
*   **Flujo de Trabajo de Despliegue Continuo (CD)**: Crear un nuevo flujo de trabajo de GitHub Actions (`deploy.yml`) que, tras el éxito de la CI, se conecte a la VM y despliegue la nueva versión de la aplicación.

**Cloud** **(Para** **ﬂujos** **de** **trabajo** **avanzados)**

Para ﬂujos de trabajo más complejos o si necesita un control más
granular sobre el entorno de ejecución, puede conﬁgurar su VM de Google
Cloud como un ejecutor autoalojado de GitHub Actions. Esto elimina la
necesidad de SSH en cada paso, ya que el ejecutor se ejecuta
directamente en su VM.

**. .** **Pasos** **para** **Conﬁgurar** **un** **Ejecutor**
**Autoalojado**

> . **En** **GitHub:** Vaya a su repositorio en GitHub, luego a Settings
> \> Actions \> Runners \> New self-hosted runner.
>
> . **Seleccione** **el** **Sistema** **Operativo** **y** **la**
> **Arquitectura:** Elija Linux y x .
>
> . **Siga** **las** **Instrucciones:** GitHub le proporcionará una
> serie de comandos para ejecutar en su VM de Google Cloud. Estos
> comandos descargarán el software del ejecutor, lo conﬁgurarán y lo
> registrarán con su repositorio. Los pasos suelen ser:
>
> Crear un directorio para el ejecutor.
>
> Descargar el paquete del ejecutor.
>
> Extraer el paquete.
>
> Ejecutar el script de conﬁguración ( ./config.sh), que le pedirá la
> URL de su repositorio y un token de registro (proporcionado por
> GitHub).
>
> Ejecutar el ejecutor ( ./run.sh).
>
> Puede ejecutar ./run.sh en un proceso en segundo plano (ej. usando
> nohup o screen/ tmux) para que el ejecutor permanezca activo incluso
> si cierra su sesión
>
> SSH.

**. .** **Crear** **el** **Flujo** **de** **Trabajo** **de** **GitHub**
**Actions** **para** **Ejecutor** **Autoalojado**

Una vez que su ejecutor autoalojado esté en línea, puede modiﬁcar su
archivo .github/workflows/main.yml para usarlo:

> **name**: Ejecutar Pruebas en VM de Google Cloud (Self-Hosted)

||
||
||
||
||

||
||
||
||
||
||
||

> cd /ruta/a/su/proyecto && npm install && npm test

**Asegúrese** **de** **reemplazar:** \* /ruta/a/su/proyecto con la ruta
absoluta a su proyecto en la VM. \* npm install && npm test con los
comandos que necesita ejecutar para instalar dependencias y correr
pruebas en su proyecto.

Esta opción es más robusta para entornos de CI/CD dedicados, ya que el
ejecutor está siempre disponible y no hay sobrecarga de conexión SSH en
cada ejecución. Sin embargo, requiere que la VM esté siempre encendida
para que el ejecutor esté disponible, lo que puede incurrir en costos si
no se gestiona adecuadamente (ej. con GitHub Actions para
suspender/iniciar la VM como se mencionó en la investigación inicial).

Adaptación a Windsurf (Windows) y MCP Servers Disponibles

Esta sección adapta la guía al entorno actual de trabajo en Windsurf (Windows) y a los MCP Servers disponibles en este workspace, con recomendaciones prácticas para automatizar tu flujo.

Perfil del entorno actual (resumen)

- Sistema operativo: Windows.
- Editor: Windsurf IDE con agente Cascade.
- MCP Servers disponibles: github-mcp-server, locofy, mcp-playwright, memory, postgresql, prisma-mcp-server, puppeteer, sequential-thinking.
- Observación del repositorio actual (`c:/Users/alean/Desktop/Server-Automata/`): no se detectaron archivos típicos de automatización (por ejemplo: `.github/`, `Dockerfile`, `docker-compose*.yml`, `package.json`, `requirements.txt`, `pyproject.toml`, scripts `*.ps1`/`*.bat`). Si existen en otra ruta o repo, indícala para incorporarlos a esta guía.

Acciones rápidas desde Windsurf (MCP)

- GitHub (github-mcp-server): crear/actualizar issues, ramas y PRs; hacer reviews, comentar líneas, actualizar ramas de PR con `base`, reintentar/rerun de workflows, y hacer merge (según permisos). Ideal para GitOps: planificar → rama → commits → PR → revisión → merge → release.
- QA E2E (mcp-playwright / puppeteer): navegar, llenar formularios, tomar capturas, generar o ejecutar tests, esperar y afirmar respuestas HTTP. Útil para smoke/E2E rápidos y evidencias (screenshots/PDFs).
- Base de datos (prisma-mcp-server / postgresql):
  - Prisma: `migrate status`, `migrate dev` (crear/aplicar migraciones), `Prisma Studio` (GUI), `migrate reset` (SOLO desarrollo; DESTRUCTIVO).
  - PostgreSQL: consultas read-only para validaciones o diagnósticos.
- Memoria y planificación (memory, sequential-thinking): documentar decisiones, plantillas, checklists y mantener planes iterativos de tareas.
- UI/Componentes (locofy): sincronizar componentes y dependencias entre estructura de carpetas y código del IDE.

Buenas prácticas de calidad

- Ejecuta linters y pruebas localmente antes de automatizar (regla: “siempre revisar problemas de código antes de probar”).
- Añade logs claros en scripts y pipelines para diagnosticar rápido.
- Aísla problemas con pruebas unitarias/funcionales mínimas.

Plantillas de scripts (Windows, opcional)

- `scripts/bootstrap.ps1`: instala dependencias (Node/Python), prepara entorno.
- `scripts/lint.ps1`: ejecuta linters/formatters.
- `scripts/test.ps1`: corre pruebas unitarias/e2e.
- `scripts/release.ps1`: versionado, changelog, build y publicación.
- Recomendación: usa rutas relativas y `Write-Host` con mensajes claros; devuelve códigos de salida adecuados (`exit 1` en fallos) para integrarse fácil con CI.

Blueprint de CI con GitHub Actions (opcional)

Un flujo base en `.github/workflows/ci.yml` podría incluir:

```yaml
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  build-test:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install deps
        run: |
          if (Test-Path package.json) { npm ci } else { echo "No Node project" }
      - name: Lint
        run: |
          if (Test-Path package.json) { npm run lint --if-present } else { echo "Skip" }
      - name: Test
        run: |
          if (Test-Path package.json) { npm test --if-present } else { echo "Skip" }
```

Adapta a Python/.NET según tu stack. Si trabajas con Google Cloud, puedes añadir pasos para autenticación y despliegue (Cloud Run, GCE, etc.).

Información necesaria para personalizar la guía

1) URL del repositorio GitHub y ramas principales (por ej. `main`, `develop`).
2) Lenguajes/stack principales (Node, Python, .NET, etc.) y gestores de paquetes (npm/pnpm/yarn, pip/poetry).
3) Herramientas de calidad: linters (ESLint/Flake8), formatters (Prettier/Black), pruebas (Jest/PyTest/Playwright), coverage, pre-commit.
4) Tipo de aplicación y objetivo de despliegue: web API, frontend, worker, monorepo; VM en GCP vs Cloud Run vs Docker local u otro.
5) Requisitos de CI/CD: qué quieres validar en cada push/PR; políticas de ramas; estrategia de versión/release.
6) Base de datos y ORM: proveedor (Postgres/MySQL/SQLite/otro), ¿usas Prisma? ¿existe `schema.prisma`? (no compartas credenciales; solo nombres de secretos y variables).
7) Variables de entorno y secretos necesarios (solo nombres, no valores) y dónde residirán (GitHub Secrets, .env local, Google Secret Manager).
8) Scripts existentes que debamos estandarizar (`*.ps1`, `*.bat`, npm scripts, Makefile/Taskfile).
9) Si usas Google Cloud VM: nombre/hostname/IP de la instancia, SO, usuario, método de acceso (SSH con llave). No compartas claves privadas.

Siguientes pasos

 - Confirmar la información anterior para generar scripts y pipelines listos para tu stack.
 - Si procede, crear los directorios `scripts/` y `.github/workflows/` con las plantillas acordadas.
 - Integrar comandos MCP en tu rutina (GitHub reviews/PRs, tests E2E, migraciones) y documentarlos en esta guía.

 . GitHub CLI (gh): uso práctico en Windows
 
 Este apartado resume comandos comunes con GitHub CLI para autenticación, repositorios, PRs, Actions y secretos.
 
 Autenticación (SSH) y verificación:
 
 ```powershell
 gh --version
 gh auth login --hostname github.com --git-protocol ssh --web
 gh auth status
 ```
 
 Repositorios:
 
 ```powershell
 # Clonar por SSH (recomendado)
 gh repo clone owner/repo
 # Crear repo remoto desde el directorio actual y hacer push inicial
 gh repo create owner/repo --private --source . --push
 ```
 
 Issues y Pull Requests:
 
 ```powershell
 gh issue list
 gh issue create -t "Título" -b "Descripción"
 gh pr create -t "feat: ..." -b "Detalles" -B main -H tu-rama
 gh pr status
 gh pr view --web
 ```
 
 GitHub Actions:
 
 ```powershell
 gh workflow list
 gh run list
 gh workflow run ci.yml
 gh run watch --exit-status  # espera al resultado del último run
 ```
 
 Secretos (repo) y autenticación para CI:
 
 ```powershell
 # Repo actual
 gh secret set MY_SECRET --body "valor"
 # Otro repo
 gh secret set MY_SECRET --repo owner/repo --body "valor"
 ```
 
 GHCR (login al registry de contenedores):
 
 ```powershell
 $env:GH_TOKEN = (gh auth token)
 echo $env:GH_TOKEN | docker login ghcr.io -u theChosen16 --password-stdin
 ```
 
 . LangSmith (smith.langchain.com): observabilidad y evaluación
 
 LangSmith provee trazado, evaluación y monitoreo de pipelines LLM/AI. Úsalo en local y CI para depurar, comparar y auditar runs.
 
 Prerrequisitos:
 
 - Cuenta en LangSmith vinculada a GitHub (listo).
 - API Key desde Smith: Settings → API Keys. No la compartas; guárdala como GitHub Secret.
 
 Variables de entorno mínimas (PowerShell):
 
 ```powershell
 $env:LANGCHAIN_TRACING_V2="true"
 $env:LANGCHAIN_ENDPOINT="https://api.smith.langchain.com"
 $env:LANGCHAIN_API_KEY="<TU_API_KEY>"    # En CI usa GitHub Secrets
 $env:LANGCHAIN_PROJECT="automata-local"  # opcional
 ```
 
 Python (tracing básico):
 
 ```powershell
 pip install langsmith
 ```
 
 ```python
 import os
 os.environ["LANGCHAIN_TRACING_V2"] = "true"
 os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
 # LANGCHAIN_API_KEY se toma del entorno
 
 from langsmith import traceable
 
 @traceable
 def ejemplo(nombre: str) -> str:
     return f"Hola, {nombre}!"
 
 if __name__ == "__main__":
     print(ejemplo("mundo"))
 ```
 
 JavaScript/TypeScript:
 
 ```powershell
 npm i -S langsmith
 # o: pnpm add langsmith
 ```
 
 ```ts
 // Activación por variables de entorno
 process.env.LANGCHAIN_TRACING_V2 = "true";
 process.env.LANGCHAIN_ENDPOINT = "https://api.smith.langchain.com";
 // LANGCHAIN_API_KEY se lee desde el entorno/secretos
 ```
 
 Crear secreto en GitHub con GH CLI:
 
 ```powershell
 gh secret set LANGCHAIN_API_KEY --body "<TU_API_KEY>"
 ```
 
 Integración en GitHub Actions (fragmentos):
 
 ```yaml
 # .github/workflows/ci.yml
 jobs:
   backend-tests:
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@v4
       - uses: actions/setup-python@v5
         with:
           python-version: '3.11'
       - run: pip install -r backend/requirements.txt langsmith
       - name: Run tests with LangSmith tracing
         run: pytest -q
         env:
           LANGCHAIN_TRACING_V2: "true"
           LANGCHAIN_ENDPOINT: https://api.smith.langchain.com
           LANGCHAIN_API_KEY: ${{ secrets.LANGCHAIN_API_KEY }}
           LANGCHAIN_PROJECT: ci-${{ github.repository }}
 
   web-tests:
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@v4
       - uses: actions/setup-node@v4
         with:
           node-version: '20'
       - run: npm ci --prefix web-app
       - run: npm test --prefix web-app
         env:
           LANGCHAIN_TRACING_V2: "true"
           LANGCHAIN_ENDPOINT: https://api.smith.langchain.com
           LANGCHAIN_API_KEY: ${{ secrets.LANGCHAIN_API_KEY }}
           LANGCHAIN_PROJECT: ci-${{ github.repository }}
 ```
 
 Revisa y compara runs en: https://smith.langchain.com/
 
 ---

## 9. Conclusión
  
 La automatización del ﬂujo de trabajo de desarrollo, integrando Windsurf
IDE, una VM de Google Cloud y GitHub, representa un avance signiﬁcativo
en la eﬁciencia y la productividad del desarrollo de software. Al seguir
los pasos y las conﬁguraciones detalladas en esta guía, los
desarrolladores pueden establecer un entorno de trabajo robusto,
escalable y altamente automatizado.

Windsurf IDE, con sus capacidades de IA y su agente Cascade, se
convierte en una herramienta indispensable para la codiﬁcación
inteligente y la asistencia contextual. La VM de Google Cloud
proporciona un entorno de desarrollo consistente y potente, liberando a
las máquinas locales de cargas de trabajo pesadas y garantizando la
uniformidad en el equipo. Finalmente, GitHub, junto con sus poderosas
Actions,

orquesta el ciclo de vida del desarrollo, desde la integración continua
hasta el despliegue continuo, asegurando que el código se construya,
pruebe y despliegue de manera eﬁciente y sin errores manuales.

Esta sinergia no solo acelera el proceso de desarrollo, sino que también
mejora la calidad del código, facilita la colaboración y permite a los
desarrolladores centrarse en la innovación y la resolución de problemas
complejos, en lugar de en tareas repetitivas y administrativas. La
inversión en la conﬁguración inicial de esta arquitectura se traduce en
beneﬁcios a largo plazo, optimizando los recursos y potenciando la
capacidad de respuesta del equipo de desarrollo ante las demandas del
mercado.

Esperamos que esta guía sirva como un recurso valioso para transformar
su proceso de desarrollo, llevándolo a un nuevo nivel de automatización
y eﬁciencia.
