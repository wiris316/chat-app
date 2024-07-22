import "../assets/Chatroom.scss";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import {
  doc,
  getFirestore,
  collection,
  deleteDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import {
  TbEdit,
  TbLayoutSidebarLeftCollapseFilled,
  TbPlaylistAdd,
  TbSquareRoundedCheck,
  TbSquareRoundedCheckFilled,
} from "react-icons/tb";
// import { getFirestore, collection, addDoc, deleteDoc, getDocs, orderBy, query, doc, onSnapshot, limit } from 'firebase/firestore';
import Chats from "./Chats";
import UserLegend from "./UserLegend";
import SidebarMenu from "./SidebarMenu";

function Chatroom(props) {
  const { auth, validated, setValidated, currentUser } = props;
  const firestore = getFirestore();
  const [chatRooms, setChatRooms] = useState([]);
  const [roomSelected, setRoomSelected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [userData, setUserData] = useState([]);
  const [senderIcon, setSenderIcon] = useState({});
  const [userLegendInfo, setUserLegendInfo] = useState([]);
  const [activeBox, setActiveBox] = useState("");
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
  const [refreshRoom, setRefreshRoom] = useState(false);
  const [selectedBox, setSelectedBox] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
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
  }, [roomSelected]);

  useEffect(() => {
    if (windowSize.width < 1000 && roomSelected) {
      setShowSidebar(false);
      setTimeout(() => {
        const sidebar = document.getElementById("chatroom-div-hidden");
        if (sidebar) {
          sidebar.style.display = "none";
        }
      }, 500);
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
    setUserLegendInfo(arr);
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
  }, [refreshRoom]);

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

  const addChatroom = async (newRoomName) => {
    await setDoc(doc(firestore, "chatroom", newRoomName), {});
    setRefreshRoom(!refreshRoom);
    setSidebarMenuOpen(!sidebarMenuOpen);
    handleJoinRoom(newRoomName);
  };

  const handleJoinRoom = (roomId) => {
    setRoomId(roomId);
    setRoomSelected(true);
    setActiveBox(roomId);
  };

  const toggleSidebar = () => {
    if (windowSize.width < 1000 && !showSidebar) {
      setRoomSelected(false);
    } else if (windowSize.width < 1000 && !roomSelected) {
      setRoomSelected(true);
    }

    if (roomSelected && showSidebar) {
      setTimeout(() => {
        const sidebar = document.getElementById("chatroom-div-hidden");
        sidebar.style.display = "none";
      }, 500);
    } else {
      const sidebar = document.getElementById("chatroom-div-hidden");
      if (sidebar) {
        sidebar.style.display = "flex";
      }
    }

    setShowSidebar(!showSidebar);
  };

  const handleSidebarMenuClick = () => {
    setSidebarMenuOpen(!sidebarMenuOpen);
    setDeleteMode(false);
  };

  const handleSelectBox = (roomId) => {
    if (roomId === "select-all-boxes") {
      const allRooms = [];
      chatRooms.forEach((room) => {
        allRooms.push(room.id);
      });
      setSelectedBox(allRooms);
    } else if (roomId === "deselect-all-boxes") {
      setSelectedBox([]);
    } else if (selectedBox.includes(roomId)) {
      const newArr = selectedBox.filter((ele) => ele !== roomId);
      setSelectedBox(newArr);
    } else {
      setSelectedBox([...selectedBox, roomId]);
    }
  };

  const toggleDeleteMode = () => {
    setSelectedBox([]);
    setDeleteMode(!deleteMode);
    setSidebarMenuOpen(false);
  };

  const handleDeleteRooms = () => {
    selectedBox.forEach(async (room) => {
      await deleteDoc(doc(firestore, "chatroom", room));
    });
    setRefreshRoom(!refreshRoom);
    setRoomSelected(false);
    setDeleteMode(false);
  };

  return (
    <>
      <button id="signout-button" onClick={() => logOut()}>
        sign out
      </button>
      <div id="container">
        <div id={showSidebar ? "chatroom-div" : "chatroom-div-hidden"}>
          <div id="chatroom-header-container">
            <TbPlaylistAdd id="menu-icon" onClick={handleSidebarMenuClick} />
            {sidebarMenuOpen && (
              <SidebarMenu
                addChatroom={addChatroom}
                toggleDeleteMode={toggleDeleteMode}
              />
            )}
            <h3 id="chatroom-header">ROOMS</h3>
            {roomSelected && (
              <TbLayoutSidebarLeftCollapseFilled
                id="sidebar-icon"
                onClick={toggleSidebar}
              />
            )}
          </div>
          <section id="chatroom-container">
            {chatRooms.length > 0 &&
              chatRooms.map((room, i) => (
                <div
                  key={i}
                  className={`chatroom-box ${
                    activeBox === room.id ? "active" : ""
                  }`}
                >
                  {deleteMode &&
                    (selectedBox.includes(room.id) ? (
                      <TbSquareRoundedCheckFilled
                        className="delete-checkbox-icon"
                        onClick={() => handleSelectBox(room.id)}
                      />
                    ) : (
                      <TbSquareRoundedCheck
                        className="delete-checkbox-icon"
                        onClick={() => handleSelectBox(room.id)}
                      />
                    ))}
                  <span
                    className="chatroom-box-content"
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    {room.id}
                    <TbEdit className="edit-room-icon" />
                  </span>
                </div>
              ))}
          </section>
          {roomSelected &&
            showSidebar &&
            userData.length > 0 &&
            !deleteMode && <UserLegend userLegendInfo={userLegendInfo} />}
          {deleteMode && (
            <div id="delete-settings">
              <p id="exit-delete-mode" onClick={toggleDeleteMode}>
                x
              </p>
              <h3>Delete Settings</h3>
              <section id="delete-buttons">
                <button onClick={() => handleSelectBox("select-all-boxes")}>
                  Select All
                </button>
                <button onClick={() => handleSelectBox("deselect-all-boxes")}>
                  Deselect All
                </button>
                <button id="delete-btn" onClick={handleDeleteRooms}>
                  Delete
                </button>
              </section>
            </div>
          )}
        </div>
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
            toggleSidebar={toggleSidebar}
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
