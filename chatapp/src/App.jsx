import { useState } from 'react';
import { getAuth } from "firebase/auth";
import './App.css'; 
import SignIn from './components/SignIn';
import Chats from './components/Chats'

const auth = getAuth();

function App() {
  const [validated, setValidated] = useState(false)
  const currentUser = auth.currentUser // current logged in user
  const [app, setApp] = useState(''); // state of firebase initialized app 

  return (
    <>
      {currentUser ? 
      <Chats auth={auth} validated={validated} setValidated={setValidated} app={app} setApp={setApp} currentUser={currentUser} />
      :<SignIn validated={validated} setValidated={setValidated} app={app} setApp={setApp} />}
    </>
  )
}

export default App
