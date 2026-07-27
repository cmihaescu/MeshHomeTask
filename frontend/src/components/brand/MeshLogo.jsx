import React from 'react';

// Official Mesh wordmark (from the Mesh Link widget's public assets),
// recolored via currentColor so it follows the surrounding text color.
export const MeshWordmark = ({ height = 20, className }) => (
  <svg
    viewBox="0 0 1080 312.77"
    height={height}
    className={className}
    role="img"
    aria-label="Mesh"
    fill="currentColor"
  >
    <path d="M983.62,45.32c-36.47,0-59.39,22.69-69.81,38.32V0h-83.87v80.2l-9.53-7.66c-21.82-17.53-52.29-27.25-88.1-27.25-40.46,0-78.9,16.03-102.84,42.14l-4.42,4.83-4.46-4.79c-25.39-27.22-62.69-42.2-105.03-42.2-38.75,0-72.92,11.83-98.12,33.6v-.02c-.41.35-10.14,9.72-12.65,12.63l-4.49,5.2c-11.68-29.52-37.16-51.35-87.73-51.35-41.68,0-67.72,22.69-83.35,43.53-10.42-20.84-36.47-43.53-78.14-43.53-36.47,0-59.91,22.69-70.33,38.32v-33.11H0v253.3h80.75v-149.11c0-22.67,18.38-41.05,41.05-41.05h0c22.67,0,41.05,18.38,41.05,41.05v149.11h83.24v-149.11c0-22.67,18.38-41.05,41.05-41.05h0c22.67,0,41.05,18.38,41.05,41.05v149.11h80.72v-32.61l9.34,8.04c25.47,21.92,59.28,33.5,97.76,33.5,44.4,0,79.37-12.88,104.76-37.23l4.28-4.1,4.19,4.19c23.33,23.33,60.57,37.15,104.05,37.15,33.18,0,64.18-10.95,87.27-28.14l9.35-6.96v26.15h83.91s0-149.11,0-149.11c0-22.67,18.38-41.05,41.05-41.05h0c22.67,0,41.05,18.38,41.05,41.05v149.11h84.03v-154.32c0-57.3-31.26-104.19-96.38-104.19ZM464.72,133.31c11.7-14.49,29.59-23.76,49.66-23.76s37.99,9.29,49.69,23.79v12.03h-99.35v-12.06ZM766.99,237.07l-1.49.88c-10.07,5.77-21.42,9.21-33.34,9.21-21.89,0-39.28-8.88-51.86-22.82h-106.16c-13.65,13.99-32.71,22.68-53.8,22.68-22.63,0-42.92-10.01-56.71-25.83v-24.55h201.79s101.58,17.91,101.58,17.91v22.53ZM766.99,152.46s-68.31-12.04-68.31-12.04h0l.02-17.73c9.86-8.35,22.6-13.38,36.53-13.38,17.76,0,33.6,8.19,43.98,20.99h50.74s0,47.07,0,47.07c-2.7-2.14-23.31-17.67-62.96-24.91Z" />
  </svg>
);

// Compact Mesh "M" glyph (the mark Mesh uses for its favicon): ink tile with
// the acid-yellow stroke. Fixed brand colors on purpose — it reads the same
// in both themes, like a printed label. Pass `label` to expose it to
// assistive tech; without one it renders decorative (aria-hidden).
export const MeshGlyph = ({ size = 28, className, label }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    className={className}
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : 'true'}
  >
    <rect width="32" height="32" rx="8" fill="#141418" />
    <path
      d="M8 22V10l8 6 8-6v12"
      stroke="#f8ff4d"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);
