import "../assets/Chatroom.scss";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import {
  doc,
  getFirestore,
  collection,
  deleteDoc,
  getDoc,
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
  const [roomInfo, setRoomInfo] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [userData, setUserData] = useState([]);
  const [senderIcon, setSenderIcon] = useState({});
  const [userLegendInfo, setUserLegendInfo] = useState([]);
  const [activeBox, setActiveBox] = useState("");
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
  const [refreshRoom, setRefreshRoom] = useState(false);
  const [selectedBox, setSelectedBox] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [editInput, setEditInput] = useState("");
  const [editMode, setEditMode] = useState("");
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
        const chatRoomId = chatRoomSnapshot.docs.map((doc) => doc.id);
        return chatRoomId;
      } catch (error) {
        console.error("Error fetching chatrooms:", error);
      }
    };

    const fetchRoomName = async (roomId) => {
      try {
        const promises = roomId.map(async (id) => {
          const roomNameDocRef = doc(firestore, "chatroom", id, "roomName", id);
          const roomNameDocSnap = await getDoc(roomNameDocRef);
          if (roomNameDocSnap.exists()) {
            const data = roomNameDocSnap.data();
            const obj = { [id]: data.roomName };
            return obj;
          }
        });
        const results = await Promise.all(promises);
        setChatRooms(results);
      } catch (error) {
        console.error("error in fettching room name");
      }
    };

    const fetchData = async () => {
      const chatRoomIds = await fetchChatRooms();
      await fetchRoomName(chatRoomIds);
    };
    fetchData();
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
    const data = { roomName: newRoomName };
    const roomId = `room${chatRooms.length + 1}`;

    // create existent ancestor document for roomName
    await setDoc(doc(firestore, "chatroom", roomId), {});

    // create new document and store roomName
    await setDoc(doc(firestore, "chatroom", roomId, "roomName", roomId), data);

    if (deleteMode) {
      toggleDeleteMode();
    }
    
    setRefreshRoom(!refreshRoom);
    setSidebarMenuOpen(!sidebarMenuOpen);
    handleJoinRoom({ [roomId]: newRoomName });
  };

  const handleJoinRoom = (room) => {
    setRoomInfo(room);
    setRoomSelected(true);
    setActiveBox(Object.keys(room)[0]);
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
  };

  const handleSelectBox = (selectedRoom) => {
    if (selectedRoom === "select-all-boxes") {
      const allRooms = chatRooms.map((room) => Object.keys(room)[0]);
      setSelectedBox(allRooms);
    } else if (selectedRoom === "deselect-all-boxes") {
      setSelectedBox([]);
    } else if (selectedBox.includes(selectedRoom)) {
      const newArr = selectedBox.filter((ele) => ele !== selectedRoom);
      setSelectedBox(newArr);
    } else {
      setSelectedBox([...selectedBox, selectedRoom]);
    }
  };

  const toggleDeleteMode = () => {
    setSelectedBox([]);
    setDeleteMode(!deleteMode);
    setSidebarMenuOpen(false);
  };

  const handleDeleteRooms = () => {
    const userResponse = window.confirm(
      "Are you sure you want to delete the selected chatrooms?"
    );
    if (userResponse) {
      selectedBox.forEach(async (room) => {
        await deleteDoc(doc(firestore, "chatroom", room));
      });
      setRefreshRoom(!refreshRoom);
      setRoomSelected(false);
      setDeleteMode(false);
    }
  };

  const toggleEditMode = (e, selectedRoom) => {
    e.stopPropagation();
    editMode === selectedRoom ? setEditMode("") : setEditMode(selectedRoom);
  };

  const handleEditRoomName = async (e, roomId) => {
    if (e.key === "Enter") {
      const data = { roomName: editInput };
      await setDoc(
        doc(firestore, "chatroom", roomId, "roomName", roomId),
        data
      );
      setRoomInfo({ [roomId]: editInput });
      setRefreshRoom(!refreshRoom);
      setEditInput("");
      setEditMode("");
    }
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
                setSidebarMenuOpen={setSidebarMenuOpen}
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
                    activeBox === Object.keys(room)[0] ? "active" : ""
                  }`}
                >
                  {deleteMode &&
                    (selectedBox.includes(Object.keys(room)[0]) ? (
                      <TbSquareRoundedCheckFilled
                        className="delete-checkbox-icon"
                        onClick={() => handleSelectBox(Object.keys(room)[0])}
                      />
                    ) : (
                      <TbSquareRoundedCheck
                        className="delete-checkbox-icon"
                        onClick={() => handleSelectBox(Object.keys(room)[0])}
                      />
                    ))}
                  <span
                    className="chatroom-box-content"
                    onClick={() => handleJoinRoom(room)}
                  >
                    {editMode && editMode === Object.keys(room)[0] ? (
                      <input
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setEditInput(e.target.value)}
                        value={editInput}
                        onBlur={() => setEditMode(false)}
                        onKeyDown={(e) =>
                          handleEditRoomName(e, Object.keys(room)[0])
                        }
                        placeholder="New Chatroom Name"
                      ></input>
                    ) : (
                      Object.values(room)[0]
                    )}
                    {!deleteMode && (
                      <TbEdit
                        className="edit-room-icon"
                        onClick={(e) => toggleEditMode(e, Object.keys(room)[0])}
                      />
                    )}
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
            roomInfo={roomInfo}
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
