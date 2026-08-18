import React from 'react';
import './TypingIndicator.css';

/**
 * TypingIndicator
 *
 * Displays "Alice is typing…", "Alice and Bob are typing…", or
 * "Alice, Bob, and 2 others are typing…" based on how many users are typing.
 *
 * Renders nothing when no one is typing.
 *
 * Props:
 *  - typingUsers  Array<{ socketId, username }> — users who are currently typing
 *  - currentUser  { socketId }                  — the local user (excluded from display)
 */
export function TypingIndicator({ typingUsers, currentUser }) {
  // Filter out the current user (they don't see their own typing indicator)
  const others = typingUsers.filter((u) => u.socketId !== currentUser.socketId);

  if (others.length === 0) return null;

  const buildLabel = () => {
    if (others.length === 1) {
      return (
        <>
          <strong>{others[0].username}</strong> is typing
        </>
      );
    }
    if (others.length === 2) {
      return (
        <>
          <strong>{others[0].username}</strong> and{' '}
          <strong>{others[1].username}</strong> are typing
        </>
      );
    }
    // 3+
    const extra = others.length - 2;
    return (
      <>
        <strong>{others[0].username}</strong>,{' '}
        <strong>{others[1].username}</strong>, and {extra} other
        {extra > 1 ? 's' : ''} are typing
      </>
    );
  };

  return (
    <div className="typing-indicator" aria-live="polite" aria-label="Typing indicator">
      {/* Animated dots */}
      <span className="typing-dots" aria-hidden="true">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </span>

      {/* Label */}
      <span className="typing-label">{buildLabel()}…</span>
    </div>
  );
}
