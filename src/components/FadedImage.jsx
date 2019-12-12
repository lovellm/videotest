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

class FadedImage extends React.PureComponent {

  transform(imgData) {
    if (!imgData || !imgData.width || !imgData.height || !imgData.data) {
      return;
    }

    let data = imgData.data;
    let newData = new Uint8ClampedArray(imgData.data.length);

    for (let i=0; i < data.length; i+=4) {
      let gray = (data[i]+data[i+1]+data[i+2]) / 3;
      newData[i] = gray;
      newData[i+1] = gray * 0.6;
      newData[i+2] = gray * 0.3;
      newData[i+3] = 255;
    }
    
    //return {data: newData, width: imgData.width, height: imgData.height};
    return new ImageData(newData, imgData.width, imgData.height);
  }

  render() {
    let imgData = this.transform(this.props.imgData);
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

FadedImage.propTypes = propTypes;
FadedImage.defaultProps = defaultProps;
export default FadedImage;
