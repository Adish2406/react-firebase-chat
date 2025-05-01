import Chat from "./components/chat/Chat";
import List from "./components/list/List";
import Detail from "./components/detail/Detail";
import Login from "./components/login/login"
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import {auth} from "./lib/firebase";
import {useEffect} from "react";
import {useUserStore} from "./lib/userStore";
import {useChatStore} from "./lib/chatStore";


const App = () => {

  const{currentUser,isLoading,fetchUserInfo}=useUserStore();
  const{chatId}=useChatStore();

  useEffect(()=>{
    // start listening to authentication changes.
    // This function listens to changes in the user authentication state(like login/logout)
    const unSub=onAuthStateChanged(auth,(user)=>{
      fetchUserInfo(user?.uid);
    });
    // stop listening by calling unSub
    return ()=>{
      unSub();
    };
  }, [ fetchUserInfo]);
  console.log(currentUser)

  if(isLoading) return <div className="loading">Loading....</div>

  // const user=false;
  return (
    <div className='container'>
      {
        currentUser? (
          <>
          <List/>
          {chatId && <Chat/>}
          {chatId && <Detail/>}

          </>

        ) : <Login/>
      }
     <Notification/> 
    </div>
  )
}

export default App