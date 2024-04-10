import '../assets/MessageBox.scss';
import { useEffect, useState } from 'react';

function MessageBox(props) {
  const { data, uid, currentUser } = props;
  const messageClass = currentUser.uid === uid ? 'sent' : 'received';
  const [msgs, setMsgs] = useState({})

  useEffect(() => {
    setMsgWithDate()
  }, [])

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
