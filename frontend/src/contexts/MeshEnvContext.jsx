import React, { createContext, useContext, useState, useEffect } from 'react';

const MeshEnvContext = createContext();

export const MESH_ENVS = ['sandbox', 'production'];

// Selectable Mesh "Link" account configurations. Each version maps to its own
// Mesh client ID (frontend) and client ID/secrets (backend).
export const MESH_LINK_VERSIONS = ['v1', 'v2'];
export const DEFAULT_LINK_VERSION = 'v2';

// Resolve the frontend Mesh client ID for the active Link version, falling back
// to the legacy non-versioned var when a versioned one isn't set.
const clientIdForVersion = (version) => {
  const v1 = import.meta.env.VITE_MESH_CLIENT_ID_V1;
  const v2 = import.meta.env.VITE_MESH_CLIENT_ID_V2;
  const legacy = import.meta.env.VITE_MESH_CLIENT_ID;
  return (version === 'v1' ? v1 : v2) || legacy;
};

export const useMeshEnv = () => {
  const context = useContext(MeshEnvContext);
  if (!context) {
    throw new Error('useMeshEnv must be used within MeshEnvProvider');
  }
  return context;
};

export const MeshEnvProvider = ({ children }) => {
  // Default to sandbox; persist the selection across reloads.
  const [meshEnv, setMeshEnv] = useState(() => {
    const saved = localStorage.getItem('meshEnv');
    return MESH_ENVS.includes(saved) ? saved : 'sandbox';
  });

  // Which Link account configuration ("v1" / "v2") is active. Selects the Mesh
  // client ID used by the SDK and the credentials used by the backend.
  const [linkVersion, setLinkVersion] = useState(() => {
    const saved = localStorage.getItem('meshLinkVersion');
    return MESH_LINK_VERSIONS.includes(saved) ? saved : DEFAULT_LINK_VERSION;
  });

  // When true, the Mesh Link UI is mounted into an embedded <iframe>
  // instead of the default popup overlay.
  const [iframeMode, setIframeMode] = useState(
    () => localStorage.getItem('meshIframeMode') === 'true'
  );

  // When true, the embedded iframe is sandboxed so content inside it cannot
  // open new tabs/windows (e.g. Coinbase OAuth popups) or navigate the top
  // window. Only meaningful while iframeMode is on.
  const [blockTopLevelLinks, setBlockTopLevelLinks] = useState(
    () => localStorage.getItem('meshBlockTopLevelLinks') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('meshEnv', meshEnv);
  }, [meshEnv]);

  useEffect(() => {
    localStorage.setItem('meshLinkVersion', linkVersion);
  }, [linkVersion]);

  useEffect(() => {
    localStorage.setItem('meshIframeMode', String(iframeMode));
  }, [iframeMode]);

  useEffect(() => {
    localStorage.setItem('meshBlockTopLevelLinks', String(blockTopLevelLinks));
  }, [blockTopLevelLinks]);

  const value = {
    meshEnv,
    setMeshEnv,
    linkVersion,
    setLinkVersion,
    // Active Mesh client ID for the selected Link version (used by the SDK).
    meshClientId: clientIdForVersion(linkVersion),
    iframeMode,
    setIframeMode,
    blockTopLevelLinks,
    setBlockTopLevelLinks,
  };

  return <MeshEnvContext.Provider value={value}>{children}</MeshEnvContext.Provider>;
};
