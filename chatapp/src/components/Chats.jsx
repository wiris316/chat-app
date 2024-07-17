import { useEffect, useRef, useState } from 'react';
import { collection, addDoc, doc, deleteDoc, getDocs, getDoc, setDoc, updateDoc, orderBy, query, onSnapshot} from 'firebase/firestore';
// import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc,getDocs, orderBy, query, onSnapshot, limit } from 'firebase/firestore';
import '../assets/Chats.scss';
import MessageBox from './MessageBox';

function Chats(props) {
  const { currentUser, roomId, setRoomSelected, firestore, logOut } = props;
  const [roomData, setRoomData] = useState([]);
  const [userData, setUserData] = useState({})
  const [inputValue, setInputValue] = useState('');
  const chatBoxRef = useRef(null);
  const messagesRef = collection(firestore, 'chatroom', roomId, 'messages'); 
  const userRef = collection(firestore, 'chatroom', roomId, 'users')
  const userDocRef = doc(firestore, 'chatroom', roomId, 'users', currentUser.uid)
  const sortedQuery = query(messagesRef, orderBy('createdAt'), /*limit(15)*/);
  
  useEffect(() => {
    const fetchMsgData = async () => {
      onSnapshot(sortedQuery, (querySnapshot) => {
        const msgData = [];
        querySnapshot.forEach((doc) => {
          msgData.push(doc.data());
        });
        setRoomData(msgData); 

        setTimeout(() => {
          scrollToBottom();
        }, 1000)
      });
    };
    fetchMsgData();
    fetchUserData();
  }, [roomId]);

  const fetchUserData = async () => {
    onSnapshot(userRef, (querySnapshot) => {
      const userObjects = [];
      querySnapshot.forEach((doc) => {
        let user = doc.data() 
        userObjects.push(user);
      })

      setUserData(userObjects)
    })
  }

  const refreshChat = async () => {
    onSnapshot(sortedQuery, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push(doc.data());
      });
      setRoomData(roomData)
      scrollToBottom();
    })
  }
  
  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault();

    await addDoc(messagesRef, {
      createdAt: new Date(),
      text: inputValue,
      uid: currentUser.uid,
    })

    // Check if current user is new, if yes, add to db collection
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        [currentUser.uid]: `user${userData.length+1}`
      })
      console.log('Added new user to chatroom')
    } else {
      console.log('Current user')
    }

    setInputValue('');
    scrollToBottom();

    // await updateDoc(userDocRef, {
    //   [currentUser.uid]: 'value1',
    //   }, { merge: true })
    //   .then(() => {
    //     console.log('Document successfully updated!');
    //   })
    //   .catch((error) => {
    //       console.error('Error updating document: ', error);
    //   });
    
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
  console.log('roomid', roomId)

  return (
    <>
      {/* <div id='back-signout-buttons'>
        <button id='back-button' onClick={handleBackButton}>back</button>
        <button id="signout-button" onClick={() => logOut()}>sign out</button>
      </div> */}
      <div id='chats-div'>
        <span id='chat-buttons'>
          <button id='refresh' onClick={() => refreshChat()}>refresh</button>
          <button id='clear' onClick={() => clearChat()}>clear</button>
        </span>
        <h4>{roomId}</h4>
        {roomData.length > 0 ? 
          <div id='messages-container' ref={chatBoxRef}>
            {roomData?.map((msg, index) => 
              <MessageBox key={index} currentUser={currentUser} uid={msg.uid} data={msg} userData={userData} roomId={roomId} />
            )}           
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