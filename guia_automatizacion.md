**Guía** **Completa** **de** **Automatización** **del** **Desarrollo**
**con** **Windsurf** **IDE,** **Google** **Cloud** **VM** **y**
**GitHub**

**Introducción**

En el dinámico mundo del desarrollo de software, la eﬁciencia y la
automatización son claves para el éxito. Esta guía exhaustiva está
diseñada para desarrolladores que buscan optimizar su ﬂujo de trabajo
aprovechando la potencia de herramientas modernas como Windsurf IDE, la
ﬂexibilidad de una máquina virtual (VM) en Google Cloud y las
capacidades de control de versiones y automatización de GitHub. Nuestro
objetivo es proporcionar un camino claro y práctico para integrar estas
tecnologías, permitiendo un ciclo de desarrollo más rápido, consistente
y colaborativo.

Tradicionalmente, el desarrollo puede verse obstaculizado por entornos
inconsistentes, procesos manuales repetitivos y la gestión compleja de
dependencias. Al centralizar el entorno de desarrollo en una VM en la
nube, se garantiza la uniformidad para todo el equipo y se aprovecha la
escalabilidad de la infraestructura de Google Cloud. Windsurf IDE, con
sus avanzadas características impulsadas por inteligencia artiﬁcial, se
convierte en el aliado perfecto para potenciar la productividad del
desarrollador, ofreciendo asistencia inteligente y automatización de
tareas de codiﬁcación. Finalmente, GitHub no solo actúa como un
repositorio central para el código fuente, sino que, a través de GitHub
Actions, se transforma en un orquestador de procesos de integración
continua y despliegue continuo (CI/CD), automatizando la construcción,
prueba y despliegue de aplicaciones.

Esta guía lo llevará a través de los pasos necesarios para conﬁgurar su
entorno, desde la preparación de su VM de Google Cloud y la conﬁguración
de las claves SSH, hasta la conexión de Windsurf IDE para un desarrollo
remoto ﬂuido y la implementación de ﬂujos de trabajo de GitHub Actions
para automatizar sus procesos de CI/CD. Al ﬁnal,

tendrá una comprensión sólida y las herramientas necesarias para
transformar su enfoque de desarrollo, haciéndolo más ágil, robusto y
eﬁciente.

**Tabla** **de** **Contenidos**

> . **Windsurf** **IDE:** **Una** **Visión** **General**
>
> . **Google** **Cloud** **VM** **y** **GitHub:** **Fundamentos**
> **para** **la** **Automatización**
>
> . **Diseño** **de** **la** **Arquitectura** **de** **Automatización**
> Flujo de Trabajo de Desarrollo Automatizado
>
> Interacción entre Componentes
>
> Componentes Clave y sus Roles
>
> . **Scripts** **y** **Conﬁguraciones** **de** **Automatización**
> Conﬁguración Inicial de la VM de Google Cloud
>
> Conﬁguración de Claves SSH para GitHub en la VM
>
> Conexión de Windsurf IDE a la VM de Google Cloud para Desarrollo
> Remoto
>
> Flujo de Trabajo de GitHub Actions para CI/CD Básico
>
> . **Conclusión**

**.** **Windsurf** **IDE:** **Una** **Visión** **General**

Windsurf IDE es un entorno de desarrollo integrado (IDE) de vanguardia,
diseñado para revolucionar la experiencia de codiﬁcación mediante la
integración de inteligencia artiﬁcial avanzada. Su objetivo principal es
hacer que el desarrollo de software sea no solo más rápido, sino también
más intuitivo y agradable para los desarrolladores. Las capacidades de
IA de Windsurf se extienden a través de varias características clave que
lo distinguen de los IDEs tradicionales:

> **Supercomplete** **e** **Inline** **AI:** Esta funcionalidad va más
> allá del autocompletado básico, ofreciendo sugerencias de código
> inteligentes y contextuales, refactorización asistida por IA y la
> capacidad de generar bloques de código completos. La asistencia de IA
> se integra directamente en el ﬂujo de trabajo de codiﬁcación,
> minimizando las interrupciones y maximizando la eﬁciencia.
>
> **Cascade:** Considerado el corazón de las capacidades de IA de
> Windsurf, Cascade es un agente de IA colaborativo. Su fortaleza radica
> en su profunda comprensión del código base de un proyecto. Esto le
> permite no solo asistir en tareas de codiﬁcación, sino también
> automatizar procesos complejos, llenar automáticamente el contexto
> necesario para ciertas operaciones y ejecutar comandos de manera
> inteligente. Cascade es fundamental para la visión de Windsurf de un
> IDE "agentic", donde la IA actúa como un compañero de desarrollo
> proactivo.
>
> **Integración** **con** **Git** **y** **GitHub:** Windsurf simpliﬁca
> signiﬁcativamente la interacción con sistemas de control de versiones
> como Git. Puede generar comandos Git de forma autónoma, lo que reduce
> la necesidad de memorizar sintaxis complejas. Además, ofrece la
> capacidad de documentar commits de manera más efectiva, mejorando la
> calidad del historial del proyecto. La integración con GitHub se
> menciona especíﬁcamente, sugiriendo que Windsurf puede interactuar con
> repositorios remotos, posiblemente a través de un "Model Context
> Protocol (MCP) Server" para una sincronización y colaboración más
> ﬂuidas.
>
> **Capacidades** **de** **Desarrollo** **Remoto:** Una característica
> crucial para entornos de desarrollo modernos es la capacidad de
> trabajar en servidores remotos. Windsurf ofrece la opción de
> conectarse a estos entornos, lo que lo hace ideal para ser utilizado
> con máquinas virtuales en la nube, como una VM de Google Cloud. Esto
> permite a los desarrolladores aprovechar la potencia de cómputo y el
> aislamiento de un entorno en la nube, mientras mantienen la
> familiaridad y las ventajas de su IDE local.
>
> **Pestaña** **"Problems":** Una característica práctica que consolida
> y lista todos los problemas, errores y advertencias detectados en el
> proyecto, facilitando su identiﬁcación y resolución.
>
> **Paleta** **de** **Comandos:** Proporciona un acceso rápido y
> centralizado a una amplia gama de comandos y conﬁguraciones avanzadas
> del IDE, mejorando la navegabilidad y la personalización.

La integración robusta de Windsurf con GitHub, especialmente a través de
la conﬁguración de un servidor MCP, y su soporte para el desarrollo
remoto, son aspectos clave que lo posicionan como una herramienta
poderosa para la automatización del ﬂujo de trabajo en un entorno de
nube. Estas características son fundamentales para

el objetivo de esta guía de establecer un ecosistema de desarrollo
eﬁciente y automatizado en Google Cloud. \[ \]

**Referencias**

\[ \] Windsurf IDE. (s.f.). Windsurf Editor. Recuperado de
https://windsurf.com/editor

**.** **Google** **Cloud** **VM** **y** **GitHub:** **Fundamentos**
**para** **la** **Automatización**

La máquina virtual (VM) de Google Cloud, con sus especiﬁcaciones de
Debian x ,

núcleos y GB de RAM, se posiciona como un entorno robusto y ﬂexible para
el desarrollo remoto. Esta sección explora cómo esta VM, en conjunto con
GitHub, sienta las bases para un ﬂujo de trabajo de desarrollo
automatizado y eﬁciente.

**Conectividad** **y** **Acceso** **Remoto**

La capacidad de conectarse a la VM de Google Cloud de forma remota es
fundamental para establecer un entorno de desarrollo centralizado. Esto
se logra principalmente a través de SSH (Secure Shell), un protocolo de
red criptográﬁco que permite la operación segura de servicios de red
sobre una red no segura. Google Cloud facilita esta conectividad de
varias maneras:

> **Acceso** **Directo** **SSH:** Los desarrolladores pueden establecer
> una conexión SSH a la VM directamente desde su terminal local,
> utilizando herramientas estándar de línea de comandos. Esto
> proporciona un control total sobre el entorno de la VM, permitiendo la
> ejecución de comandos, la gestión de archivos y la conﬁguración de
> software.
>
> **SSH-in-browser:** Para mayor comodidad, la consola de Google Cloud
> ofrece una herramienta SSH-in-browser, que permite a los usuarios
> acceder a su VM directamente desde un navegador web, eliminando la
> necesidad de conﬁgurar un cliente SSH local. \[ \]

Esta conectividad SSH es la columna vertebral que permite a Windsurf IDE
interactuar con el sistema de archivos y los procesos que se ejecutan en
la VM, creando una experiencia de desarrollo remoto ﬂuida.

**Integración** **con** **GitHub**

GitHub, como la plataforma de control de versiones más popular, juega un
papel crucial en la gestión del código fuente y la colaboración. Google
Cloud ofrece múltiples vías para integrar sus servicios con GitHub,
facilitando un ecosistema de desarrollo cohesivo:

> **Control** **de** **Versiones** **Estándar** **(Git):** Una vez
> conectado a la VM vía SSH, se pueden realizar todas las operaciones
> estándar de Git (clonar repositorios, hacer
>
> push, pull, commit, etc.). Para asegurar una comunicación segura y sin
> contraseñas con los repositorios de GitHub, es esencial conﬁgurar
> claves SSH privadas y públicas en la VM y en la cuenta de GitHub del
> usuario. \[ \]
>
> **Cloud** **Build:** Google Cloud Build es un servicio de integración
> continua que puede conﬁgurarse para escuchar eventos en repositorios
> de GitHub. Esto permite la automatización de procesos de construcción,
> prueba y despliegue de aplicaciones directamente desde GitHub a
> diversos servicios de Google Cloud, como Cloud Run o Google Kubernetes
> Engine. \[ \]
>
> **Conexión** **de** **Repositorios:** La consola de Google Cloud
> permite vincular directamente repositorios de GitHub, lo que simpliﬁca
> la conﬁguración de ﬂujos de trabajo automatizados y la gestión de
> permisos. \[ \]

**Automatización** **con** **GitHub** **Actions**

GitHub Actions es una potente herramienta de automatización que se
integra directamente con los repositorios de GitHub. Permite deﬁnir
ﬂujos de trabajo personalizados que se ejecutan en respuesta a eventos
especíﬁcos (ej. un push de código). En el contexto de una VM de Google
Cloud, GitHub Actions puede ser utilizado para:

> **Gestión** **de** **la** **VM:** Crear acciones para iniciar, detener
> o suspender la VM, lo que puede ayudar a optimizar los costos al
> asegurar que la VM solo esté activa cuando sea necesario. \[ \]
>
> **CI/CD:** Automatizar el ciclo de integración y despliegue continuo,
> ejecutando pruebas, construyendo artefactos y desplegando aplicaciones
> en la VM o en otros servicios de Google Cloud. \[ \]

La combinación de la accesibilidad remota de la VM de Google Cloud, su
capacidad para interactuar con GitHub a través de Git y SSH, y la
ﬂexibilidad de GitHub Actions para la automatización, proporciona una
base sólida para construir un ﬂujo de trabajo de desarrollo altamente
eﬁciente y automatizado.

**Referencias**

\[ \] Google Cloud. (s.f.). Conectarse a instancias de VM de Linux.
Recuperado de https://cloud.google.com/compute/docs/connect/standard-ssh
\[ \] Stack Overﬂow. ( , de febrero). How to set up git/git pull on
Google Cloud VM. Recuperado de https://stackoverﬂow.com/questions/
/how-to-set-up-git-git-pull-on-google-cloud-vm \[ \] Google Cloud.
(s.f.). Conectar a un repositorio de GitHub \| Documentación de Cloud
Build. Recuperado de
https://cloud.google.com/build/docs/automating-builds/github/connect-repo-github

\[ \] Google Cloud. (s.f.). Conectarse a GitHub \| Developer Connect.
Recuperado de
https://cloud.google.com/developer-connect/docs/connect-github-repo \[
\] dev.to. ( , de mayo). Create a remote developer environment in GCP
and manage with Github Actions. Recuperado de
https://dev.to/phouchens/create-a-remote-developer-environment-in-gcp-and-manage-with-github-actions-
da \[ \] Medium. ( , de agosto). Google Compute Engine CI/CD with GitHub
Actions. Recuperado de
https://medium.com/@vngauv/from-github-to-gce-automate-deployment-with-

github-actions- e ba add

**.** **Diseño** **de** **la** **Arquitectura** **de**
**Automatización**

Esta sección profundiza en la arquitectura propuesta para la
automatización del ﬂujo de trabajo de desarrollo, integrando Windsurf
IDE, una máquina virtual (VM) en Google Cloud y GitHub. El diseño busca
optimizar la eﬁciencia del desarrollo, permitiendo a los desarrolladores
trabajar de forma remota en un entorno potente y escalable,

mientras se aprovechan las capacidades de IA de Windsurf y el control de
versiones de GitHub.

**Flujo** **de** **Trabajo** **de** **Desarrollo** **Automatizado**

El ﬂujo de trabajo propuesto se centra en un ciclo de desarrollo
continuo que abarca desde la escritura del código hasta el despliegue y
la colaboración. Se busca minimizar la intervención manual y maximizar
la velocidad y la calidad del desarrollo. El proceso se puede desglosar
en las siguientes etapas:

> . **Desarrollo** **Local/Remoto** **con** **Windsurf** **IDE:** El
> desarrollador interactúa con el código fuente utilizando Windsurf IDE.
> Este puede estar instalado localmente en su máquina o, para aprovechar
> la potencia de la VM de Google Cloud, conﬁgurado para trabajar de
> forma remota en la VM. Windsurf, con su agente Cascade y capacidades
> de IA, asiste en la escritura de código, refactorización, depuración y
> generación de pruebas.
>
> . **Control** **de** **Versiones** **con** **Git** **y** **GitHub:**
> El código fuente se gestiona en un repositorio de GitHub. Los cambios
> realizados en Windsurf IDE se versionan utilizando Git y se
> sincronizan con el repositorio remoto en GitHub. Windsurf facilita
> esta interacción, incluso generando comandos Git y documentando
> commits automáticamente.
>
> . **Entorno** **de** **Ejecución** **y** **Pruebas** **en** **Google**
> **Cloud** **VM:** La VM de Google Cloud actúa como el entorno
> principal para la ejecución, compilación y prueba del código. Esto
> proporciona un entorno consistente y potente, aislado de la máquina
> local del desarrollador. Los proyectos se clonan o se sincronizan en
> la VM, y las pruebas automatizadas se ejecutan aquí.
>
> . **Integración** **Continua/Despliegue** **Continuo** **(CI/CD)**
> **con** **GitHub** **Actions** **y** **Google** **Cloud:** Para
> automatizar el proceso de construcción, prueba y despliegue, se
> utilizarán GitHub Actions. Estas acciones se activarán automáticamente
> con cada push al repositorio de GitHub, ejecutando tareas predeﬁnidas
> en la VM de Google Cloud o directamente en los servicios de Google
> Cloud (por ejemplo, Cloud Build, Cloud Run, Compute Engine). Esto
> asegura que el código se pruebe y se despliegue de manera consistente
> y eﬁciente.
>
> . **Monitoreo** **y** **Retroalimentación:** Una vez desplegada la
> aplicación, se implementarán herramientas de monitoreo en Google Cloud
> para supervisar el
>
> rendimiento y la disponibilidad. Cualquier problema o error se
> registrará y se notiﬁcará al equipo de desarrollo, cerrando el ciclo
> de retroalimentación.

Este ﬂujo de trabajo permite a los desarrolladores centrarse en la
lógica de negocio, mientras que la infraestructura automatizada se
encarga de las tareas repetitivas y propensas a errores. La VM de Google
Cloud proporciona la potencia de cómputo necesaria, Windsurf IDE mejora
la productividad del desarrollador, y GitHub y GitHub Actions orquestan
la automatización.

**Interacción** **entre** **Componentes**

La sinergia entre Windsurf IDE, Google Cloud VM y GitHub es fundamental
para el éxito de esta arquitectura. A continuación, se describe cómo
interactúan estos componentes:

> **Windsurf** **IDE** **y** **Google** **Cloud** **VM:** La conexión
> entre Windsurf IDE y la VM de Google Cloud se establece a través de
> SSH. Esto permite al desarrollador editar el código directamente en la
> VM como si fuera un entorno local. Windsurf IDE, con su capacidad de
> desarrollo remoto, se conecta a un servidor en la VM, lo que le
> permite acceder al sistema de archivos, ejecutar comandos y utilizar
> sus funciones de IA (como Cascade) en el contexto del proyecto alojado
> en la VM. Esto combina la experiencia de usuario de un IDE local con
> la potencia y el aislamiento de un entorno de desarrollo en la nube.
>
> **Windsurf** **IDE** **y** **GitHub:** Windsurf IDE se integra con Git
> y GitHub para simpliﬁcar el control de versiones. Desde el IDE, el
> desarrollador puede realizar commits, crear ramas, fusionar cambios y
> sincronizar con el repositorio remoto en GitHub. La característica de
> IA de Windsurf puede incluso ayudar a redactar mensajes de commit
> descriptivos y a documentar el código, mejorando la calidad del
> historial de versiones.
>
> **Google** **Cloud** **VM** **y** **GitHub:** La VM de Google Cloud se
> conecta a GitHub para clonar repositorios y mantener el código fuente
> actualizado. Se conﬁgurarán claves SSH en la VM para permitir el
> acceso seguro a los repositorios de GitHub. Además, los ﬂujos de
> trabajo de GitHub Actions se ejecutarán en la VM o interactuarán con
> ella para realizar tareas de CI/CD, como la ejecución de pruebas o el
> despliegue de aplicaciones.
>
> **GitHub** **y** **GitHub** **Actions:** GitHub actúa como el centro
> neurálgico del ﬂujo de trabajo. Los eventos en el repositorio de
> GitHub (como push o pull_request) desencadenan los ﬂujos de trabajo de
> GitHub Actions. Estos ﬂujos de trabajo deﬁnen los pasos para
> construir, probar y desplegar la aplicación, orquestando las acciones
> necesarias en la VM de Google Cloud.

**Componentes** **Clave** **y** **sus** **Roles**

> **Windsurf** **IDE:**
>
> **Rol:** Entorno de desarrollo principal para el desarrollador.
>
> **Responsabilidades:** Edición de código, depuración, refactorización,
> asistencia de IA (Cascade), integración con Git.
>
> **Google** **Cloud** **VM** **(Debian** **x ,** **núcleos,** **GB**
> **RAM):**
>
> **Rol:** Entorno de desarrollo, ejecución y pruebas remoto.
>
> **Responsabilidades:** Alojar el código fuente, ejecutar la
> aplicación, compilar el código, ejecutar pruebas automatizadas,
> proporcionar un entorno consistente y escalable.
>
> **GitHub:**
>
> **Rol:** Repositorio central de código fuente y plataforma de
> colaboración.
>
> **Responsabilidades:** Almacenar el código fuente, gestionar el
> control de versiones (Git), facilitar la colaboración entre
> desarrolladores, alojar la conﬁguración de GitHub Actions.
>
> **GitHub** **Actions:**
>
> **Rol:** Herramienta de automatización de CI/CD.
>
> **Responsabilidades:** Orquestar el proceso de construcción, prueba y
> despliegue, ejecutar ﬂujos de trabajo automatizados en respuesta a
> eventos de GitHub, interactuar con la VM de Google Cloud para realizar
> tareas de despliegue.

**.** **Scripts** **y** **Conﬁguraciones** **de** **Automatización**

Esta sección proporciona instrucciones detalladas y ejemplos de
conﬁguración para implementar la arquitectura de automatización descrita
anteriormente. Cubriremos la conﬁguración inicial de la VM de Google
Cloud, la gestión de claves SSH para GitHub, la conexión de Windsurf IDE
para desarrollo remoto y la creación de un ﬂujo de trabajo básico de
GitHub Actions.

**.** **Conﬁguración** **Inicial** **de** **la** **VM** **de**
**Google** **Cloud**

Antes de poder utilizar su VM de Google Cloud como entorno de desarrollo
remoto, es necesario realizar algunas conﬁguraciones iniciales. Asumimos
que ya tiene una instancia de VM con Debian x , núcleos y GB de RAM
conﬁgurada en Google Cloud Platform.

**.** **Acceso** **SSH** **a** **la** **VM**

Para interactuar con su VM, necesitará acceder a ella a través de SSH.
Google Cloud ofrece varias formas de hacerlo:

> **Desde** **la** **Consola** **de** **Google** **Cloud**
> **(SSH-in-browser):** La forma más sencilla de conectarse es
> directamente desde la consola de Google Cloud. Navegue a Compute
> Engine \> Instancias de VM, encuentre su instancia y haga clic en el
> botón SSH. Esto abrirá una ventana de terminal en su navegador,
> conectada
>
> directamente a su VM.
>
> **Desde** **su** **Terminal** **Local** **(gcloud** **CLI):** Para un
> ﬂujo de trabajo más integrado, puede usar la herramienta de línea de
> comandos gcloud de Google Cloud SDK. Asegúrese de tener gcloud
> instalado y autenticado en su máquina local. Luego, puede conectarse a
> su VM usando el siguiente comando:
>
> bash gcloud compute ssh \<nombre-de-su-instancia-vm\>
> --zone=\<su-zona-gcp\> Reemplace \<nombre-de-su-instancia-vm\> con el
> nombre de su VM y \<su-zona-gcp\> con la zona donde se encuentra su VM
> (ej. us-central1-a). La
>
> primera vez que se conecte, gcloud generará automáticamente un par de
> claves SSH y las cargará en su VM.

**.** **Instalación** **de** **Git** **en** **la** **VM**

Git es esencial para el control de versiones y la interacción con
GitHub. Debian, el sistema operativo de su VM, facilita la instalación
de Git. Conéctese a su VM a través de SSH y ejecute los siguientes
comandos:

> sudo apt update
>
> sudo apt install git -y

Veriﬁque la instalación ejecutando:

> git --version

Esto debería mostrar la versión de Git instalada. Una vez instalado,
conﬁgure su nombre de usuario y correo electrónico de Git:

> git config --global user.name "Su Nombre"
>
> git config --global user.email "su.email@example.com"

Estos datos se utilizarán en sus commits de Git.

**.** **Conﬁguración** **de** **Claves** **SSH** **para** **GitHub**
**en** **la** **VM**

Para que su VM de Google Cloud pueda interactuar de forma segura con sus
repositorios privados de GitHub sin necesidad de introducir sus
credenciales repetidamente, es fundamental conﬁgurar un par de claves
SSH. Este proceso implica generar una clave SSH en su VM y añadir la
clave pública a su cuenta de GitHub.

**.** **Generar** **un** **Nuevo** **Par** **de** **Claves** **SSH**
**en** **la** **VM**

Conéctese a su VM de Google Cloud a través de SSH. Una vez dentro,
genere un nuevo par de claves SSH utilizando el siguiente comando. Se
recomienda usar un comentario que identiﬁque la clave, como su dirección
de correo electrónico.

> ssh-keygen -t ed25519 -C "su.email@example.com"

Cuando se le pregunte dónde guardar la clave, puede presionar Enter para
aceptar la ubicación predeterminada ( /home/su_usuario/.ssh/id_ed25519).
También se le pedirá una frase de contraseña (passphrase). Es una buena
práctica usar una, pero si desea que la automatización sea completamente
sin intervención, puede dejarla en blanco (aunque esto reduce la
seguridad).

Este comando creará dos archivos en el directorio .ssh: \* id_ed25519:
Su clave privada. **Nunca** **comparta** **este** **archivo.** \*
id_ed25519.pub: Su clave pública. Este es el archivo que añadirá a
GitHub.

**.** **Copiar** **la** **Clave** **Pública**

Para añadir la clave pública a GitHub, primero necesita copiar su
contenido. Puede ver el contenido de su clave pública con el siguiente
comando:

> cat ~/.ssh/id_ed25519.pub

Copie toda la salida de este comando, que comenzará con ssh-ed25519 y
terminará con su comentario (ej. su.email@example.com).

**.** **Añadir** **la** **Clave** **Pública** **a** **su** **Cuenta**
**de** **GitHub**

Ahora, siga estos pasos para añadir la clave pública a su cuenta de
GitHub:

> . Inicie sesión en su cuenta de GitHub en un navegador web.
>
> . Haga clic en su foto de perﬁl en la esquina superior derecha y luego
> en Settings (Conﬁguración).
>
> . En la barra lateral izquierda, haga clic en SSH and GPG keys (Claves
> SSH y GPG).
>
> . Haga clic en el botón New SSH key (Nueva clave SSH) o Add SSH key
> (Añadir clave SSH).
>
> . En el campo Title (Título), asigne un nombre descriptivo a la clave
> (ej. "VM Google Cloud - Desarrollo").
>
> . En el campo Key (Clave), pegue el contenido de su clave pública que
> copió en el paso anterior.
>
> . Haga clic en Add SSH key (Añadir clave SSH).

**.** **Probar** **la** **Conexión** **SSH** **a** **GitHub**

Para veriﬁcar que la conexión SSH a GitHub funciona correctamente desde
su VM, ejecute el siguiente comando:

> ssh -T git@github.com

Se le preguntará si está seguro de continuar la conexión. Escriba yes y
presione Enter. Si todo está conﬁgurado correctamente, debería ver un
mensaje como:

> Hi \<su_nombre_de_usuario\>! You've successfully authenticated, but
> GitHub does not provide shell access.

Esto conﬁrma que su VM puede autenticarse con GitHub usando la clave
SSH. Ahora puede clonar repositorios privados usando la URL SSH (ej.
git@github.com:su_usuario/su_repositorio.git) sin necesidad de
credenciales de

usuario y contraseña.

**.** **Conexión** **de** **Windsurf** **IDE** **a** **la** **VM**
**de** **Google** **Cloud** **para** **Desarrollo** **Remoto**

Windsurf IDE está diseñado para soportar el desarrollo remoto,
permitiéndole trabajar en proyectos alojados en su VM de Google Cloud
como si estuvieran en su máquina local. Esto se logra a través de una
conexión SSH, similar a cómo funcionan las extensiones de desarrollo
remoto en otros IDEs como VS Code. La funcionalidad Cascade de Windsurf
también debería operar en este entorno remoto, aprovechando

el contexto del código en la VM.

**.** **Requisitos** **Previos**

> **Windsurf** **IDE** **instalado:** Asegúrese de tener Windsurf IDE
> instalado en su máquina local.
>
> **Acceso** **SSH** **conﬁgurado:** Conﬁrme que puede acceder a su VM
> de Google Cloud a través de SSH desde su terminal local, como se
> describió en la Sección . .

**.** **Pasos** **para** **Conectar** **Windsurf** **IDE** **a** **la**
**VM**

Aunque los pasos exactos pueden variar ligeramente dependiendo de la
versión de Windsurf IDE, el proceso general implica conﬁgurar una
conexión SSH dentro del IDE:

> . **Abrir** **Windsurf** **IDE:** Inicie Windsurf IDE en su máquina
> local.
>
> . **Acceder** **a** **la** **Conexión** **Remota:** Busque una opción
> de "Conexión Remota" o "Remote-SSH" dentro de Windsurf. Esto podría
> estar en el menú de comandos (accesible a menudo con Ctrl/Cmd +
> Shift + P y buscando "Remote-SSH"), en la barra lateral, o en un botón
> de "Abrir Ventana Remota" en la parte inferior izquierda de la
> interfaz.
>
> . **Añadir** **un** **Nuevo** **Host** **SSH:** Seleccione la opción
> para añadir un nuevo host SSH. Se le pedirá que introduzca la
> información de conexión de su VM. La sintaxis típica es
> usuario@ip_o_nombre_de_host.
>
> **Usuario:** El nombre de usuario que utiliza para conectarse a su VM
> (generalmente su_usuario o ubuntu si no ha creado uno especíﬁco).
>
> **IP** **o** **Nombre** **de** **Host:** La dirección IP externa de su
> VM de Google Cloud o el nombre de host si lo ha conﬁgurado en su
> archivo ~/.ssh/config local. Ejemplo: ubuntu@34.123.45.67 (reemplace
> con la IP de su VM).
>
> . **Conﬁgurar** **Opciones** **SSH** **(Opcional** **pero**
> **Recomendado):** Windsurf puede pedirle que conﬁgure opciones SSH
> adicionales. Es posible que necesite especiﬁcar la ruta a su clave
> privada SSH si no está en la ubicación predeterminada ( ~/.ssh/id_rsa
> o ~/.ssh/id_ed25519).
>
> . **Conectar:** Una vez conﬁgurado el host, Windsurf intentará
> establecer la conexión SSH. Si es la primera vez que se conecta a este
> host desde Windsurf, es posible que se le pida que conﬁrme la huella
> digital del servidor.
>
> . **Abrir** **Carpeta** **Remota:** Una vez conectado, Windsurf le
> permitirá abrir una carpeta en el sistema de archivos de la VM.
> Navegue hasta el directorio de su proyecto y ábralo. Windsurf cargará
> el proyecto y todas sus funcionalidades (incluyendo Cascade) operarán
> en el contexto de los archivos en la VM.

**Consideraciones** **para** **Cascade** **y** **MCP** **Server**

Algunas fuentes mencionan la conﬁguración de un "Remote MCP Server" para
Windsurf. El "Model Context Protocol (MCP)" es lo que permite a Cascade
entender el contexto de su código. Si bien la conexión SSH estándar
debería permitir que Cascade

funcione con los archivos en la VM, para una integración más profunda o
para aprovechar al máximo las capacidades de IA de Windsurf en un
entorno remoto, podría ser necesario conﬁgurar un servidor MCP en la VM.
Consulte la documentación oﬁcial de Windsurf para obtener instrucciones
especíﬁcas sobre cómo conﬁgurar un MCP Server remoto, ya que esto puede
implicar pasos adicionales como la instalación de dependencias o la
ejecución de un servicio en la VM.

**.** **Flujo** **de** **Trabajo** **de** **GitHub** **Actions**
**para** **CI/CD** **Básico**

GitHub Actions le permite automatizar, personalizar y ejecutar ﬂujos de
trabajo de desarrollo directamente en su repositorio de GitHub. Puede
crear ﬂujos de trabajo para construir, probar, empaquetar, lanzar o
desplegar cualquier proyecto. Para nuestro caso, crearemos un ﬂujo de
trabajo básico que se activará con cada push al repositorio y ejecutará
pruebas en la VM de Google Cloud.

**.** **Conceptos** **Clave** **de** **GitHub** **Actions**

> **Workﬂow** **(Flujo** **de** **Trabajo):** Un proceso automatizado
> conﬁgurable que se ejecuta en su repositorio. Los ﬂujos de trabajo se
> deﬁnen en archivos YAML
>
> ( .yml) en el directorio .github/workflows/ de su repositorio.
>
> **Event** **(Evento):** Una actividad especíﬁca en su repositorio que
> desencadena un ﬂujo de trabajo (ej. push, pull_request,
> issue_comment).
>
> **Job** **(Trabajo):** Un conjunto de steps que se ejecutan en el
> mismo runner (servidor). Puede tener múltiples trabajos en un ﬂujo de
> trabajo, y pueden ejecutarse en paralelo o secuencialmente.
>
> **Step** **(Paso):** Una tarea individual que puede ejecutar un
> comando, un script o una acción (una aplicación reutilizable de GitHub
> Actions).
>
> **Runner** **(Ejecutor):** Un servidor que ejecuta su ﬂujo de trabajo.
> GitHub proporciona ejecutores alojados (máquinas virtuales con
> software preinstalado), pero también puede conﬁgurar sus propios
> ejecutores autoalojados (self-hosted runners) en su VM de Google Cloud
> para tener más control sobre el entorno y los recursos.

**.** **Opción** **:** **Ejecutar** **Comandos** **SSH** **en** **la**
**VM** **desde** **GitHub** **Actions** **(Recomendado** **para**
**inicio)**

Esta opción es más sencilla de conﬁgurar inicialmente y permite que los
ejecutores alojados de GitHub (que son máquinas virtuales efímeras
proporcionadas por GitHub) se conecten a su VM de Google Cloud a través
de SSH para ejecutar comandos. Necesitará conﬁgurar una clave SSH
privada como un secreto de GitHub.

**. .** **Generar** **una** **Clave** **SSH** **Dedicada** **para**
**GitHub** **Actions**

Es una buena práctica generar un nuevo par de claves SSH especíﬁcamente
para GitHub Actions, en lugar de reutilizar la clave que usa para su
acceso personal. Genere este par de claves en su máquina local o en la
VM de Google Cloud. Asegúrese de **no** usar una frase de contraseña
para esta clave, ya que la automatización no podrá introducirla.

> ssh-keygen -t ed25519 -f ~/.ssh/github_actions_ssh_key -C
> "github-actions@example.com"

Esto creará github_actions_ssh_key (privada) y
github_actions_ssh_key.pub (pública).

**. .** **Añadir** **la** **Clave** **Pública** **a** **la** **VM**
**de** **Google** **Cloud**

Copie el contenido de github_actions_ssh_key.pub y añádalo al archivo
~/.ssh/authorized_keys en su VM de Google Cloud. Si el archivo no
existe, créelo. Asegúrese de que los permisos del archivo
authorized_keys sean 600 ( chmod 600

~/.ssh/authorized_keys).

**. .** **Añadir** **la** **Clave** **Privada** **como** **Secreto**
**de** **GitHub**

> . Copie el contenido de su clave privada ( github_actions_ssh_key).
>
> . En su repositorio de GitHub, vaya a Settings \> Secrets and
> variables \> Actions \> New repository secret.
>
> . Asigne un nombre al secreto, por ejemplo, SSH_PRIVATE_KEY_VM.
>
> . Pegue el contenido de su clave privada en el campo Value.

**. .** **Crear** **el** **Flujo** **de** **Trabajo** **de** **GitHub**
**Actions**

Cree un archivo .github/workflows/main.yml en su repositorio con el
siguiente contenido:

> **name**: Ejecutar Pruebas en VM de Google Cloud

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
||

||
||
||
||
||
||

> *\#* *MY_ENV_VAR:* *\${{* *secrets.MY_ENV_VAR* *}}*

**Asegúrese** **de** **reemplazar:** \* \<IP_PUBLICA_DE_SU_VM\> con la
dirección IP externa de su VM de Google Cloud. \* /ruta/a/su/proyecto
con la ruta absoluta a su proyecto en la VM. \* npm install && npm test
con los comandos que necesita ejecutar para instalar dependencias y
correr pruebas en su proyecto.

Este ﬂujo de trabajo: . Se activa con cada push a la rama main. .
Realiza un checkout de su código. . Conﬁgura un agente SSH con la clave
privada que guardó como secreto. . Se conecta a su VM de Google Cloud
vía SSH y ejecuta los comandos especiﬁcados (navegar al directorio del
proyecto, instalar dependencias y ejecutar

pruebas).

**.** **Opción** **:** **Conﬁgurar** **un** **Ejecutor** **Autoalojado**
**(Self-Hosted** **Runner)** **en** **la** **VM** **de** **Google**
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

**.** **Conclusión**

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
