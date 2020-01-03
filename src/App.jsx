import React from 'react';
import './App.css';
import VideoCapture from './components/VideoCapture';
import InvertImage from './components/InvertImage';
import CanvasImgData from './components/CanvasImgData';
import FadedImage from './components/FadedImage';
import Edge from './components/Edge';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imgData: null,
      imgUrl: null,
      disable: false,
      hideVideo: false,
      continuous: false,
    }

    this.handleCapture = this.handleCapture.bind(this);
    this.handleToggleDisable = this.handleToggleDisable.bind(this);
    this.handleToggleHide = this.handleToggleHide.bind(this);
    this.handleToggleCont = this.handleToggleCont.bind(this);
  }

  handleCapture(data) {
    if (!data) {
      console.error('No data in App handleCapture');
      return;
    }
    this.setState({
      imgData: data.imgData,
      imgUrl: data.imgUrl,
    });
  }

  handleToggleDisable() {
    this.setState({disable: !this.state.disable});
  }

  handleToggleHide() {
    this.setState({hideVideo: !this.state.hideVideo});
  }

  handleToggleCont() {
    this.setState({continuous: !this.state.continuous});
  }

  render() {
    return (
      <div className="App">
        <VideoCapture
          hideVideo={this.state.hideVideo}
          disable={this.state.disable}
          width={400}
          height={null}
          captureKey={this.state.continuous ? null : ' '}
          captureTime={42}
          captureData={{
            imgData: true,
            imgUrl: false,
          }}
          onStop={() => console.log("Stopped")}
          onCapture={this.handleCapture}
          onStart={() => console.log("Start")}
        />
        <InvertImage imgData={this.state.imgData}>
          <CanvasImgData />
        </InvertImage>
        <FadedImage imgData={this.state.imgData}>
          <CanvasImgData />
        </FadedImage>
        <Edge imgData={this.state.imgData}>
          <CanvasImgData />
        </Edge>
        <div>
          <button onClick={this.handleToggleDisable}>Toggle Camera</button>
          <button onClick={this.handleToggleHide}>Toggle Original Video</button>
          <button onClick={this.handleToggleCont}>Toggle Continuous</button>
        </div>
      </div>
    );
  }
};

export default App;
