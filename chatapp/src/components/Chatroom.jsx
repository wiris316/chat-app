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
  const [userData, setUserData] = useState([]);
  const [senderIcon, setSenderIcon] = useState({});
  const [userLegend, setUserLegend] = useState([]);
  const [activeBox, setActiveBox] = useState("");
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (windowSize.width < 1000 && roomSelected) {
      setShowSidebar(false);
      const sidebar = document.getElementById("chatroom-div-hidden");
      if (sidebar) {
        sidebar.style.display = "none";
      }
    } else if (windowSize.width > 1000) {
      setShowSidebar(true);
      const sidebar = document.getElementById("chatroom-div-hidden");
      if (sidebar) {
        sidebar.style.display = "flex";
      }
    }
  }, [windowSize, roomSelected]);

  useEffect(() => {
    const arr = [];
    userData.forEach((ele) => {
      arr.push({ [Object.values(ele)[0]]: senderIcon[Object.keys(ele)[0]] });
    });
    setUserLegend(arr);
  }, [userData, senderIcon]);

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

  const handleJoinRoom = (roomId, i) => {
    setRoomId(roomId);
    setRoomSelected(true);
    setActiveBox(i);
  };

  const handleSidebarClick = () => {
    setShowSidebar(!showSidebar);
    if (roomSelected && showSidebar) {
      setTimeout(() => {
        const sidebar = document.getElementById("chatroom-div-hidden");
        sidebar.style.display = "none";
      }, 200);
    } else {
      const sidebar = document.getElementById("chatroom-div-hidden");
      sidebar.style.display = "flex";
    }
  };

  return (
    <>
      <button id="signout-button" onClick={() => logOut()}>
        sign out
      </button>
      <div id="container">
        {/* {showSidebar && */}
        <div id={showSidebar ? "chatroom-div" : "chatroom-div-hidden"}>
          <div id="chatroom-header-container">
            <h3 id="chatroom-header">ROOMS</h3>
            <TbLayoutSidebarLeftCollapseFilled
              id="sidebar-icon"
              onClick={handleSidebarClick}
            />
          </div>
          <section id="chatroom-container">
            {chatRooms.length > 0 &&
              chatRooms.map((room, i) => (
                <div
                  key={i}
                  className={`chatroom-box ${activeBox === i ? "active" : ""}`}
                  onClick={() => handleJoinRoom(room.id, i)}
                >
                  <span className="chatroom-box-content">{room.id}</span>
                </div>
              ))}
          </section>
          {roomSelected && (
            <section id="user-legend">
              <h3 id="user-legend-header">Chatters in the room</h3>
              <ul>
                {userLegend.map((user, i) => (
                  <li>{`${Object.keys(user)[0]} - ${
                    Object.values(user)[0]
                  }`}</li>
                ))}
              </ul>
            </section>
          )}
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
            senderIcon={senderIcon}
            setSenderIcon={setSenderIcon}
            userData={userData}
            setUserData={setUserData}
          />
        )}
      </div>
    </>
  );
}

export default Chatroom;
