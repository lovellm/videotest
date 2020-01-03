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

function process(imgData) {
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

self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
  if (!e || !e.data || !e.data.data) return;
  let newImage = process(e.data);
  postMessage(newImage);
});

/* Instructions for making webworker work in react-create-app env found at
 * https://medium.com/@danilog1905/how-to-use-web-workers-with-react-create-app-and-not-ejecting-in-the-attempt-3718d2a1166b
 */
