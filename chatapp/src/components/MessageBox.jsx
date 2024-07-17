import '../assets/MessageBox.scss';
import { useEffect, useState } from 'react';

function MessageBox(props) {
  const { data, uid, currentUser, userData} = props;
  const messageClass = currentUser.uid === uid ? 'sent' : 'received';
  const [msgs, setMsgs] = useState({})
  const [senderIcon, setSenderIcon] = useState({})

  useEffect(() => {
    setMsgWithDate()
    if (userData.length > 0) {
      const colors = ['blue', 'green', 'purple'];
      const newObj = {};
      for (let i = 0; i < userData.length; i++) {
        newObj[Object.keys(userData[i])[0]] = colors[i];
      }
      setSenderIcon(newObj);
    }
  }, [userData])
  
  const setMsgWithDate = () => {
    if (data !== null) {
      const date = data.createdAt.toDate().toLocaleString()
      const tempObj = {[date]:[data.text]};
      setMsgs((msg)=>tempObj);
    }
  }

  return (
    <>
      <div id='message-container'>
        {msgs &&
          Object.keys(msgs).map((date) =>
            <div className={messageClass}>
              <div className={`${senderIcon[uid]}Circle`}></div>
              <span className='msg-date'>
                <p className='message-content'>{msgs[date]}</p>
                <p className='message-date'> {date} </p>
              </span>
            </div>
          )}
      </div>
    </>
  )
}

export default MessageBox;
