import React from 'react';
import { avatarColor, avatarInitials, formatJoinTime } from '../utils/avatar';
import './ChatPage.css';

/**
 * ChatPage — Phase 3 scope.
 *
 * Displays:
 *  - Header with current user info and Leave button
 *  - Online users sidebar
 *  - Join/leave notification feed (messages come in Phase 4)
 *
 * Props:
 *  - currentUser  { socketId, username, joinedAt }
 *  - users        Array<{ socketId, username, joinedAt }>
 *  - notifications Array<{ id, type, username, ts }>
 *  - leaveChat()
 */
export function ChatPage({ currentUser, users, notifications, leaveChat }) {
  return (
    <div className="chat-shell">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="chat-header">
        <div className="chat-brand">
          <span className="chat-brand-icon">💬</span>
          <span className="chat-brand-name">ChatNow</span>
        </div>

        <div className="chat-header-center">
          <span className="chat-online-badge">
            <span className="chat-online-dot" />
            {users.length} online
          </span>
        </div>

        <div className="chat-header-right">
          <div
            className="chat-current-avatar"
            style={{ '--avatar-color': avatarColor(currentUser.username) }}
            title={currentUser.username}
          >
            {avatarInitials(currentUser.username)}
          </div>
          <span className="chat-current-name">{currentUser.username}</span>
          <button
            id="leave-chat-btn"
            className="chat-leave-btn"
            onClick={leaveChat}
            title="Leave chat"
          >
            Leave
          </button>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="chat-body">

        {/* ── Online users sidebar ─────────────────────────────────────── */}
        <aside className="chat-sidebar" aria-label="Online users">
          <h2 className="chat-sidebar-title">
            Online
            <span className="chat-sidebar-count">{users.length}</span>
          </h2>

          <ul className="chat-user-list" role="list">
            {users.map((user) => {
              const isMe = user.socketId === currentUser.socketId;
              return (
                <li
                  key={user.socketId}
                  className={`chat-user-item ${isMe ? 'chat-user-item--me' : ''}`}
                >
                  <div
                    className="chat-user-avatar"
                    style={{ '--avatar-color': avatarColor(user.username) }}
                    aria-hidden="true"
                  >
                    {avatarInitials(user.username)}
                  </div>
                  <div className="chat-user-info">
                    <span className="chat-user-name">
                      {user.username}
                      {isMe && <span className="chat-user-you"> (you)</span>}
                    </span>
                    <span className="chat-user-joined">
                      Joined {formatJoinTime(user.joinedAt)}
                    </span>
                  </div>
                  <span className="chat-user-online-dot" aria-label="online" />
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ── Main content area ────────────────────────────────────────── */}
        <main className="chat-main" aria-label="Chat area">

          {/* Notifications / event feed */}
          <div className="chat-event-feed" aria-live="polite" aria-label="Chat events">
            {notifications.length === 0 ? (
              <div className="chat-empty-state">
                <span className="chat-empty-icon">👋</span>
                <p className="chat-empty-text">
                  You&apos;re in! Say hello when messaging is ready in Phase 4.
                </p>
                <p className="chat-empty-sub">
                  Join and leave events will appear here.
                </p>
              </div>
            ) : (
              <ul className="chat-notif-list" role="list">
                {notifications.map((n) => (
                  <li key={n.id} className={`chat-notif chat-notif--${n.type}`}>
                    <span className="chat-notif-icon">
                      {n.type === 'join' ? '🟢' : '🔴'}
                    </span>
                    <span className="chat-notif-text">
                      <strong>{n.username}</strong>{' '}
                      {n.type === 'join' ? 'joined the chat' : 'left the chat'}
                    </span>
                    <span className="chat-notif-time">
                      {new Date(n.ts).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Message area placeholder — Phase 4 */}
          <div className="chat-composer-placeholder">
            <span className="chat-composer-placeholder-text">
              💬 Messaging coming in Phase 4
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
