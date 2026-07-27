import React from 'react';
import { Link } from 'react-router-dom';

// Explicit variant set instead of boolean mode props (isPrimary, isGhost, …).
const VARIANTS = {
  primary: 'btn btn--primary',
  secondary: 'btn btn--secondary',
  ghost: 'btn btn--ghost',
  danger: 'btn btn--danger',
};

const classFor = (variant, block, className) =>
  [VARIANTS[variant] ?? VARIANTS.primary, block ? 'btn--block' : '', className ?? '']
    .filter(Boolean)
    .join(' ');

export const Button = ({ variant = 'primary', block = false, className, children, ...rest }) => (
  <button className={classFor(variant, block, className)} {...rest}>
    {children}
  </button>
);

// Same visual language for router links that act as calls to action.
export const ButtonLink = ({ variant = 'primary', block = false, className, to, children, ...rest }) => (
  <Link to={to} className={classFor(variant, block, className)} {...rest}>
    {children}
  </Link>
);
