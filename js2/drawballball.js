let src = cv.imread('canvasInput');
let dst = new cv.Mat();
let low = new cv.Mat(src.rows, src.cols, src.type(), [200, 0, 0, 0]);
let high = new cv.Mat(src.rows, src.cols, src.type(), [255,200,100, 255]);
// You can try more different parameters
cv.inRange(src, low, high, dst);
low.delete(); high.delete();
let dst1 = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();
cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
let max_i = -1;
let max_area = -1;
console.log('load');
for (let i = 0; i < contours.size(); ++i) {
    let cnt = contours.get(i);
    let rect = cv.boundingRect(cnt);
    let area = cv.contourArea(cnt, false);
    console.log(rect.width, rect.height);
    if(area > max_area && rect.width > 12 && rect.width < 70 && rect.height > 12 && rect.height < 70) {
    	max_area = area;
    	max_i = i;
    }
}
cnt = contours.get(max_i);
rect = cv.boundingRect(cnt);

let contoursColor = new cv.Scalar(255, 255, 255);
let rectangleColor = new cv.Scalar(255, 0, 0);
cv.drawContours(dst1, contours, max_i, contoursColor, 1, 8, hierarchy, 100);
let point1 = new cv.Point(rect.x + parseInt(rect.width)/2 -75, rect.y+ parseInt(+rect.height)/2 -75);
let point2 = new cv.Point(rect.x + parseInt(rect.width)/2 +75, rect.y+ parseInt(+rect.height)/2 +75);
cv.rectangle(dst1, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);
rectangleColor = new cv.Scalar(0,  255, 0);
point1 = new cv.Point(rect.x, rect.y);
point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
cv.rectangle(dst1, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);

console.log('w',rect.width,rect.height);

cv.imshow('canvasOutput', dst1);