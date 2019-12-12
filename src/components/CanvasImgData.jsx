import React from 'react';
import PropTypes from 'prop-types';

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

class CanvasImgData extends React.PureComponent {
  constructor(props) {
    super(props);

    // Refs to the important DOM elements, as they are used directly
    this.canvas = React.createRef();
  }

  componentDidMount() {
    this.drawImage();
  }

  componentDidUpdate() {
    this.drawImage();
  }

  drawImage() {
    let canvas = this.canvas.current;
    if (!canvas) {
      // First render will not have a ref created yet, so will be null until didMount
      return;
    }

    let context = canvas.getContext('2d');

    let imgData = this.props.imgData;
    if (! imgData instanceof ImageData) {
      let data = imgData.data;
      if (! data instanceof Uint8ClampedArray) {
        data = new Uint8ClampedArray(imgData.data.length);
        for (let i=0; i< imgData.data.length; i++) {
          data[i] = imgData.data[i];
        }
      }
      imgData = new ImageData(data, imgData.width, imgData.height);
    }
    
    context.putImageData(imgData, 0, 0);
  }

  render() {
    let imgData = this.props.imgData || {};
    let width = imgData.width || 0;
    let height = imgData.height || 0;
    let canDraw = !!(width && height && imgData.data);
    return (
      <div
        style={{
          display: 'inline-block',
          margin: 0,
          padding: 0,
        }}
      >
        {canDraw &&
          <canvas
            id="canvas"
            width={width}
            height={height}
            ref={this.canvas}
          />
        }
      </div>
    );
  }
};

CanvasImgData.propTypes = propTypes;
CanvasImgData.defaultProps = defaultProps;
export default CanvasImgData;
