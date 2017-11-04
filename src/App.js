import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import CollabEditor from './Editor';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Demo with React + Draft.js</h1>
        </header>
        <CollabEditor/>
      </div>
    );
  }
}

export default App;
