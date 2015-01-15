import { Ball } from '../elements/ball.es6';
import { Actor } from '../elements/actor.es6';

var
  win = window,
  doc = document;

function addMultipleEvents(el, evts, fn) {
  var evts = evts.split(' ');
  evts.forEach(function(evt) {
    el.addEventListener(evt, fn);
  });
}


var
  _ctx = _ctx || null,
  _io = _io || null,
  istance = null;



export class Pong {
  constructor(io, ctx) {
    if (!io && !ctx) {
      console.error('No io and/or ctx passed.');
      return;
    }
    _io = io;
    _ctx = ctx;
    this.pitch = sessionStorage.getItem('player');
    this.scoreEl = doc.querySelector('#score');
    if (this.pitch === 'right') {
      this.scoreEl.classList.add('right');
    }
    // resize actor propotions for smaller screen
    this.actor = new Actor(10, 10, 20, 120, _ctx, _ctx.canvas.height,
      _ctx.canvas.width, this.pitch);
    this.ball = new Ball(300, 300, _ctx,
    win.innerWidth, win.innerHeight, this.pitch);
    this.config();
    _io.on('message', this.socketListener);
    _io.on('game:opponent-canvas', this.actor.updateRatio.bind(this.actor));
    _io.on('pong:goal-scored', this.goalHandler.bind(this));
    _io.on('pong:player-left', this.playerLeft.bind(this));
    _io.on('pong:ball-coming', this.ballComingHandler.bind(this));
    this.scribbles = {
      actors: this.actor,
      ball: this.ball
    };

    if (!this.ball.invisible) {
      istance = this.istance = this.init.bind(this);
      win.addEventListener('touchstart', istance, true);
    } else {
      this.update();
      this.touchListener();
    }

    this.updateOnResize(true);
  }

  init(){
    this.update();
    win.removeEventListener('touchstart', istance, true);
    this.touchListener();
  }

  playerLeft(message) {
    var notifier = doc.createElement('div');
    notifier.className = 'notifier visible';
    notifier.textContent = message;
    doc.body.appendChild(notifier);
    this.ball.invisible = true;
  }

  config() {
    //canvas
    _ctx.strokeStyle = '#ffffff';
    //actors
    this.actor.fillStyle = '#ffffff';
    this.actor.halfHeight = this.actor.height / 2;
    this.actor.halfWidth = this.actor.width / 2;
    // reset time
    this.resetTime = 500;
    //ball
    this.ball.x_speed = 10;
    this.ball.y_speed = 10;
    this.ball.radius = 10;
    this.ball.fillstyle = '#000000';
    if (this.pitch === 'right') {
      this.ball.invisible = false;
    }else{
      this.ball.invisible = true;
    }
    //score
    this.score = {
      player1: 0,
      player2: 0
    };
  }


  // fire after window.resize
  waitForFinalEvent() {
    var timers = {};
    return function(callback, ms, uniqueId) {
      if (!uniqueId) {
        uniqueId = 'Don\'t call this twice without a uniqueId';
      }
      if (timers[uniqueId]) {
        clearTimeout(timers[uniqueId]);
      }
      timers[uniqueId] = setTimeout(callback.bind(this), ms);
    }.apply(this, arguments);
  }


  orientation() {
    win.addEventListener('resize', () => {
      this.waitForFinalEvent(this.updateOnResize, 100, 'some unique string');
    });
  }


  updateOnResize(init) {
    _ctx.canvas.width = win.innerWidth;
    _ctx.canvas.height = win.innerHeight;

    this.ball.updateOnResize(_ctx.canvas.width, _ctx.canvas.height);
    if (_ctx.canvas.height > _ctx.canvas.width) {
      this.dirPlayer = 'x';
      this.scoreEl.classList.add('portrait');
    } else {
      this.dirPlayer = 'y';
      this.scoreEl.classList.remove('portrait');
    }
    if(init){
      this.orientation();
    }
    this.actor.move(this.dirPlayer);
    this.ball.dirPlayer = this.dirPlayer;
  }

  draw() {
    _ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
    this._draw();
  }

  _draw() {
    this.scribbles.actors.draw();
    this.scribbles.ball.draw();
    requestAnimationFrame(this.draw.bind(this));
  }

  touchListener() {
    addMultipleEvents(win, 'touchstart touchmove', (e) => {
      e.preventDefault();
      e.stopPropagation();

      this.touchY = e.touches[0].pageY;
      this.touchX = e.touches[0].pageX;

      if (this.dirPlayer === 'x') {
        this.coordMove = 'pageX';
        if (this.touchX >= _ctx.canvas.width - this.actor.halfHeight) {
          this.actor.coords.x = _ctx.canvas.width - this.actor.width;
        } else if (this.touchX < this.actor.halfHeight) {
          this.actor.coords.x = 0;
        }else{
          this.actor.coords[this.dirPlayer] =
              e.touches[0][this.coordMove] - this.actor.halfHeight;
        }
      } else {
        this.coordMove = 'pageY';
        if (this.touchY >= _ctx.canvas.height - this.actor.halfHeight) {
          this.actor.coords.y = _ctx.canvas.height - this.actor.height;
        } else if (this.touchY < this.actor.halfHeight) {
          this.actor.coords.y = 0;
        }else{
          this.actor.coords[this.dirPlayer] =
              e.touches[0][this.coordMove] - this.actor.halfHeight;
        }
      }
    });
  }

  goal() {
    ++this.score.player2;
    _io.emit('pong:goal');
    this.scoreUpdate();
  }

  goalHandler() {
    ++this.score.player1;
    this.scoreUpdate();
  }

  scoreUpdate(){
      this.scoreEl.textContent = `${this.score.player1} - ${this.score.player2}`;
      this.ball.reset(_ctx.canvas.width, _ctx.canvas.height);
      this.scoreEl.classList.toggle('goal');
      setTimeout(function(){
        this.scoreEl.classList.toggle('goal');
      }.bind(this), 400 );
  }


  update() {
     if (this.dirPlayer === 'y' && this.pitch === 'left') {
      if (this.ball.x - this.ball.radius <= 0) {
        this.goal();
        this._update.call(this, this.resetTime);
      } else if (this.ball.x + this.ball.radius >= _ctx.canvas.width) {
        this.ball.comingBall = true;
        this.ballComing(_ctx.canvas.height);
      } else {
        this._update();
      }
    } else if (this.dirPlayer === 'y' && this.pitch === 'right') {
      if (this.ball.x + this.ball.radius >= _ctx.canvas.width) {
        this.goal();
        this._update.call(this, this.resetTime);
      } else if (this.ball.x - this.ball.radius <= 0) {
        this.ball.comingBall = true;
        this.ballComing(_ctx.canvas.height);
      } else {
        this._update();
      }
    } else if (this.dirPlayer === 'x' && this.pitch === 'left') {
      if (this.ball.y - this.ball.radius <= 0) {
        this.goal();
        this._update.call(this, this.resetTime);
      } else if (this.ball.y + this.ball.radius >= _ctx.canvas.height) {
        this.ball.comingBall = true;
        this.ballComing(_ctx.canvas.width);
      } else {
        this._update();
      }
    } else if (this.dirPlayer === 'x' && this.pitch === 'right') {
      if (this.ball.y + this.ball.radius >= _ctx.canvas.height) {
        this.goal();
        this._update.call(this, this.resetTime);
      } else if (this.ball.y - this.ball.radius <= 0) {
        this.ball.comingBall = true;
        this.ballComing(_ctx.canvas.width);
      } else {
        this._update();
      }
    }
  }

  _update(time) {
    var collision = this.checkCollision(this.dirPlayer);
    for (var scribble in this.scribbles) {
      this.scribbles[scribble].update(collision);
    }
    if(!this.ball.invisible){
      if( time ){
        cancelAnimationFrame(this.requestId);
        this.requestId = undefined;
        setTimeout(this.update.bind(this), time);
      } else {
        this.requestId = requestAnimationFrame(this.update.bind(this));
      }
    }
  }


  ballComing(axis) {
    var comingJSON = {
      type : 'ballComing',
      axis : axis,
      x : this.ball.x,
      y : this.ball.y,
      dirPlayer : this.dirPlayer,
      canvas : {
        width : _ctx.canvas.width,
        height : _ctx.canvas.height,
        ratio : _ctx.canvas.ratio
      }
    };
    this.ball.invisible = true;
    _io.emit('pong:ball-info', comingJSON);
  }

  ballComingHandler(data){
    var ready = this.ball.coming(data);

    if(!ready) {
      this.update(true);
    }
  }


  checkCollision(dirPlayer) {
    if (dirPlayer === 'y' && this.pitch === 'left') {
      if (this.ball.x - this.ball.radius < this.actor.coords.x +
          this.actor.width && this.ball.y >= this.actor.coords.y &&
          this.ball.y <= this.actor.height + this.actor.coords.y) {
        return {collision: 'collisionX', actorCoords : this.actor.coords.x +
        this.actor.width + this.ball.radius};
      } else {
        return false;
      }
    } else if (dirPlayer === 'y' && this.pitch === 'right') {
        if (this.ball.x + this.ball.radius > this.actor.coords.x &&
          this.ball.y >= this.actor.coords.y &&
          this.ball.y <= this.actor.height + this.actor.coords.y) {
        return {collision: 'collisionX', actorCoords : this.actor.coords.x -
        this.ball.radius};
      } else {
        return false;
      }
    } else if (dirPlayer === 'x' && this.pitch === 'left') {
        if (this.ball.y - this.ball.radius < this.actor.coords.y +
          this.actor.height && this.ball.x >= this.actor.coords.x &&
          this.ball.x <= this.actor.width + this.actor.coords.x) {
        return {collision: 'collisionY', actorCoords : this.actor.coords.y +
         this.actor.height + this.ball.radius };
      } else {
        return false;
      }
    } else if (dirPlayer === 'x' && this.pitch === 'right') {
        if (this.ball.y + this.ball.radius > this.actor.coords.y &&
          this.ball.x >= this.actor.coords.x &&
          this.ball.x <= this.actor.width + this.actor.coords.x) {
          return {collision: 'collisionY', actorCoords : this.actor.coords.y -
          this.ball.radius};
        } else {
          return false;
        }
    }
  }

}

