import React from 'react';

import Friends from "./components/Friends"; // i wish
import Hero from "./components/Hero";

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';

import './App.css';

let HOST = "http://127.0.0.1:8090";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      loggedIn: false,
      userInfo: {}
    }
  }

  getInfo() {
    fetch(HOST + "/api/state")
      .then(res => res.json())
      .then(res => {
        console.log(res);
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
