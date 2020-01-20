// ================= UI element event-driven section ==================

function showSTVal(val) {
    document.getElementById('stt').innerText = val;
}
function showLWTVal(val) {
    document.getElementById('lwt').innerText = val;
}


// ================== Segmentation & Experiment Section ===================

/*
    Return color basic on different joint
    Input: typeOfJoit(String)
    Output: color(rgb Array)
*/
function jointColor(typeOfJoint) {
    var color;
    switch (typeOfJoint) {
        case 'boundary':
          color = [255, 255, 0];
          break;
    }
    return color;
}


/*
    Return joint index of pxiel
    Input: arr(1d array), val(joint int)
    Output: indexes(Array)
*/
function getAllIndexes(arr, val) {
    var indexes = [], i;
    for(i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}


/*
    Modify result frame 
    Input: data(rgb frame Array), indexes(Array), typeOfJoint(String)
    Output: data(modified rgb frame Array)
*/
function modifyImgRGBA(data, indexes, typeOfJoint) {
    var len = indexes.length;                       /// length of buffer
    var i = 0;                                   /// cursor for RGBA buffer
    var t = 0;                                   /// cursor for RGB buffer

    var color = jointColor(typeOfJoint);

    // Modify img RGB
    for(; i < len; i += 1) {
        idx = indexes[i] * 4;

        data[idx]     = color[0];     /// copy RGB data to canvas from custom array
        data[idx + 1] = color[1];
        data[idx + 2] = color[2];
        data[idx + 3] = 255;           /// remember this one with createImageBuffer  
    }

    return data;
}


/*
    Remove row of array 
    Input: arr(Array), row(num. of row)
    Output: arr(Array)
*/
function deleteRow(arr, row) {
   var lineWidth = parseInt(document.getElementById('lw').value);
   arr.splice(row - lineWidth, lineWidth);
   return arr;
}


function getYShiftSegmentation(shiftSegmentation, rowNum, colNum) {

    var lineWidth = parseInt(document.getElementById('lw').value);

    var oriShiftSegmentation = Array.from(shiftSegmentation);
    var rRow = deleteRow(shiftSegmentation, rowNum);
    const oriTensor = tf.tensor(oriShiftSegmentation, [rowNum, colNum], 'int32');
    const rRowTensor = tf.tensor(rRow, [rowNum - lineWidth, colNum], 'int32');
    const rowTensor = tf.ones([lineWidth, colNum]).mul(tf.scalar(-1));
    const v_shift = tf.concat([rowTensor, rRowTensor], 0);

    return Array.from(oriTensor.sub(v_shift).abs().reshape([rowNum*colNum]).dataSync());
}


function getXShiftSegmentation(shiftSegmentation, rowNum, colNum) {

    var lineWidth = parseInt(document.getElementById('lw').value);

    var oriShiftSegmentation = Array.from(shiftSegmentation);
    var rCol = shiftSegmentation.map(function(val){
        return val.slice(0, -lineWidth);
    });

    const oriTensor = tf.tensor(oriShiftSegmentation, [rowNum, colNum], 'int32');
    const rColTensor = tf.tensor(rCol, [rowNum, colNum - lineWidth], 'int32');
    const colTensor = tf.ones([rowNum, lineWidth]).mul(tf.scalar(-1));
    const h_shift = tf.concat([colTensor, rColTensor], 1);

    return Array.from(oriTensor.sub(h_shift).abs().reshape([rowNum*colNum]).dataSync());
}


function getSegmentArray(segmentName) {
    var segmentArray;
    switch (segmentName) {
        case 'head':
            segmentArray = [0, 1];
            break;
        case 'rightArm':
            // segmentArray = [14, 15, 16, 21, 22];
            segmentArray = [21];
            break;
        case 'rightLeg':
            segmentArray = [2, 3, 4, 9, 10];
            break;
        case 'body':
            segmentArray = [12, 13];
            break;
        case 'leftArm':
            segmentArray = [17, 18, 19, 20, 23];
            break;
        case 'leftLeg':
            segmentArray = [5, 6, 7, 8, 11];
            break;
    }
    return segmentArray;
}


/*
    Add btn click listener
*/
function initialBtn() {
    cv['onRuntimeInitialized']=()=>{
        document.getElementById('startCapBtn').addEventListener('click', () => {
            main();
        });
    };
}


/*
    Main program - Segmentation
*/
async function main() {

    var model = await bodyPix.load();

    // Create a camera object.
    var output = document.getElementById('output');
    var ctx = output.getContext("2d");
    ctx.scale(2, 2);
    var camera = document.createElement("video");
    camera.setAttribute("width", 320);
    camera.setAttribute("height", 180);

    // Get a permission from user to use a camera.
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
      .then(function(stream) {
        camera.srcObject = stream;
        camera.onloadedmetadata = function(e) {
          camera.play();
        };
    });

    //! [Open a camera stream]
    var cap = new cv.VideoCapture(camera);
    var frame = new cv.Mat(camera.height, camera.width, cv.CV_8UC4);
    const FPS = 30;
    var then = Date.now() / 1000;
    var countFrame = 0;
    
    let dst = new cv.Mat(320,180, cv.CV_8UC4);
    async function processVideo() {

        ++countFrame;

        let begin = Date.now();
        var now = Date.now() / 1000;

        // Read frame (Mat format)
        cap.read(frame);
        // Call body-pix
        var outputStride = 16;
        var segmentationThreshold = parseFloat(document.getElementById('st').value);
        var s = Date.now();
        var r = frame.rows;
        var c = frame.cols;
        var imgData = new ImageData(frame.rows, frame.cols);
        // for (var i = 0; i <  c; i++ ) {
        //     for ( var j = 0 ; j < r; j++) {
        //         for (var k = 0; k<4; k++){
        //             imgData.data[((r-j-1) * c + i)*4+k] = frame.data[((r-j-1) * c + i)*4+k];
        //         }
        //     }
        // }
        for (var i = 0 ; i < 230400 ; i ++ ){
            imgData.data[i] = frame.data[i];
        }
        cv.imshow("output", frame);
        var partSegmentation = await model.estimatePartSegmentation(imgData, outputStride, segmentationThreshold);
        // var data = imgData.data;                   /// view for the canvas buffer               /// view for the canvas buffer
        // console.log(partSegmentation);
        // // Read from radio btn
        // var showSegementName = $("input[name='body']:checked").val();
        // var showSegementArray = getSegmentArray(showSegementName);
        // var diffWithBackground = 1;

        // // Find Boundary
        // var shiftSegmentation = Array.from(partSegmentation.data);

        // // Loop change the array only include backgroundIdx and showSegementIdx
        // for (var i=0; i<shiftSegmentation.length; i++) {
        //     if (showSegementArray.includes(shiftSegmentation[i])) {
        //         shiftSegmentation[i] = 0;
        //     } else {
        //         shiftSegmentation[i] = -1;
        //     }
        // }

        // // 1d to 2d array
        // var newShiftSegmentation = [];
        // while(shiftSegmentation.length) newShiftSegmentation.push(shiftSegmentation.splice(0,camera.height));

        // // Get difference of x-shift and y-shift frame
        // var xShiftSegmentation = getXShiftSegmentation(newShiftSegmentation, camera.width, camera.height);
        // var yShiftSegmentation = getYShiftSegmentation(newShiftSegmentation, camera.width, camera.height);

        // // Find the y-shift indexes and change RGB
        // if(yShiftSegmentation) {
        //     var yShiftIndexes = getAllIndexes(yShiftSegmentation, diffWithBackground);
        //     if (yShiftIndexes.length != 0) {
        //         data = modifyImgRGBA(data, yShiftIndexes, 'boundary');
        //     }
        // }
        
        // // Find the x-shift indexes and change RGB
        // if(xShiftSegmentation) {
        //     var xShiftIndexes = getAllIndexes(xShiftSegmentation, diffWithBackground);
        //     if (xShiftIndexes.length != 0) {
        //         data = modifyImgRGBA(data, xShiftIndexes, 'boundary');
        //     }
        // }


        // visualize the result
        // var newCanvas = $("<canvas>")
        //     .attr("width", imgData.width)
        //     .attr("height", imgData.height)[0];

        // newCanvas.getContext("2d").putImageData(imgData, 0, 0);
        // ctx.drawImage(newCanvas, 0, 0);


        // // compute time since last frame
        // var elapsedTime = now - then;
        // then = now;
        
        // // compute fps
        // var fps = 1 / elapsedTime;
        // document.getElementById('fps').innerText = fps.toFixed(2);

        // schedule the next one
        let delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    };

    // schedule the first one.
    setTimeout(processVideo, 0);
}
