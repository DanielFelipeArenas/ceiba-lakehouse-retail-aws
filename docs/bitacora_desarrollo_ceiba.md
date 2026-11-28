# Bitácora de desarrollo del tablero de ventas de Ceiba

**Responsable:** Viviana Marcela Jiménez Rojas  
**Rama de trabajo:** `Viviana_branch`  
**Carpeta del tablero:** `dashboard/`  
**Tecnologías:** Next.js con App Router, React, JavaScript y CSS Modules.

El tablero permite a la gerencia de Ceiba consultar cuánto se vendió, comparar tiendas, revisar el cumplimiento de metas y entender por qué canales compran los clientes y cómo pagan. En esta primera etapa, las cifras que aparecen en pantalla son datos de ejemplo en pesos colombianos.

## 24 de noviembre de 2026 · Primer prototipo funcional

### Entorno de trabajo

- Preparé el entorno de desarrollo en Windows con Node.js y npm.
- Ejecuté el tablero localmente con `npm run dev` desde la carpeta `dashboard/`, donde se encuentra el archivo `package.json`.
- Desarrollé la primera página en `dashboard/app/page.js`. Incluí el título «Ceiba · Tablero de ventas» y el aviso «Prototipo con datos provisionales».

### Filtro y ranking de tiendas

Creé tres tiendas de ejemplo para comprobar el comportamiento del tablero antes de conectarlo a la API.

| Tienda | Departamento | Ventas de ejemplo |
| --- | --- | ---: |
| Tunja | Boyacá | $8.000.000 |
| Duitama | Boyacá | $5.000.000 |
| Bucaramanga | Santander | $10.000.000 |

Agregué el filtro **Departamento** con las opciones «Todos», «Boyacá» y «Santander». Implementé dos operaciones sobre las tiendas seleccionadas: sumar sus ventas y ordenarlas de mayor a menor para construir el ranking.

Probé las tres opciones en el navegador. Con «Todos» obtuve $23.000.000. Al seleccionar «Boyacá», el total cambió a $13.000.000 y el ranking mostró a Tunja seguida de Duitama. Con «Santander», el total cambió a $10.000.000 y quedó únicamente Bucaramanga.

Posteriormente subí esta primera versión a la rama `Viviana_branch`.

## 26 de noviembre de 2026 · Cinco vistas con datos de ejemplo

### 1. Ventas y ticket

Organicé el resumen de ventas en cuatro tarjetas. Cada indicador se calcula con las tiendas del departamento seleccionado.

| Indicador | Cálculo |
| --- | --- |
| Ventas netas | Suma de las ventas de las tiendas seleccionadas. |
| Facturas | Suma de las facturas de esas tiendas. |
| Ticket promedio | Ventas totales divididas entre el número total de facturas. |
| Unidades por ticket | Unidades vendidas divididas entre el número total de facturas. |

### 2. Ranking de tiendas

Organicé el ranking en una tabla con cuatro columnas: puesto, tienda, departamento y ventas. Al cambiar el filtro, se actualizan las tiendas visibles y se vuelven a asignar los puestos según las ventas de la selección.

### 3. Canales y medios de pago

Separé dos preguntas que puede hacerse la gerencia:

- **¿Por qué canal se realizó la venta?** Las barras de «Ventas por canal» muestran el monto y la participación de cada canal: tienda física, comercio electrónico, aplicación móvil y domicilios por teléfono.
- **¿Cómo se pagó la compra?** La tabla «Medios de pago» muestra cuánto se pagó con cada medio y qué porcentaje representa sobre el total de pagos de la selección.

### 4. Cumplimiento de metas

Incorporé las metas provisionales de junio de 2026. Para cada tienda se muestran las ventas, la meta del mes y el porcentaje alcanzado.

| Tienda | Ventas | Meta provisional | Cumplimiento |
| --- | ---: | ---: | ---: |
| Tunja | $8.000.000 | $10.000.000 | 80 % |
| Duitama | $5.000.000 | $4.000.000 | 125 % |
| Bucaramanga | $10.000.000 | $10.000.000 | 100 % |

Ubiqué las metas junto al ranking porque permiten interpretar juntos estos resultados. Por ejemplo, Bucaramanga lidera en ventas, mientras que Duitama es la tienda que supera su meta por el mayor porcentaje.

### 5. Mapa de ventas por departamento

Incorporé un mapa de Colombia que agrupa las ventas de las tiendas por departamento. La leyenda distingue tres situaciones: departamentos sin datos para la selección, ventas inferiores a $12.000.000 y ventas iguales o superiores a $12.000.000.

Debajo del mapa incluí los valores exactos. Con el filtro «Todos», Boyacá suma $13.000.000 entre sus dos tiendas y Santander registra $10.000.000.

### Consultas en Neon y coordinación con Aura

- En el editor SQL de Neon confirmé que el esquema `retail` contiene las tablas `tienda`, `factura`, `detalle_factura` y `canal_venta`.
- Consulté los cuatro canales en `retail.canal_venta`: aplicación móvil (`APP`), comercio electrónico (`ECO`), domicilios por teléfono (`DOM`) y tienda física (`TIE`).
- Revisé los siete medios registrados en `retail.medio_pago`: billetera digital (`BDI`), bono de regalo (`BON`), efectivo (`EFE`), puntos de fidelización (`PTS`), tarjeta crédito (`TCR`), tarjeta débito (`TDB`) y transferencia bancaria (`TRF`).
- Usé estos catálogos como referencia para los nombres que aparecen en el tablero. Los montos de ventas, pagos y metas siguen siendo provisionales.
- Preparé un borrador del contrato de la API para revisarlo con Aura. Queda pendiente acordar los nombres de los campos, cómo se calcula cada indicador y un ejemplo de respuesta para probar la integración.

### Diseño y distribución

- Reemplacé la barra oscura del encabezado por el árbol y el nombre de Ceiba. En escritorio, el selector de departamento queda junto al título y las cuatro tarjetas de indicadores comparten la fila siguiente.
- Ubiqué el mapa en la columna izquierda y agrupé el ranking y las metas en la derecha. Alineé los paneles de canales y medios de pago con esas mismas columnas.
- Adapté la distribución para pantallas pequeñas. Los paneles pasan a una columna y la tabla del ranking permite desplazamiento horizontal cuando lo necesita.
- Revisé un aviso de hidratación de React en el mapa. El ajuste propuesto reúne el nombre del departamento y el valor de ventas en un solo texto dentro de `<title>`. Queda pendiente confirmar el resultado al recargar la página.

### Valores de referencia para que el equipo pruebe el tablero

Con el prototipo abierto, seleccionen cada opción del filtro **Departamento** y comparen la pantalla con estos resultados esperados:

| Departamento | Ventas netas | Facturas | Ticket promedio | Unidades por ticket | Primera tienda del ranking |
| --- | ---: | ---: | ---: | ---: | --- |
| Todos | $23.000.000 | 460 | $50.000 | 2,4 | Bucaramanga |
| Boyacá | $13.000.000 | 260 | $50.000 | 2,4 | Tunja |
| Santander | $10.000.000 | 200 | $50.000 | 2,4 | Bucaramanga |

## 27–28 de noviembre de 2026 · Tres vistas nuevas y ajuste del diseño

Completé las tres vistas que estaban pendientes. Con este avance, el tablero reúne ocho vistas con datos de ejemplo.

### 6. Productos

Incorporé la participación de marca propia y dos tablas de ventas: una por categoría y otra por marca. Al seleccionar un departamento, la gerencia puede consultar qué categorías y marcas concentran las ventas de sus tiendas.

### 7. Ventas por día y hora

Agregué una matriz que cruza los días de la semana con las horas disponibles en los datos de ejemplo. Cada celda suma las ventas del período para esa combinación. Por ejemplo, «Martes · 17:00» reúne las ventas registradas a esa hora en los martes del mes.

La vista permite filtrar por tienda y tipo de día. El color más oscuro identifica el mayor valor acumulado de la selección y el guion indica una combinación sin datos.

### 8. Tiendas abiertas

Incorporé una consulta por fecha y hora de Colombia. La vista muestra cuántas tiendas de la selección están abiertas, el horario que corresponde a cada una ese día y su estado a la hora consultada. Los horarios son de ejemplo.

### Diseño e integración

Ajusté la distribución y el espaciado de las secciones para facilitar la comparación de cifras y la lectura de las tablas. Conservé la identidad visual de Ceiba, el filtro por departamento y el énfasis en ventas netas.

Las ocho vistas funcionan con datos locales de ejemplo. El siguiente paso de integración es contrastar los campos y cálculos del frontend con una respuesta de prueba de la API.

### Próximos pasos

- [ ] Revisar el contrato de la API con Aura y validar los cálculos con una respuesta de ejemplo acordada.
- [ ] Subir a `Viviana_branch` los cambios de esta jornada y publicar una versión de prueba para el equipo.
