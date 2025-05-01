import './addUser.css';
import { db } from '../../../../lib/firebase';
import {
  collection,
  query,
  where,
  doc,
  getDocs,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion
} from "firebase/firestore";

import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = ({ onUserAdded }) => {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore(); // assuming this returns an object with id, username, etc.

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const foundUser = querySnapshot.docs[0];
        setUser({ ...foundUser.data(), id: foundUser.id }); // include id here
      } else {
        setUser(null); // clear user if not found
      }
    } catch (err) {
      console.error("Search Error:", err);
    }
  };

  const handleAdd = async () => {
    if (!user || !user.id || !currentUser?.id) {
      console.error("User or current user is not defined properly");
      return;
    }

    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const currentUserDocRef = doc(userChatsRef, currentUser.id);
      const foundUserDocRef = doc(userChatsRef, user.id);

      const chatDataForCurrentUser = {
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: user.id,
        updatedAt: Date.now(),
      };

      const chatDataForFoundUser = {
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: currentUser.id,
        updatedAt: Date.now(),
      };

      const currentUserSnap = await getDoc(currentUserDocRef);
      const foundUserSnap = await getDoc(foundUserDocRef);

      if (!currentUserSnap.exists()) {
        await setDoc(currentUserDocRef, { chats: [chatDataForCurrentUser] });
      } else {
        await updateDoc(currentUserDocRef, {
          chats: arrayUnion(chatDataForCurrentUser),
        });
      }

      if (!foundUserSnap.exists()) {
        await setDoc(foundUserDocRef, { chats: [chatDataForFoundUser] });
      } else {
        await updateDoc(foundUserDocRef, {
          chats: arrayUnion(chatDataForFoundUser),
        });
      }

      console.log("Chat created successfully!");

      // Notify the parent component that a user was added
      if (onUserAdded) {
        onUserAdded(); // Notify the parent to refresh the chat list
      }

    } catch (err) {
      console.error("Add Error:", err);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" required />
        <button>Search</button>
      </form>

      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="User Avatar" />
            <span>{user.username}</span>
            <button onClick={handleAdd}>Add User</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUser;
