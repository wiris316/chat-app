import { useEffect,useState } from 'react';
import { getAuth, signInWithEmailAndPassword, } from "firebase/auth";
import { initializeApp } from 'firebase/app';
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

  return (
    <>
      <form onSubmit={(e)=>signInWithEmail(e,emailVal,passwordVal)}>
        <label>Email:</label>
        <input value={emailVal} onChange={(e)=>setEmailVal(e.target.value)} />
        <label>Password:</label>
        <input value={passwordVal} onChange={(e)=> setPasswordVal(e.target.value)} />
        
        <button >sign in</button>
      </form>

    </>
  )
}

export default SignIn;
