import "../assets/Chatroom.scss";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
// import { getFirestore, collection, addDoc, deleteDoc, getDocs, orderBy, query, doc, onSnapshot, limit } from 'firebase/firestore';
import Chats from "./Chats";

function Chatroom(props) {
  const { auth, validated, setValidated, currentUser } = props;
  const firestore = getFirestore();
  const [chatRooms, setChatRooms] = useState([]);
  const [roomSelected, setRoomSelected] = useState(false);
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const chatRoomCollection = collection(firestore, "chatroom");
        const chatRoomSnapshot = await getDocs(chatRoomCollection);
        const chatRoomData = chatRoomSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChatRooms(chatRoomData);
      } catch (error) {
        console.error("Error fetching chatrooms:", error);
      }
    };
    fetchChatRooms();

    // return () => {
    //   fetchChatRooms()
    // };
  }, []);

  const logOut = () => {
    signOut(auth)
      .then(() => {
        console.log("successfully signed out..");
        setValidated(!validated);
      })
      .catch((error) => {
        console.error(`${error}: an error occur while signing out`);
      });
  };

  const handleJoinRoom = (id) => {
    setRoomId(id);
    setRoomSelected(true);
  };

  return (
    <>
      {/* {
        roomSelected ?
        <Chats auth={auth} validated={validated} setValidated={setValidated} currentUser={currentUser} roomId={roomId} setRoomSelected={setRoomSelected} firestore={firestore} logOut={logOut} />
      :
        <div id='chatroom-container'>
          <button id='signout-button' onClick={()=>logOut()}>sign out</button>
          <div id='chatroom-div'>
            {chatRooms.length > 0 && chatRooms.map((room, i) =>
              <div key={i} className='chatroom-box'>{room.id}
                <button className='join-button' onClick={()=> handleJoinRoom(room.id)}>join</button>
              </div>
            )}
          </div>
        </div>
        } */}
      <div id="chatroom-container">
        {/* <button id="signout-button" onClick={() => logOut()}>
          sign out
        </button> */}
        <div id="chatroom-div">
          {chatRooms.length > 0 &&
            chatRooms.map((room, i) => (
              <div key={i} className="chatroom-box">
                {room.id}
                <button
                  className="join-button"
                  onClick={() => handleJoinRoom(room.id)}
                >
                  join
                </button>
              </div>
            ))}
        </div>
        {roomSelected && (
          <Chats
            auth={auth}
            validated={validated}
            setValidated={setValidated}
            currentUser={currentUser}
            roomId={roomId}
            setRoomSelected={setRoomSelected}
            firestore={firestore}
            logOut={logOut}
          />
        )}
      </div>
    </>
  );
}

export default Chatroom;
