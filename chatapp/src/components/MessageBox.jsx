import '../assets/MessageBox.scss';

function MessageBox(props) {
  const { data, uid, currentUser } = props;
  const messageClass = currentUser.uid === uid ? 'sent' : 'received';

  return (
    <>
      <div id='message-container'>
        <div className={messageClass}>
          <p className='message-content'>
            {data}
          </p>
        </div>

      </div>
    </>
  )
}

export default MessageBox;
