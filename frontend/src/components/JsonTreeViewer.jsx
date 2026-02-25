import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';

const ROW_HEIGHT = 26;
const OVERSCAN = 15;
const INDENT = 20;
const MAX_EXPAND_NODES = 50000;

const VALUE_COLORS = {
  string: '#98c379',
  number: '#d19a66',
  boolean: '#56b6c2',
  null: '#c678dd',
};

// Lazily indexes JSON nodes — only processes children when a node is expanded
class JsonIndex {
  constructor(rootData) {
    this.nodes = new Map();
    this.rawData = new Map();
    const root = this._makeNode(rootData, 'root', null, 0);
    this.nodes.set('root', root);
    if (!root.isLeaf) this.rawData.set('root', rootData);
  }

  _makeNode(val, id, key, depth) {
    if (val !== null && typeof val === 'object') {
      const isArr = Array.isArray(val);
      return {
        id, key, depth, isLeaf: false,
        kind: isArr ? 'array' : 'object',
        count: isArr ? val.length : Object.keys(val).length,
        childIds: null,
      };
    }
    return {
      id, key, depth, isLeaf: true,
      kind: val === null ? 'null' : typeof val,
      value: val,
    };
  }

  ensureChildren(id) {
    const node = this.nodes.get(id);
    if (!node || node.isLeaf || node.childIds !== null) return;
    const data = this.rawData.get(id);
    if (data === undefined) return;

    const isArr = Array.isArray(data);
    const pairs = isArr
      ? data.map((v, i) => [String(i), v])
      : Object.entries(data);

    node.childIds = pairs.map(([k]) => `${id}.${k}`);

    for (const [k, v] of pairs) {
      const cid = `${id}.${k}`;
      const child = this._makeNode(v, cid, k, node.depth + 1);
      this.nodes.set(cid, child);
      if (!child.isLeaf) this.rawData.set(cid, v);
    }
  }
}

// Builds a flat list of all currently visible rows based on the expanded set
function computeRows(index, expanded) {
  const rows = [];
  const visit = (id) => {
    const n = index.nodes.get(id);
    if (!n) return;
    rows.push(n);
    if (!n.isLeaf && expanded.has(id)) {
      index.ensureChildren(id);
      if (n.childIds) n.childIds.forEach(visit);
      rows.push({ id: `${id}__end`, isClose: true, depth: n.depth, kind: n.kind });
    }
  };
  visit('root');
  return rows;
}

function TreeRow({ row, isExpanded, onToggle }) {
  const pl = row.depth * INDENT + 8;

  if (row.isClose) {
    return (
      <div style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', paddingLeft: pl }}>
        <span style={{ color: '#abb2bf', fontFamily: 'monospace', fontSize: 13 }}>
          {row.kind === 'array' ? ']' : '}'}
        </span>
      </div>
    );
  }

  const valStr = row.isLeaf
    ? (row.kind === 'string' ? `"${row.value}"` : row.kind === 'null' ? 'null' : String(row.value))
    : null;

  return (
    <div
      className="jtv-row"
      style={{
        height: ROW_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: pl,
        paddingRight: 8,
        cursor: row.isLeaf ? 'default' : 'pointer',
        userSelect: 'none',
      }}
      onClick={() => !row.isLeaf && onToggle(row.id)}
      title={row.isLeaf && valStr && valStr.length > 80 ? valStr : undefined}
    >
      {/* Toggle arrow */}
      <span style={{ width: 14, flexShrink: 0, fontSize: 9, color: '#5c6370', fontFamily: 'monospace' }}>
        {!row.isLeaf && (isExpanded ? '▼' : '▶')}
      </span>

      {/* Key */}
      {row.key !== null && row.key !== undefined && (
        <span style={{ color: '#61afef', fontFamily: 'monospace', fontSize: 13, marginRight: 2, whiteSpace: 'nowrap', flexShrink: 0 }}>
          &quot;{row.key}&quot;:&nbsp;
        </span>
      )}

      {/* Value */}
      {row.isLeaf ? (
        <span style={{
          color: VALUE_COLORS[row.kind] || '#abb2bf',
          fontFamily: 'monospace', fontSize: 13,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
        }}>
          {valStr}
        </span>
      ) : (
        <span style={{ color: '#abb2bf', fontFamily: 'monospace', fontSize: 13, whiteSpace: 'nowrap' }}>
          {row.kind === 'array' ? '[' : '{'}
          {!isExpanded && row.count === 0 && (
            <span>{row.kind === 'array' ? ']' : '}'}</span>
          )}
          {!isExpanded && row.count > 0 && (
            <span style={{ color: '#5c6370' }}>
              &nbsp;{row.count} {row.kind === 'array' ? 'items' : 'keys'}&nbsp;
              {row.kind === 'array' ? ']' : '}'}
            </span>
          )}
        </span>
      )}
    </div>
  );
}

function VirtualTree({ index }) {
  const [expanded, setExpanded] = useState(() => new Set(['root']));
  const [scrollTop, setScrollTop] = useState(0);
  const [containerH, setContainerH] = useState(600);
  const [expandWarning, setExpandWarning] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerH(el.clientHeight));
    ro.observe(el);
    setContainerH(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const rows = useMemo(() => computeRows(index, expanded), [index, expanded]);

  const toggle = useCallback((id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const ids = new Set();
    let count = 0;
    const bfs = (id) => {
      if (count >= MAX_EXPAND_NODES) return;
      const n = index.nodes.get(id);
      if (!n || n.isLeaf) return;
      ids.add(id);
      count++;
      index.ensureChildren(id);
      if (n.childIds) n.childIds.forEach(bfs);
    };
    bfs('root');
    setExpanded(ids);
    if (count >= MAX_EXPAND_NODES) {
      setExpandWarning(`Large file: showing first ${MAX_EXPAND_NODES.toLocaleString()} expandable nodes`);
    } else {
      setExpandWarning('');
    }
  }, [index]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set(['root']));
    setExpandWarning('');
  }, []);

  const total = rows.length;
  const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const end = Math.min(total - 1, Math.ceil((scrollTop + containerH) / ROW_HEIGHT) + OVERSCAN);

  return (
    <div>
      <div className="jtv-toolbar">
        <span className="jtv-stats">
          {total.toLocaleString()} visible rows &nbsp;·&nbsp; {index.nodes.size.toLocaleString()} indexed nodes
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" style={{ padding: '4px 14px', fontSize: 12 }} onClick={expandAll}>
            Expand All
          </button>
          <button className="btn btn-secondary" style={{ padding: '4px 14px', fontSize: 12 }} onClick={collapseAll}>
            Collapse All
          </button>
        </div>
      </div>

      {expandWarning && (
        <div style={{ fontSize: 12, color: '#856404', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 4, padding: '4px 10px', marginBottom: 8 }}>
          {expandWarning}
        </div>
      )}

      <div
        ref={ref}
        className="jtv-container"
        onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{ height: total * ROW_HEIGHT, position: 'relative' }}>
          <div style={{ transform: `translateY(${start * ROW_HEIGHT}px)` }}>
            {rows.slice(start, end + 1).map(row => (
              <TreeRow
                key={row.id}
                row={row}
                isExpanded={expanded.has(row.id)}
                onToggle={toggle}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JsonTreeViewer() {
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [index, setIndex] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const processFile = useCallback((file) => {
    if (!file) return;
    setFileName(file.name);
    setFileSize(file.size);
    setStatus('loading');
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      // Small delay lets the loading UI paint before the synchronous parse blocks
      setTimeout(() => {
        try {
          const data = JSON.parse(e.target.result);
          setIndex(new JsonIndex(data));
          setStatus('ready');
        } catch (err) {
          setError(err.message);
          setStatus('error');
        }
      }, 30);
    };
    reader.onerror = () => { setError('Failed to read file.'); setStatus('error'); };
    reader.readAsText(file);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  }, [processFile]);

  const reset = useCallback(() => {
    setStatus('idle');
    setIndex(null);
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="container jtv-page">
      <div className="jtv-header">
        <div>
          <h2>JSON Tree Viewer</h2>
          <p className="jtv-subtitle">Upload a JSON file to explore it as an interactive tree</p>
        </div>
        {status === 'ready' && (
          <button className="btn btn-secondary" onClick={reset}>Load New File</button>
        )}
      </div>

      {status !== 'ready' && (
        <div
          className={`jtv-dropzone${isDragging ? ' jtv-dropzone--active' : ''}${status === 'error' ? ' jtv-dropzone--error' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={e => processFile(e.target.files[0])}
          />

          {status === 'idle' && (
            <>
              <div className="jtv-icon">📂</div>
              <p className="jtv-drop-title">Drop your JSON file here</p>
              <p className="jtv-drop-sub">or click to browse files</p>
              <p className="jtv-drop-note">Supports large JSON files &nbsp;·&nbsp; Virtualised tree rendering</p>
            </>
          )}

          {status === 'loading' && (
            <>
              <div className="jtv-icon jtv-spin">⟳</div>
              <p className="jtv-drop-title">Parsing {fileName}…</p>
              <p className="jtv-drop-sub">
                {fileSize > 0 && `${formatSize(fileSize)} — `}Building tree index, please wait
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="jtv-icon">⚠️</div>
              <p className="jtv-drop-title" style={{ color: '#dc3545' }}>Invalid JSON</p>
              <p className="jtv-drop-sub" style={{ maxWidth: 520 }}>{error}</p>
              <p className="jtv-drop-note">Click to try another file</p>
            </>
          )}
        </div>
      )}

      {status === 'ready' && index && (
        <div>
          <div className="jtv-file-info">
            <span>📄</span>
            <strong>{fileName}</strong>
            <span className="jtv-file-size">{formatSize(fileSize)}</span>
          </div>
          <VirtualTree index={index} />
        </div>
      )}
    </div>
  );
}
