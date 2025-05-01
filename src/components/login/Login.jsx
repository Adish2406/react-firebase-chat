import "./login.css";
import {useState} from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createUserWithEmailAndPassword,signInWithEmailAndPassword } from "firebase/auth";
import {auth,db} from "../../lib/firebase";
import {doc,setDoc} from "firebase/firestore";


const Login = () => {
    const [avatar,setAvatar]=useState({
        file:null,
        url:""
    });

    const [loading,setLoading]=useState(false);
    const handleAvatar=(e)=>{
        setAvatar({
            file:e.target.files[0],
            // 0 gets the first selected file(usually there is a one selected in a profile avatar upload)
            url:URL.createObjectURL(e.target.files[0])
        })
    }
    const handleRegister= async (e)=>{
        e.preventDefault();
        setLoading(true);
        
        const formData=new FormData(e.target);

        const{username,email,password}=Object.fromEntries(formData);
        // console.log(username);

        try{
            const res= await createUserWithEmailAndPassword(auth,email,password);
            

            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,

                id:res.user.uid,
                blocked: [],

              });

              await setDoc(doc(db,"userChats",res.user.uid),{
              chats: [],
        });
toast.success("Account created! You can login now!");
        }catch(err){
            console.log(err);
            toast.error(err.message);

        }
        finally{
            setLoading(false);
        }
 

    };
    const handleLogin= async(e)=>{
        e.preventDefault();
        setLoading(true);

        const formData=new FormData(e.target);

        const{email,password}=Object.fromEntries(formData);

        try{
            await signInWithEmailAndPassword(auth,email,password);

        }
        catch(err){
            console.log(err.message);
            toast.error(err.message);
        }
        finally{
            setLoading(false);
        }
    
    };

    

  return (
    <div className="Login">
    <div className="item">
    <h2>Welcome Back!</h2>
    <form onSubmit={handleLogin}>
        <input type="text" placeholder="email" name="email"  />
        <input type="text" placeholder="Password" name="password" />
        <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
    </form>
    </div>
    
    <div className="seperator"></div>
    <div className="item">
    <h2>Create an Account</h2>
    <form onSubmit={handleRegister} >
        <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="" />Upload an Image!</label>
        <input type="file" id="file" style={{display:"none"}} onChange={(handleAvatar)} />
        <input type="text" placeholder="Username" name="username"  />
        <input type="text" placeholder="email" name="email"  />
        <input type="text" placeholder="Password" name="password" />
        <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
    </form>
    </div>
    </div>
  )
}

export default Login