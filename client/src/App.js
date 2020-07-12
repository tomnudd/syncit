import React from 'react';

import Friends from "./components/Friends"; // i wish
import Hero from "./components/Hero";

import './App.css';

let HOST = "http://127.0.0.1:8090";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      loggedIn: false,
      userInfo: {}
    }

    this.getInfo = this.getInfo.bind(this);
  }

  getInfo() {
    fetch(HOST + "/api/state")
      .then(res => res.json())
      .then(res => {
        console.log(res);
        this.setState({userInfo: res});
      });
  }

  componentDidMount() {
    fetch(HOST + "/api/loggedIn")
      .then(res => res.json())
      .then(res => {
        if (res.response == true) {
          this.setState({loggedIn: true});
          this.getInfo();
        }
      });
  }

  render() {
    return (
      <div className="App">
        <main>
          <Hero loggedIn={this.state.loggedIn}/>
          <Friends info={this.state.userInfo}/>
        </main>
      </div>
    );
  }
}

export default App;
