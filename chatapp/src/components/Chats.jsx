import { useEffect, useState } from 'react';
import { signOut } from "firebase/auth";
import { collection, addDoc, deleteDoc, getDocs, orderBy, query, onSnapshot} from 'firebase/firestore';
// import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc,getDocs, orderBy, query, onSnapshot, limit } from 'firebase/firestore';
import '../assets/Chats.scss';
import MessageBox from './MessageBox';

function Chats(props) {
  const { auth, validated, setValidated, currentUser, roomId, setRoomSelected, firestore } = props;
  const [roomData, setRoomData] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messageContainer = document.querySelector('#messages-container')
  const messagesRef = collection(firestore, 'chatroom', roomId, 'messages'); 
  const sortedQuery = query(messagesRef, orderBy('createdAt'), /*limit(15)*/);

  useEffect(() => {
    const fetchRoomData = async () => {
      onSnapshot(sortedQuery, (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push(doc.data());
        });
        setRoomData(data); 
      });
    };
    fetchRoomData();
  }, []);
  
  const logOut = () => {
    signOut(auth)
      .then(() => {
        console.log('successfully signed out..')
        setValidated(!validated)
      })
      .catch((error) => {
        console.error(`${error}: an error occur while signing out`)
    });
  }

  const refreshChat = async () => {
    onSnapshot(sortedQuery, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push(doc.data());
      });
      setRoomData(roomData)
    })
  }

  function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  const sendMessage = async (e) => {
    e.preventDefault();

    await addDoc(messagesRef, {
      createdAt: new Date(),
      text: inputValue,
      uid: currentUser.uid,
    })
    setInputValue('');
    scrollToBottom();
  }

  const clearChat = async () => {
    const querySnapshot = await getDocs(messagesRef);
    // Delete each document in the collection
    const deletePromises = querySnapshot.docs.map(async (doc) => {
      await deleteDoc(doc.ref);
    });
    // Wait for all document deletions to complete
    await Promise.all(deletePromises);
  }

  const handleBackButton = () => {
    setRoomSelected(false)
  }

  return (
    <>
      <div id='back-signout-buttons'>
        <button id='back-button' onClick={handleBackButton}>back</button>
        <button id="signout-button" onClick={() => logOut()}>sign out</button>
      </div>
      <div id='chats-div'>
        <span id='chat-buttons'>
          <button id='refresh' onClick={() => refreshChat()}>refresh</button>
          <button id='clear' onClick={() => clearChat()}>clear</button>
        </span>
        <h4>{roomId}</h4>
        {roomData.length > 0 ? 
          <div id='messages-container'>
            {roomData?.map((msg, index) => <MessageBox key={index} currentUser={currentUser} uid={msg.uid} data={msg.text}/>)}
            
          </div>
          : <p id='emptyChat-message'>This is the beginning of the chat.</p>
        }
        <form onSubmit={sendMessage} id="message-form">
          <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} maxLength={300}/>
          <button id="send-button">send</button>
        </form>
      </div>
    </>
  )
}

export default Chats;