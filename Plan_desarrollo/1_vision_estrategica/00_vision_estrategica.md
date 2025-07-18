# **Visión Estratégica: Plataforma de "Mercenarios"**

## **1. Propuesta de Valor Única (PVU)**

### **1.1 Diferenciación Clave**

La plataforma Mercenary se posiciona como una **comunidad gamificada de élite para profesionales de alto rendimiento**, diferenciándose de las plataformas tradicionales de freelancing con un enfoque en:

- **Sistema de Ranking Competitivo**: El núcleo de la propuesta de valor, que mide y premia la excelencia.
- **Enfoque en Calidad sobre Cantidad**: Atracción de profesionales de alto nivel y proyectos desafiantes.
- **Gamificación del Trabajo**: Los usuarios mejoran su estatus a través de logros y desempeño comprobado.

> **Nota**: Para detalles técnicos sobre la implementación del sistema de ranking, consulte [Diseño del Sistema de Ranking](./8_documentation/API_DOCS.md#sistema-de-ranking).

### **Análisis del Perfil de Usuario Objetivo**

El éxito de la plataforma depende de atraer y retener a dos perfiles de usuario complementarios:

* **El "Mercenario":** Se define como una persona natural. No es un freelancer ocasional, sino un especialista que busca proyectos que pongan a prueba sus capacidades. Se siente motivado por un sistema que mide objetivamente su habilidad y fiabilidad a través de la competencia directa y un ranking visible. El ascenso en este ranking es un objetivo en sí mismo, representando un testimonio de su pericia.  
* **El "Oferente":** Puede ser una persona o una empresa que necesita talento de alta calidad y fiabilidad para ejecutar tareas críticas. Este usuario está dispuesto a confiar y, potencialmente, a pagar una prima por un sistema de ranking robusto que filtre eficazmente a los mejores candidatos, eliminando la incertidumbre y la fricción inherentes al proceso de selección tradicional.1

## **2. Visión General de la Arquitectura**

Para detalles completos sobre la arquitectura técnica, consulte el documento [Decisiones Técnicas](../2_arquitectura/01_decisiones_tecnicas.md).

### **2.1 Pilares Tecnológicos**

- **Frontend**: Aplicación móvil multiplataforma desarrollada con Flutter
- **Backend**: API RESTful construida con FastAPI (Python)
- **Base de Datos**: PostgreSQL para garantizar integridad transaccional
- **Infraestructura**: Contenedores Docker para despliegue consistente

## **3. Modelo de Negocio**

Para una descripción detallada del modelo de negocio, consulte [Modelo de Negocio](../5_negocio/01_modelo_negocio.md).

### **3.1 Fuentes de Ingresos**

1. Comisión por servicio (15% sobre transacciones)
2. Membresías Premium para Mercenarios y Empresas
3. Servicios adicionales (destacados de perfiles, publicidad)

### **Definición y Priorización de Funcionalidades para el MVP**

El objetivo principal del MVP es validar la hipótesis central del negocio: ¿un sistema de ranking competitivo es un incentivo suficiente para que Oferentes y Mercenarios transaccionen en Chile? Para ello, es imperativo implementar el ciclo completo de la interacción principal: un Oferente publica un trabajo, un Mercenario lo completa, y ambos se califican mutuamente, lo que a su vez afecta sus posiciones en el ranking.  
La siguiente tabla utiliza un enfoque de priorización para definir el alcance del MVP, enfocando los recursos en las características absolutamente esenciales para el lanzamiento y evitando la "inflación de características" que podría retrasar la llegada al mercado.

| Característica | Prioridad | Justificación |
| :---- | :---- | :---- |
| **Registro y Perfil de Usuario (Oferente/Mercenario)** | Must-have | Flujo de entrada esencial. Debe diferenciar los dos tipos de usuario desde el inicio. |
| **Publicación de Anuncios (por Oferentes)** | Must-have | Inicia el ciclo de trabajo. Debe incluir título, descripción, categoría y presupuesto. |
| **Tablón de Anuncios con Filtro por Categoría** | Must-have | Funcionalidad central para que los Mercenarios encuentren trabajo. |
| **Sistema de Postulación y Aceptación de Trabajo** | Must-have | Mecanismo para formalizar el acuerdo entre las partes. |
| **Sistema de Calificación Básico (Post-trabajo)** | Must-have | Recopila el feedback necesario para alimentar el sistema de ranking. |
| **Sistema de Ranking v1.0 (Basado en Elo \+ Feedback simple)** | Must-have | El diferenciador clave. Debe ser funcional, aunque el algoritmo se refine después. |
| **Pasarela de Pago Segura (Depósito en Garantía/Escrow)** | Must-have | Esencial para la confianza. El Oferente deposita el pago, se libera al Mercenario tras la finalización. |
| **Notificaciones Push Básicas** | Should-have | Mejora la experiencia (nuevas postulaciones, mensajes, etc.), pero no es bloqueante. |
| **Chat Básico entre Usuarios** | Should-have | Facilita la comunicación durante el proyecto, pero se puede manejar externamente en la primera iteración si es necesario. |
| **Perfiles de Usuario Avanzados (Portafolio, Historial)** | Could-have | Enriquece la plataforma, pero puede ser desarrollado post-MVP. |
| **Sistema de Disputas** | Could-have | Importante a largo plazo, pero para el MVP se puede manejar manualmente. |

### **Hoja de Ruta de Desarrollo por Fases**

El desarrollo se propone en fases iterativas para permitir la validación continua y la adaptación basada en el feedback del mercado.

* **Fase 1 (MVP \- 3-4 meses):** Implementación de todas las características catalogadas como "Must-have". El objetivo es lanzar una versión beta a un grupo cerrado de usuarios para validar el modelo de negocio y el ciclo de interacción principal.  
* **Fase 2 (Versión 2.0 \- 4-6 meses post-MVP):** Desarrollo de las características "Should-have" y "Could-have", priorizadas según el feedback recopilado durante la Fase 1\. Se refinará el algoritmo de ranking y se mejorará la experiencia de usuario general.  
* **Fase 3 (Futuro):** Exploración e implementación de funcionalidades avanzadas, como sistemas de matching basados en IA, modelos de suscripción premium, herramientas analíticas para oferentes y una posible expansión a otros mercados de América Latina.

## **Propuesta de Stack Tecnológico: Desarrollo Frontend**

La elección del framework de frontend es una de las decisiones técnicas más críticas, ya que impacta directamente en la velocidad de desarrollo del MVP, el costo del proyecto y la calidad de la experiencia del usuario final.

### **Análisis Comparativo de Frameworks Multiplataforma**

Se han evaluado tres tecnologías líderes para el desarrollo de aplicaciones móviles multiplataforma:

* **Kotlin Multiplatform (KMP):** Esta tecnología ofrece el rendimiento más cercano al nativo y genera los tamaños de aplicación más pequeños.7 Su principal desventaja, especialmente para un MVP, es que solo comparte la lógica de negocio, no la interfaz de usuario (UI). Esto significa que la UI debe ser desarrollada de forma nativa para cada plataforma (una vez para Android con Jetpack Compose y otra para iOS con SwiftUI), duplicando efectivamente el tiempo y el costo de desarrollo de la interfaz.8 KMP es una opción excelente para empresas con equipos de desarrollo nativo ya establecidos que buscan optimizar la reutilización de código de lógica de negocio.10  
* **React Native (RN):** Su mayor fortaleza es la capacidad de aprovechar el vasto ecosistema de JavaScript y el gran número de desarrolladores con experiencia en React.10 Sin embargo, los benchmarks de 2025 indican que su rendimiento en tareas intensivas de UI, como el desplazamiento de listas largas y las animaciones complejas, es significativamente inferior al de Flutter.7 Su arquitectura, que depende de un "puente" para comunicarse con los componentes nativos, puede introducir una sobrecarga de rendimiento y complejidad.12  
* **Flutter:** Creado y respaldado por Google, Flutter está diseñado específicamente para construir interfaces de usuario nativas compiladas de alto rendimiento desde una única base de código.8 A diferencia de React Native, Flutter no utiliza componentes nativos de la plataforma, sino que renderiza cada píxel en la pantalla utilizando su propio motor gráfico de alto rendimiento, llamado Impeller. Esto garantiza que la UI no solo sea extremadamente rápida, sino también 100% consistente en todos los dispositivos y versiones de Android e iOS, lo cual es fundamental para construir una identidad de marca sólida y una experiencia de usuario predecible.7

### **Benchmarks de Rendimiento 2025**

Para tomar una decisión informada, es crucial analizar datos de rendimiento objetivos. La siguiente tabla resume los benchmarks de 2025, comparando las tres tecnologías en métricas clave.

| Métrica (Datos de 2025\) | Kotlin Multiplatform (KMP) | Flutter 3.24 (Impeller) | React Native 0.74 (Bridgeless) | Ganador | Relevancia para el MVP |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Tiempo de Inicio (Frío)** | 1.27 s | **0.72 s** | 1.61 s | **Flutter** | Crítico para la retención del usuario. Un inicio rápido mejora la primera impresión. |
| **Tamaño de App (APK)** | **6.18 MB** | 12.08 MB | 11.56 MB | **KMP** | Menos crítico para el MVP, pero relevante a largo plazo. |
| **Uso de Memoria (Inactivo)** | **96 MB** | 253 MB | 130 MB | **KMP** | Importante para el rendimiento en dispositivos de gama baja. |
| **FPS Promedio (Scroll)** | 119 FPS | **120 FPS** | 42 FPS | **Flutter** | Esencial para una experiencia de usuario fluida y profesional. El bajo FPS de RN es una bandera roja. |
| **Velocidad de Desarrollo MVP** | Lenta (UI duplicada) | **Muy Rápida** | Rápida | **Flutter** | El factor más importante para un prototipo a corto plazo. |
| **Satisfacción del Desarrollador** | 82% | 78% | 74% | **KMP** | Alta satisfacción en todos, pero la curva de aprendizaje de KMP es más pronunciada para iOS.9 |

### **Recomendación Fundamentada: Flutter**

Para el objetivo explícito de desarrollar un **prototipo a corto plazo** que ofrezca una experiencia de usuario pulida, de alto rendimiento y visualmente atractiva, **Flutter es la opción tecnológica superior**.7  
Las razones que sustentan esta recomendación son:

1. **Velocidad de Desarrollo Inigualable:** La combinación de una única base de código para la lógica de negocio y la UI, junto con la característica de "Hot Reload" que permite ver los cambios en el código reflejados en la app casi instantáneamente, acelera drásticamente el ciclo de desarrollo e iteración, lo cual es vital para un MVP.8  
2. **Rendimiento Excepcional de la UI:** Gracias al motor de renderizado Impeller, Flutter ofrece un rendimiento de 120 FPS en dispositivos compatibles, lo que se traduce en animaciones y desplazamientos perfectamente fluidos, comparables a una aplicación nativa. Esto es crucial para transmitir una sensación de calidad y profesionalismo.7  
3. **Consistencia de Marca y Experiencia:** Al controlar cada píxel en la pantalla, Flutter garantiza que la aplicación se verá y se comportará de manera idéntica en todos los dispositivos Android e iOS. Esto es un activo invaluable para construir una identidad de marca fuerte y cohesiva en torno al concepto único de "Mercenarios".11  
4. **Curva de Aprendizaje Manejable:** Aunque el desarrollo se realiza en el lenguaje Dart, su sintaxis y paradigmas son muy similares a otros lenguajes modernos orientados a objetos como Kotlin. Para un desarrollador con experiencia en Android Studio, la transición a Flutter es relativamente sencilla y rápida.12

## **Propuesta de Stack Tecnológico: Desarrollo Backend**

El backend es el motor que impulsa toda la plataforma. Su elección debe ser una decisión estratégica que equilibre el rendimiento bruto, la velocidad de desarrollo para el MVP y la capacidad de evolucionar para satisfacer las necesidades futuras del negocio.

### **Análisis Comparativo de Frameworks de Backend**

Se han analizado dos opciones principales para la construcción de la API:

* **Node.js (con frameworks como Express o NestJS):** Es una opción madura y extremadamente popular, respaldada por el vasto ecosistema de paquetes de npm.13 Su principal atractivo es para equipos que ya tienen una fuerte competencia en JavaScript, permitiendo unificar el lenguaje en todo el stack. Sin embargo, su naturaleza de un solo hilo (single-threaded) puede ser una limitación para tareas intensivas en CPU. Además, la naturaleza de tipado dinámico de JavaScript, aunque flexible, puede aumentar el riesgo de errores en tiempo de ejecución que son más difíciles de detectar durante el desarrollo.13 Aunque en benchmarks de operaciones de I/O puras puede ser muy rápido, en escenarios de carga compleja, alternativas modernas pueden ofrecer menor latencia.14  
* **FastAPI (Python):** Es un framework web de Python moderno, diseñado desde cero para la creación de APIs de alto rendimiento, comparable en velocidad a Node.js y Go.17 Sus ventajas son particularmente relevantes para este proyecto:  
  * **Velocidad de Desarrollo Exponencial:** FastAPI está diseñado para minimizar el código repetitivo, permitiendo a los desarrolladores construir funcionalidades hasta un 200-300% más rápido.17  
  * **Robustez y Reducción de Errores:** Utiliza las anotaciones de tipo de Python y la biblioteca Pydantic para realizar una validación de datos automática y rigurosa. Esto reduce los errores inducidos por el desarrollador en aproximadamente un 40%, ya que muchos errores de datos se detectan antes de que el código llegue a producción.14  
  * **Documentación Interactiva Automática:** Genera automáticamente documentación de la API compatible con los estándares OpenAPI (anteriormente Swagger) y ReDoc. Esto ahorra innumerables horas de trabajo manual y facilita la colaboración y las pruebas de la API.13  
  * **Rendimiento Asíncrono:** Construido sobre Starlette para la parte web y ASGI para la comunicación con el servidor, FastAPI maneja operaciones asíncronas de forma nativa, lo que lo hace extremadamente rápido y eficiente para manejar múltiples solicitudes concurrentes.15  
  * **Alineación con el Ecosistema de IA/ML:** Al estar basado en Python, se integra de forma nativa y sin fricciones con el ecosistema de Machine Learning (IA/ML) más grande del mundo, incluyendo bibliotecas como TensorFlow, PyTorch y scikit-learn. Esta no es una ventaja menor, sino una capacidad estratégica fundamental para el futuro de la plataforma.14

### **Recomendación Fundamentada: FastAPI**

Para este proyecto, **FastAPI es la recomendación estratégica para el desarrollo del backend**.13 Esta elección no se basa únicamente en sus méritos para acelerar el desarrollo del MVP, sino en su posicionamiento como un habilitador estratégico a largo plazo.  
El sistema de ranking, que es el corazón de la aplicación, será un objetivo para intentos de manipulación. Para mantener su integridad y valor a medida que la plataforma crezca, será inevitable la implementación de algoritmas de Machine Learning para la detección de fraudes (por ejemplo, detectar anillos de votación, perfiles falsos, etc.).19 Además, la evolución natural de la plataforma incluirá funcionalidades de matching inteligente para conectar a los Mercenarios más adecuados con los Oferentes correctos.  
Al construir el backend en Python con FastAPI desde el principio, la plataforma estará perfectamente posicionada para integrar estas capacidades avanzadas de IA/ML de manera nativa. No será necesario reescribir la lógica en otro lenguaje, mantener servicios separados o lidiar con la complejidad de una arquitectura políglota. Se trata de una decisión que optimiza el presente (velocidad del MVP) y habilita el futuro (escalabilidad e inteligencia artificial).14

## **Diseño del Modelo de Datos y Selección de Base de Datos**

La base de datos es el cimiento sobre el cual se construye toda la aplicación. Su diseño y la tecnología elegida son determinantes para la integridad de los datos, el rendimiento de las consultas y la escalabilidad futura de la plataforma.

### **Análisis Comparativo: PostgreSQL vs. MongoDB**

La elección fundamental se da entre una base de datos relacional (SQL) y una no relacional (NoSQL).

* **MongoDB (NoSQL):** Como base de datos de documentos, MongoDB ofrece una gran flexibilidad. Almacena datos en documentos similares a JSON, lo que se mapea de forma muy natural a los objetos en el código de la aplicación, pudiendo acelerar el desarrollo inicial.20 Es una excelente opción para datos no estructurados o con esquemas que cambian constantemente. Sin embargo, para datos con relaciones complejas y bien definidas —como es el caso de un usuario que tiene múltiples anuncios, y un anuncio que recibe múltiples calificaciones—, MongoDB requiere un proceso llamado desnormalización. Este proceso implica duplicar datos en diferentes documentos, lo que puede complicar las actualizaciones y crear inconsistencias si no se maneja con extremo cuidado.20 Aunque MongoDB soporta transacciones ACID desde su versión 4.0, esta no es su característica principal ni su modo de operación por defecto.22  
* **PostgreSQL (SQL):** Es un sistema de gestión de bases de datos relacionales de objetos (ORDBMS) de código abierto, conocido por su robustez, madurez y estricto cumplimiento de los estándares SQL. Es la opción ideal para aplicaciones que demandan una alta integridad de datos y la capacidad de realizar consultas complejas.20  
  * **Integridad Relacional Garantizada:** PostgreSQL utiliza claves primarias y foráneas para definir y hacer cumplir las relaciones entre las tablas (por ejemplo, la relación entre la tabla Usuarios y la tabla Anuncios). Esto previene la existencia de datos "huérfanos" y asegura que la estructura de datos permanezca consistente y lógica, lo cual es fundamental para la lógica de negocio de esta aplicación.24  
  * **Cumplimiento ACID por Defecto:** Cada transacción en PostgreSQL es, por defecto, Atómica, Consistente, Aislada y Duradera. Esto es crucial para operaciones críticas como el procesamiento de pagos, la publicación de un anuncio o el registro de una calificación, ya que garantiza que la base de datos nunca quede en un estado inconsistente.20  
  * **Flexibilidad con JSONB:** PostgreSQL no es solo una base de datos relacional rígida. A través de su tipo de dato JSONB, puede almacenar, indexar y consultar datos semi-estructurados (similares a JSON) de manera altamente eficiente. Esto ofrece lo mejor de ambos mundos: la rigidez y seguridad de SQL para los datos estructurados y la flexibilidad de NoSQL para campos específicos que puedan necesitarla, todo dentro de la misma base de datos.23

### **Recomendación Fundamentada: PostgreSQL**

Para una aplicación donde las relaciones entre Usuarios, Anuncios, Contratos y Calificaciones no son un detalle secundario sino el núcleo mismo del modelo de negocio, **PostgreSQL es la elección inequívocamente superior**.20 La integridad de los datos y la fiabilidad transaccional no son características deseables, sino requisitos no negociables para construir la confianza de los usuarios en la plataforma.

### **Propuesta de Diagrama Entidad-Relación (ERD) Conceptual para el MVP**

El siguiente esquema describe las tablas principales y sus relaciones para la base de datos del MVP:

* **Users**: Almacenará la información de inicio de sesión y el rol de todos los usuarios.  
  * Campos: user\_id (Clave Primaria), email, password\_hash, name, role (ENUM: 'oferente', 'mercenario'), is\_company (Booleano), created\_at.  
* **Profiles**: Contendrá datos adicionales y específicos del perfil, vinculados a un usuario.  
  * Campos: profile\_id (Clave Primaria), user\_id (Clave Foránea a Users), elo\_rating (para Mercenarios), weighted\_score (para Mercenarios), bio, skills (puede ser un campo de texto o JSONB), company\_name (para Oferentes), industry.  
* **Announcements**: Representa los trabajos publicados por los Oferentes.  
  * Campos: announcement\_id (Clave Primaria), offerer\_id (Clave Foránea a Users), title, description, category\_id (Clave Foránea a Categories), budget, status (ENUM: 'abierto', 'en\_progreso', 'cerrado', 'cancelado'), created\_at.  
* **Categories**: Tabla maestra para las categorías de los anuncios.  
  * Campos: category\_id (Clave Primaria), name, parent\_category\_id (para subcategorías).  
* **Contracts**: Formaliza un acuerdo entre un Oferente y un Mercenario para un anuncio específico.  
  * Campos: contract\_id (Clave Primaria), announcement\_id (Clave Foránea a Announcements), mercenary\_id (Clave Foránea a Users), status (ENUM: 'activo', 'completado', 'disputado'), final\_price.  
* **Ratings**: Almacena el feedback detallado que se genera al completar un contrato.  
  * Campos: rating\_id (Clave Primaria), contract\_id (Clave Foránea a Contracts), rater\_id (quien califica, FK a Users), ratee\_id (quien es calificado, FK a Users), score\_quality, score\_communication, score\_professionalism, comment, created\_at.  
* **Transactions**: Registra todos los movimientos de dinero dentro de la plataforma.  
  * Campos: transaction\_id (Clave Primaria), contract\_id (Clave Foránea a Contracts), amount, status (ENUM: 'deposito\_escrow', 'liberacion\_pago', 'reembolso'), timestamp.

## **Diseño del Sistema de Ranking Competitivo: Un Enfoque Híbrido**

Esta es la característica más innovadora y el principal activo estratégico de la plataforma. Su diseño debe ser robusto, percibido como justo por los usuarios y, sobre todo, resistente a la manipulación. Se propone un sistema híbrido que combina la objetividad matemática de un sistema de clasificación de habilidad con la riqueza cualitativa del feedback humano.

### **Fundamento Algorítmico: Sistema de Rating Elo**

El sistema de rating Elo, desarrollado originalmente para el ajedrez, es un modelo matemático ideal para medir la habilidad relativa de los participantes en interacciones de suma cero.25 Su adaptación a este marketplace se realizaría de la siguiente manera:

* **Definición de la "Partida":** Cada "trabajo completado" se considerará una "partida" entre un Mercenario y un Oferente. Ambos usuarios tendrán un rating Elo. El rating del Mercenario representará su **nivel de habilidad**, mientras que el rating del Oferente puede interpretarse como un indicador de la **dificultad o calidad de los trabajos que propone**.  
* Cálculo del Resultado Esperado: Antes de que comience un trabajo, el sistema calculará el resultado esperado (E) para el Mercenario. Este se basa en la diferencia entre su rating (RA​) y el del Oferente (RB​). La fórmula es:  
  EA​=1+10(RB​−RA​)/4001​

  Un Mercenario con un rating muy superior al del Oferente tendrá un resultado esperado cercano a 1 (se espera que gane). Por el contrario, si se enfrenta a un trabajo de un Oferente con un rating mucho más alto (un trabajo "difícil"), su resultado esperado será bajo.27  
* Actualización del Rating: Tras la finalización del trabajo, el resultado real (S) —que puede ser 1 para un éxito o 0 para un fracaso— se compara con el esperado. El rating del Mercenario se actualiza con la siguiente fórmula:  
  Rnuevo′​=Ranterior​+K⋅(S−E)

  Donde K es el "factor K", una constante que determina la volatilidad del rating (un K más alto significa cambios más rápidos).27 Ganar un trabajo "difícil" (donde  
  E era bajo) otorgará una gran cantidad de puntos, mientras que perder un trabajo "fácil" (donde E era alto) resultará en una pérdida significativa de puntos. Esto incentiva a los Mercenarios a aceptar desafíos para ascender más rápidamente en el ranking.25

### **Capa de Ponderación: Modelo de Calificación Ponderada (WRS)**

El sistema Elo es excelente para medir el resultado binario de una interacción, pero no captura los matices de la *calidad* de la ejecución. Un trabajo puede ser completado con éxito, pero la comunicación pudo haber sido deficiente o la calidad apenas aceptable. Para capturar esta dimensión cualitativa, se introduce una segunda capa: un sistema de calificación ponderada (Weighted Rating System), inspirado en modelos de priorización de productos y sistemas de reputación como el de IMDb.29  
Después de cada contrato, el Oferente calificará al Mercenario en varias dimensiones predefinidas. No todas las dimensiones tienen la misma importancia; por ejemplo, la "Calidad del Entregable" es intrínsecamente más crítica que otros aspectos. Por lo tanto, a cada criterio se le asigna un peso porcentual. El resultado es un "Modificador de Calidad" que refleja el desempeño global en ese trabajo específico.32

| Criterio de Feedback | Calificación (1-5) | Peso | Puntuación Ponderada |
| :---- | :---- | :---- | :---- |
| Calidad del Entregable | 4 | 50% | 2.0 |
| Comunicación | 5 | 20% | 1.0 |
| Profesionalismo | 5 | 20% | 1.0 |
| Cumplimiento de Plazos | 3 | 10% | 0.3 |
| **Total** |  | **100%** | **4.3 (sobre 5\)** |

### **El Sistema Híbrido Final**

La combinación de ambos sistemas crea un modelo de reputación robusto y multifacético.

* El **ranking principal** y visible del Mercenario será su **Rating Elo**, que refleja su habilidad probada para completar trabajos de diversa dificultad.  
* Sin embargo, el cambio de puntos Elo después de cada trabajo será modulado por el Modificador de Calidad obtenido de la calificación ponderada. La fórmula de actualización final sería:  
  ΔElo=K⋅(S−E)⋅ModificadorCalidad

  Donde el ModificadorCalidad podría ser un valor derivado de la puntuación ponderada (ej. PuntuaciónPonderada / 3, para que oscile alrededor de 1.0). De esta forma, un trabajo exitoso (S=1) pero con un feedback excelente (ModificadorCalidad \> 1\) otorgará un bono de puntos Elo. Por el contrario, un trabajo exitoso pero con un feedback deficiente (ModificadorCalidad \< 1\) otorgará menos puntos de los que corresponderían solo por el resultado. Este sistema premia tanto la capacidad de asumir desafíos como la excelencia en la ejecución.

### **Mecanismos Anti-Manipulación**

La confianza en el sistema de ranking es el activo más valioso de la plataforma. Por lo tanto, es imperativo diseñar mecanismos para prevenir y mitigar la manipulación desde el inicio.19

* **Verificación de Transacción:** La capacidad de calificar y afectar el ranking Elo estará estrictamente limitada a las interacciones que hayan culminado con una transacción monetaria procesada a través de la plataforma. Esto elimina de raíz la posibilidad de reseñas falsas de personas que no fueron clientes reales.  
* **Ponderación por Antigüedad y Gasto (Post-MVP):** Inspirado en investigaciones sobre sistemas de reputación robustos, las calificaciones emitidas por usuarios (tanto Oferentes como Mercenarios) con un historial corto o un bajo volumen de transacciones en la plataforma tendrán un peso menor en los cálculos. Esto reduce significativamente el impacto de cuentas falsas creadas con el único propósito de inflar o dañar la reputación de otros.19  
* **Análisis de Comportamiento (Post-MVP):** A medida que la plataforma acumule datos, se podrán implementar algoritmos de Machine Learning para detectar patrones de comportamiento anómalos. Por ejemplo, un grupo de Oferentes que sistemáticamente contratan y califican positivamente a un único Mercenario, o un Mercenario que repentinamente recibe una avalancha de calificaciones negativas de cuentas recién creadas. Estos patrones pueden ser marcados para una revisión manual o para una atenuación automática de su impacto en el ranking.19

## **Flujos de Usuario Clave y Taxonomía de Servicios**

Esta sección define las interacciones fundamentales de los usuarios con la plataforma y la estructura de información que facilitará la conexión entre Oferentes y Mercenarios.

### **Diseño de los Recorridos de Usuario (User Journeys)**

Los flujos de usuario deben ser intuitivos, eficientes y deben generar confianza en cada paso. Se basarán en las mejores prácticas de plataformas líderes como Upwork.35

* **Flujo del Oferente:**  
  1. **Registro y Verificación:** El proceso comienza con la creación de una cuenta, donde el usuario debe especificar si actúa como persona natural o en representación de una empresa.37 Se requiere una verificación de correo electrónico para activar la cuenta.  
  2. **Publicación de Anuncio:** El Oferente es guiado a través de un formulario estructurado para crear una oferta de trabajo clara y completa. Este formulario solicitará un título conciso, una descripción detallada del proyecto, la selección de una categoría de servicio, la definición de un presupuesto (ya sea de precio fijo o por hora) y la especificación de las habilidades requeridas.35  
  3. **Revisión de Postulaciones:** Una vez publicado el anuncio, el Oferente recibe postulaciones de los Mercenarios. Podrá ver una lista de candidatos, cada uno con su ranking Elo, su perfil y su propuesta específica para el trabajo.  
  4. **Contratación y Depósito en Garantía:** Al aceptar la postulación de un Mercenario, se genera un Contrato formal en la plataforma. En este punto, se solicita al Oferente que deposite el monto acordado en un sistema de garantía (escrow), asegurando al Mercenario que los fondos están disponibles.  
  5. **Seguimiento y Finalización:** Durante la ejecución del proyecto, la comunicación se puede mantener a través de un chat integrado. Al finalizar el trabajo, el Oferente revisa y aprueba el entregable.  
  6. **Liberación de Pago y Calificación:** Con la aprobación del trabajo, el Oferente autoriza la liberación del pago desde el escrow hacia el Mercenario. Inmediatamente después, se le solicita que califique al Mercenario en las dimensiones definidas (calidad, comunicación, etc.), completando así el ciclo.  
* **Flujo del Mercenario:**  
  1. **Registro y Creación de Perfil:** El Mercenario se registra como persona natural y completa un perfil detallado que funciona como su currículum digital. Este perfil debe incluir una foto profesional, una biografía convincente, una lista de sus habilidades y, opcionalmente, un portafolio de trabajos anteriores.4  
  2. **Búsqueda de Trabajos:** El Mercenario accede al tablón de anuncios público, donde puede navegar y buscar oportunidades. Utilizará filtros por categoría, palabras clave y presupuesto para encontrar los proyectos que mejor se ajusten a su perfil.  
  3. **Postulación:** Cuando encuentra un anuncio de interés, envía una propuesta personalizada. Esta propuesta es su oportunidad para destacar, explicando por qué es el candidato ideal y cómo abordaría el proyecto.  
  4. **Ejecución del Trabajo:** Una vez contratado, el Mercenario realiza el trabajo acordado, manteniendo una comunicación fluida con el Oferente.  
  5. **Entrega y Recepción de Pago:** Al completar el proyecto, entrega el trabajo final a través de la plataforma. Una vez que el Oferente aprueba y libera los fondos, el pago se acredita en su cuenta de la plataforma.  
  6. **Calificación Mutua:** Finalmente, el Mercenario también califica al Oferente, proporcionando feedback sobre aspectos como la claridad de los requerimientos y la calidad de la comunicación. Este feedback afectará el rating Elo del Oferente.

### **Propuesta de Taxonomía de Categorías de Anuncios**

Una taxonomía de servicios bien diseñada es fundamental para la usabilidad de la plataforma. Permite a los Mercenarios encontrar trabajos relevantes rápidamente y a los Oferentes categorizar sus necesidades con precisión, mejorando la calidad del matching.38 La estructura debe ser jerárquica y basarse en categorías reconocidas en el mercado, pero con la flexibilidad para adaptarse al nicho específico de "Mercenarios" en Chile.1

* **Estructura Jerárquica Propuesta:**  
  * **Nivel 1 (Categorías Principales):** Agrupaciones de alto nivel que cubren las principales áreas de servicios profesionales.  
    * Desarrollo y Tecnología (Ej. Desarrollo Web, Apps Móviles, Ciberseguridad, Infraestructura Cloud)  
    * Diseño y Creatividad (Ej. Diseño Gráfico, Diseño UI/UX, Edición de Video, Animación 3D)  
    * Marketing y Ventas (Ej. SEO/SEM, Gestión de Redes Sociales, Estrategia Comercial, Publicidad Digital)  
    * Redacción y Traducción (Ej. Copywriting, Redacción Técnica, Creación de Contenido, Traducción Jurada)  
    * Consultoría y Negocios (Ej. Asesoría Financiera, Planificación Estratégica, Gestión de Proyectos Ágiles)  
    * Servicios Especializados (Inspirado en modelos como TaskRabbit 1, esta categoría puede abarcar oficios calificados como plomería, electricidad, ensamblaje de muebles, etc., abriendo un nicho de mercado diferente).  
  * **Nivel 2 (Subcategorías):** Especializaciones dentro de cada categoría principal. Por ejemplo, dentro de "Desarrollo de Apps Móviles", las subcategorías serían "Desarrollo Nativo Android (Kotlin)", "Desarrollo Nativo iOS (Swift)" y "Desarrollo Multiplataforma (Flutter)".  
  * **Nivel 3 (Etiquetas/Habilidades):** Atributos específicos que permiten un filtrado facetado y de alta precisión.40 Estas serían habilidades concretas como  
    PostgreSQL, FastAPI, Docker, SwiftUI, Jetpack Compose, etc.

## **Cumplimiento Normativo y Consideraciones Legales en Chile**

Operar una plataforma digital en Chile, especialmente una que maneja datos personales y transacciones financieras, exige un cumplimiento estricto de la legislación local. Ignorar estas obligaciones no es una opción, ya que representa un riesgo legal y reputacional significativo que podría comprometer la viabilidad del negocio.

### **Análisis de la Ley N° 19.628 sobre Protección de la Vida Privada**

La Ley N° 19.628 es el marco legal vigente que regula el tratamiento de datos de carácter personal de personas naturales, y su alcance es aplicable a cualquier entidad, pública o privada, que realice dicho tratamiento.41 La ley tiene un ámbito de aplicación territorial, lo que significa que se aplica a esta plataforma, ya que está destinada a ofrecer servicios a titulares de datos que se encuentran en Chile.42  
El diseño y la operación de la aplicación deben estar guiados por los principios fundamentales de la ley 43:

* **Principio de Licitud y Lealtad:** Todo tratamiento de datos debe ser justo y realizarse con sujeción a la ley.  
* **Principio de Finalidad:** Los datos solo pueden ser recolectados para fines específicos, explícitos y lícitos. No pueden ser utilizados posteriormente para fines incompatibles con los originales.  
* **Principio de Transparencia e Información:** Las políticas y prácticas sobre el tratamiento de datos deben ser claras, precisas y estar permanentemente accesibles para los usuarios.  
* **Principio de Confidencialidad:** La plataforma, como responsable de los datos, tiene la obligación de guardar secreto sobre ellos y establecer las medidas de seguridad adecuadas para protegerlos.43  
* **Tratamiento de Datos Sensibles:** La ley prohíbe, como regla general, el tratamiento de datos sensibles (aquellos que revelan origen racial, opiniones políticas, estado de salud, etc.), salvo excepciones muy específicas que no parecen aplicar a este modelo de negocio.44

### **Impacto de la Nueva Ley de Protección de Datos**

Es crucial entender que el marco regulatorio en Chile está en proceso de un endurecimiento significativo. El proyecto de ley que moderniza la Ley 19.628 ya ha sido aprobado por la Comisión Mixta del Congreso, y su pronta promulgación traerá cambios sustanciales.45

* **Creación de la Agencia de Protección de Datos Personales:** Se establecerá una autoridad autónoma con amplias facultades normativas, fiscalizadoras y sancionadoras. Esto implica que la fiscalización dejará de ser reactiva (basada en denuncias) y pasará a ser proactiva.45  
* **Sanciones Drásticas:** Las multas por incumplimiento aumentarán de manera exponencial, pudiendo alcanzar hasta 20,000 UTM (más de 1.300 millones de pesos chilenos) para las infracciones consideradas gravísimas.45  
* **Principio de Responsabilidad (Accountability):** La carga de la prueba se invierte. La plataforma será legalmente responsable de demostrar activamente que cumple con la ley, no solo de cumplirla.45

### **Checklist de Acciones para el Cumplimiento (Privacy by Design)**

Para mitigar los riesgos legales, es fundamental adoptar un enfoque de "Privacidad desde el Diseño", integrando los requisitos legales en la arquitectura de la aplicación desde el primer día. La siguiente tabla detalla acciones concretas para el MVP.

| Acción Requerida | Base Legal (Ley 19.628 y su reforma) | Implementación en la App |
| :---- | :---- | :---- |
| **Obtener Consentimiento Informado y Específico** | Art. 12 (Regla general) 43 | Durante el proceso de registro, se debe presentar un checkbox (desmarcado por defecto) donde el usuario acepte explícitamente la Política de Privacidad y los Términos de Servicio. El texto debe enlazar directamente a dichos documentos. |
| **Redactar Política de Privacidad Clara y Completa** | Principio de Transparencia 43 | Crear un documento legal, redactado en lenguaje claro y accesible, que explique en detalle: qué datos se recopilan, con qué finalidad, por cuánto tiempo se almacenan, si se comparten con terceros (ej. pasarela de pago), y cómo los usuarios pueden ejercer sus derechos. |
| **Minimizar la Recolección de Datos** | Principio de Finalidad 43 | El formulario de registro y perfil debe solicitar únicamente los datos estrictamente necesarios para el funcionamiento de la plataforma. Se debe evitar la recolección de datos "por si acaso" o para futuras funcionalidades no definidas. |
| **Implementar Medidas de Seguridad Robustas** | Art. 11 (Deber de cuidado) 44 | Es obligatorio implementar medidas técnicas y organizativas para proteger los datos. Esto incluye, como mínimo: encriptación de contraseñas (usando algoritmos de hashing como Argon2 o bcrypt), uso de HTTPS para toda la comunicación cliente-servidor, y protección de la base de datos contra accesos no autorizados. |
| **Establecer un Protocolo para Derechos ARCOP** | Art. 5-10 (Derechos del titular) y nueva ley 43 | La aplicación debe contar con una sección en el perfil del usuario que le permita de forma sencilla: **Acceder** a todos sus datos, **Rectificar** la información incorrecta, solicitar la **Cancelación/Supresión** de su cuenta y datos, **Oponerse** a ciertos tratamientos (si aplica), y solicitar la **Portabilidad** de sus datos en un formato estructurado. |
| **Designar un Responsable de Datos** | Principio de Responsabilidad 45 | Internamente, se debe designar a una persona o rol como el responsable del tratamiento de datos personales, quien actuará como punto de contacto para los usuarios y la futura Agencia. |
| **Gestionar Transferencias Internacionales de Datos** | Art. 28 (Nueva Ley) 45 | Si se utilizan servicios de cloud hosting cuyos servidores están fuera de Chile (ej. AWS en EE.UU.), el contrato con dicho proveedor debe cumplir con las exigencias de la ley chilena para la transferencia internacional de datos, asegurando un nivel de protección adecuado. |

## **Estrategias de Monetización para la Plataforma**

Una vez que el MVP haya validado la propuesta de valor y comience a atraer a una base de usuarios, es fundamental implementar un modelo de negocio sostenible que permita el crecimiento y la rentabilidad de la plataforma.

### **Evaluación de Modelos de Ingresos**

Existen varios modelos de monetización probados en el ámbito de los marketplaces de servicios, cada uno con sus ventajas y desventajas.

* **Comisión por Transacción (Revenue Share):** Este es el modelo más directo y común en los marketplaces. La plataforma facilita la conexión y la transacción segura, y a cambio, cobra un porcentaje del valor de cada contrato completado.46 Es el modelo principal de gigantes como Upwork, que cobra un 10% al freelancer, y Fiverr, que cobra un 20% al vendedor.4 Su principal ventaja es que alinea perfectamente los incentivos: la plataforma solo gana dinero cuando sus usuarios (Oferentes y Mercenarios) tienen éxito. Es ideal para la fase inicial, ya que reduce la barrera de entrada al no requerir un pago por adelantado.  
* **Modelo de Suscripción (Freemium/Premium):** Este modelo consiste en ofrecer diferentes niveles de servicio.  
  * **Para Oferentes:** Se puede implementar un plan gratuito con funcionalidades básicas (ej. publicar un número limitado de anuncios al mes) y ofrecer planes de suscripción de pago que desbloqueen beneficios premium. Estos beneficios podrían incluir: la capacidad de publicar anuncios ilimitados, destacar sus ofertas para mayor visibilidad, obtener acceso prioritario a un pool de Mercenarios "Top Rated" o de élite, o acceder a herramientas analíticas avanzadas sobre el mercado.46  
  * **Para Mercenarios:** Aunque es menos común, se podría ofrecer una suscripción opcional que otorgue beneficios como un perfil destacado, comisiones reducidas sobre sus ganancias, o acceso anticipado a ciertos tipos de trabajos de alto valor.  
* **Tarifas por Servicios de Valor Agregado (Value-Added Services):** Consiste en cobrar por funcionalidades o servicios opcionales que mejoran la experiencia del usuario.  
  * **Promoción de Anuncios/Perfiles:** Similar a un anuncio patrocinado, los Oferentes podrían pagar para que su oferta de trabajo aparezca en la parte superior de los resultados de búsqueda, y los Mercenarios para destacar su perfil.  
  * **Verificación Acelerada:** Ofrecer un proceso de verificación de identidad o habilidades más rápido y exhaustivo por una tarifa única.  
  * **Servicios de Mediación en Disputas:** Cobrar por un servicio de mediación premium en caso de desacuerdos entre las partes.  
  * **Cursos y Certificaciones:** Crear o asociarse con proveedores de formación para ofrecer cursos que permitan a los Mercenarios mejorar sus habilidades. Al completar estos cursos, podrían obtener insignias de certificación en sus perfiles, aumentando su atractivo para los Oferentes.1

### **Recomendación de Estrategia de Monetización por Fases**

Se recomienda un enfoque de monetización evolutivo, que priorice la adquisición de usuarios en la fase inicial y la maximización de ingresos en fases posteriores.

* **Fase 1 (MVP y Crecimiento Inicial):**  
  * **Modelo Principal: Comisión por Transacción Competitiva.** El enfoque inicial debe ser atraer una masa crítica de Oferentes y Mercenarios. Para ello, se propone implementar un modelo de comisión por transacción único y competitivo, por ejemplo, una tasa fija del 10% que se reparte entre el Oferente y el Mercenario, o una comisión total que sea deliberadamente más baja que la de los competidores directos. En esta etapa, el objetivo no es la rentabilidad, sino el crecimiento y la validación del ecosistema.  
* **Fase 2 (Post-Masa Crítica):**  
  * **Introducción de Modelos de Suscripción para Oferentes.** Una vez que la plataforma albergue un flujo constante y una base sólida de Mercenarios de alta calidad, el valor de acceder a este talento se incrementa. En este punto, los Oferentes (especialmente las empresas) estarán más dispuestos a pagar una suscripción mensual por beneficios premium que les den una ventaja competitiva en la contratación.  
  * **Segmentación de Comisiones.** Se puede evolucionar hacia un modelo de comisiones más sofisticado, como el de Upwork, que incentiva las relaciones a largo plazo. Por ejemplo, la comisión podría disminuir a medida que aumenta el volumen de facturación total entre un mismo Oferente y un mismo Mercenario, fomentando la recurrencia y la lealtad a la plataforma.5

## **Conclusiones y Próximos Pasos Recomendados**

Este informe ha delineado una propuesta integral para el desarrollo de una innovadora plataforma de servicios freelance en Chile. La estrategia, la arquitectura tecnológica y las funcionalidades han sido diseñadas para crear un producto diferenciado, competitivo y con un alto potencial de crecimiento.

### **Resumen Ejecutivo de Recomendaciones Clave**

* **Estrategia de Posicionamiento:** El éxito de la plataforma no radicará en ser una alternativa más, sino en posicionarse como un **marketplace de nicho, gamificado y de élite**. El sistema de ranking competitivo no es una simple característica, sino el **producto central** que genera un círculo virtuoso de calidad y participación.  
* **Stack Tecnológico Óptimo:** Para lograr un desarrollo rápido del MVP sin sacrificar la calidad ni la escalabilidad futura, se recomienda un stack tecnológico moderno y eficiente: **Flutter** para el desarrollo del frontend multiplataforma, **FastAPI (Python)** para el backend, y **PostgreSQL** como sistema de gestión de base de datos.  
* **Sistema de Ranking Innovador:** Se debe implementar un sistema de reputación híbrido y único que combine la objetividad matemática del **Rating Elo** para medir la habilidad relativa, con la riqueza cualitativa de un **Modelo de Calificación Ponderada** para evaluar la calidad de la ejecución. Este sistema debe estar protegido por robustos mecanismos anti-manipulación.  
* **Cumplimiento Legal Proactivo:** Es imperativo adoptar un enfoque de **"Privacidad desde el Diseño"**, integrando los estrictos requisitos de la **Ley N° 19.628** y su inminente reforma en la arquitectura de la aplicación desde el primer día para minimizar el riesgo legal.  
* **Monetización Evolutiva:** La estrategia de negocio debe comenzar con un modelo de **comisión por transacción bajo y competitivo** para fomentar la adopción masiva. Una vez alcanzada una masa crítica de usuarios, se deben introducir gradualmente modelos de suscripción y servicios de valor agregado para maximizar los flujos de ingresos.

### **Plan de Acción Inmediato (Primeros 30 días)**

Para transformar esta propuesta en un proyecto tangible, se recomienda el siguiente plan de acción inmediato:

1. **Configuración del Entorno de Desarrollo:** Instalar y configurar las herramientas tecnológicas recomendadas: Flutter SDK con Android Studio, Python con el entorno virtual para FastAPI, una instancia local de PostgreSQL y Docker Desktop para la gestión de contenedores.  
2. **Diseño de UI/UX (Prototipado Visual):** Crear los wireframes y mockups de alta fidelidad para las pantallas clave del MVP. Esto incluye los flujos de registro, el tablón de anuncios, el perfil de usuario, el formulario de publicación de anuncios y la pantalla de calificación.  
3. **Desarrollo del Backend (Sprint 1):** Iniciar el desarrollo de la API con FastAPI. La primera tarea será implementar los endpoints para el registro de usuarios (diferenciando Oferentes y Mercenarios) y el sistema de autenticación, por ejemplo, utilizando tokens JWT (JSON Web Tokens).  
4. **Desarrollo de la Base de Datos (Sprint 1):** Utilizando un gestor de base de datos, crear el esquema inicial en PostgreSQL basado en el Diagrama Entidad-Relación (ERD) conceptual propuesto en este informe.  
5. **Asesoría Legal Especializada:** Paralelamente al desarrollo técnico, es crucial contactar a un abogado o estudio jurídico en Chile con especialización en derecho tecnológico y protección de datos. Su rol será revisar y validar la Política de Privacidad y los Términos de Servicio para asegurar su total conformidad con la legislación vigente y su futura reforma.
