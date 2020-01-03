import React from 'react';
import PropTypes from 'prop-types';
import * as tf from '@tensorflow/tfjs';

const kernel = [
  [
    [[-1, -1],[-1, -1],[-1, -1]],
    [[-2,  0],[-2,  0],[-2,  0]],
    [[-1,  1],[-1,  1],[-1,  1]],
  ],
  [
    [[ 0, -2],[ 0, -2],[ 0, -2]],
    [[ 0,  0],[ 0,  0],[ 0,  0]],
    [[ 0,  2],[ 0,  2],[ 0,  2]],
  ],
  [
    [[ 1, -1],[ 1, -1],[ 1, -1]],
    [[ 2,  0],[ 2,  0],[ 2,  0]],
    [[ 1,  1],[ 1,  1],[ 1,  1]],
  ],
];


const propTypes = {
  // ImageData object, from canvas2D.getImageData()
  imgData: PropTypes.shape({
    data: PropTypes.any, // Uint8ClampedArray
    width: PropTypes.number,
    height: PropTypes.number,
  }),
};

const defaultProps = {
  imgData: null,
};

class Edge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imgData: null,
    };
    this.processing = false;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.imgData !== this.props.imgData) {
      this.startProcess();
    }
  }

  startProcess() {
    if (this.processing) { return; }
    this.processing = true;
    this.process(this.props.imgData).then((imgData) =>{
      this.setState({imgData: imgData}, () => this.processing = false);
    });
  }

  async process(imgData) {
    const convArray = tf.tidy(()=>{
      let imageTensor = tf.browser.fromPixels(imgData, 3);
      let convTensor = tf.depthwiseConv2d(imageTensor, kernel, 1, 'same');
      let convData = convTensor.arraySync();
      return convData;
    });
    // convArray should be [height, width, 6]
    let newData = new Uint8ClampedArray(imgData.data.length);
    const perRow = imgData.width*4;
    for (let i=0; i < imgData.data.length; i+=4) {
      let row = Math.floor(i/perRow);
      let col = Math.floor((i-(row*perRow))/4);
      let convPixel = convArray[row][col];

      newData[i] = Math.sqrt(convPixel[0]**2 + convPixel[1]**2);
      newData[i+1] = Math.sqrt(convPixel[2]**2 + convPixel[3]**2);
      newData[i+2] = Math.sqrt(convPixel[4]**2 + convPixel[5]**2);
      newData[i+3] = 255;
    }
    return new ImageData(newData, imgData.width, imgData.height);
  }

  render() {
    return (
      React.cloneElement(
        /* Error if more than one child, otherwise, use that child */
        React.Children.only(this.props.children),
        /* Props to merge in to the child */
        {imgData: this.state.imgData}
      )
    );
  }
};

Edge.propTypes = propTypes;
Edge.defaultProps = defaultProps;
export default Edge;