import { useState } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg"
import visiblityIcon from '../assets/svg/visibilityIcon.svg';
import OAuth from '../components/OAuth';
function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { email, password } = formData;
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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                navigate('/');
            }
        }
        catch (error) {
            toast.error('Bad User Credentials')
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
                        <input type="email" className="emailInput" placeholder="Email" id="email" value={email} onChange={changeHandler} />
                        <div className="passwordInputDiv">
                            <input type={getPasswordInputType()} className="passwordInput" placeholder="password" id="password" value={password} onChange={changeHandler} />
                            <img src={visiblityIcon} alt="show password" className="showPassword" onClick={setShowPassword.bind(null, (previousState) => !previousState)} />
                        </div>
                        <Link to='/forgot-password' className="forgotPasswordLink">
                            Forgot Password
                        </Link>
                        <div className="signInBar">
                            <p className="signInText">
                                Sign In
                            </p>
                            <button className="signInButton">
                                <ArrowRightIcon fill='#fff' width="34px" height="34px" />
                            </button>
                        </div>
                    </form>
                    <OAuth />
                    <Link to='/sign-up' className="registerLink">
                        Sign Up Instead
                    </Link>
                </main>
            </div>
        </>
    )
}

export default SignIn
