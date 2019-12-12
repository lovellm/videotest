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

class InvertImage extends React.PureComponent {

  invert(imgData) {
    if (!imgData || !imgData.width || !imgData.height || !imgData.data) {
      return;
    }

    let data = imgData.data;
    let newData = new Uint8ClampedArray(imgData.data.length);

    for (let i=0; i < data.length; i+=4) {
      newData[i] = 255 - data[i];
      newData[i+1] = 255 - data[i+1];
      newData[i+2] = 255 - data[i+2];
      newData[i+3] = 255;
    }
    
    //return {data: newData, width: imgData.width, height: imgData.height};
    return new ImageData(newData, imgData.width, imgData.height);
  }

  render() {
    let imgData = this.invert(this.props.imgData);
    return (
      React.cloneElement(
        /* Error if more than one child, otherwise, use that child */
        React.Children.only(this.props.children),
        /* Props to merge in to the child */
        {imgData: imgData}
      )
    );
  }
};

InvertImage.propTypes = propTypes;
InvertImage.defaultProps = defaultProps;
export default InvertImage;
