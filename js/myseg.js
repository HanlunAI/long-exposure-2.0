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
    var height = 300;
    var width = 300; 
    // Create a camera object.
    var output = document.getElementById('output');
    var ctx = output.getContext("2d");
    ctx.scale(2, 2);
    
    let video = document.getElementById("videoInput"); 
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(function(stream){
            video.srcObject = stream;
            video.play();
        })
        .catch(function(err){
            console.log("Error ! "+ err); 
        });
    var src = new cv.Mat(height, width, cv.CV_8UC4);
    var dst = new cv.Mat(height, width, cv.CV_8UC1);
    const FPS = 30;

    function processVideo(){
        let begin = Date.now();
        ctx.drawImage(video, 0, 0, width, height);
        src.data.set(ctx.getImageData(0, 0, width, height).data);
        console.log(ctx.getImageData(0, 0, width, height).data);
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
        cv.imshow("canvasOutput", dst); // canvasOutput is the id of another <canvas>;
        // schedule next one.
        let delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    }
    setTimeout(processVideo, 0);
}
