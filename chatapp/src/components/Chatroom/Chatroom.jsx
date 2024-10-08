import "./Chatroom.scss";
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
  TbLogout,
  TbPlaylistAdd,
  TbSquareRoundedCheck,
  TbSquareRoundedCheckFilled,
} from "react-icons/tb";
import Chats from "../Chats/Chats";
import UserLegend from "../UserLegend/UserLegend";
import SidebarMenu from "../SidebarMenu/SidebarMenu";

function Chatroom(props) {
  const { auth, firestore, validated, setValidated, currentUser } = props;
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
  const [editRoom, setEditRoom] = useState("");
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

  async function deleteCollection(collectionRef, room) {
    try {
      const snapshot = await getDocs(collectionRef);

      for (const docSnapshot of snapshot.docs) {
        const docRef = doc(firestore, docSnapshot.ref.path); // Create a ref to the document

        // Recursively delete all subcollections
        const subcollectionNames = ["messages", "roomName", "users"];
        for (const subcollectionName of subcollectionNames) {
          const subcollectionRef = collection(docRef, subcollectionName);
          await deleteCollection(subcollectionRef, room); // Recursively delete each subcollection
        }

        // Delete the document
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.error("Error deleting collection: ", error);
    }
  }

  const handleDeleteRooms = async () => {
    if (selectedBox.length > 0) {
      const userResponse = window.confirm(
        "Are you sure you want to delete the selected chatroom(s)?"
      );
      if (userResponse) {
        try {
          // Handle all deletions in parallel
          await Promise.all(
            selectedBox.map(async (room) => {
              const roomDocRef = doc(firestore, "chatroom", room);

              const subcollectionNames = ["messages", "roomName", "users"];
              for (const subcollectionName of subcollectionNames) {
                const subcollectionRef = collection(
                  roomDocRef,
                  subcollectionName
                );
                await deleteCollection(subcollectionRef); // Recursively delete each subcollection
              }

              // Delete the room document itself
              await deleteDoc(roomDocRef);
            })
          );

          setRoomSelected(false);
          setDeleteMode(false);
          setRefreshRoom((prev) => !prev);
        } catch (error) {
          console.error("Error deleting user and nested data: ", error);
        }
        console.log("Nested data of chatroom successfully deleted");
      }
    } else {
      alert("Please select a chatroom to delete.");
    }
  };

  const toggleEditMode = (e, selectedRoom) => {
    e.stopPropagation();
    editRoom === selectedRoom ? setEditRoom("") : setEditRoom(selectedRoom);
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
      setEditRoom("");
    }
  };

  return (
    <>
      <button id="signout-button" onClick={() => logOut()}>
        sign out
        <TbLogout />
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
                    {editRoom && editRoom === Object.keys(room)[0] ? (
                      <input
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setEditInput(e.target.value)}
                        value={editInput}
                        onBlur={() => setEditRoom('')}
                        onKeyDown={(e) =>
                          handleEditRoomName(e, Object.keys(room)[0])
                        }
                        placeholder="New Chatroom Name"
                        className="edit-name-input"
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
          {roomSelected && showSidebar && !deleteMode && (
            <UserLegend userLegendInfo={userLegendInfo} />
          )}
          {deleteMode && (
            <div id="delete-settings">
              <div id="exit-delete-mode" onClick={toggleDeleteMode}>
                x
              </div>
              <h3>Delete Settings</h3>
              <section id="desc-buttons-container">
                <p id="delete-desc">
                  Deleting chatrooms are irreversible. Please select the
                  chatroom you would like to delete.
                </p>
                <button
                  className="btns"
                  id="delete-btn"
                  onClick={handleDeleteRooms}
                >
                  Delete
                </button>
                <button
                  className="btns"
                  onClick={() => handleSelectBox("select-all-boxes")}
                >
                  Select All
                </button>
                <button
                  className="btns"
                  onClick={() => handleSelectBox("deselect-all-boxes")}
                >
                  Deselect All
                </button>
              </section>
            </div>
          )}
        </div>
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
