"use client";

import { useState } from "react";
import styles from "./page.module.css";
import openingStyles from "./OpenStores.module.css";

// Fictional weekly schedules for the prototype.
// Store IDs match the demo stores in page.js.
const demoSchedules = {
  1: {
    weekday: { opensAt: "08:00", closesAt: "19:00" },
    saturday: { opensAt: "08:00", closesAt: "17:00" },
    sunday: { opensAt: "09:00", closesAt: "14:00" },
  },
  2: {
    weekday: { opensAt: "09:00", closesAt: "18:00" },
    saturday: { opensAt: "09:00", closesAt: "16:00" },
    sunday: { closedAllDay: true },
  },
  3: {
    open24Hours: true,
  },
};

const dayNames = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const statusLabels = {
  open: "Abierta",
  closed: "Cerrada",
  unknown: "Sin información",
};

const statusClasses = {
  open: openingStyles.open,
  closed: openingStyles.closed,
  unknown: openingStyles.unknown,
};

function getOpeningInfo(storeId, dayOfWeek, time) {
  const schedule = demoSchedules[storeId];

  if (!schedule) {
    return { status: "unknown", hours: "Horario sin registrar" };
  }

  if (schedule.open24Hours) {
    return { status: "open", hours: "24 horas" };
  }

  let dailySchedule = schedule.weekday;

  if (dayOfWeek === 6) dailySchedule = schedule.saturday;
  if (dayOfWeek === 0) dailySchedule = schedule.sunday;

  if (dailySchedule?.closedAllDay) {
    return { status: "closed", hours: "Cerrada todo el día" };
  }

  if (!dailySchedule?.opensAt || !dailySchedule?.closesAt) {
    return { status: "unknown", hours: "Horario sin registrar" };
  }

  const { opensAt, closesAt } = dailySchedule;

  // The sample uses same-day shifts. HH:mm strings sort in time order.
  const isOpen = time >= opensAt && time < closesAt;

  return {
    status: isOpen ? "open" : "closed",
    hours: `${opensAt}–${closesAt}`,
  };
}

export default function OpenStores({ stores }) {
  const [selectedDate, setSelectedDate] = useState("2026-06-16");
  const [selectedTime, setSelectedTime] = useState("10:00");

  const hasSelection = Boolean(selectedDate && selectedTime);

  // Use the calendar date as entered, regardless of the browser's time zone.
  // The selected clock time is interpreted directly as Colombian local time.
  const dayOfWeek = selectedDate
    ? new Date(`${selectedDate}T12:00:00Z`).getUTCDay()
    : null;

  const rows = hasSelection
    ? stores.map((store) => ({
        id: store.id,
        name: store.name,
        ...getOpeningInfo(store.id, dayOfWeek, selectedTime),
      }))
    : [];

  const openCount = rows.filter((store) => store.status === "open").length;

  return (
    <section className={styles.panel} aria-labelledby="open-stores-heading">
      <h2 id="open-stores-heading">Tiendas abiertas</h2>

      <p className={styles.panelNote}>
        Consulta una fecha y una hora de Colombia. Horarios de ejemplo.
      </p>

      <div className={openingStyles.controls}>
        <label>
          Fecha
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </label>

        <label>
          Hora
          <input
            type="time"
            step="60"
            value={selectedTime}
            onChange={(event) => setSelectedTime(event.target.value)}
          />
        </label>
      </div>

      {!hasSelection ? (
        <p role="status">Selecciona una fecha y una hora.</p>
      ) : rows.length === 0 ? (
        <p role="status">Sin tiendas para el departamento seleccionado.</p>
      ) : (
        <>
          <p className={openingStyles.summary} aria-live="polite">
            <strong>Tiendas abiertas: {openCount} de {rows.length}</strong>
            <span>{dayNames[dayOfWeek]} · {selectedTime}</span>
          </p>

          <div className={styles.tableScroll}>
            <table
              className={openingStyles.table}
              aria-labelledby="open-stores-heading"
            >
              <thead>
                <tr>
                  <th scope="col">Tienda</th>
                  <th scope="col">Horario del día</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((store) => (
                  <tr key={store.id}>
                    <th scope="row">{store.name}</th>
                    <td>{store.hours}</td>
                    <td>
                      <span
                        className={`${openingStyles.status} ${statusClasses[store.status]}`}
                      >
                        {statusLabels[store.status]}
                      </span>
                    </td>
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