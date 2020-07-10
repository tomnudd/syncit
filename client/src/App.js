import React from 'react';

import MyFriends from "./components/MyFriends";
import MyInfo from "./components/MyInfo";
import Navbar from "./components/Navbar";
import Recent from "./components/Recent";

import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <MyInfo />
      <Recent />
      <MyFriends />
    </div>
  );
}

export default App;
