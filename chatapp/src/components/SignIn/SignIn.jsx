import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import "./SignIn.scss";
import CreateAccountModal from "../CreateAccountModal/CreateAccountModal";

const firebaseConfig = {

};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

function SignIn(props) {
  const { setValidated, firestore } = props;
  const [emailVal, setEmailVal] = useState("");
  const [passwordVal, setPasswordVal] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const signInWithEmail = (e, email, password) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setValidated(true);
        console.log("sign in successful");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`${errorCode}: ${errorMessage}`);
      });
  };

  const createAccount = (email, password) => {
    console.log("creating new account...");
    setOpenModal(true);
  };

  return (
    <>
      {openModal && (
        <CreateAccountModal
          firestore={firestore}
          setOpenModal={setOpenModal}
          auth={auth}
        />
      )}
      <div id="signin-container">
        <h3 id="signin-header">Sign In:</h3>
        <form
          id="signin-form"
          onSubmit={(e) => signInWithEmail(e, emailVal, passwordVal)}
        >
          <label>Email:</label>
          <input
            className="signin-input"
            value={emailVal}
            onChange={(e) => setEmailVal(e.target.value)}
          />
          <label>Password:</label>
          <input
            className="signin-input"
            value={passwordVal}
            onChange={(e) => setPasswordVal(e.target.value)}
          />
          <span id="signin-form-buttons">
            <button type="submit" id="signin-button">
              sign in
            </button>
            <button
              type="button"
              id="create-account-button"
              onClick={() => createAccount(emailVal, passwordVal)}
            >
              {" "}
              create account
            </button>
          </span>
        </form>
      </div>
    </>
  );
}

export default SignIn;
