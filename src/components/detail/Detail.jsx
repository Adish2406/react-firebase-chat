import "./detail.css";
import {auth} from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import { useChatStore } from "../../lib/chatStore";
import { doc,updateDoc,arrayUnion,arrayRemove } from "firebase/firestore";
import { db } from "../../lib/firebase";


const Detail = () => {
  const {chatId,user,isCurrentUserBlocked, isReceiverBlocked,changeBlock}=
useChatStore();
const {currentUser}=useUserStore();
  const handleBlock=async()=>{
    if(!user || !currentUser?.id) return;

    const userDocRef=doc(db,"users",currentUser.id);

    try{
      await updateDoc(userDocRef,{
        blocked:isReceiverBlocked? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock()

    }catch(err){
      console.log(err)
    }
    
  }
  return (
    <div className="detail">
      Detail
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username}</h2>
        <p>Lorem ipsum dolor sit amet. </p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="./lnct.png" alt="" />
                <span>photo_2025_2.png</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>

            <div className="photoItem">
              <div className="photoDetail">
                <img src="./lnct.png" alt="" />
                <span>photo_2025_2.png</span>
              </div>
              <img src="./download.png" alt="" className="icon"/>
            </div>

            <div className="photoItem">
              <div className="photoDetail">
                <img src="./lnct.png" alt="" />
                <span>photo_2025_2.png</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>

            
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
      
      <button onClick={handleBlock}>{isCurrentUserBlocked? "You are Blocked!" : isReceiverBlocked? "User Blocked" : "Block User"}
        </button>
     <button className="logout" onClick={()=>auth.signOut()}>Logout</button>
      </div>
    </div>
  );
};

export default Detail;
