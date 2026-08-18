/**
 * hooks/useChat.js
 *
 * Manages the chat session state:
 * - joining / leaving the chat
 * - current user record
 * - live online user list
 * - join/leave notification events
 *
 * Works in conjunction with useSocket.js (connection lifecycle).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { socket } from '../services/socket';

/**
 * @typedef {{ socketId: string, username: string, joinedAt: string }} ChatUser
 */

/**
 * @returns {{
 *   joined: boolean,
 *   currentUser: ChatUser | null,
 *   users: ChatUser[],
 *   notifications: Array<{ id: string, type: 'join'|'leave', username: string, ts: number }>,
 *   joinError: string | null,
 *   isJoining: boolean,
 *   joinChat: (username: string) => void,
 *   leaveChat: () => void,
 * }}
 */
export function useChat() {
  const [joined, setJoined] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [joinError, setJoinError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);

  const listenersRegistered = useRef(false);

  const addNotification = useCallback((type, username) => {
    const note = { id: `${Date.now()}-${Math.random()}`, type, username, ts: Date.now() };
    setNotifications((prev) => [...prev.slice(-49), note]); // keep last 50
  }, []);

  const registerListeners = useCallback(() => {
    if (listenersRegistered.current) return;
    listenersRegistered.current = true;

    // ── Successful join ───────────────────────────────────────────────────
    socket.on('chat_joined', ({ user, users: userList }) => {
      setCurrentUser(user);
      setUsers(userList);
      setJoined(true);
      setIsJoining(false);
      setJoinError(null);
    });

    // ── Join error ────────────────────────────────────────────────────────
    socket.on('chat_error', ({ message }) => {
      setJoinError(message);
      setIsJoining(false);
    });

    // ── Another user joined ───────────────────────────────────────────────
    socket.on('user_joined', ({ user, users: userList }) => {
      setUsers(userList);
      addNotification('join', user.username);
    });

    // ── A user left / disconnected ────────────────────────────────────────
    socket.on('user_left', ({ user, users: userList }) => {
      setUsers(userList);
      addNotification('leave', user.username);
    });
  }, [addNotification]);

  const removeListeners = useCallback(() => {
    socket.off('chat_joined');
    socket.off('chat_error');
    socket.off('user_joined');
    socket.off('user_left');
    listenersRegistered.current = false;
  }, []);

  useEffect(() => {
    registerListeners();
    return () => removeListeners();
  }, [registerListeners, removeListeners]);

  /**
   * Attempt to join the chat with the given username.
   */
  const joinChat = useCallback((username) => {
    setJoinError(null);
    setIsJoining(true);

    if (!socket.connected) {
      socket.connect();
      // Wait for connection then emit
      socket.once('connect', () => {
        socket.emit('join_chat', { username });
      });
    } else {
      socket.emit('join_chat', { username });
    }
  }, []);

  /**
   * Leave the chat cleanly.
   */
  const leaveChat = useCallback(() => {
    socket.emit('leave_chat');
    setJoined(false);
    setCurrentUser(null);
    setUsers([]);
    setNotifications([]);
    setJoinError(null);
  }, []);

  return {
    joined,
    currentUser,
    users,
    notifications,
    joinError,
    isJoining,
    joinChat,
    leaveChat,
  };
}
