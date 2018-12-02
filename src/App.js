import React, { Component } from 'react';
import './App.css';
import './hello.js';
import {uploadFile} from './hello.js';

class App extends Component {
  fileChangedHandler = event => {
      this.setState({
        selectedFile: event.target.files[0]
      });
  }

  uploadHandler = () => {
      console.log(this.state.selectedFile, this.state.selectedFile.name);
      uploadFile(this.state.selectedFile);
  }
  render() {
    return (
      <body>
      <div>
      <div id='bodybox'>
    <div id='chatborder'>
      <p id="chatlog7" class="chatlog">&nbsp;</p>
      <p id="chatlog6" class="chatlog">&nbsp;</p>
      <p id="chatlog5" class="chatlog">&nbsp;</p>
      <p id="chatlog4" class="chatlog">&nbsp;</p>
      <p id="chatlog3" class="chatlog">&nbsp;</p>
      <p id="chatlog2" class="chatlog">&nbsp;</p>
      <p id="chatlog1" class="chatlog">&nbsp;</p>
      <input type="text" name="chat" id="chatbox" placeholder="Hi there! Type here to talk to me." onfocus="placeHolder()"
      />
      <input type="file" onChange={this.fileChangedHandler} class='upload_1'/>
        <button onClick={this.uploadHandler} class='upload_1'>Upload!</button>
    </div>
  </div>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<div id="myImg"></div>
</div>
</body>
    );
  }
}



export default App;
