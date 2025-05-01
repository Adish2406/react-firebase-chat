import { useState, useEffect, useCallback } from "react";
import "./chatList.css";
import AddUser from "./addUser/addUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);

  const { currentUser } = useUserStore();
  const changeChat = useChatStore((state) => state.changeChat);

  const fetchChats = useCallback(async () => {
    if (!currentUser?.id) return;

    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const data = res.data();

        if (!data || !Array.isArray(data.chats)) {
          setChats([]);
          return;
        }

        const items = data.chats;

        const promises = items.map(async (item) => {
          if (!item || !item.receiverId) return null;

          try {
            const userDocRef = doc(db, "users", item.receiverId);
            const userDocSnap = await getDoc(userDocRef);
            const user = userDocSnap.exists() ? userDocSnap.data() : null;

            return { ...item, user };
          } catch (error) {
            console.error("Error fetching user document:", error);
            return null;
          }
        });

        const chatData = await Promise.all(promises);
        const validChats = chatData.filter((chat) => chat !== null);
        setChats(validChats.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser?.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);
    if (chatIndex !== -1) {
      userChats[chatIndex].isSeen = true;
    }

    const userChatRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleUserAdded = () => {
    console.log("User added, refreshing chat list");
    fetchChats();
  };

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input type="text" placeholder="Search" />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {chats.map((chat) => {
        console.log(chat.user?.username, "Seen:", chat?.isSeen);

        return (
          <div
            className="item"
            key={chat.chatId}
            onClick={() => handleSelect(chat)}
            style={{
              backgroundColor: chat?.isSeen
                ? "transparent"
                : "blue",
                   // unseen - blue tint
              backdropFilter: "blur(10px)",
              borderRadius: "10px",
              padding: "10px",
              marginBottom: "8px",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
          >
            <img src={chat.user?.avatar || "./avatar.png"} alt="" />
            <div className="texts">
              <span>{chat.user?.username || "Unknown user"}</span>
              <p>{chat.lastMessage}</p>
            </div>
          </div>
        );
      })}

      {addMode && <AddUser onUserAdded={handleUserAdded} />}
    </div>
  );
};

export default ChatList;
