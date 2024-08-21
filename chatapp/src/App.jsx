import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import "./App.css";
import SignIn from "./components/SignIn/SignIn";
import Chatroom from "./components/Chatroom/Chatroom";

const auth = getAuth();
const firestore = getFirestore();

function App() {
  const [validated, setValidated] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setValidated(true);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      {currentUser ? (
        <Chatroom
          firestore={firestore}
          auth={auth}
          validated={validated}
          setValidated={setValidated}
          currentUser={currentUser}
        />
      ) : (
        <SignIn
          firestore={firestore}
          validated={validated}
          setValidated={setValidated}
        />
      )}
    </>
  );
}

export default App;
