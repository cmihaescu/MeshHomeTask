import React, { useState } from 'react';

const SOURCE_TONE = {
  onEvent: 'event',
  onIntegrationConnected: 'connect',
  onTransferFinished: 'transfer',
  onExit: 'exit',
};

const time = (d) => d.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0');

const EventLogPanel = ({ entries, onClear }) => {
  const [openIds, setOpenIds] = useState(() => new Set());
  const [copiedId, setCopiedId] = useState(null);

  const toggle = (id) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const copy = async (entry) => {
    const text = JSON.stringify({ source: entry.source, type: entry.type, at: entry.at, payload: entry.payload }, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {
      // Clipboard unavailable (e.g. insecure context); the payload is still on screen.
    }
  };

  return (
    <section className="wd-card wd-log">
      <div className="wd-card-head">
        <div>
          <span className="wd-eyebrow">Mesh Link SDK</span>
          <h3>Event log</h3>
        </div>
        <div className="wd-log-actions">
          <span className="wd-count">{entries.length}</span>
          <button type="button" className="wd-link-btn" onClick={onClear} disabled={!entries.length}>Clear</button>
        </div>
      </div>
      <p className="wd-muted wd-small">Every SDK callback is recorded here and in the browser console, newest first.</p>

      {entries.length === 0 ? (
        <div className="wd-empty wd-empty-dark">
          <p>No events yet. Start a verification to see them stream in.</p>
        </div>
      ) : (
        <ol className="wd-log-list">
          {entries.map((e) => {
            const open = openIds.has(e.id);
            const hasPayload = e.payload !== undefined;
            return (
              <li key={e.id} className="wd-log-item">
                <button type="button" className="wd-log-row" onClick={() => toggle(e.id)} aria-expanded={open}>
                  <span className="wd-log-time">{time(e.at)}</span>
                  <span className={`wd-log-source wd-tone-${SOURCE_TONE[e.source] || 'event'}`}>{e.source}</span>
                  <span className="wd-log-type">{e.type}</span>
                  <span className="wd-log-caret" aria-hidden="true">{hasPayload ? (open ? '▾' : '▸') : ''}</span>
                </button>
                {open && (
                  <div className="wd-log-payload">
                    <pre>{hasPayload ? JSON.stringify(e.payload, null, 2) : 'No payload'}</pre>
                    <button type="button" className="wd-link-btn" onClick={() => copy(e)}>
                      {copiedId === e.id ? 'Copied' : 'Copy JSON'}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};

export default EventLogPanel;
