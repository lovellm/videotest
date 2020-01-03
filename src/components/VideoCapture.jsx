import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  hideVideo: PropTypes.bool,
  disable: PropTypes.bool,
  captureKey: PropTypes.string,
  captureTime: PropTypes.number,
  catpureData: PropTypes.shape({
    imgData: PropTypes.bool,
    imgUrl: PropTypes.bool,
  }),
  onStop: PropTypes.func,
  onStart: PropTypes.func,
  onCapture: PropTypes.func,
};

const defaultProps = {
  width: null,
  height: null,
  hideVideo: false,
  disable: false,
  captureKey: ' ',
  captureTime: null,
  captureData: {
    imgData: true,
    imgUrl: false,
  },
  onStop: null,
  onStart: null,
  onCapture: null,
};

class VideoCapture extends React.PureComponent {
  constructor(props) {
    super(props);
    let state = {
      streaming: false,
      imgUrl: null,
    };

    // Replicating as non-state, since setState is async and using within another async
    this.streaming = false;
    this.state = state;

    // Refs to the important DOM elements, as they are used directly
    this.video = React.createRef();
    this.canvas = React.createRef();
    
    this.handleStart = this.handleStart.bind(this);
    this.handleCanPlay = this.handleCanPlay.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.handleCapture = this.handleCapture.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.timedImage = this.timedImage.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keypress', this.handleKeyPress);
    this.handleStart();
  }

  componentWillUnmount() {
    document.removeEventListener('keypress', this.handleKeyPress);
    this.handleStop();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.captureTime !== prevProps.captureTime ||
      this.props.captureKey !== prevProps.captureKey
    ) {
      this.timedImage();
    }

    if (this.props.disable && !prevProps.disable) {
      this.handleStop();
    } else if (!this.props.disable && prevProps.disable) {
      this.handleStart();
    }
  }

  handleKeyPress(e) {
    if (e.key !== this.props.captureKey) { return; }
    this.handleCapture();
  }

  handleCapture() {
    if (this.props.disable) { return; }
    let imgData = this.captureImg(this.video.current);
    if (typeof this.props.onCapture === 'function') {
      this.props.onCapture(imgData);
    }
  }

  handleStart() {
    if (this.props.disable) { 
      // Do not start if Disable prop is given
      return;
    }
    const video = this.video.current;

    // Get a video stream from the default device
    // TODO: Allow using specific media device instead of default
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    }).then((stream) => {
      video.srcObject = stream;
      video.play();
    }).catch((err) => {
      console.error("An error occurred: " + err);
    });

    // Set some properties once the stream starts
    if (!this.streaming) {
      video.addEventListener('canplay', this.handleCanPlay, false); // END of video.addEventListener('canplay')
    }
  }

  handleCanPlay() {
    // This event could fire multiple times, only handle it if first time
    if (this.streaming) { return; }
    try {
      const video = this.video.current;
      const canvas = this.canvas.current;
      let width;
      let height;

      // Scale video based on desired width or height
      if (this.props.width) {
        width = this.props.width;
        height = video.videoHeight / (video.videoWidth/width);
      } else if (this.props.height) {
        height = this.props.height;
        width = video.videoWidth / (video.videoHeight/height);
      } else {
        width = video.videoWidth;
        height = video.videoHeight;
      }
      
      // Set style width/height based on the computed onces.
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);

      // Update non-state incase event fires again before state updates.
      this.streaming = true;

      // Update State
      this.setState({
        streaming: true,
        height: height,
        width: width,
      }, this.timedImage());
    } catch (e) {
      console.error(e);
      this.handleStop();
    }

    // If given an onStart callback, call it with a reference to the video element
    if (typeof this.props.onStart === 'function') {
      this.props.onStart(this.video.current);
    }
  }

  handleStop() {
    const video = this.video.current;
    this.stopVideo(video);
    video.removeEventListener('canplay', this.handleCanPlay);
    this.streaming = false;
    if (typeof this.props.onStop === 'function') {
      this.props.onStop();
    }
  }

  stopVideo(video) {
    if (!video) { return; }
    try {
      // Stop the video display
      video.pause();
      video.currentTime = 0;

      // Stop the camera stream
      let stream = video.srcObject;
      if (!stream) {
        return;
      }

      if (typeof stream.stop === 'function') {
        // stream.stop is deprecated, but older browser might have it
        stream.stop();
      } else {
        // Stopping each track is the preferred way.
        let tracks = stream.getTracks();
        if (tracks) {
          tracks.forEach((t) => {
            t.stop();
          });
        }
      }
    } catch(e) {
      console.error('stopVideo Error '+ e);
    }
  }

  captureImg(video) {
    if (!video) { return; }
    let imgUrl = null;
    let imgData = null;
    let modes = this.props.captureData || {};
    let canvas = this.canvas.current;
    let context = canvas.getContext('2d');
    if (this.state.width && this.state.height) {
      canvas.width = this.state.width;
      canvas.height = this.state.height;
      context.drawImage(video, 0, 0, this.state.width, this.state.height);

      if (modes.imgData) {
        imgData = context.getImageData(0, 0, this.state.width, this.state.height);
      }
      if (modes.imgUrl) {
        imgUrl = canvas.toDataURL('image/png');
      }

      this.setState({
        imgUrl: imgUrl
      });
    }
    
    return {
      imgUrl: imgUrl,
      imgData: imgData,
    };
  }

  timedImage() {
    if (this.props.disable) { return; }
    if (typeof this.props.captureTime !== 'number' || this.props.captureKey !== null) {
      return;
    }
    this.handleCapture();
    setTimeout(this.timedImage, this.props.captureTime);
  }

  render() {
    return (
      <div
        style={{
          display: 'inline-block',
        }}
      >
        <video
          ref={this.video}
          id="video"
          style={{
            display: this.props.hideVideo ? 'none' : 'initial'
          }}
        />
        <canvas style={{display: 'none'}} ref={this.canvas} id="canvas" />
      </div>
    );
  }
};

VideoCapture.propTypes = propTypes;
VideoCapture.defaultProps = defaultProps;
export default VideoCapture;
