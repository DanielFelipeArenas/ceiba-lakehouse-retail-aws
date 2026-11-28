import styles from "./page.module.css";

// Demo sales grouped by store, category and brand.
// Store IDs match the three demo stores in page.js.
const demoProductSales = [
  {
    storeId: 1,
    category: "Alimentos",
    brand: "Ceiba",
    isPrivateLabel: true,
    netSales: 2400000,
  },
  {
    storeId: 1,
    category: "Alimentos",
    brand: "Campo Claro",
    isPrivateLabel: false,
    netSales: 3600000,
  },
  {
    storeId: 1,
    category: "Aseo",
    brand: "Brisa",
    isPrivateLabel: false,
    netSales: 2000000,
  },
  {
    storeId: 2,
    category: "Alimentos",
    brand: "Ceiba",
    isPrivateLabel: true,
    netSales: 2000000,
  },
  {
    storeId: 2,
    category: "Alimentos",
    brand: "Campo Claro",
    isPrivateLabel: false,
    netSales: 1250000,
  },
  {
    storeId: 2,
    category: "Aseo",
    brand: "Brisa",
    isPrivateLabel: false,
    netSales: 1750000,
  },
  {
    storeId: 3,
    category: "Alimentos",
    brand: "Ceiba",
    isPrivateLabel: true,
    netSales: 2000000,
  },
  {
    storeId: 3,
    category: "Alimentos",
    brand: "Campo Claro",
    isPrivateLabel: false,
    netSales: 5000000,
  },
  {
    storeId: 3,
    category: "Aseo",
    brand: "Brisa",
    isPrivateLabel: false,
    netSales: 3000000,
  },
];

const pesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 1,
});

function rankBySales(rows, field) {
  const totals = new Map();

  for (const row of rows) {
    const name = row[field];
    const previousSales = totals.get(name) ?? 0;
    totals.set(name, previousSales + row.netSales);
  }

  return Array.from(totals, ([name, netSales]) => ({ name, netSales })).sort(
    (first, second) =>
      second.netSales - first.netSales ||
      first.name.localeCompare(second.name, "es-CO")
  );
}

function ProductRanking({ title, columnLabel, rows }) {
  return (
    <div className={styles.tableScroll}>
      <h3>{title}</h3>

      <table className={styles.rankingTable} aria-label={title}>
        <thead>
          <tr>
            <th scope="col">{columnLabel}</th>
            <th scope="col">Ventas netas</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">{row.name}</th>
              <td>{pesos.format(row.netSales)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProductSales({ stores }) {
  const selectedStoreIds = new Set(stores.map((store) => store.id));

  const selectedRows = demoProductSales.filter((row) =>
    selectedStoreIds.has(row.storeId)
  );

  const totalSales = selectedRows.reduce(
    (total, row) => total + row.netSales,
    0
  );

  const privateLabelSales = selectedRows.reduce(
    (total, row) => total + (row.isPrivateLabel ? row.netSales : 0),
    0
  );

  // These three fields match the data object in the products API contract.
  const data = {
    topCategories: rankBySales(selectedRows, "category"),
    topBrands: rankBySales(selectedRows, "brand"),
    privateLabelSharePercent:
      totalSales === 0 ? null : (privateLabelSales / totalSales) * 100,
  };

  return (
    <section className={styles.panel} aria-labelledby="products-heading">
      <h2 id="products-heading">Productos</h2>

      {selectedRows.length === 0 ? (
        <p className={styles.panelNote}>
          Sin datos de productos para esta selección.
        </p>
      ) : (
        <>
          <p className={styles.panelNote}>
            Participación de marca propia:{" "}
            <strong>
              {data.privateLabelSharePercent === null
                ? "Sin dato"
                : `${percent.format(data.privateLabelSharePercent)} %`}
            </strong>
          </p>

          <div className={styles.salesMixGrid}>
            <ProductRanking
              title="Categorías por ventas"
              columnLabel="Categoría"
              rows={data.topCategories}
            />

            <ProductRanking
              title="Marcas por ventas"
              columnLabel="Marca"
              rows={data.topBrands}
            />
          </div>
        </>
      )}
    </section>
  );
}