export class Actor {
  constructor(x, y, width, height, cx, canvasHeight, canvasWidth, pitch) {
    this.cx = cx;
    this.coords = {
      x: x,
      y: y
    };
    this.width = width;
    this.height = height;
    this.canvasHeight = canvasHeight;
    this.canvasWidth = canvasWidth;
    this.pitch = pitch;
    this.count = 2;
  }

  updateRatio(data) {
    if( this.canvasHeight < data.height && this.canvasHeight < data.width ||
      this.canvasWidth < data.width && this.width){
      var ratio = (data.width * data.height) /
      (this.canvasWidth * this.canvasHeight);
      this.width = this.width / ratio;
      this.height = this.height / ratio;
    }
  }

  update(){
    // handler for any update changes
  }

  move(orientation) {
    if(!this.maxValueX){
      this.maxValueX = Math.max(window.innerHeight, window.innerWidth) - 10 - Math.min(this.height, this.width);
    }
    if(!this.maxValueY){
      this.maxValueY =  Math.max(window.screen.height, window.screen.width) - 10 - Math.min(this.height, this.width) ;
    }
    this._height = this.height;
    this._width = this.width;
    if (orientation === 'x') {
      this.coords.x = this.coords.y;

      if (this.pitch === 'left'){
        this.coords.y = 10;
      } else {
        this.coords.y =  this.maxValueX;
      }
      if (this.width < this.height) {
        this.height = this._width;
        this.width = this._height;
      }

    } else {

      this.coords.y = this.coords.x;
      if (this.pitch === 'left'){
        this.coords.x = 10;
      } else {
        this.coords.x =  this.maxValueY;
      }
      if (this.width > this.height) {
        this.height = this._width;
        this.width = this._height;
      }

    }
  }

  draw() {
    this.cx.save();
    this.cx.beginPath();
    this.cx.fillStyle = this.fillStyle;
    this.el = this.cx.fillRect(this.coords.x, this.coords.y, this.width, this.height);
    this.cx.closePath();
    this.cx.restore();
  }
}
