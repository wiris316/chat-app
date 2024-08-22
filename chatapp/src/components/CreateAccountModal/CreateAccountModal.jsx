import { useEffect, useRef, useState } from "react";
import "./CreateAccountModal.scss";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";


const CreateAccountModal = ({ firestore, setOpenModal, auth }) => {
  const ref = useRef(null);
  const [formVal, setFormVal] = useState({
    email: "",
    password: "",
    username: "",
  });


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpenModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(
      auth,
      formVal.email,
      formVal.password,
      formVal.username
    )
      .then(() => {
        // setValidated(true);
        updateProfile(auth.currentUser, {
          displayName: formVal.username,
        })
          .then(() => {
            console.log("New user's displayName set");
          })
          .catch((error) => {
            console.error("Error in setting new user's displayName - ", error);
          });
        console.log("create account successful");
      })
      .then(async () => {
        const docRef = doc(firestore, 'users', formVal.username)
        await setDoc(docRef, {
          uid: auth.currentUser.uid,
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(
          `${errorCode}: Error in creating account - ${errorMessage}`
        );
      });
  };

  return (
    <div id="CreateAccountModal-overlay">
      <form id="CreateAccountModal-form" ref={ref} onSubmit={handleFormSubmit}>
        <h4 id="create-account-header">Create Account</h4>
        <input
          className="create-account-input"
          placeholder="Email"
          type="email"
          value={formVal.email}
          name="email"
          onChange={(e) => setFormVal({ ...formVal, email: e.target.value })}
          required
        />
        <input
          className="create-account-input"
          placeholder="Password"
          type="password"
          value={formVal.password}
          name="password"
          onChange={(e) => setFormVal({ ...formVal, password: e.target.value })}
          required
        />
        <input
          className="create-account-input"
          placeholder="Username"
          type="text"
          minLength="5"
          maxLength="12"
          value={formVal.username}
          name="username"
          onChange={(e) => setFormVal({ ...formVal, username: e.target.value })}
          required
        />
        <button id="submit-btn">submit</button>
      </form>
    </div>
  );
};

export default CreateAccountModal;
