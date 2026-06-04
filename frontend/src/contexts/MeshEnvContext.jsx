import React, { createContext, useContext, useState, useEffect } from 'react';

const MeshEnvContext = createContext();

export const MESH_ENVS = ['sandbox', 'production'];

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

  // When true, the Mesh Link UI is mounted into an embedded <iframe>
  // instead of the default popup overlay.
  const [iframeMode, setIframeMode] = useState(
    () => localStorage.getItem('meshIframeMode') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('meshEnv', meshEnv);
  }, [meshEnv]);

  useEffect(() => {
    localStorage.setItem('meshIframeMode', String(iframeMode));
  }, [iframeMode]);

  const value = { meshEnv, setMeshEnv, iframeMode, setIframeMode };

  return <MeshEnvContext.Provider value={value}>{children}</MeshEnvContext.Provider>;
};
