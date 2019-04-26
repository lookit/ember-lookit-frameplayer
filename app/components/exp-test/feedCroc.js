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
let paddle = {};
let ball = {};
let target = {};
let audio = {};
let bounceSound  = {};
let ballCatchFail = {};
let goodJob = {};

let initSoundPlaying = true;

let trajectories = [

  {velocity : {x: 3.9, y:-6.8}},
  {velocity : {x: 3.7, y:-7.2}},
  {velocity : {x: 3.5, y:-7.7}},
  {velocity : {x: 3.6, y:-7.6}}


];



/**
 * FeedCroc implementation for crocodile game
 */
export default class FeedCroc extends Base{


  /**
   * Constructor to get parameters from caller
   * @param context from component
   * @param document object from component
   */
  constructor(context,document){

    super(context,document);
    paddleWidth = this.canvas.width/20;
    paddleHeight = this.canvas.width/15;


  }

  /**
   * initialize on start button
   */
  init(){
    super.init();


    paddle = {

      dimensions: {width: paddleWidth*1.5, height: paddleHeight/5},
      position: {x: paddleWidth*10, y : this.canvas.height/2.5 + this.canvas.height/2  - paddleHeight },
      paddleLastMovedMillis: 100,
      velocity:super.Utils.paddleSpeed

    };

    target = {

      dimensions: {width: this.canvas.width/5, height: this.canvas.width/5},
      position : {x: this.canvas.width - this.canvas.width/3.5 , y:10 },
      imageURL : super.Utils.crocStartImage,
      imageTargetReachedURL : super.Utils.crocdoneImage

    };


    bounceSound  = new Audio(super.Utils.bouncingSound);
    bounceSound.load();

    goodJob  = new Audio(super.Utils.crocSlurpSound);
    goodJob.load();

    ballCatchFail = new Audio(super.Utils.ballcatchFailSound);
    ballCatchFail.load();

    audio  = new Audio(super.Utils.rattleSound);
    audio.load();
    audio.addEventListener('onloadeddata', this.initGame(),false);

  }




  drawPaddle () {
    this.ctx.beginPath();
    this.ctx.rect(paddle.position.x + 5, paddle.position.y, paddle.dimensions.width-10, paddle.dimensions.height);
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fill();
    this.ctx.closePath();
  }


  createPaddleBox() {
    this.ctx.beginPath();
    this.ctx.rect(paddleWidth*10 ,this.canvas.height/2.5 + this.canvas.height/2  - paddle.dimensions.height*5 ,paddle.dimensions.width,paddle.dimensions.height*5);
    this.ctx.fillStyle= "#020102";
    this.ctx.lineWidth = "8";
    this.ctx.strokeStyle = "#1931dd";
    this.ctx.stroke();
  }



  /**
   * Main game loop
   */
  loop() {

    super.loop();

    super.createBallBox(paddleWidth);
    this.createPaddleBox();
    this.drawPaddle();
    this.drawImage(target,target.imageURL);
    super.paddleMove(paddle);
    this.paddleBallCollision();


    let hitTheTarget = this.collisionDetection();
    let hitTheWall = super.wallCollision(ball);


    if(hitTheTarget || hitTheWall || super.gameOver ){
        // Remove ball and show in the starting point,
        //User should set the paddle to initial position , call stop after that


        if(hitTheTarget){
          if(!super.gameOver && goodJob.readyState === 4) {

            goodJob.play();
          }
          this.drawImage(target,target.imageTargetReachedURL);

        }else{
          if(!super.gameOver) {

             ballCatchFail.play();
          }
        }

        super.moveBallToStart(ball,true);
        super.paddleAtZero(paddle,hitTheTarget);




    }else{

      if(initSoundPlaying) {

        super.moveBallToStart(ball,false);

      }else{

        super.ballTrajectory(ball);

      }
    }


  }

  /**
   * Handle paddle collision here
   * Adjust velocity to the ball by restitution factor
   */
  paddleBallCollision() {
    if (ball.position.y >= (paddle.position.y - paddle.dimensions.height) && ball.position.y < (paddle.position.y + paddle.dimensions.height)) {
      if ((ball.position.x  > paddle.position.x - paddle.dimensions.width && ball.position.x < paddle.position.x + paddle.dimensions.width)) {
         if(new Date().getTime() -  paddle.paddleLastMovedMillis > 150 ) {
            bounceSound.play();
         }

          ball.velocity.y *= ball.restitution * 1.12;
          ball.velocity.x *= -ball.restitution;
          ball.position.y = paddle.position.y - ball.radius;
          paddle.paddleLastMovedMillis = new Date().getTime();
        }
      }
  }





  collisionDetection(){

      if ((ball.position.y < target.position.y + target.dimensions.height) && (ball.position.y > target.position.y + target.dimensions.height/1.6) && ball.position.x > target.position.x + 40 && ball.position.x <  target.position.x + 80) {
              return true;
      }

    return false;
  }


  /**
   * Initialize game state before each round
   *
   */
  initGame(){


    let trajectory = trajectories[Math.floor(Math.random()*trajectories.length)];

    ball = {

      position : {x: paddleWidth*5 + 20, y:(this.canvas.height-paddleWidth*2)},
      velocity : {x:trajectory.velocity.x, y:trajectory.velocity.y},
      mass: super.Utils.ballMass,
      radius: 10,
      restitution: -1.5,
      color:"#dadd0f"

    };



    initSoundPlaying = true;
    goodJob.src = super.Utils.crocSlurpSound;
    ballCatchFail.src = super.Utils.ballcatchFailSound;
    bounceSound.src = super.Utils.bouncingSound;
    audio.src = super.Utils.rattleSound;
    audio.play();
    audio.addEventListener("ended", function () {

         initSoundPlaying = false;
    });


    super.initGame();

  }

  /**
   * Export data
   */
  dataCollection(){


    let  exportData = {

      ball_position_x: ball.position.x,
      ball_position_y: ball.position.y,
      paddle_position_x: paddle.position.x,
      paddle_position_y: paddle.position.y,

    };

   // this.context.get('export_arr').addObject(exportData);
    super.storeData(exportData);

  }










}
