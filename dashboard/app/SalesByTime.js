"use client";

import { useState } from "react";
import styles from "./page.module.css";
import timeStyles from "./SalesByTime.module.css";

const weekDays = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

// Provisional monthly sales grouped by store, weekday, hour and day type.
// Store IDs match the demo stores in page.js.
const demoSalesByTime = [
  // Tunja: $8.000.000
  { storeId: 1, dayOfWeek: 1, hour: 10, dayType: "holiday", netSales: 1600000 },
  { storeId: 1, dayOfWeek: 1, hour: 10, dayType: "regular", netSales: 1200000 },
  { storeId: 1, dayOfWeek: 2, hour: 17, dayType: "regular", netSales: 2800000 },
  { storeId: 1, dayOfWeek: 6, hour: 12, dayType: "regular", netSales: 2400000 },

  // Duitama: $5.000.000
  { storeId: 2, dayOfWeek: 1, hour: 10, dayType: "holiday", netSales: 500000 },
  { storeId: 2, dayOfWeek: 1, hour: 10, dayType: "regular", netSales: 750000 },
  { storeId: 2, dayOfWeek: 2, hour: 17, dayType: "regular", netSales: 2250000 },
  { storeId: 2, dayOfWeek: 6, hour: 12, dayType: "regular", netSales: 1500000 },

  // Bucaramanga: $10.000.000
  { storeId: 3, dayOfWeek: 1, hour: 10, dayType: "holiday", netSales: 1500000 },
  { storeId: 3, dayOfWeek: 1, hour: 10, dayType: "regular", netSales: 1500000 },
  { storeId: 3, dayOfWeek: 2, hour: 17, dayType: "regular", netSales: 2500000 },
  { storeId: 3, dayOfWeek: 6, hour: 12, dayType: "regular", netSales: 4500000 },
];

const pesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function getCellKey(dayOfWeek, hour) {
  return `${dayOfWeek}-${hour}`;
}

function getCellClass(amount, peakSales) {
  if (amount === undefined) return timeStyles.emptyCell;
  if (amount === peakSales) return timeStyles.peakCell;
  if (amount >= peakSales / 2) return timeStyles.mediumCell;
  return timeStyles.lowCell;
}

export default function SalesByTime({ stores }) {
  const [selectedStore, setSelectedStore] = useState("all");
  const [selectedDayType, setSelectedDayType] = useState("all");

  const availableStoreIds = new Set(stores.map((store) => store.id));

  const filteredRows = demoSalesByTime.filter((row) => {
    const matchesDepartment = availableStoreIds.has(row.storeId);
    const matchesStore =
      selectedStore === "all" || row.storeId === Number(selectedStore);
    const matchesDayType =
      selectedDayType === "all" || row.dayType === selectedDayType;

    return matchesDepartment && matchesStore && matchesDayType;
  });

  const hours = [...new Set(filteredRows.map((row) => row.hour))].sort(
    (first, second) => first - second
  );

  const salesByCell = new Map();

  for (const row of filteredRows) {
    const key = getCellKey(row.dayOfWeek, row.hour);
    const previousSales = salesByCell.get(key) ?? 0;
    salesByCell.set(key, previousSales + row.netSales);
  }

  const peakSales =
    salesByCell.size > 0 ? Math.max(...salesByCell.values()) : null;

  const peakPeriods = [];

  for (const [key, amount] of salesByCell) {
    if (amount === peakSales) {
      const [dayOfWeek, hour] = key.split("-").map(Number);
      peakPeriods.push(`${weekDays[dayOfWeek - 1]} a las ${hour}:00`);
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="sales-time-heading">
      <h2 id="sales-time-heading">Ventas por día y hora</h2>

      <p className={styles.panelNote}>
        Junio de 2026 · Datos de ejemplo · Hora de Colombia
      </p>

      <div className={timeStyles.controls}>
        <label>
          Tienda
          <select
            value={selectedStore}
            onChange={(event) => setSelectedStore(event.target.value)}
          >
            <option value="all">Todas</option>

            {stores.map((store) => (
              <option key={store.id} value={String(store.id)}>
                {store.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tipo de día
          <select
            value={selectedDayType}
            onChange={(event) => setSelectedDayType(event.target.value)}
          >
            <option value="all">Todos</option>
            <option value="regular">No festivo</option>
            <option value="holiday">Festivo</option>
          </select>
        </label>
      </div>

      {peakSales === null ? (
        <p role="status">Sin datos para esta selección.</p>
      ) : (
        <>
          <p className={timeStyles.peakSummary} aria-live="polite">
            <strong>Mayor venta acumulada los días</strong>
            <span>
              {peakPeriods.join(" y ")} · {pesos.format(peakSales)}
              {peakPeriods.length > 1 ? " por franja" : ""}
            </span>
          </p>

          <div className={styles.tableScroll}>
            <table className={timeStyles.matrix}>
              <caption>
                Ventas acumuladas por días del mes. El azul más oscuro indica el
                valor máximo y el guion indica una franja sin datos.
              </caption>

              <thead>
                <tr>
                  <th scope="col">Día</th>
                  {hours.map((hour) => (
                    <th key={hour} scope="col">
                      {hour}:00
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {weekDays.map((dayName, index) => (
                  <tr key={dayName}>
                    <th scope="row">{dayName}</th>

                    {hours.map((hour) => {
                      const amount = salesByCell.get(getCellKey(index + 1, hour));

                      return (
                        <td
                          key={hour}
                          className={getCellClass(amount, peakSales)}
                        >
                          {amount === undefined ? "—" : pesos.format(amount)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}