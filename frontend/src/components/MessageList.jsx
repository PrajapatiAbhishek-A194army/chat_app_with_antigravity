import React, { useEffect, useRef } from 'react';
import { avatarColor, avatarInitials } from '../utils/avatar';
import './MessageList.css';

/**
 * MessageList
 *
 * Renders a scrollable list of chat messages and join/leave notifications,
 * merged in chronological order.
 *
 * Props:
 *  - messages      Message[]
 *  - notifications Notification[]
 *  - currentUser   { socketId, username }
 */
export function MessageList({ messages, notifications, currentUser }) {
  const bottomRef = useRef(null);

  // Auto-scroll to latest item whenever messages or notifications change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, notifications]);

  // Merge messages and notifications into a single chronological feed
  const feed = [
    ...messages.map((m) => ({ ...m, _kind: 'message', _ts: new Date(m.timestamp).getTime() })),
    ...notifications.map((n) => ({ ...n, _kind: 'event', _ts: n.ts })),
  ].sort((a, b) => a._ts - b._ts);

  const isEmpty = feed.length === 0;

  return (
    <div className="msg-list" role="log" aria-live="polite" aria-label="Chat messages">
      {isEmpty ? (
        <div className="msg-list-empty">
          <span className="msg-list-empty-icon">💬</span>
          <p className="msg-list-empty-title">No messages yet</p>
          <p className="msg-list-empty-sub">Be the first to say something!</p>
        </div>
      ) : (
        <ul className="msg-list-items">
          {feed.map((item) => {
            if (item._kind === 'event') {
              return (
                <li key={item.id} className={`msg-event msg-event--${item.type}`}>
                  <span className="msg-event-icon">
                    {item.type === 'join' ? '🟢' : '🔴'}
                  </span>
                  <span className="msg-event-text">
                    <strong>{item.username}</strong>{' '}
                    {item.type === 'join' ? 'joined the chat' : 'left the chat'}
                  </span>
                  <span className="msg-event-time">
                    {new Date(item._ts).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </li>
              );
            }

            // Message item
            const isOwn = item.socketId === currentUser.socketId;
            const color = avatarColor(item.username);
            const initials = avatarInitials(item.username);
            const time = new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <li
                key={item.id}
                className={`msg-bubble-row ${isOwn ? 'msg-bubble-row--own' : ''}`}
              >
                {!isOwn && (
                  <div
                    className="msg-avatar"
                    style={{ '--avatar-color': color }}
                    aria-hidden="true"
                  >
                    {initials}
                  </div>
                )}

                <div className="msg-bubble-group">
                  {!isOwn && (
                    <span className="msg-sender" style={{ color }}>
                      {item.username}
                    </span>
                  )}
                  <div className={`msg-bubble ${isOwn ? 'msg-bubble--own' : 'msg-bubble--other'}`}>
                    <p className="msg-text">{item.text}</p>
                  </div>
                  <span className="msg-time">{time}</span>
                </div>

                {isOwn && (
                  <div
                    className="msg-avatar msg-avatar--own"
                    style={{ '--avatar-color': color }}
                    aria-hidden="true"
                  >
                    {initials}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {/* Auto-scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
