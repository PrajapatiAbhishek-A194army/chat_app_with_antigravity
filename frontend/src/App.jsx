import React, { useEffect } from 'react';
import './index.css';
import { useSocket } from './hooks/useSocket';
import { useChat } from './hooks/useChat';
import { JoinPage } from './pages/JoinPage';
import { ChatPage } from './pages/ChatPage';

function App() {
  const { status: socketStatus, connect } = useSocket();
  const { joined, currentUser, users, notifications, joinError, isJoining, joinChat, leaveChat } =
    useChat();

  // Pre-connect the socket when the app loads so the join form can show
  // the correct connection status immediately.
  useEffect(() => {
    connect();
  }, [connect]);

  if (!joined) {
    return (
      <JoinPage
        joinChat={joinChat}
        isJoining={isJoining}
        joinError={joinError}
        socketStatus={socketStatus}
      />
    );
  }

  return (
    <ChatPage
      currentUser={currentUser}
      users={users}
      notifications={notifications}
      leaveChat={leaveChat}
    />
  );
}

export default App;
