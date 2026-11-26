import styles from "./page.module.css";

const paymentMethods = [
  { id: "BDI", name: "Billetera digital" },
  { id: "BON", name: "Bono de regalo" },
  { id: "EFE", name: "Efectivo" },
  { id: "PTS", name: "Puntos de fidelización" },
  { id: "TCR", name: "Tarjeta crédito" },
  { id: "TDB", name: "Tarjeta débito" },
  { id: "TRF", name: "Transferencia bancaria" },
];

// Provisional amounts in COP, grouped by store ID and payment method.
const demoPaymentsByStore = {
  1: {
    BDI: 1000000,
    BON: 200000,
    EFE: 3000000,
    PTS: 100000,
    TCR: 1000000,
    TDB: 2000000,
    TRF: 700000,
  },
  2: {
    BDI: 600000,
    BON: 150000,
    EFE: 2000000,
    PTS: 50000,
    TCR: 800000,
    TDB: 1000000,
    TRF: 400000,
  },
  3: {
    BDI: 1000000,
    BON: 200000,
    EFE: 4000000,
    PTS: 100000,
    TCR: 1500000,
    TDB: 2500000,
    TRF: 700000,
  },
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

export default function PaymentsByMethod({ stores }) {
  const payments = paymentMethods.map((method) => {
    const paidAmount = stores.reduce((total, store) => {
      const storeAmount = demoPaymentsByStore[store.id]?.[method.id] ?? 0;
      return total + storeAmount;
    }, 0);

    return { ...method, paidAmount };
  });

  const totalPaid = payments.reduce(
    (total, method) => total + method.paidAmount,
    0
  );

  const rankedPayments = payments.sort(
    (first, second) => second.paidAmount - first.paidAmount
  );

  return (
    <section className={styles.panel} aria-labelledby="payment-heading">
      <h2 id="payment-heading">Medios de pago</h2>

      <div className={styles.tableScroll}>
        <table
          className={styles.paymentTable}
          aria-labelledby="payment-heading"
        >
          <thead>
            <tr>
              <th scope="col">Medio</th>
              <th scope="col">Monto</th>
              <th scope="col">% del total</th>
            </tr>
          </thead>
          <tbody>
            {rankedPayments.map((method) => (
              <tr key={method.id}>
                <td>{method.name}</td>
                <td>{currencyFormatter.format(method.paidAmount)}</td>
                <td>
                  {totalPaid > 0
                    ? percentFormatter.format(method.paidAmount / totalPaid)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}