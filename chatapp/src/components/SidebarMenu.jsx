import "../assets/SidebarMenu.scss";
import { useState } from "react";
import { MdOutlineAdd } from "react-icons/md";

const SidebarMenu = (props) => {
  const { addChatroom } = props;
  const [showInputBox, setShowInputBox] = useState(false);
  const toggleInputBox = () => {
    setShowInputBox(!showInputBox);
  };
  return (
    <div id="sidebarMenu-container">
      <div className="menu-options">
        <button onClick={toggleInputBox}>Create Room</button>
        {showInputBox && (
          <span className="icon-input-span">
            <MdOutlineAdd id="add-icon" />
            <input id="new-room-input" placeholder="Name..."></input>
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
