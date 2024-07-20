import "../assets/Chatroom.scss";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { TbLayoutSidebarLeftCollapseFilled } from "react-icons/tb";
// import { getFirestore, collection, addDoc, deleteDoc, getDocs, orderBy, query, doc, onSnapshot, limit } from 'firebase/firestore';
import Chats from "./Chats";

function Chatroom(props) {
  const { auth, validated, setValidated, currentUser } = props;
  const firestore = getFirestore();
  const [chatRooms, setChatRooms] = useState([]);
  const [roomSelected, setRoomSelected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (windowSize.width < 1000 && roomSelected) {
      setShowSidebar(false)
      const sidebar = document.getElementById('chatroom-div-hidden');
      if (sidebar) {
        sidebar.style.display= 'none'
      }
    } else if (windowSize.width > 1000) {
      setShowSidebar(true)
      const sidebar = document.getElementById('chatroom-div-hidden');
      if (sidebar) {
        sidebar.style.display = 'flex'
      }
    }
  
  }, [windowSize, roomSelected])

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

  const handleSidebarClick = () => {
    setShowSidebar(!showSidebar)
    if (roomSelected && showSidebar) {
      setTimeout(() => {
        const sidebar = document.getElementById('chatroom-div-hidden');
        sidebar.style.display= 'none'
      },200)
    } else {
      const sidebar = document.getElementById('chatroom-div-hidden');
      sidebar.style.display = 'flex'
    }
  };

  return (
    <>
      <button id="signout-button" onClick={() => logOut()}>
        sign out
      </button>
      <div id="container">
        {/* {showSidebar && */}
          <div id={showSidebar? 'chatroom-div': 'chatroom-div-hidden'}>
            <div id="chatroom-header-container">
              <h3 id="chatroom-header">ROOMS</h3>
              <TbLayoutSidebarLeftCollapseFilled
                id="sidebar-icon"
                onClick={handleSidebarClick}
              />
            </div>
            <div id="chatroom-container">
              {chatRooms.length > 0 &&
                chatRooms.map((room, i) => (
                  <div
                    key={i}
                    className="chatroom-box"
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    <span className="chatroom-box-content">
                      {room.id}
                    </span>
                  </div>
                ))}
            </div>
          </div>
         {/* } */}
        {/* <div className="vertical-divider"></div> */}
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
            showSidebar={showSidebar}
            handleSidebarClick={handleSidebarClick}
          />
        )}
      </div>
    </>
  );
}

export default Chatroom;
