function showSTVal(val) {
    document.getElementById('stt').innerText = val;
}
function showLWTVal(val) {
    document.getElementById('lwt').innerText = val;
}
function show_more(){
  var moreText = document.getElementById("more_option");
  var btnText = document.getElementById("showBtn");

  if (btnText.innerHTML === "More options") {
    btnText.innerHTML = "Less options";
    moreText.style.display = "inline";
  } else {
    btnText.innerHTML = "More options";
    moreText.style.display = "none";
  }
}
function download(){
    var download = document.getElementById("download");
    var image = document.getElementById("result").toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
    download.setAttribute("href", image);
    //download.setAttribute("download","archive.png");
    }
function stop(){
    console.log("stop");
    clearTimeout(timehandle);
}

function getSegmentArray(segmentName) {
    var segmentArray = [];
    segmentName.forEach(collect);
    function collect(value, index, array){
        switch (value  ) {
            case 'all':
                segmentArray = segmentArray.concat([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,23]);
                break;
            case 'head':
                segmentArray = segmentArray.concat([0, 1]);
                break;
            case 'rightArm':
                //v2 numbering different from v1
                segmentArray =segmentArray.concat([ 4, 5, 8, 9, 11]);
                break;
            case 'rightLeg':
                segmentArray = segmentArray.concat([16, 17, 20, 21, 23]);
                break;
            case 'body':
                segmentArray = segmentArray.concat([12, 13]);
                break;
            case 'leftArm':
                segmentArray = segmentArray.concat([2, 3, 6, 7, 10]);
                break;
            case 'leftLeg':
                segmentArray =  segmentArray.concat([14, 15, 18, 19, 22]);
                break;
            case "leftFace":
                segmentArray =  segmentArray.concat([0]);
                break;
            case "rightFace":
                segmentArray =  segmentArray.concat([1]);
                break;
            case "rightUpperLegFront":
                segmentArray =  segmentArray.concat([16]);
                break;
            case "rightLowerLegBack":
                segmentArray =  segmentArray.concat([21]);
                break;
            case "rightUpperLegBack":
                segmentArray =  segmentArray.concat([17]);
                break;
            case "leftLowerLegFront":
                segmentArray =  segmentArray.concat([20]);
                break;
            case "leftUpperLegFront":
                segmentArray =  segmentArray.concat([14]);
                break;
            case "leftUpperLegBack":
                segmentArray =  segmentArray.concat([15]);
                break;
            case "leftLowerLegBack":
                segmentArray =  segmentArray.concat([19]);
                break;
            case "rightFeet":
                segmentArray =  segmentArray.concat([23]);
                break;
            case "rightLowerLegFront":
                segmentArray =  segmentArray.concat([20]);
                break;
            case "leftFeet":
                segmentArray =  segmentArray.concat([22]);
                break;
            case "torsoFront":
                segmentArray =  segmentArray.concat([12]);
                break;
            case "torsoBack":
                segmentArray =  segmentArray.concat([13]);
                break;
            case "rightUpperArmFront":
                segmentArray =  segmentArray.concat([4]);
                break;
            case "rightUpperArmBack":
                segmentArray =  segmentArray.concat([5]);
                break;
            case "rightLowerArmBack":
                segmentArray =  segmentArray.concat([9]);
                break;
            case "leftLowerArmFront":
                segmentArray =  segmentArray.concat([6]);
                break;
            case "leftUpperArmFront":
                segmentArray =  segmentArray.concat([2]);
                break;
            case "leftUpperArmBack":
                segmentArray =  segmentArray.concat([3]);
                break;
            case "leftLowerArmBack":
                segmentArray =  segmentArray.concat([7]);
                break;
            case "rightHand":
                segmentArray =  segmentArray.concat([11]);
                break;
            case "rightLowerArmFront":
                segmentArray =  segmentArray.concat([8]);
                break;
            case "leftHand":
                segmentArray =  segmentArray.concat([10]);
                break;
        }
    };
    return segmentArray;
}
function initialBtn() {
    cv['onRuntimeInitialized']=()=>{
        document.getElementById('startCapBtn').addEventListener('click', () => {
            main();
        });
    };
}

function change(out){
    console.log("{LZ");
    out = 1;
}

async function main() {
    var width = 640;
    var height = 320;
    // Create a camera object.
    var camera = document.createElement("video");
    camera.setAttribute("width", width);
    camera.setAttribute("height", height);
    // Get a permission from user to use a camera.
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
      .then(function(stream) {
        camera.srcObject = stream;
        camera.onloadedmetadata = function(e) {
          camera.play();
        };
    });

    var output = document.getElementById('result');
    var ctx = output.getContext("2d");
    // THIS LINE CRUCIAL
    ctx.fillRect(0, 0, width, height);
    var imgData = ctx.getImageData(0,0, width, height);

    //! [Open a camera stream]
    var cap = new cv.VideoCapture(camera);
    var frame = new cv.Mat(height, width, cv.CV_8UC4);
    var tmpImg = new ImageData(width, height);
    let webImg = new cv.Mat();
    let dsize = new cv.Size(width/4, height/4);

    var outputStride = 16;

    var model = await bodyPix.load({outputStride:outputStride});
    var previous_backg = new Array(height * width+1).join('0').split('').map(parseFloat);

    const FPS = 100;
    var then = Date.now() / 1000;
    var countFrame = 0;
    var enter = 1;
    var canv = document.getElementById("webcam");
    var ctx_web = canv.getContext("2d");


    async function processVideo(){
        var out = 0;
        let begin = Date.now();
        var outputStride = 16;
        cap.read(frame);

        var segmentationThreshold = parseFloat(document.getElementById('st').value);
        var s = Date.now();
        var r = height;
        var c = width;


        for(var l= 0; l < r*c*4 ; l ++){
            tmpImg.data[l] = frame.data[l];
        }
        cv.resize(frame,webImg,dsize,0,0, cv.INTER_AREA);
        cv.imshow('webcam',webImg);

        var partSegmentation = await model.segmentPersonParts(tmpImg, {flipHorizontal:true, segmentationThreshold:segmentationThreshold});
        var checkboxes = document.getElementsByName('body');
        var selected = [];
        for (var i=0; i<checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                selected.push(checkboxes[i].value);
            }
        }
        var segmentArray = getSegmentArray(selected);
        console.log(segmentArray);
        var settime = $("input[name='time']:checked").val();

        // For webcam uploading time 5 second
        if (Date.now()/1000 - then > 5){
            if(enter){
                enter = 0;
                console.log("started");
                countFrame = 0;
            }
            for(var p = 0 ; p < c; p ++){
                for(var q = 0 ; q < r ; q++){
                    if (Date.now()/1000 - then > settime+ 5){
                        return;
                    }
                    else if(segmentArray.includes(partSegmentation.data[p * r +  q])){
                        for(var k = 0 ; k < 3; k ++){
                            imgData.data[(p*r + q)*4 + k] = frame.data[(p*r + q)*4 + k];
                        }
                        previous_backg[p * r + q] = 0;
                    }
                    else if (previous_backg[p * r + q] == 1 || countFrame ==0) {
                        previous_backg[p * r + q] = 1;
                        for(var k = 0 ; k < 3; k ++){
                            imgData.data[(p*r + q)*4 + k] =  frame.data[(p*r + q)*4 + k];
                        }
                    }

                }
            }
        }
    ctx.putImageData(imgData,0,0);
    let delay = 1000/FPS - (Date.now() - begin);
    ++countFrame;
    timehandle= setTimeout(processVideo, delay);
    };
    setTimeout(processVideo, 0);

}
