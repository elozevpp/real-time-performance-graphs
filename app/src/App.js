import logo from './logo.svg';
import './App.css';
import { io } from "socket.io-client";
const socket = io('ws://server:3000/', {transports: ['websocket']});


function App() {

  socket.on('connect', () => {
    console.log('connected')
  });

  socket.on('connect_error', (e) => {
    console.log('connected_error', e)
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
