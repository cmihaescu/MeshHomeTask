import React from 'react';

/**
 * The shop's signature element: order math rendered as a ledger receipt —
 * mono type, dashed rules, perforated bottom edge, highlighted total.
 *
 * Compound component:
 *   <Receipt title="Order summary">
 *     <Receipt.Row label="Item × 2" value="$49.98" />
 *     <Receipt.Divider />
 *     <Receipt.Total label="Total" value="$49.98" />
 *     <Receipt.Note>Paid in USDC via Mesh</Receipt.Note>
 *   </Receipt>
 */
export const Receipt = ({ title, children }) => (
  <section className="receipt" aria-label={title}>
    {title ? <h2 className="receipt__title">{title}</h2> : null}
    {children}
  </section>
);

const Row = ({ label, detail, value }) => (
  <div className="receipt__row">
    <span className="receipt__label">
      {label}
      {detail ? <span className="receipt__detail">{detail}</span> : null}
    </span>
    <span className="receipt__value">{value}</span>
  </div>
);

const Divider = () => <hr className="receipt__divider" />;

const Total = ({ label = 'Total', value }) => (
  <div className="receipt__row receipt__row--total">
    <span className="receipt__label">{label}</span>
    <span className="receipt__total-value">{value}</span>
  </div>
);

const Note = ({ children }) => <p className="receipt__note">{children}</p>;

Receipt.Row = Row;
Receipt.Divider = Divider;
Receipt.Total = Total;
Receipt.Note = Note;
