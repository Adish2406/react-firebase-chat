import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { useState, useRef, useEffect } from "react";
import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
 
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked,isReceiverBlocked} = useChatStore();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    if (text === "") return;

    try {
      // ✅ Add message to messages subcollection
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: currentUser.id,
        text,
        createdAt: new Date(),
      });

      // ✅ Update last message metadata for both users
      const userIDs = [currentUser.id, user.id];

      for (const id of userIDs) {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          let chatsArray = userChatsData.chats || [];

          const chatIndex = chatsArray.findIndex((c) => c.chatId === chatId);
          const isSender = id === currentUser.id;

          const updatedChat = {
            chatId,
            receiverId: isSender ? user.id : currentUser.id,
            lastMessage: text,
            isSeen: isSender, // true for sender, false for receiver
            updatedAt: Date.now(),
          };

          if (chatIndex !== -1) {
            chatsArray[chatIndex] = { ...chatsArray[chatIndex], ...updatedChat };
          } else {
            chatsArray.push(updatedChat);
          }

          await updateDoc(userChatsRef, {
            chats: chatsArray,
          });
        }
      }

      setText(""); // Clear input after sending
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar ||"./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>
              {messages.length > 0
                ? messages[messages.length - 1]?.text
                : "Start a conversation..."}
            </p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>

      <div className="center">
        {messages.map((message) => (
          <div className={message.senderId===currentUser?.id ? "message own" : "message"} key={message?.createAt}
           
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <img src="./img.png" alt="" />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          placeholder={(isCurrentUserBlocked || isReceiverBlocked)? "You cannot send a message":"Type a message..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
        disabled={isCurrentUserBlocked || isReceiverBlocked}
          />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
