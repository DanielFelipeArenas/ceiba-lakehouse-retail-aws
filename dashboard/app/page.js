"use client";

import { useState } from "react";
import PaymentsByMethod from "./PaymentsByMethod";
import SalesByChannel from "./SalesByChannel";
import SalesMap from "./SalesMap";
import SalesTargets from "./SalesTargets";
import styles from "./page.module.css";

const stores = [
  {
    id: 1,
    name: "Tunja",
    department: "Boyacá",
    sales: 8000000,
    invoiceCount: 150,
    unitsSold: 390,
  },
  {
    id: 2,
    name: "Duitama",
    department: "Boyacá",
    sales: 5000000,
    invoiceCount: 110,
    unitsSold: 234,
  },
  {
    id: 3,
    name: "Bucaramanga",
    department: "Santander",
    sales: 10000000,
    invoiceCount: 200,
    unitsSold: 480,
  },
];

const departments = [...new Set(stores.map((store) => store.department))];

const departmentOptions = [
  { value: "all", label: "Todos" },
  ...departments.map((department) => ({
    value: department,
    label: department,
  })),
];

const iconPaths = {
  sales: "M2 3h3l2.3 12h11.9l2.1-9H5.6 M9 20h.01 M18 20h.01",
  invoices: "M5 3h14v18l-3-2-4 2-4-2-3 2V3Z M8.5 8h7 M8.5 12h7",
  ticket: "M3 13 13 3h7v7L10 20 3 13Z M16.5 6.5h.01",
  units: "m3 8 9-5 9 5-9 5-9-5Z M3 12l9 5 9-5 M3 16l9 5 9-5",
};

function formatColombianPesos(amount) {
  return `$${Math.round(amount).toLocaleString("es-CO")}`;
}

function CeibaBrand() {
  return (
    <div className={styles.brand}>
      <svg
        className={styles.brandTree}
        viewBox="0 0 72 56"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 29c-4-1-4-6 0-8-1-4 3-7 7-6 1-5 5-7 10-6 2-5 7-7 12-4 4-3 10-2 13 2 5-1 10 2 11 7 5-1 9 3 8 7 4 3 2 8-3 8-5 1-10-1-15-1-6 0-10 3-14 7-5-4-10-6-15-6-5 0-10 2-14 0Z" />
        <path d="M15 52c10-1 17-5 18-14l1-6m4 0 1 6c1 9 7 13 18 14M24 52c6-1 10-3 12-7 2 4 6 6 12 7" />
        <path d="M34 33 23 21l-9-2m10 3-1-9m12 18-3-14-6-7m11 21 7-15 7-4m-6 6 9 2m-15 12 13-9 9 1M32 19l4-8" />
      </svg>

      <span className={styles.brandName}>Ceiba</span>
    </div>
  );
}

function KpiCard({ icon, label, value, primary = false }) {
  const cardClass = primary
    ? `${styles.kpiCard} ${styles.primaryKpi}`
    : styles.kpiCard;

  return (
    <div className={cardClass}>
      <span className={styles.kpiIcon} aria-hidden="true">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={iconPaths[icon]} />
        </svg>
      </span>

      <dl className={styles.kpiMetric}>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </dl>
    </div>
  );
}

export default function SalesDashboardPage() {
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const filteredStores = stores.filter(
    (store) =>
      selectedDepartment === "all" || store.department === selectedDepartment
  );

  const totalSales = filteredStores.reduce(
    (total, store) => total + store.sales,
    0
  );

  const invoiceCount = filteredStores.reduce(
    (total, store) => total + store.invoiceCount,
    0
  );

  const unitsSold = filteredStores.reduce(
    (total, store) => total + store.unitsSold,
    0
  );

  const averageTicket = invoiceCount > 0 ? totalSales / invoiceCount : null;
  const unitsPerTicket = invoiceCount > 0 ? unitsSold / invoiceCount : null;

  const storeRanking = [...filteredStores].sort(
    (firstStore, secondStore) => secondStore.sales - firstStore.sales
  );

  return (
    <div className={styles.page}>
      <main className={styles.dashboard}>
        <header className={styles.header}>
          <div>
            <CeibaBrand />
            <h1>Tablero de ventas</h1>
          </div>

          <fieldset className={styles.departmentFilter}>
            <legend>Departamento</legend>

            <div className={styles.filterOptions}>
              {departmentOptions.map((option) => (
                <label key={option.value} className={styles.filterOption}>
                  <input
                    type="radio"
                    name="department"
                    value={option.value}
                    checked={selectedDepartment === option.value}
                    onChange={(event) =>
                      setSelectedDepartment(event.target.value)
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </header>

        <section className={styles.kpiGrid} aria-label="Indicadores de ventas">
          <KpiCard
            primary
            icon="sales"
            label="Ventas netas"
            value={formatColombianPesos(totalSales)}
          />

          <KpiCard
            icon="invoices"
            label="Facturas"
            value={invoiceCount.toLocaleString("es-CO")}
          />

          <KpiCard
            icon="ticket"
            label="Ticket promedio"
            value={
              averageTicket === null
                ? "Sin datos"
                : formatColombianPesos(averageTicket)
            }
          />

          <KpiCard
            icon="units"
            label="Unidades por ticket"
            value={
              unitsPerTicket === null
                ? "Sin datos"
                : unitsPerTicket.toLocaleString("es-CO", {
                    maximumFractionDigits: 1,
                  })
            }
          />
        </section>

        <div className={styles.geographyGrid}>
          <SalesMap stores={filteredStores} />

          <div className={styles.storeColumn}>
            <section className={styles.panel} aria-labelledby="ranking-heading">
              <h2 id="ranking-heading">Ranking de tiendas</h2>

              <div className={styles.tableScroll}>
                <table
                  className={styles.rankingTable}
                  aria-labelledby="ranking-heading"
                >
                  <thead>
                    <tr>
                      <th scope="col">Puesto</th>
                      <th scope="col">Tienda</th>
                      <th scope="col" className={styles.departmentColumn}>
                        Departamento
                      </th>
                      <th scope="col">Ventas</th>
                    </tr>
                  </thead>

                  <tbody>
                    {storeRanking.map((store, index) => (
                      <tr key={store.id}>
                        <td>{index + 1}</td>
                        <th scope="row">{store.name}</th>
                        <td className={styles.departmentColumn}>
                          <button
                            type="button"
                            className={styles.departmentLink}
                            aria-label={`Filtrar por ${store.department}`}
                            onClick={() =>
                              setSelectedDepartment(store.department)
                            }
                          >
                            {store.department}
                          </button>
                        </td>
                        <td>{formatColombianPesos(store.sales)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <SalesTargets stores={filteredStores} />
          </div>
        </div>

        <div className={styles.salesMixGrid}>
          <SalesByChannel stores={filteredStores} />
          <PaymentsByMethod stores={filteredStores} />
        </div>

        <footer className={styles.footer}>Cifras de ejemplo · Ceiba</footer>
      </main>
    </div>
  );
}