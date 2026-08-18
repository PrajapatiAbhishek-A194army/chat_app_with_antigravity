import React from 'react';
import { avatarColor, avatarInitials, formatJoinTime } from '../utils/avatar';
import { MessageList } from '../components/MessageList';
import { MessageInput } from '../components/MessageInput';
import { TypingIndicator } from '../components/TypingIndicator';
import './ChatPage.css';

/**
 * ChatPage — Phase 5: typing indicators added.
 *
 * Props:
 *  - currentUser      { socketId, username, joinedAt }
 *  - users            Array<{ socketId, username, joinedAt }>
 *  - notifications    Array<{ id, type, username, ts }>
 *  - messages         Array<{ id, socketId, username, text, timestamp }>
 *  - typingUsers      Array<{ socketId, username }>
 *  - messageError     string | null
 *  - clearMessageError()
 *  - sendMessage(text)
 *  - notifyTyping()
 *  - stopTypingNow()
 *  - leaveChat()
 */
export function ChatPage({
  currentUser,
  users,
  notifications,
  messages,
  typingUsers,
  messageError,
  clearMessageError,
  sendMessage,
  notifyTyping,
  stopTypingNow,
  leaveChat,
}) {
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
              const isThisUserTyping = typingUsers.some(
                (t) => t.socketId === user.socketId && t.socketId !== currentUser.socketId
              );
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
                      {isThisUserTyping ? (
                        <span className="chat-user-typing-status">typing…</span>
                      ) : (
                        <>Joined {formatJoinTime(user.joinedAt)}</>
                      )}
                    </span>
                  </div>
                  <span className="chat-user-online-dot" aria-label="online" />
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ── Main chat area ────────────────────────────────────────────── */}
        <main className="chat-main" aria-label="Chat area">
          {/* Message feed */}
          <MessageList
            messages={messages}
            notifications={notifications}
            currentUser={currentUser}
          />

          {/* Typing indicator — shown between message list and composer */}
          <TypingIndicator typingUsers={typingUsers} currentUser={currentUser} />

          {/* Message composer */}
          <MessageInput
            onSend={sendMessage}
            messageError={messageError}
            clearMessageError={clearMessageError}
            disabled={false}
            onTyping={notifyTyping}
            onStopTyping={stopTypingNow}
          />
        </main>
      </div>
    </div>
  );
}
