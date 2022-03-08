import logo from './logo.svg';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import React, {  useState } from 'react';
import {useAuthState} from 'react-firebase-hooks/auth'
import {useCollectionData} from 'react-firebase-hooks/firestore';

//Firebase configuration and initialization for Web apps
//set up from Firestore settings


firebase.initializeApp({
  apiKey: "AIzaSyDJkeXzNyJl8CYzy3ZR5MhWZlDkaw77BxI",
  authDomain: "kuzchat-30c12.firebaseapp.com",
  projectId: "kuzchat-30c12",
  storageBucket: "kuzchat-30c12.appspot.com",
  messagingSenderId: "249292166305",
  appId: "1:249292166305:web:bfaf54e0dae227082c0ce0"
})


//Storing as global variables auth and firestore
const auth = firebase.auth();
const firestore = firebase.firestore();

//If user is signed in then show chat room, if not then show sign in with google
//using code below will know whther or not the user is logged in


function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p> Welcome to KuzChat!</p>
        <textarea> Rate the Conversation!</textarea>
        <SignOut/>
        
      </header>

      <section>
        {user ? <Chats /> : <SignIn />}
      </section>

    </div>
  );
}
//Under Section is if user then show the Chatroom if not then show sign in


function SignIn() {
  const useSignInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    //Popup WIndow will show the popup Google sign in
    auth.signInWithPopup(provider);
  }
  return(
    //Button listens to click event signInGOogle
    <>
      <button onClick={useSignInWithGoogle}> <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj_EsinMgg5VWQrttB06J6LeVx65V9V-S-ULFcsL45aPmE7mqs_LqDMROizFqhbVW1-7A&usqp=CAU" alt="GoogleIcon"/>Sign In with Google</button>

    </>
  )
}

//Signout method 
function SignOut() {
  return auth.currentUser && (
    
    <button className="sign-out" onClick={() => auth.signOut()}>Click to Sign Out</button>
  )
}


function Chats() {
  //refrencing my firestore collection for messages
  const messagesFire = firestore.collection('messages');
  // querying all the items in the collection
  const query = messagesFire.orderBy('createdAt').limit(25);
  //Updates the App with useCollection Data for id fields
  const [messages] = useCollectionData(query, {idField:'id'});
  // USeState changes the form value when something is submitted
  const [formValue, setFormValue]= useState('');

  const sendMessage = async(e) => {
    e.preventDefault();
    
    const { uid, displayName, photoURL } = auth.currentUser;
//UID/Displayname,PhotoURL all connected to the authenticated user, adding tot he DB after send message
    await messagesFire.add({
      text : formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      displayName: displayName,
      photoURL

    });
    setFormValue('');
  }

  return(
    <>
      <main>
        
        {messages && messages.map(msg => <ChatMessage key={msg.id} message = {msg} />)}
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Say Something..." />
        <button type="submit" placeholder="Send">Send</button>

      </form>
    
    </>
  )
}

// Returning the displayname, photoID, and Text which is styled in the CSS
function ChatMessage(props){
  const {text, uid, displayName, photoURL} = props.message;
  
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recieved';
  return(<>

    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://pfpmaker.com/_nuxt/img/profile-3-1.3e702c5.png'} alt="ProfileDefault" />
      <ins> User: {displayName} </ins>

      <p> {text}</p>

    </div>
  
  </>)
}


export default App;

