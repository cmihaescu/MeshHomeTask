import React from 'react';
import { useMeshEnv, MESH_ENVS, MESH_LINK_VERSIONS } from '../contexts/MeshEnvContext';
import { Field } from './ui/Field';

/**
 * Demo instrumentation (Mesh environment, Link account version, iframe
 * options) collected behind one chip so the shopper-facing nav stays clean.
 * The chip always shows the live env + account so state is never hidden.
 */
const DemoConsole = () => {
  const {
    meshEnv,
    setMeshEnv,
    linkVersion,
    setLinkVersion,
    iframeMode,
    setIframeMode,
    blockTopLevelLinks,
    setBlockTopLevelLinks,
  } = useMeshEnv();

  return (
    <details className="demo-console" data-env={meshEnv}>
      <summary className="demo-console__chip">
        <span className="demo-console__dot" aria-hidden="true" />
        {meshEnv} · Link {linkVersion}
      </summary>
      <div className="demo-console__panel">
        <p className="demo-console__title">Demo console</p>
        <Field
          label="Mesh environment"
          hint="Used for payments and deposits."
        >
          <select value={meshEnv} onChange={(e) => setMeshEnv(e.target.value)}>
            {MESH_ENVS.map((env) => (
              <option key={env} value={env}>
                {env.charAt(0).toUpperCase() + env.slice(1)}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Link account"
          hint="Which Mesh account credentials the SDK and backend use."
        >
          <select value={linkVersion} onChange={(e) => setLinkVersion(e.target.value)}>
            {MESH_LINK_VERSIONS.map((v) => (
              <option key={v} value={v}>
                {`Link ${v}`}
              </option>
            ))}
          </select>
        </Field>
        <label className="check" title="Mount the Mesh Link UI inside an embedded iframe instead of the default popup">
          <input
            type="checkbox"
            checked={iframeMode}
            onChange={(e) => setIframeMode(e.target.checked)}
          />
          <span>iFrame mode</span>
        </label>
        {iframeMode ? (
          <label className="check" title="Sandbox the iframe so it cannot open new tabs/windows or navigate the top-level page">
            <input
              type="checkbox"
              checked={blockTopLevelLinks}
              onChange={(e) => setBlockTopLevelLinks(e.target.checked)}
            />
            <span>Block top-level links</span>
          </label>
        ) : null}
      </div>
    </details>
  );
};

export default DemoConsole;
