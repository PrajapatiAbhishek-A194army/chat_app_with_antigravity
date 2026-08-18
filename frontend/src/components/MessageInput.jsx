import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

const MESSAGE_MAX_LENGTH = 500;

/**
 * MessageInput
 *
 * Controlled message composer. Supports:
 * - Submit on Enter (Shift+Enter = newline)
 * - Character counter
 * - Over-limit visual warning
 * - Server-side error display
 * - Disabled state while not connected
 *
 * Props:
 *  - onSend(text)        — called with trimmed text
 *  - messageError        — server error string | null
 *  - clearMessageError() — clears error state
 *  - disabled            — true when not in chat / not connected
 */
export function MessageInput({ onSend, messageError, clearMessageError, disabled }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const length = text.length;
  const isOverLimit = length > MESSAGE_MAX_LENGTH;
  const isEmpty = text.trim().length === 0;
  const canSend = !isEmpty && !isOverLimit && !disabled;

  // Auto-clear server error when user types
  useEffect(() => {
    if (messageError && text) {
      clearMessageError();
    }
  }, [text, messageError, clearMessageError]);

  // Auto-resize textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [text]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!canSend) return;
    onSend(text);
    setText('');
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="msg-input-wrapper">
      {/* Error message */}
      {messageError && (
        <div className="msg-input-error" role="alert">
          <span className="msg-input-error-icon">⚠️</span>
          {messageError}
        </div>
      )}

      <div className={`msg-input-bar ${isOverLimit ? 'msg-input-bar--over' : ''}`}>
        <textarea
          ref={textareaRef}
          id="message-input"
          className="msg-input-textarea"
          placeholder={disabled ? 'Join the chat to send messages…' : 'Type a message… (Enter to send, Shift+Enter for newline)'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          maxLength={MESSAGE_MAX_LENGTH + 50} // allow typing over to show warning, not hard cut
          aria-label="Message input"
          aria-describedby={messageError ? 'msg-error' : 'msg-counter'}
        />

        <div className="msg-input-controls">
          <span
            id="msg-counter"
            className={`msg-input-counter ${isOverLimit ? 'msg-input-counter--over' : ''}`}
          >
            {length}/{MESSAGE_MAX_LENGTH}
          </span>

          <button
            id="send-message-btn"
            className="msg-send-btn"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            title="Send (Enter)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>

      <p className="msg-input-hint">
        Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for a new line
      </p>
    </div>
  );
}
