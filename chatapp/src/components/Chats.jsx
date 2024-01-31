import { useEffect, useState } from 'react';
import { signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, orderBy, query, onSnapshot } from 'firebase/firestore';

function Chats(props) {
  const { auth, validated, setValidated, app } = props;
  const [data, setData] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const firestore = getFirestore(app);
  const messageCollection = collection(firestore, 'messages')
  const sortedQuery = query(messageCollection, orderBy('createdAt'));

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
    const dataArray = [];
    const messages = await getDocs(messageCollection)
    messages.forEach((ele, index) => dataArray.push({...ele.data(), id:index}));
    setData([...dataArray])
  }

  const sendMessage = async (e) => {
    e.preventDefault();

    await addDoc(messageCollection, {
      createdAt: new Date(),
      text: inputValue,
      uid: auth.currentUser?.uid,
    })
    setInputValue('');
  }

  return (
    <>
      <p>chats goes here</p>
      <button onClick={() => logOut()}>sign out</button>
      <button onClick={() => refreshChat()}>refresh</button>
      <div>
        {data && data?.map((msg, index) => <p key={index}>{msg.text}</p>)}
      </div>
      <form onSubmit={sendMessage}>
        <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        <button>send</button>
      </form>
    </>
  )
}

export default Chats;