import { useEffect, useState } from 'react';
import { signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, deleteDoc, getDocs, orderBy, query, onSnapshot, limit } from 'firebase/firestore';
import '../assets/Chats.scss';
import MessageBox from './MessageBox';

function Chats(props) {
  const { auth, validated, setValidated, app, currentUser } = props;
  const [data, setData] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const firestore = getFirestore(app);
  const messageCollection = collection(firestore, 'messages')
  
  // sort query by createdAt timestamp in descending order and limit to returning 15 elements
  const sortedQuery = query(messageCollection, orderBy('createdAt', 'desc'), limit(15));

  useEffect(() => {
    // real-time listener for event changes
    const unsubscribe = onSnapshot(sortedQuery, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
          data.push(doc.data());
      });
      setData(data)
    });

    // stop listening when component unmounts
    return () => {
      unsubscribe()
    };
  }, [])
  
  const logOut = () => {
    signOut(auth).then(() => {
      setValidated(!validated)
      console.log('signed out success')
    }).catch((error) => {
      console.error(`${error}: an error occur while signing out`)
    });
  }

  const refreshChat = async () => {
    // const dataArray = [];
    // const messages = await getDocs(messageCollection)
    // messages.forEach((ele, index) => dataArray.push({ ...ele.data() }));
    // setData([...dataArray])
    onSnapshot(sortedQuery, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push(doc.data());
      });
      setData(data)
    })
  }

  const sendMessage = async (e) => {
    e.preventDefault();

    await addDoc(messageCollection, {
      createdAt: new Date(),
      text: inputValue,
      uid: currentUser.uid,
    })
    setInputValue('');
  }

  const clearChat = async () => {
    const querySnapshot = await getDocs(messageCollection);

    // Delete each document in the collection
    const deletePromises = querySnapshot.docs.map(async (doc) => {
      await deleteDoc(doc.ref);
    });
  
    // Wait for all document deletions to complete
    await Promise.all(deletePromises);
  
  }

  return (
    <>
      <button id="signout-button" onClick={() => logOut()}>sign out</button>
      <div id="chats-div">
        <span id="chat-buttons">
          <button onClick={() => refreshChat()}>refresh</button>
          <button onClick={() => clearChat()}>clear</button>
        </span>
        <h4>CHAT AWAY</h4>
        <div>
          {data && data?.map((msg, index) => <MessageBox key={index} currentUser={currentUser} uid={msg.uid} data={msg.text}/>)}
          {/* <MessageBox data={data} /> */}
          
        </div>
        <form onSubmit={sendMessage} id="message-form">
          <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
          <button>send</button>
        </form>
      </div>
    </>
  )
}

export default Chats;