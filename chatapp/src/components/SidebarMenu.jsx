import '../assets/SidebarMenu.scss';

const SidebarMenu = (props) => {
  const { addChatroom } = props;
  return (
    <div id="sidebarMenu-container">
      <button onClick={addChatroom}>Add New Room</button>
      <button>Delete Room</button>
    </div>
  )
}

export default SidebarMenu;