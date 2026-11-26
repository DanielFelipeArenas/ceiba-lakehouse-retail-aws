import { geoIdentity, geoPath } from "d3-geo";
import departmentsMap from "./colombia-departments.json";
import styles from "./page.module.css";

const departmentCodes = {
  Boyacá: "15",
  Santander: "68",
};

const pesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const projection = geoIdentity()
  .reflectY(true)
  .fitExtent(
    [
      [8, 8],
      [412, 312],
    ],
    departmentsMap
  );

const drawPath = geoPath(projection);

const mapRegions = departmentsMap.features.map((feature) => ({
  id: feature.properties.divipola_dep,
  name: feature.properties.dpto_nombre,
  path: drawPath(feature),
}));

function getRegionColor(sales) {
  if (sales === undefined) return "#e2e8ee";
  if (sales < 12000000) return "#91b2ce";
  return "#315c83";
}

export default function SalesMap({ stores }) {
  const salesByDepartment = new Map();

  for (const store of stores) {
    const previousSales = salesByDepartment.get(store.department) ?? 0;
    salesByDepartment.set(store.department, previousSales + store.sales);
  }

  const salesByCode = new Map(
    Array.from(salesByDepartment, ([name, sales]) => [
      departmentCodes[name],
      sales,
    ])
  );

  return (
    <section className={styles.panel} aria-labelledby="map-heading">
      <h2 id="map-heading">Ventas por departamento</h2>

      <svg
        className={styles.salesMap}
        viewBox="0 0 420 320"
        role="img"
        aria-label="Mapa de Colombia con ventas por departamento. Las cifras se detallan debajo."
      >
        {mapRegions.map((region) => {
          const sales = salesByCode.get(region.id);
          const salesLabel =
            sales === undefined
              ? "Sin datos en la selección"
              : pesos.format(sales);

          const regionTitle = `${region.name} · ${salesLabel}`;

          return (
            <path
              key={region.id}
              d={region.path}
              fill={getRegionColor(sales)}
              fillRule="evenodd"
              stroke="#ffffff"
              strokeWidth="0.8"
            >
              <title>{regionTitle}</title>
            </path>
          );
        })}
      </svg>

      <div className={styles.mapLegend} aria-label="Escala de ventas">
        <span>
          <i style={{ background: "#e2e8ee" }} />
          Sin datos
        </span>
        <span>
          <i style={{ background: "#91b2ce" }} />
          Menos de $12 millones
        </span>
        <span>
          <i style={{ background: "#315c83" }} />
          $12 millones o más
        </span>
      </div>

      <ul className={styles.mapValues}>
        {Array.from(salesByDepartment, ([name, sales]) => (
          <li key={name}>
            <span>{name}</span>
            <strong>{pesos.format(sales)}</strong>
          </li>
        ))}
      </ul>

      <p className={styles.mapSource}>
        Cartografía: DANE · MGN 2025, simplificación de mapas-colombia.
      </p>
    </section>
  );
}