import "./SidebarMenu.scss";
import { useEffect, useRef, useState } from "react";
import { MdOutlineAdd } from "react-icons/md";

const SidebarMenu = (props) => {
  const { addChatroom, toggleDeleteMode, setSidebarMenuOpen } = props;
  const [showInputBox, setShowInputBox] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const ref = useRef(null);
  const toggleInputBox = () => {
    setShowInputBox(!showInputBox);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setSidebarMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  const handleInputChange = (e) => {
    setNameInput(e.target.value);
  };

  const handleInputSubmit = (e) => {
    if (e.key === "Enter") {
      addChatroom(nameInput);
      setNameInput("");
    }
  };

  return (
    <div id="sidebarMenu-container" ref={ref}>
      <div className="menu-options">
        <button onClick={toggleInputBox}>Create Room</button>
        {showInputBox && (
          <span className="icon-input-span">
            <MdOutlineAdd id="add-icon" />
            <input
              autoFocus
              onBlur={toggleInputBox}
              id="new-room-input"
              placeholder="Name..."
              onChange={handleInputChange}
              onKeyDown={handleInputSubmit}
              value={nameInput}
            ></input>
          </span>
        )}
      </div>
      {!showInputBox && (
        <span className="menu-options" onClick={toggleDeleteMode}>
          <button>Delete Room</button>
        </span>
      )}
    </div>
  );
};

export default SidebarMenu;
