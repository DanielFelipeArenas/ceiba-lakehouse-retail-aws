"use client";

import { useState } from "react";
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

function formatColombianPesos(amount) {
  return `$${Math.round(amount).toLocaleString("es-CO")}`;
}

function KpiCard({ label, value }) {
  return (
    <article className={styles.kpiCard}>
      <h2>{label}</h2>
      <p>{value}</p>
    </article>
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
    <main className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Ceiba · Tablero de ventas</h1>
        <p>Prototipo con datos provisionales</p>
      </header>

      <div className={styles.filterBar}>
        <label htmlFor="department">Departamento</label>
        <select
          id="department"
          value={selectedDepartment}
          onChange={(event) => setSelectedDepartment(event.target.value)}
        >
          <option value="all">Todos</option>
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </div>

      <section className={styles.kpiGrid} aria-label="Indicadores de ventas">
        <KpiCard
          label="Ventas netas"
          value={formatColombianPesos(totalSales)}
        />
        <KpiCard
          label="Facturas"
          value={invoiceCount.toLocaleString("es-CO")}
        />
        <KpiCard
          label="Ticket promedio"
          value={
            averageTicket === null
              ? "Sin datos"
              : formatColombianPesos(averageTicket)
          }
        />
        <KpiCard
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
                <th scope="col">Departamento</th>
                <th scope="col">Ventas</th>
              </tr>
            </thead>
            <tbody>
              {storeRanking.map((store, index) => (
                <tr key={store.id}>
                  <td>{index + 1}</td>
                  <td>{store.name}</td>
                  <td>{store.department}</td>
                  <td>{formatColombianPesos(store.sales)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}