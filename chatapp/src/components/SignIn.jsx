import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from 'firebase/app';
import '../assets/SignIn.scss';

const firebaseConfig = {
  
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

function SignIn(props) {
  const { setValidated } = props; 
  const [emailVal, setEmailVal] = useState('');
  const [passwordVal, setPasswordVal] = useState('');


  const signInWithEmail = (e, email, password) => {
    e.preventDefault()
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setValidated(true)
        console.log('sign in successful')
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`${errorCode}: ${errorMessage}`)
      })
  };

  const createAccount = (email, password) => {
    console.log('creating new account...')
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        setValidated(true)
        console.log('create account successful')
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`${errorCode}: Error in creating account - ${errorMessage}`)
      })
  }

  return (
    <>
      <h3 id='signin-header'>Sign In:</h3>
      <form id="signin-form" onSubmit={(e)=>signInWithEmail(e,emailVal,passwordVal)}>
        <label>Email:</label>
        <input className="signin-input" value={emailVal} onChange={(e)=>setEmailVal(e.target.value)} />
        <label>Password:</label>
        <input className="signin-input" value={passwordVal} onChange={(e)=> setPasswordVal(e.target.value)} />
        <span id="signin-form-buttons">
          <button type="submit" id="signin-button">sign in</button>
          <button type="button" id="create-account-button" onClick={()=>createAccount(emailVal, passwordVal)}> create account</button>
        </span>
      </form>

    </>
  )
}

export default SignIn;
