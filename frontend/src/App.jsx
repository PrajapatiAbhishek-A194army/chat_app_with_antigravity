import React, { useEffect } from 'react';
import './index.css';
import './App.css';
import { useSocket } from './hooks/useSocket';

const STATUS_LABELS = {
  idle:         'Not connected',
  connecting:   'Connecting…',
  connected:    'Connected',
  disconnected: 'Disconnected',
  error:        'Connection error',
};

const STATUS_COLORS = {
  idle:         'var(--color-text-muted)',
  connecting:   'var(--color-warning)',
  connected:    'var(--color-success)',
  disconnected: 'var(--color-text-muted)',
  error:        'var(--color-danger)',
};

function App() {
  const { status, socketId, serverTime, error, connect, disconnect, sendPing, lastPong } =
    useSocket();

  // Auto-connect when the app mounts so we can verify Phase 2
  useEffect(() => {
    connect();
  }, [connect]);

  return (
    <div className="app-shell">
      <div className="app-placeholder">
        <div className="placeholder-icon">💬</div>
        <h1 className="placeholder-title">ChatNow</h1>
        <p className="placeholder-subtitle">
          Temporary real-time chat — no account, no database, no history.
        </p>

        {/* ── Connection status badge ─────────────────────────────── */}
        <div className="status-badge" style={{ '--status-color': STATUS_COLORS[status] }}>
          <span className="status-dot" />
          <span className="status-label">{STATUS_LABELS[status]}</span>
        </div>

        {/* ── Connection info ─────────────────────────────────────── */}
        {status === 'connected' && (
          <div className="conn-info">
            <div className="conn-row">
              <span className="conn-key">Socket ID</span>
              <span className="conn-val">{socketId}</span>
            </div>
            {serverTime && (
              <div className="conn-row">
                <span className="conn-key">Server time</span>
                <span className="conn-val">{new Date(serverTime).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Error message ───────────────────────────────────────── */}
        {status === 'error' && error && (
          <p className="conn-error">{error}</p>
        )}

        {/* ── Ping / Pong test ────────────────────────────────────── */}
        <div className="action-row">
          {status === 'connected' ? (
            <>
              <button className="btn btn-primary" onClick={sendPing}>
                Ping Server
              </button>
              <button className="btn btn-ghost" onClick={disconnect}>
                Disconnect
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary"
              onClick={connect}
              disabled={status === 'connecting'}
            >
              {status === 'connecting' ? 'Connecting…' : 'Connect'}
            </button>
          )}
        </div>

        {/* ── Last pong response ──────────────────────────────────── */}
        {lastPong && (
          <div className="pong-box">
            <p className="pong-label">✅ Pong received</p>
            <pre className="pong-data">{JSON.stringify(lastPong, null, 2)}</pre>
          </div>
        )}

        <p className="placeholder-note">
          Phase 2 — Socket.IO foundation active
        </p>
      </div>
    </div>
  );
}

export default App;
