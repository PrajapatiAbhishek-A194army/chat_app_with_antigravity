import React, { useState, useEffect } from 'react';
import './JoinPage.css';

/**
 * JoinPage
 * Username entry form. Emits join_chat via the joinChat callback.
 *
 * Props:
 *  - joinChat(username)   — called when form is submitted
 *  - isJoining            — disables the button while waiting
 *  - joinError            — server-side error message to display
 *  - socketStatus         — 'idle'|'connecting'|'connected'|'error'|'disconnected'
 */
export function JoinPage({ joinChat, isJoining, joinError, socketStatus }) {
  const [username, setUsername] = useState('');
  const [localError, setLocalError] = useState('');

  // Clear local error when the user types
  useEffect(() => {
    if (username) setLocalError('');
  }, [username]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = username.trim();

    if (trimmed.length < 2) {
      setLocalError('Username must be at least 2 characters.');
      return;
    }
    if (trimmed.length > 24) {
      setLocalError('Username must be at most 24 characters.');
      return;
    }

    setLocalError('');
    joinChat(trimmed);
  };

  const error = localError || joinError;
  const isConnecting = socketStatus === 'connecting';
  const isDisabled = isJoining || isConnecting;

  return (
    <div className="join-shell">
      {/* Background decoration */}
      <div className="join-bg-orb join-bg-orb--1" />
      <div className="join-bg-orb join-bg-orb--2" />

      <div className="join-card">
        {/* Header */}
        <div className="join-header">
          <div className="join-logo">
            <span className="join-logo-icon">💬</span>
          </div>
          <h1 className="join-title">ChatNow</h1>
          <p className="join-subtitle">
            Temporary real-time chat. No account. No history.
          </p>
        </div>

        {/* Connection status indicator */}
        <div className={`join-conn-status join-conn-status--${socketStatus}`}>
          <span className="join-conn-dot" />
          <span className="join-conn-text">
            {socketStatus === 'connected' && 'Server connected'}
            {socketStatus === 'connecting' && 'Connecting to server…'}
            {socketStatus === 'error' && 'Server unreachable'}
            {(socketStatus === 'idle' || socketStatus === 'disconnected') && 'Not connected'}
          </span>
        </div>

        {/* Join form */}
        <form className="join-form" onSubmit={handleSubmit} noValidate>
          <div className="join-field">
            <label className="join-label" htmlFor="username-input">
              Choose a username
            </label>
            <input
              id="username-input"
              className={`join-input ${error ? 'join-input--error' : ''}`}
              type="text"
              placeholder="e.g. alex, chat_user…"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={24}
              autoComplete="off"
              autoFocus
              disabled={isDisabled}
              aria-describedby={error ? 'username-error' : undefined}
              aria-invalid={!!error}
            />
            <div className="join-input-meta">
              {error ? (
                <span id="username-error" className="join-error" role="alert">
                  {error}
                </span>
              ) : (
                <span className="join-hint">
                  Letters, numbers, spaces, hyphens, underscores, dots
                </span>
              )}
              <span className="join-counter">{username.length}/24</span>
            </div>
          </div>

          <button
            id="join-btn"
            className="join-btn"
            type="submit"
            disabled={isDisabled || !username.trim()}
          >
            {isJoining || isConnecting ? (
              <>
                <span className="join-btn-spinner" aria-hidden="true" />
                {isConnecting ? 'Connecting…' : 'Joining…'}
              </>
            ) : (
              'Join Chat →'
            )}
          </button>
        </form>

        {/* Footer note */}
        <p className="join-footer-note">
          Your session ends when you leave or the server restarts.
        </p>
      </div>
    </div>
  );
}
