"use client";
import { useState } from "react";
const tiendas = [
  { id: 1, nombre: "Tunja", departamento: "Boyacá", ventas: 8000000 },
  { id: 2, nombre: "Duitama", departamento: "Boyacá", ventas: 5000000 },
  { id: 3, nombre: "Bucaramanga", departamento: "Santander", ventas: 10000000 },
];

function formatoPesos(valor) {
  return `$${valor.toLocaleString("es-CO")}`;
}

export default function Inicio() {
    const [departamento, setDepartamento] = useState("Todos");

    const tiendasVisibles = tiendas.filter(
    (tienda) => departamento === "Todos" || tienda.departamento === departamento
    );

    const ventasTotales = tiendasVisibles.reduce(
    (total, tienda) => total + tienda.ventas,
    0
    );
    const ranking = [...tiendasVisibles].sort((a, b) => b.ventas - a.ventas);

  return (
    <main>
      <h1>Ceiba · Tablero de ventas</h1>
      <p>Prototipo con datos provisionales</p>
      <label>
        Departamento{" "}
        <select
            value={departamento}
            onChange={(evento) => setDepartamento(evento.target.value)}
        >
            <option>Todos</option>
            <option>Boyacá</option>
            <option>Santander</option>
        </select>
      </label>

      <section>
        <h2>Ventas totales</h2>
        <p>{formatoPesos(ventasTotales)}</p>
      </section>

      <section>
        <h2>Raking de tiendas</h2>
        <ol>
          {ranking.map((tienda) => (
            <li key={tienda.id}>
              {tienda.nombre} ({tienda.departamento}) · {formatoPesos(tienda.ventas)}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}