/*
 * Developed by Gleb Iakovlev on 4/7/19 12:19 AM.
 * Last modified 4/7/19 12:19 AM.
 * Copyright (c) Cognoteq Software Solutions 2019.
 * All rights reserved
 */


/**
 * Main implementation for feed the mice game
 */
import Base from "./base.js";

let paddleWidth = 0;
let paddleHeight = 0;
let target = {};
let ball = {};
let targets = [];
let pressed = {};
let keys = ['i','o','p'];
let imageURLS = ['https://i.ibb.co/GPRndqc/mouse.png','https://i.ibb.co/3pRr7VW/mouse-green.png','https://i.ibb.co/sy0NrjX/mouse-red.png'];

export default class feedMice extends Base{

  constructor(context,document) {
    super(context,document);
    paddleWidth = this.canvas.width/15;
    paddleHeight = this.canvas.width/15;

  }


  createBallBox() {

    this.ctx.beginPath();
    this.ctx.fillStyle= "#020102";
    this.ctx.lineWidth = "4";
    this.ctx.strokeStyle = "#1931dd";
    this.ctx.strokeRect(paddleWidth*3,(this.canvas.height-paddleWidth*2),paddleWidth/2,paddleWidth);
    this.ctx.fill();
    this.ctx.closePath();
  }


  createHouse(){

    let houseX = this.canvas.width - paddleWidth*2 - this.canvas.width/3.2;
    let houseY = this.canvas.height/3;
    let houseWidth = this.canvas.width/3.2;
    let houseHeight = this.canvas.height/2;
    let roofSpace = 20;

    this.ctx.beginPath();
    this.ctx.fillStyle= target.color;
    this.ctx.rect(houseX,houseY,houseWidth,houseHeight);
    this.ctx.fill();
    this.ctx.closePath();
    //Draw roof

    this.ctx.beginPath();
    this.ctx.fillStyle= target.roofcolor;
    this.ctx.moveTo(houseX - roofSpace  ,houseY);
    this.ctx.lineTo(houseX + houseWidth/2 ,houseY - houseHeight + 100);
    this.ctx.lineTo(houseX+houseWidth +roofSpace ,houseY);
    this.ctx.fill();
    this.ctx.closePath();
  }


  createWindow(target){
    this.ctx.beginPath();
    this.ctx.fillStyle= target.windowbackground;
    this.ctx.rect(target.position.x,target.position.y,target.dimensions.width,target.dimensions.height);
    this.ctx.fill();
    this.ctx.closePath();

    // Add mouse to window

    super.drawImage(target)

  }


  init() {
    super.init();
    this.initGame();
  }

  initGame() {
    super.initGame();
    pressed = Array(3).fill(false);
    target = {

      dimensions: {width : paddleWidth, height: paddleWidth},
      position: {x: (this.canvas.width - paddleWidth*2 - this.canvas.width/3.2) + this.canvas.width/6.4 - paddleWidth/2 , y:this.canvas.height/3 +  this.canvas.height/6},
      radius : 4,
      color:  "#8f909c",
      roofcolor: "#ff2d23",
      windowbackground: "#020102"

    };


    ball = {
      position : {x: paddleWidth*3, y:(this.canvas.height-paddleWidth*2)},
      velocity : {x: this.context.x_velocity/10, y:-1*this.context.y_velocity/10},
      mass: this.context.ball_mass/10,
      radius: 6,
      restitution: -1 - this.context.restitution/10,
      color:"#dadd0f"

    };


    targets = Array(3).fill({}).map( (_,index) =>

      ({

        dimensions: {width : paddleWidth, height: paddleWidth},
        position: {x: (this.canvas.width - paddleWidth*2 - this.canvas.width/3.2) + this.canvas.width/5.0  , y:this.canvas.height/3 +  this.canvas.height/6 + index*paddleWidth*1.1 },
        radius : 4,
        color:  "#8f909c",
        roofcolor: "#ff2d23",
        windowbackground: "#020102",
        imageURL: imageURLS[index]


      })

    );

  }

  /**
   * Check collision of appropriate key and window
   * @param index
   * @returns {boolean}
   */
  collisionDetection(index){

    // Window collision detection
    let target = targets[index];
    if(ball.position.x > target.position.x && ball.position.x - ball.radius < target.position.x + target.dimensions.width){

      if(ball.position.y > target.position.y && ball.position.y - ball.radius < target.position.y + target.dimensions.height ){


        if(pressed[index]){

          super.increaseScore();
          super.finishGame();

        }

        return true;

      }

    }

    return false;
  }

  keyDownHandler(e) {


    pressed =  pressed.map((val,index) => keys[index] === e.key?true:false);


  }




  loop() {
    super.loop();
    let didHitWindow  = Array(3).fill(false).map((_,index) => this.collisionDetection(index)).some(item => item != false);
    super.wallCollision(ball);
    if(!didHitWindow) {
      super.ballTrajectory(ball);
    }
    this.createBallBox();
    this.createHouse();
    targets.forEach(target => this.createWindow(target));
    if(didHitWindow){
      super.ballTrajectory(ball);
    }


  }

  dataCollection() {



  }


}
