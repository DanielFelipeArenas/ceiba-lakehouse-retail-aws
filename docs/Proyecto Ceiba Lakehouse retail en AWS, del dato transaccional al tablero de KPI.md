# Proyecto Ceiba: Lakehouse retail en AWS, del dato transaccional al tablero de KPIs

## Descripción

Ceiba es un sistema completo en AWS que convierte la base transaccional de una cadena de tiendas colombiana (≈ 9 millones de filas) en un tablero público de KPIs, y que el equipo destruye con Terraform al sustentar el 9 de diciembre de 2026.

El dato recorre cuatro capas en S3 (landing, bronze, silver y gold), procesadas con Spark en AWS Glue y orquestadas a demanda con Step Functions. El modelo estrella resultante se carga en un segundo proyecto de Neon (esquema dw); una API (API Gateway y Lambda) lo expone a un tablero en Next.js publicado en Vercel o Render.

Las fuentes son el dump .pgdump restaurado en Neon (proyecto 1), tres lotes incrementales en CSV o JSON (el tercero se entrega el día de la sustentación) y tres catálogos .xlsx: divipola\_geografia, festivos\_colombia y metas\_venta. El gasto máximo de AWS es de 20 USD.

El equipo lo forman Aura, Viviana, Felipe y Javier. Cada persona es dueña de un frente de trabajo con suplente, y su trabajo lo revisa alguien distinto a quien lo construyó (ver Organización del equipo).

## Problemática

La cadena necesita saber qué tiendas venden más, dónde, cómo y a qué hora, pero esa información está en una base transaccional de ≈ 9 millones de filas, diseñada para registrar ventas y no para analizarlas.

Los datos llegan con problemas sembrados a propósito, y el pipeline debe resolverlos de forma documentada:

- **Duplicados exactos:** facturas del dump que reaparecen idénticas en un lote; se detectan con `_hash_registro`.
- **Versiones distintas:** misma llave y otro valor (facturas anuladas después); el equipo define y documenta qué versión gana.
- **Códigos rotos:** el Excel pierde el cero inicial del código DANE (5001 en vez de 05001).
- **Campos vacíos:** tiendas sin coordenadas, productos sin EAN, ventas sin cliente (consumidor final).
- **Formatos mezclados:** un lote en CSV y otro en JSON, con columnas de otro nombre y fechas en otro formato.
- **Registros nuevos:** lo único que debe entrar como venta adicional al tablero.

El tablero debe responder ocho preguntas de negocio (ventas y ticket, ranking de tiendas, mapa de calor, tiendas abiertas, cómo se vende, día × hora, cumplimiento de metas y productos) con filtros de periodo, zona, departamento, formato de tienda y canal.

A eso se suman los retos de ejecución: quince días corridos, con solo diez hábiles desde mañana (el 8 de diciembre es festivo); cuatro personas; un tope de 20 USD en AWS; un lote 3 que llega el mismo día de la sustentación, con un formato que el equipo no habrá visto; y una infraestructura que debe poder crearse y destruirse con un comando.

## Objetivo general

Construir, integrar y sustentar el 9 de diciembre de 2026 un lakehouse retail en AWS que lleve la base transaccional y los tres lotes incrementales hasta un tablero público de KPIs, procese el lote 3 en vivo, gaste como máximo 20 USD y se destruya por completo con Terraform.

## Objetivos específicos

- Restaurar el dump en Neon (proyecto 1) y llevar la base, los lotes y los catálogos (convertidos a CSV) hasta landing y bronze, con particiones y las cinco columnas de control: `_origen`, `_fuente`, `_lote`, `_fecha_ingesta` y `_hash_registro`. *(Ingesta y Lakehouse)*
- Construir silver con reglas de limpieza y deduplicación documentadas (qué versión gana, cómo se tratan las facturas anuladas y los nulos, código DANE con cero inicial) y conteos por capa comprobables en Athena. *(Calidad del dato)*
- Modelar gold como estrella con grano declarado, llaves sustitutas y dimensión fecha propia (con festivos), anonimizando con hash el documento del cliente antes de gold. *(Modelo estrella)*
- Cargar dimensiones, metas y agregados en el esquema dw de Neon (proyecto 2), dentro del límite de 1 GB y con un rol de solo lectura para la API. *(Modelo estrella, API y seguridad)*
- Exponer los KPIs con una API (API Gateway y Lambda) documentada en OpenAPI, con CORS restringido al dominio del tablero, throttling, credenciales en Secrets Manager y consultas parametrizadas. *(API y seguridad)*
- Orquestar el pipeline completo con Step Functions a demanda, con registro de lotes en DynamoDB (etl\_control), reintentos y manejo de fallas, de modo que un lote nuevo se procese sin duplicar ventas. *(Orquestación)*
- Definir toda la infraestructura de AWS en Terraform, con alarmas de Budgets a 10 y 20 USD, y demostrar un apply y un destroy reproducibles. *(IaC y costos)*
- Publicar un tablero responsive que responda las ocho preguntas de negocio, con filtros, mapa de calor y estados de carga y error. *(UI/UX del tablero)*
- Entregar un repositorio público con README, diagramas y commits de cada integrante, y llegar a una sustentación en la que cualquiera responda por cualquier parte.

## Organización del equipo

El equipo se organiza en cuatro frentes con dueño claro, de modo que ninguna parte de la ruta crítica dependa de una sola persona y cada entrega la revise alguien distinto a quien la construyó.

| Persona | Rol | Misión | Criterios de evaluación que cubre |
| --- | --- | --- | --- |
| Aura | Ingesta, bronze y API | Lleva cada dato de su origen hasta bronze sin perder ni duplicar nada, y construye la API que lo entrega al tablero | Ingesta y Lakehouse; API y seguridad (código) |
| Felipe | Silver, gold, calidad y carga a Neon dw | Convierte el dato crudo en un modelo estrella correcto y comprobable, y responde cuánto dato entra, cuánto se descarta y por qué | Calidad del dato; Modelo estrella |
| Javier | Plataforma, orquestación y entrega | Hace que todo se despliegue, se conecte, se orqueste y se destruya de forma reproducible dentro de 20 USD | Orquestación; IaC y costos; API y seguridad (infraestructura) |
| Viviana | Tablero y documentación | Convierte los KPIs en un tablero público y mantiene el contrato con la API y la documentación | UI/UX del tablero; README y diagramas |

Frente al plan preliminar, la calidad del dato deja de ser un rol aparte: cada capa la construye una persona y la verifica otra. La API, el esquema dw y la carga a Neon pasan a tener dueño, y Terraform lo escriben varias personas, con Javier como responsable del conjunto.

### Aura: ingesta, bronze y API

**Es dueña de**

- Restauración del .pgdump en Neon (proyecto 1) y verificación de conteos por tabla.
- Lambdas `ingest_drive` y `xlsx_to_csv` (los códigos DANE se leen como texto para conservar el cero inicial) y `api_kpis`.
- Jobs de Glue `extract_neon` (extracción única a landing) y `to_bronze` (Parquet más columnas de control).
- Un archivo de configuración con los nombres de columna y los formatos de fecha de cada fuente, para que el lote 3 se procese aunque cambie de formato, sin tocar el código.
- Los bloques de Terraform de sus componentes (módulos ingestion y api), que entrega por Pull Request.

**Entrega**

- Avance 1 (30 nov): base restaurada con conteos, catálogos en CSV y carga completa en landing y bronze.
- Avance 2 (2 dic): lotes 1 y 2 en bronze apenas se publiquen y primer endpoint con datos reales de gold.
- Sustentación (9 dic): endpoints de las ocho vistas, OpenAPI al día e ingesta en vivo del lote 3.

**Orden de trabajo:** ingesta hasta el 30 de noviembre; API desde el 1 de diciembre, con Javier armando antes un endpoint de prueba para que el recorrido seguro ya funcione.

### Felipe: silver, gold, calidad y carga a Neon dw

**Es dueño de**

- Proyecto 2 de Neon: DDL del esquema dw (dimensiones, `fact_ventas`, `fact_pagos`, `fact_metas` y agregados `agg_ventas_dia`, `agg_ventas_hora` y `agg_pagos_dia`) y rol de solo lectura para la API.
- Jobs `to_silver` (tipado, estandarización, deduplicación, cruce con DIVIPOLA, hash del documento del cliente), `to_gold` (llaves sustitutas, `dim_fecha` con festivos, `dim_tienda_horario`) y `load_serving`.
- Reglas de calidad documentadas y conteos por capa en Athena.
- Datos de prueba sintéticos que reproducen los problemas sembrados y simulan un lote 3 con otro formato, para ensayar antes del 9 de diciembre.
- Rendimiento y costo de Spark: pocas particiones, joins por difusión (broadcast) con las dimensiones pequeñas y 2 workers G.1X. Aquí se aprovecha su conocimiento de paralelismo.
- Los bloques de Terraform de sus jobs (módulo etl), por Pull Request.

**Entrega**

- Avance 1: DDL del dw acordado, script de verificación de conteos de la restauración (para revisarla con Aura) y silver funcionando en local con una muestra del dump.
- Avance 2: silver con deduplicación de los lotes 1 y 2, gold en estrella y primera carga al dw.
- Sustentación: lote 3 recorriendo silver, gold y `load_serving`, con evidencia de conteos por capa.

**Orden de trabajo:** la primera semana trabaja sobre una copia local del dump (o una muestra), para no esperar a bronze.

### Javier: plataforma, orquestación y entrega

**Es dueño de**

- Repositorio, flujo de ramas y revisión de Pull Requests; si Javier no responde en 12 horas, cualquier otra persona puede aprobar.
- Terraform: estructura de los ocho módulos y los módulos security, storage, catalog (crawlers y bases) y observability (Budgets a 10 y 20 USD, logs a 7 días y alertas por SNS). Los demás módulos los completan sus dueños.
- Estado remoto con bloqueo, un rol IAM por servicio y los secretos en Secrets Manager.
- Step Functions (`pipeline_retail`) y la tabla DynamoDB `etl_control`: un lote ya procesado no vuelve a sumar.
- API Gateway: permisos, CORS y throttling.
- Registro de corridas de AWS y control del presupuesto.
- Coordinación de las entregas y del ensayo de la sustentación.

**Entrega**

- Avance 1: repositorio y flujo de ramas; Terraform de security, storage y catalog aplicado; Budgets activos antes de cualquier job.
- Avance 2: Step Functions ejecutando las etapas con los jobs reales y un primer endpoint desplegado detrás de API Gateway.
- Sustentación: pipeline completo orquestado, ensayo de destroy y evidencia de `terraform destroy`.

### Viviana: tablero y documentación

**Es dueña de**

- El contrato de la API (OpenAPI v0 con el JSON que necesita cada vista), redactado con Aura antes del 27 de noviembre. Desde ese día el tablero avanza contra datos simulados, marcados como provisionales.
- El tablero en Next.js, publicado en Vercel o Render desde esta semana (el dominio hace falta para configurar CORS): ocho vistas, filtros (periodo, zona, departamento, formato de tienda y canal), mapa de calor, diseño responsive y estados de carga y error.
- El orden de construcción de las vistas, por valor: ventas y ticket, ranking de tiendas, cómo se vende, cumplimiento, mapa de calor, productos, día × hora y tiendas abiertas.
- El README y los diagramas del repositorio. Cada persona entrega, antes de cerrar su hito, un documento de su módulo en `docs/` (qué hace, cómo se ejecuta, cómo se comprueba, evidencia); Viviana los ensambla.
- El guion de la demostración.

**Entrega**

- Avance 1: prototipo ejecutable con datos provisionales y OpenAPI v0.
- Avance 2: tablero conectado al primer endpoint real.
- Sustentación: tablero público completo, README, diagramas y guion.

### Dueño, suplente y verificador por componente

Ningún componente lo verifica quien lo construyó, y la persona suplente conoce lo suficiente de él para retomarlo si hace falta.

| Componente | Dueño | Suplente | Lo verifica |
| --- | --- | --- | --- |
| Restauración de Neon (proyecto 1) y conteos | Aura | Felipe | Felipe |
| Lambdas `ingest_drive` y `xlsx_to_csv` | Aura | Javier | Felipe |
| `extract_neon`, `to_bronze`, landing y bronze | Aura | Felipe | Felipe |
| Neon dw: DDL, rol de solo lectura y `load_serving` | Felipe | Aura | Aura |
| `to_silver`, `to_gold` y reglas de calidad | Felipe | Aura | Aura |
| `api_kpis` y OpenAPI | Aura | Javier | Viviana (contrato) y Felipe (cifras frente a gold) |
| API Gateway, IAM, CORS, throttling y secretos | Javier | Aura | Aura |
| Terraform, estado remoto, apply y destroy | Javier | Aura | Felipe (ejecuta el ensayo desde cero) |
| Step Functions y `etl_control` | Javier | Felipe | Aura |
| Presupuesto, alarmas y registro de corridas | Javier | Aura | Viviana |
| Tablero y su publicación | Viviana | Javier | Felipe (cifras) y Aura (CORS y errores) |
| README, diagramas y evidencias | Viviana | Javier | Felipe (sigue el README en limpio) |
| Repositorio, Pull Requests y tablero de tareas | Javier | Viviana | Todas las personas |
| Lote 3 en vivo | Aura | Felipe | Todas (ensayo general) |

## Acuerdos entre componentes

Cinco acuerdos desbloquean al equipo: los cuatro primeros se cierran a más tardar el 26 de noviembre y el quinto cuando se publiquen los lotes; después, cualquier cambio se anuncia y se anota en el documento antes de tocar el código.

| Acuerdo | Lo definen | Fecha límite | Contenido | Lo consumen |
| --- | --- | --- | --- | --- |
| Rutas y particiones en S3 | Aura y Javier | 25 nov | Buckets y prefijos de cada capa (landing: fuente= y fecha\_ingesta=; bronze: fuente= y lote=; silver y gold: anio= y mes=) | Todos los jobs |
| Esquema de bronze | Aura y Felipe | 26 nov | Columnas por tabla, columnas de control y nombre de cada lote | Felipe (silver) |
| DDL del modelo estrella y del esquema dw | Felipe, con Aura y Viviana | 26 nov | Tablas, grano, llaves sustitutas y agregados | Aura (API), Viviana y Javier |
| OpenAPI v0 | Viviana y Aura | 26 nov | Endpoints, filtros y forma del JSON de cada vista | Viviana, Aura y Javier |
| Reglas de calidad | Felipe y Aura, aprobadas por todas las personas | 1 dic (borrador el 28 nov) | Qué versión gana, tratamiento de facturas anuladas y nulos, código DANE | Silver, gold y documentación |

## Cronograma e hitos

El plan avanza en vertical: antes del Avance 2, una venta debe recorrer el sistema completo (restaurada, en bronze, silver y gold, en Neon dw, en un endpoint y en una tarjeta del tablero), y solo después se suman los lotes y las vistas restantes.

&#91;embedded content: plan por persona · 15 tareas y 3 hitos oficiales\]

Los fines de semana y el festivo del 8 de diciembre son colchón: se les asignan tareas de bajo riesgo y de revisión, no de ruta crítica.

### Hitos

| Hito | Entregable | Dueño | Lo verifica |
| --- | --- | --- | --- |
| Avance 1 · 30 nov | Base restaurada en Neon con conteos | Aura | Felipe |
| Avance 1 · 30 nov | Terraform base aplicado (security, storage y catalog) | Javier | Felipe |
| Avance 1 · 30 nov | Carga completa en landing y bronze | Aura | Felipe |
| Avance 1 · 30 nov | Prototipo del tablero con OpenAPI v0 | Viviana | Aura |
| Avance 2 · 2 dic | Silver con deduplicación de los lotes 1 y 2 | Felipe | Aura |
| Avance 2 · 2 dic | Gold en modelo estrella y primera carga al dw | Felipe | Aura |
| Avance 2 · 2 dic | Al menos un endpoint funcional con datos reales | Aura (código) y Javier (API Gateway) | Viviana |
| Sustentación · 9 dic | Pipeline completo orquestado en Step Functions | Javier | Aura |
| Sustentación · 9 dic | Tablero público completo | Viviana | Felipe |
| Sustentación · 9 dic | Lote 3 procesado en vivo | Aura y Felipe | Todas las personas (ensayo el 7 dic) |
| Sustentación · 9 dic | Evidencia de `terraform destroy` | Javier | Felipe |

### Primeras 48 horas

- [ ] **Todas las personas:** acordar hora y canal de la sincronización diaria y dejar funcionando Docker con la imagen de Glue en el propio equipo.
- [ ] **Javier:** crear el repositorio público con `.gitignore` (tfstate, tfvars y .env) y reglas de ramas; decidir la cuenta de AWS, crear las identidades IAM con MFA y activar Budgets a 10 y 20 USD; consultar al docente por el tamaño del equipo.
- [ ] **Aura:** restaurar el .pgdump en Neon (proyecto 1) el 25 de noviembre y compartir los conteos por tabla; preguntar fecha y acceso de los lotes; definir con Javier las rutas de S3.
- [ ] **Felipe:** crear el proyecto 2 de Neon con el DDL del esquema dw; restaurar una copia local o una muestra del dump para empezar silver; preparar el script de conteos de la restauración.
- [ ] **Viviana:** crear el proyecto Next.js y publicar una página de prueba en Vercel para tener el dominio; redactar con Aura el OpenAPI v0; maquetar las ocho vistas con datos provisionales.

## Reglas de trabajo

Estas reglas protegen lo más escaso del proyecto: el presupuesto de 20 USD, las credenciales de un repositorio público y el tiempo de revisión.

- **Git:** la rama principal queda protegida y cada persona trabaja en su rama. Todo Pull Request lo revisa alguien distinto al autor, en un máximo de 12 horas. Cada integrante hace sus propios commits (en trabajo en pareja se agrega Co-authored-by), porque la evaluación mira los commits de cada persona.
- **Cuenta de AWS:** una sola cuenta del equipo, con una identidad IAM individual por persona y MFA. Quién es la dueña o el dueño de la cuenta se decide el 25 de noviembre (ver Riesgos).
- **Desarrollo local primero:** ningún job se lanza en AWS sin haberse validado antes con la imagen Docker de Glue. Los jobs corren con 2 workers G.1X, nunca con los 10 por defecto, y no se dejan notebooks interactivos abiertos.
- **Presupuesto de corridas:** la estimación del curso es de ≈ 20 corridas completas en AWS. Reparto: Aura 4, Felipe 5, integración con Javier 4 y 7 para ensayos y sustentación. Cada corrida se anota en un registro compartido (fecha, quién, job, resultado y costo aproximado). El crawler de landing solo se ejecuta cuando hay archivos nuevos, porque cada corrida factura mínimo 10 minutos.
- **Credenciales:** nunca en el código ni en Git. El `.gitignore` excluye `.env`, `*.tfvars` y `terraform.tfstate` desde el primer commit, y los secretos se leen de Secrets Manager en ejecución. Si una clave llega al repositorio, se rota de inmediato: borrar el commit no basta.
- **Terraform destruible:** estado remoto con bloqueo en un bucket creado a mano, fuera de lo que se destruye; buckets con `force_destroy = true`; secretos con `recovery_window_in_days = 0` (si no, quedan en espera y bloquean el siguiente apply); grupos de logs declarados en Terraform. Se ensaya un apply y un destroy completos antes del 9 de diciembre.
- **Documentación continua:** cada persona entrega en `docs/` el documento de su módulo antes de cerrar su hito. Una tarea no está terminada solo porque el código esté escrito.
- **Comunicación:** sincronización de 15 minutos al día, a una hora fija que se acuerda hoy. Los bloqueos se avisan en el momento, no en la sincronización siguiente.
- **Todas las personas responden por todo:** el 6 o el 7 de diciembre cada dueño explica su módulo en 15 minutos a las demás personas, y en el ensayo general cada persona sustenta un componente que no construyó.

## Riesgos y decisiones pendientes

Hay cinco decisiones que se resuelven entre hoy y el 25 de noviembre, porque de ellas depende la ruta crítica; el resto son riesgos que se vigilan durante todo el proyecto.

| Riesgo o decisión | Cómo se maneja | Responsable | Fecha |
| --- | --- | --- | --- |
| Equipo de cuatro personas (el enunciado del curso habla de 2 a 3) | Confirmar con el docente que está permitido y cómo se evalúa la participación | Javier | 25 nov |
| Fecha, formato y acceso a lote\_01 y lote\_02 (el PDF los publica en la semana 2) y si la carpeta de Drive es pública | Preguntar al docente; mientras tanto, desarrollar la deduplicación con los datos sintéticos de Felipe | Aura | 25 nov |
| Cuenta de AWS: de quién es y quién asume el costo | Decidir una cuenta, una identidad IAM por persona, MFA y Budgets activos antes del primer job | Javier | 25 nov |
| Cabida del dump (≈ 9 M filas) en el plan de Neon | Verificar al restaurar; si no cabe, avisar al docente el mismo día | Aura | 25 nov |
| Hora de la sincronización diaria y canal de comunicación | Acordarlos en la primera reunión | Todas las personas | 24 nov |
| Lote 3 solo llega el 9 dic, con formato desconocido | Nombres de columna y formatos de fecha en un archivo de configuración; ensayo con un lote 3 simulado | Aura y Felipe | Ensayo el 5 dic |
| Regla de versión ganadora y tratamiento de facturas anuladas | Proponer, documentar y aprobar entre todas las personas, porque cambia las cifras del tablero | Felipe y Aura | 1 dic |
| Alcance ajustado: ocho vistas, cinco jobs y una API en diez días hábiles | Revisar el avance en cada sincronización; si algo se atrasa, recortar en este orden: tiendas abiertas, día × hora, productos; el mapa se simplifica por departamento antes de eliminarlo | Todas las personas; Javier modera | Diario |
| Costo por corridas innecesarias | Desarrollo local primero, registro de corridas y alarmas de Budgets a 10 y 20 USD | Javier | Continuo |
| Credenciales en un repositorio público | `.gitignore` desde el primer commit, secretos en Secrets Manager y revisión antes de cada push | Todas las personas; Javier revisa | Continuo |
| Destroy que falla o deja recursos facturando | Configurar buckets, secretos y logs como indican las reglas y ensayar apply y destroy completos | Javier; verifica Felipe | 5 dic |
| El 8 de diciembre es festivo y el 9 es la sustentación | Congelar cambios el lunes 7 en la noche; el 8 solo se ensaya | Todas las personas | 7 dic |

## Criterio de terminado

Una tarea está terminada cuando otra persona la pudo ejecutar o revisar y existe evidencia de que funciona.

- El responsable completó el desarrollo o la configuración.
- El resultado está integrado en el repositorio o en el ambiente acordado.
- Otra persona (la indicada en la tabla de verificadores) lo ejecutó o lo revisó.
- Existe evidencia: captura, conteo conciliado, registro de ejecución o URL.
- El documento del módulo en `docs/` permite reproducirlo.

El objetivo del equipo es llegar a cada hito con una versión integrada y comprobable, no con piezas que solo funcionan en el computador de quien las desarrolló.
