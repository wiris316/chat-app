import { useEffect,useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from 'firebase/app';
import '../assets/SignIn.scss';
// import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

function SignIn(props) {
  const { validated, setValidated, setApp } = props; 
  const [emailVal, setEmailVal] = useState('');
  const [passwordVal, setPasswordVal] = useState('');

  useEffect(() => {
    setApp(app)
  },[])

  const signInWithEmail = (e, email, password) => {
    e.preventDefault()
    console.log('in here', email, password)
    const provider = signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
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
    console.log('in create', email, password)
    const provider = createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        setValidated(true)
        console.log('create account successful')
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`${errorCode}: ${errorMessage}`)
      })
  }

  return (
    <>
      <h3 style={{color:'white', margin:'10px'}}>Sign In:</h3>
      <form id="signin-form" onSubmit={(e)=>signInWithEmail(e,emailVal,passwordVal)}>
        <label>Email:</label>
        <input className="signin-input" value={emailVal} onChange={(e)=>setEmailVal(e.target.value)} />
        <label>Password:</label>
        <input className="signin-input" value={passwordVal} onChange={(e)=> setPasswordVal(e.target.value)} />
        <span id="signin-form-buttons">
          <button type="submit" id="signin-button">Sign In</button>
          <button type="button" id="create-account-button" onClick={()=>createAccount(emailVal, passwordVal)} >Create Account</button>
        </span>
      </form>

    </>
  )
}

export default SignIn;
