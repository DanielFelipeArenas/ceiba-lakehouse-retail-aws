import styles from "./page.module.css";

// Provisional monthly targets in COP for June 2026.
const monthlyTargets = {
  1: 10000000,
  2: 4000000,
  3: 10000000,
};

const pesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat("es-CO", {
  style: "percent",
  maximumFractionDigits: 1,
});

export default function SalesTargets({ stores }) {
  return (
    <section className={styles.panel} aria-labelledby="targets-heading">
      <h2 id="targets-heading">Cumplimiento de metas</h2>
      <p className={styles.panelNote}>Junio de 2026 · Metas provisionales</p>

      <ul className={styles.targetList}>
        {stores.map((store) => {
          const target = monthlyTargets[store.id];
          const achievement = target > 0 ? store.sales / target : null;

          return (
            <li key={store.id}>
              <div className={styles.targetHeading}>
                <strong>{store.name}</strong>
                <span>
                  {achievement === null
                    ? "Sin meta válida"
                    : percent.format(achievement)}
                </span>
              </div>

              <p className={styles.targetDetail}>
                Ventas {pesos.format(store.sales)}
                {target != null && ` · Meta ${pesos.format(target)}`}
              </p>

              {achievement !== null && (
                <div className={styles.targetTrack} aria-hidden="true">
                  <div
                    className={
                      achievement >= 1 ? styles.targetReached : styles.targetFill
                    }
                    style={{ width: `${Math.min(achievement, 1) * 100}%` }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}