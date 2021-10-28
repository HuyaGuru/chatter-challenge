import React, { useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import useSound from 'use-sound';
import config from '../../../config';
import LatestMessagesContext from '../../../contexts/LatestMessages/LatestMessages';
import TypingMessage from './TypingMessage';
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import '../styles/_messages.scss';
import initialBottyMessage from '../../../common/constants/initialBottyMessage';

const socket = io(
  config.BOT_SERVER_ENDPOINT,
  { transports: ['websocket', 'polling', 'flashsocket'] }
);

function Messages() {
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { setLatestMessage } = useContext(LatestMessagesContext);
  const [message, setMessage] = useState('')
  const defaultBotMessage = {user: "bot", message: initialBottyMessage, botTyping:false}
  const [messages, setMessages] = useState([defaultBotMessage])
  const sendMessage = () => {
    socket.emit('user-message',message)
    setMessages([...messages,{user:"me", message:message, botTyping:false}])
    setLatestMessage("bot",message)
  }
  const onChangeMessage = (e) => {
    setMessage(e.target.value)
  }
  socket.on("bot-typing",() => {
    setMessages([...messages, {user: "bot",message: "typing", botTyping:true}])
  })
  socket.on("bot-message", (arg) => {
    let tempMess = [...messages,{user:"bot", message:arg, botTyping:false}]
    for( let i = 0; i < tempMess.length; i++){     
      if(tempMess[i].botTyping === true){
        tempMess.splice(i, 1)
      }
    }
    setMessages(tempMess)
    setLatestMessage("bot",arg)
  });

  
  const nextMessage = "Living the dream"

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list">
      
        {messages.map((item) => {
          if(item.botTyping===true){
            return <TypingMessage/>
          }
          return <Message message={item} botTyping={item.botTyping} nextMessage={nextMessage}/>
        })}
      </div>
      <Footer message={message} sendMessage={sendMessage} onChangeMessage={(e) => onChangeMessage(e)} />
    </div>
  );
}

export default Messages;
