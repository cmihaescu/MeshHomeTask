import { useState } from 'react';

// Session storage key for the last onIntegrationConnected payload. Persisted so
// the payload survives the navigate('/confirmation') on a completed transfer.
export const CONNECTED_PAYLOAD_KEY = 'meshOnConnectedPayload';

const copyText = async (text) => {
  // navigator.clipboard needs a secure context; on-device testing over plain
  // http (e.g. phone hitting a LAN IP) falls back to the legacy textarea trick.
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy path
    }
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
};

const ConnectedPayloadPanel = ({ payload }) => {
  const [copied, setCopied] = useState(false);

  if (!payload) return null;

  const json = JSON.stringify(payload, null, 2);

  const handleCopy = async () => {
    const ok = await copyText(json);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      marginTop: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 15px',
        backgroundColor: '#f1f3f5',
        borderBottom: '1px solid #ddd',
      }}>
        <strong style={{ fontSize: '13px' }}>onIntegrationConnected payload</strong>
        <button
          onClick={handleCopy}
          className="btn btn-secondary"
          style={{ fontSize: '12px', padding: '4px 12px' }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre style={{
        margin: 0,
        padding: '15px',
        fontSize: '11px',
        fontFamily: 'monospace',
        maxHeight: '300px',
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
      }}>
        {json}
      </pre>
    </div>
  );
};

export default ConnectedPayloadPanel;
