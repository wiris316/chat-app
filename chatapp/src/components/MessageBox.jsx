import '../assets/MessageBox.scss';

function MessageBox(props) {
  const { data, uid, currentUser } = props;
  const messageClass = currentUser.uid === uid ? 'sent' : 'received';

  return (
    <>
      <div className={messageClass}>
        {data}
      </div>
    </>
  )
}

export default MessageBox;
