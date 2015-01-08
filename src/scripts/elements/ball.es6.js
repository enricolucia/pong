export class Ball {
  constructor(x, y, cx, width, height, pitch) {
    this.cx = cx;
    this.x = x;
    this.y = y;
    this.space = {
      top: 0,
      right: width,
      bottom: height,
      left: 0
    };
    this.dirX = 1;
    this.dirY = 1;
    this.boundaryY = 'bottom';
    this.boundaryX = 'right';
    this.pitch = pitch;
  }

  draw() {
    //check if ball is on the pitch
    if (!this.invisible) {
      this.cx.save();
      this.cx.beginPath();
      this.cx.fillStyle = this.fillStyle;
      this.cx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
      this.cx.fill();
      this.cx.closePath();
      this.cx.restore();
    }
  }

  reset(canvasW, canvasH) {
    this.x = canvasW / 2;
    this.y = canvasH / 2;
  }

  coming(data){

    if (this.dirPlayer === 'y' &&  data.dirPlayer === 'y') {
      var ratio = this.space.bottom / data.axis;
      this.y = data.y * ratio;
      if (this.pitch === 'left') {
        this.x = this.space.right - this.radius * 2;
        this.dirX = -1;
      } else {
        this.x = this.radius * 2 ;
        this.dirX = 1;
      }
    } else if (this.dirPlayer === 'x' &&  data.dirPlayer === 'x') {
      var ratio = this.space.right / data.axis;
      this.x = data.x * ratio;
      if (this.pitch === 'left') {
        this.y = this.space.bottom - this.radius * 2;
        this.dirY = -1;
      } else {
        this.y = this.radius * 2;
        this.dirY = 1;
      }
    } else if (this.dirPlayer === 'y' &&  data.dirPlayer === 'x') {
      var ratio = this.space.bottom / data.axis;
      this.y = data.x * ratio;
      if (this.pitch === 'left') {
        this.x = this.space.right - this.radius * 2;
        this.dirX = -1;
      } else {
        this.x = this.radius * 2;
        this.dirX = 1;
      }
    } else if (this.dirPlayer === 'x' &&  data.dirPlayer === 'y') {
      var ratio = this.space.right / data.axis;
      this.x = data.y * ratio;
      if (this.pitch === 'left') {
        this.y = this.space.bottom - this.radius * 2;
        this.dirY = -1;
      } else {
        this.y = this.radius * 2;
        this.dirY = 1;
      }
    }

    this.invisible = false;
  }


  update(data) {
    if (!this.comingBall) {

      if ((this.x + this.radius) >= this.space[this.boundaryX] ||
        data.collision === 'collisionX' || this.x <= this.radius) {
        if (data.collision) {
           this.x = data.actorCoords;
        }
        this.dirX *= -1;

      } else if ((this.y + this.radius)  >= this.space[this.boundaryY] ||
        data.collision === 'collisionY'  || this.y <= this.radius) {
          if (data.collision) {
             this.y = data.actorCoords;
          }
          this.dirY *= -1;
      }

    } else {
      this.comingBall = false;
    }
    this.x += this.x_speed * this.dirX;
    this.y += this.y_speed * this.dirY;
  }

  updateOnResize(width, height) {
    this.space = {
      top: 0,
      right: width,
      bottom: height,
      left: 0
    };
    this._x = this.x;
    this._y = this.y;
    this.x = this._y;
    this.y = this._x;
    this._dirX = this.dirY;
    this._dirY = this.dirX;
    this.dirX = this._dirX;
    this.dirY = this._dirY;
  }
}
