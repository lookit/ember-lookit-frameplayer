/*
 * Developed by Gleb Iakovlev on 3/31/19 8:15 PM.
 * Last modified 3/31/19 8:07 PM.
 * Copyright (c) 2019 . All rights reserved.
 */

import Base from './base';
/**
 * Main class for catch the crocodile game
 * This is only initial code. A lot will be redone here.
 */

let paddleWidth = 0;
let paddleHeight = 10;
let downPressed = false;
let upPressed = false;
let rho = 1.22; // kg/ m^3
let Cd = 0.47;  // Dimensionless
let frameRate = 1/200; // Seconds
let frameDelay = frameRate * 1000; // ms
let paddle = {};
let ball = {};
let dataLoop ={};
let gameLoop = {};
let currentRounds = 0;
let gameScore = 0;
let ctx = {};
let target = {};
let A = {};
let canvas = {};

/**
 * Game implementation for crocodile game
 * TODO: create base game class for main game parameters out of this file
 */
export default class Game extends Base{


  /**
   * Constructor to get parameters from caller
   * @param context from component
   * @param document object from component
   */
  constructor(context,document){

    super(context,document);

    this.gravity = context.gravity_factor * 9.81;  // m / s^2
    canvas = this.canvas;
    ctx = this.ctx;
    paddleWidth = canvas.width/9;
    this.document.addEventListener("keydown", this.keyDownHandler, false);
    this.document.addEventListener("keyup", this.keyUpHandler, false);

  }

  /**
   * initialize on start button
   */
  init(){
    currentRounds = 0;
    this.initGame();
  }



  keyDownHandler(e) {
    if(e.key === "Up" || e.key === "ArrowUp") {
      upPressed = true;
    }
    else if(e.key === "Down" || e.key === "ArrowDown") {
      downPressed = true;
    }
  }


  keyUpHandler(e) {
    if(e.key === "Up" || e.key ==="ArrowUp") {
      upPressed = false;
    }
    else if(e.key === "Down" || e.key === "ArrowDown") {
      downPressed = false;
    }
  }



   drawPaddle () {
    ctx.beginPath();
    ctx.rect(paddle.position.x, paddle.position.y, paddle.dimensions.width, paddle.dimensions.height);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath();
  }

  createPaddleBox() {
    ctx.beginPath();
    ctx.rect(canvas.width/2-paddle.dimensions.width,canvas.height-paddle.dimensions.width*1.3,paddle.dimensions.width,paddle.dimensions.width);
    ctx.fillStyle= "#020102";
    ctx.stroke();
    ctx.lineWidth = "4";
    ctx.strokeStyle = "#1931dd";
    ctx.fill();
    ctx.closePath();
  }

  drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#09b4dd";
    ctx.fillText("Score: "+gameScore, 8, 20);
  }


  crocImage() {

    let croc = new Image();
    croc.src = target.imageURL;
    ctx.drawImage(croc,target.position.x,target.position.y,target.dimensions.width,target.dimensions.height);

  }


  createBallBox() {

    ctx.beginPath();
    ctx.fillStyle= "#020102";
    ctx.lineWidth = "4";
    ctx.strokeStyle = "#1931dd";
    ctx.strokeRect(10,canvas.height-paddle.dimensions.width*1.56,paddle.dimensions.width/2,paddle.dimensions.width*1.2);
    ctx.fill();
    ctx.closePath();
  }


  /**
   * Main game loop
   * TODO : add this to base class
   */
  loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#020102";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();


    this.createBallBox();
    this.drawPaddle();
    this.createPaddleBox();
    this.crocImage();
    this.drawScore();
    /**
     * Handle paddle collision here
     * Adjust velocity to the ball by restitution factor
     */
    if(ball.position.y >= (paddle.position.y - paddle.dimensions.height) && ball.position.y < (paddle.position.y + paddle.dimensions.height)){
      if ((ball.position.x > paddle.position.x && ball.position.x  < paddle.position.x + paddle.dimensions.width)) {

        ball.velocity.y *= ball.restitution;
        ball.velocity.x *= -ball.restitution;
        ball.position.y = paddle.position.y - ball.radius;

        /**
         *  Check if paddle moved recently and apply restitution coefficient
         *  Tolerate 10 millis
         */

        if(new Date().getTime() -  paddle.paddleLastMovedMillis < 10 ){

          ball.velocity.y *= paddle.paddleRestitution;
          ball.velocity.x *= -paddle.paddleRestitution;
        }

      }
    }

    /**
     * Walls and target collisions detection
     */

    if(ball.position.y > canvas.height - ball.radius || ball.position.x > canvas.width - ball.radius || ball.position.x < ball.radius){


      this.finishGame();
    }



    /**
     * Missed target
     */
    if(ball.position.x > target.position.x+ 40 && (ball.position.y < (target.position.y + target.dimensions.height)/1.6)){

      this.finishGame();

    }



    /**
     * Target is reached here
     */
    if((ball.position.y < target.position.y + target.dimensions.height) &&  (ball.position.y > (target.position.y + target.dimensions.height)/1.6) && ball.position.x > target.position.x + 40 ){


      gameScore++;
      this.finishGame();

    }





    /**
     * Handle paddle direction on key pressed
     */

    if(downPressed && paddle.position.y < canvas.height-paddle.dimensions.height ) {

      paddle.position.y += paddle.velocity;
      paddle.paddleLastMovedMillis = new Date().getTime();

    }
    else if(upPressed && paddle.position.y > 0) {
      paddle.position.y -= paddle.velocity;
      paddle.paddleLastMovedMillis = new Date().getTime();
    }

    let Fx = -0.5 * Cd * A * rho * ball.velocity.x * ball.velocity.x * ball.velocity.x / Math.abs(ball.velocity.x);
    let Fy = -0.5 * Cd * A * rho * ball.velocity.y * ball.velocity.y * ball.velocity.y / Math.abs(ball.velocity.y);

    Fx = (isNaN(Fx) ? 0 : Fx);
    Fy = (isNaN(Fy) ? 0 : Fy);

    let ax = Fx / ball.mass;
    let ay = this.gravity + (Fy / ball.mass);

    ball.velocity.x += ax*frameRate;
    ball.velocity.y += ay*frameRate;
    ball.position.x += ball.velocity.x*frameRate*100;
    ball.position.y += ball.velocity.y*frameRate*100;

    ctx.translate(ball.position.x, ball.position.y);
    ctx.beginPath();
    ctx.arc(0,0,ball.radius, 0, Math.PI*2,true);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();

  }


  /**
   * Finish current round and check for rounds left
   * TODO : add this to base class
   */
  finishGame(){

    currentRounds++;
    clearInterval(dataLoop);
    clearInterval(gameLoop);

    if(currentRounds < this.context.game_rounds){

      this.initGame();

    }


  }


  /**
   * Initialize game state before each round
   *
   * TODO : add this to base class
   */
  initGame(){


    paddle = {

      dimensions: {width: paddleWidth, height: paddleHeight},
      position: {x: canvas.width/2 - paddleWidth, y : (canvas.height-paddleHeight)/2 },
      paddleRestitution: -1 - this.context.paddle_restitution/10,
      paddleLastMovedMillis: 100,
      velocity:this.context.paddle_speed

    };

    ball = {

      position : {x: paddle.dimensions.width/2, y:canvas.height-paddle.dimensions.width*1.56 - paddle.dimensions.width*1.2},
      velocity : {x: this.context.x_velocity/10, y:-1*this.context.y_velocity/10},
      mass: this.context.ball_mass/10,
      radius: 10,
      restitution: -1 - this.context.restitution/10,
      color:"#dadd0f"

    };


    target = {

      dimensions: {width: canvas.width/3.5, height: canvas.width/3.5},
      position : {x: canvas.width - canvas.width/3.5 -20, y:10 },
      imageURL : 'https://i.ibb.co/yFYTmBJ/croc.png'

    };
    A = Math.PI * ball.radius * ball.radius / (10000); // m^2

 //   dataLoop = setInterval(this.dataCollection,10);
  //  gameLoop = setInterval( this.loop, frameDelay);

    this.loopTimer = function () {
      let inst = this;
      gameLoop = setInterval( function (){
        inst.loop();
      }, frameDelay);


      dataLoop = setInterval( function (){
        inst.dataCollection();
      }, 10);

    };


    this.loopTimer();



  }

  /**
   * Export data
   * TODO : add this to base class
   */
  dataCollection(){


    let  exportData = {

      ball_position_x: ball.position.x,
      ball_position_y: ball.position.y,
      paddle_position_x: paddle.position.x,
      paddle_position_y: paddle.position.y,
      timestamp : new Date().getTime()

    };

    this.context.get('export_arr').addObject(exportData);


  }










}
