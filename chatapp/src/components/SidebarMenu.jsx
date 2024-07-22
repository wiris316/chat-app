import "../assets/SidebarMenu.scss";
import { useState } from "react";
import { MdOutlineAdd } from "react-icons/md";

const SidebarMenu = (props) => {
  const { addChatroom } = props;
  const [showInputBox, setShowInputBox] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const toggleInputBox = () => {
    setShowInputBox(!showInputBox);
  };

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
    <div id="sidebarMenu-container">
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
      <span className="menu-options" onClick={toggleInputBox}>
        <button>Delete Room</button>
      </span>
    </div>
  );
};

export default SidebarMenu;
