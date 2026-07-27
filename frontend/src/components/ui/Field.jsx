import React, { useId } from 'react';

/**
 * Label + control wiring. Renders the label with htmlFor bound to a generated
 * id and passes that id to the single child control, so every input is always
 * programmatically labelled.
 */
export const Field = ({ label, hint, children }) => {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const control = React.Children.only(children);

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {React.cloneElement(control, { id, 'aria-describedby': hintId })}
      {hint ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
};
