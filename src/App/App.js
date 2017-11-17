import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import CollabEditor, { MyEditor } from '../Editor/Editor';
import Editor2 from '../Editor/Editor2';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Demo with React + Draft.js</h1>
        </header>
        <div className="container">
          <CollabEditor />
        </div>  

        <div className="container">
          <Editor2 />
        </div>  
      </div>
    );
  }
}

export default App;
