import styles from "./page.module.css";

const channels = [
  { id: "TIE", name: "Tienda física" },
  { id: "ECO", name: "Comercio electrónico (web)" },
  { id: "APP", name: "Aplicación móvil" },
  { id: "DOM", name: "Domicilios por teléfono" },
];

// Provisional sales in COP, grouped by store ID and channel.
const demoSalesByStore = {
  1: { TIE: 4000000, ECO: 2000000, APP: 1500000, DOM: 500000 },
  2: { TIE: 3000000, ECO: 1000000, APP: 600000, DOM: 400000 },
  3: { TIE: 5000000, ECO: 2000000, APP: 1900000, DOM: 1100000 },
};

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("es-CO", {
  style: "percent",
  maximumFractionDigits: 1,
});

export default function SalesByChannel({ stores }) {
  const channelSales = channels.map((channel) => {
    const netSales = stores.reduce(
      (total, store) => total + demoSalesByStore[store.id][channel.id],
      0
    );

    return { ...channel, netSales };
  });

  const totalSales = channelSales.reduce(
    (total, channel) => total + channel.netSales,
    0
  );

  return (
    <section className={styles.panel} aria-labelledby="channel-heading">
      <h2 id="channel-heading">Ventas por canal</h2>

      <ul className={styles.channelList}>
        {channelSales.map((channel) => {
          const share = totalSales > 0 ? channel.netSales / totalSales : 0;

          return (
            <li key={channel.id}>
              <div className={styles.channelLabel}>
                <span>{channel.name}</span>
                <span>
                  {currencyFormatter.format(channel.netSales)}
                  {" · "}
                  {percentFormatter.format(share)}
                </span>
              </div>

              <div className={styles.channelTrack} aria-hidden="true">
                <div
                  className={styles.channelBar}
                  style={{ width: `${share * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}