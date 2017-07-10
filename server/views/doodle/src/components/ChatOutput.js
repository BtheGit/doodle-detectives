import React from 'react';

const ChatOutput = (props) => {
  return (
    <div id="chat-display">
      {props.messages.map((message, index) => {
        return (
          <div className='chat-message' key={index}>
            <span className='chat-message-name'>{message.name}:</span> {message.content}
          </div>
        )
      })}
    </div>    
  );
};

export default ChatOutput;
