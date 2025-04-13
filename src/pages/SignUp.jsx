import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from "../firebase.config"
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg"
import visiblityIcon from '../assets/svg/visibilityIcon.svg';
import { toast } from 'react-toastify';
import OAuth from '../components/OAuth';
function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { name, email, password } = formData;
  const navigate = useNavigate();
  const changeHandler = (e) => {
    setFormData((pre) => ({ ...pre, [e.target.id]: e.target.value }));
  }
  const getPasswordInputType = () => {
    if (showPassword)
      return "text";
    return "password";
  }
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      updateProfile(auth.currentUser, {
        displayName: name,
      })

      const formDataCopy = { ...formData };
      delete formDataCopy.password;
      formDataCopy.timestamp = serverTimestamp()
      await setDoc(doc(db, 'users', user.uid), formDataCopy)
      navigate('/');
    } catch (error) {
      toast.error("Something went wrong with registration");
    }
  }
  return (
    <>
      <div className='pageContainer'>
        <header>
          <p className="pageHeader">Welcom Back!</p>
        </header>
        <main>
          <form onSubmit={submitHandler}>
            <input type="text" className="nameInput" placeholder="Name" id="name" value={name} onChange={changeHandler} />
            <input type="email" className="emailInput" placeholder="Email" id="email" value={email} onChange={changeHandler} />
            <div className="passwordInputDiv">
              <input type={getPasswordInputType()} className="passwordInput" placeholder="password" id="password" value={password} onChange={changeHandler} />
              <img src={visiblityIcon} alt="show password" className="showPassword" onClick={setShowPassword.bind(null, (previousState) => !previousState)} />
            </div>
            <div className="signUpBar">
              <p className="signUpText">
                Sign Up
              </p>
              <button className="signUpButton">
                <ArrowRightIcon fill='#fff' width="34px" height="34px" />
              </button>
            </div>
          </form>
          <OAuth />
          <Link to='/sign-in' className="registerLink">
            Sign In Instead
          </Link>
        </main>
      </div>
    </>
  )
}

export default SignUp
