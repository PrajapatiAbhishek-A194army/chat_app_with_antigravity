import React, { useEffect } from 'react';
import './index.css';
import { useSocket } from './hooks/useSocket';
import { useChat } from './hooks/useChat';
import { useMessages } from './hooks/useMessages';
import { useTyping } from './hooks/useTyping';
import { JoinPage } from './pages/JoinPage';
import { ChatPage } from './pages/ChatPage';

function App() {
  const { status: socketStatus, connect } = useSocket();
  const {
    joined,
    currentUser,
    users,
    notifications,
    joinError,
    isJoining,
    joinChat,
    leaveChat,
  } = useChat();

  const { messages, messageError, clearMessageError, sendMessage } = useMessages();
  const { typingUsers, notifyTyping, stopTypingNow } = useTyping();

  // Pre-connect socket so join form shows live status immediately
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
      messages={messages}
      typingUsers={typingUsers}
      messageError={messageError}
      clearMessageError={clearMessageError}
      sendMessage={sendMessage}
      notifyTyping={notifyTyping}
      stopTypingNow={stopTypingNow}
      leaveChat={leaveChat}
    />
  );
}

export default App;
