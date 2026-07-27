import React from 'react';

const TONES = {
  danger: 'notice notice--danger',
  success: 'notice notice--success',
  warning: 'notice notice--warning',
  neutral: 'notice notice--neutral',
};

/**
 * Status/notice banner. `tone` is an explicit enum; `onDismiss` (when given)
 * renders a labelled close button. Announced politely to screen readers.
 */
export const Notice = ({ tone = 'neutral', onDismiss, children }) => (
  <div className={TONES[tone] ?? TONES.neutral} role="status">
    <div className="notice__body">{children}</div>
    {onDismiss ? (
      <button type="button" className="notice__close" onClick={onDismiss} aria-label="Dismiss message">
        ×
      </button>
    ) : null}
  </div>
);
