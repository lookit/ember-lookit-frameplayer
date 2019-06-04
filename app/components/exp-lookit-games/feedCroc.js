/*
 * Developed by Gleb Iakovlev on 5/3/19 9:09 PM.
 * Last modified 4/27/19 3:26 PM.
 * Copyright (c) Cognoteq Software Solutions 2019.
 * All rights reserved
 */
import Base from './base';
/**
 *
 * @submodule games
 *
 */

let paddle = {};
let ball = {};
let target = {};
let audio = {};
let bounceSound = {};
let ballCatchFail = {};
let goodJob = {};
let crocEatingSound = {};
let initSoundPlaying = true;
let initialTime = 0;
let alpha = 0.7;
let hArray = [];
let targetLocH = 1.66;
let targetLocV = 0.77;

let Tf = 0.75;
let Height = 0.65;

/**
 * @class FeedCroc
 * @extends Base
 * Main implementation of Feed the crocodile game.
 * The user will operate with paddle to bounce the ball into the crocodile mouth.
 * The trajectory is randomized with various values in trajectories array
 *
 */
export default class FeedCroc extends Base {


  /**
   * Constructor to get parameters from caller
   * @method constructor
   * @constructor constructor
   * @param context from component
   * @param document object from component
   */
  constructor(context, document) {

    super(context, document);

  }

  /**
   * Main point to start the game.
   * Initialize static parameters and preload sounds here
   * @method init
   */
  init() {
    super.init();

    paddle = {

      position: {x: 0, y: 0},
      dimensions: {width: 0 , height:0},
      paddleLastMovedMillis: 100,
      velocity: super.Utils.paddleSpeed,
      releaseVelocity:1,
      positions:[],
      times:[]

    };
    hArray = super.generateHeights();



    let leftBorder = (1.57)*super.Utils.SCALE ;
    let topBorder = (0.567)*super.Utils.SCALE;
    let rightBorder = (2.17)*super.Utils.SCALE;
    let downBorder =  (0.987)*super.Utils.SCALE ;

    target = {

      dimensions: {width: rightBorder-leftBorder, height: topBorder-downBorder},
      position: {x: leftBorder, y: downBorder},
      imageURL: super.Utils.croctongImage,
      imageTargetReachedURL: super.Utils.crocdoneImage

    };

    paddle = super.paddleObject(paddle);
    bounceSound = new Audio(super.Utils.bouncingSound);
    bounceSound.load();

    goodJob = new Audio(super.Utils.crocSlurpSound);
    goodJob.load();

    ballCatchFail = new Audio(super.Utils.ballcatchFailSound);
    ballCatchFail.load();

    crocEatingSound = new Audio(super.Utils.crocEatSound);
    crocEatingSound.load();


    audio = new Audio(super.Utils.rattleSound);
    audio.load();
    crocEatingSound.src =  super.Utils.crocEatSound;
    goodJob.src = super.Utils.crocSlurpSound;
    ballCatchFail.src = super.Utils.ballcatchFailSound;
    bounceSound.src = super.Utils.bouncingSound;
    audio.src = super.Utils.rattleSound;
    audio.addEventListener('onloadeddata', this.initGame(), false);

  }




  /**
   *
   * Main loop of the game.
   * Set initial position of the ball in a box and starting rattling sound (initSoundPlaying).
   * After that  start ball trajectory.
   * If ball hits the target or missed the target (hits any screen edge) wait util user places the paddle to starting position and move
   * the ball to initial position.
   * Increase the score if ball hits the target.
   * @method loop
   */
  loop() {

    super.loop();


    super.generateTrajectoryParams(hArray,Height,Tf);
    super.createBallBox();
    super.createPaddleBox();
    this.drawImageAngle(target, target.imageURL,45);
    super.paddleMove(paddle,initialTime);
    super.drawPaddle(paddle);
    this.paddleBallCollision();
    let hitTheTarget = this.collisionDetection();
    let hitTheWall = super.wallCollision(ball);

    if (hitTheTarget || hitTheWall || super.gameOver) {
      // Remove ball and show in the starting point,
      //User should set the paddle to initial position , call stop after that

      if (hitTheTarget) {

        if (ball.state === 'very good') {
          goodJob.play();
          this.drawImageAngle(target, target.imageTargetReachedURL, 45);

        } else {
          crocEatingSound.play();
          this.drawImageAngle(target, super.Utils.crocclosednotongImage, 45);
        }


      } else {
        if (!super.gameOver) {

          ballCatchFail.play();
        }
      }

      super.moveBallToStart(ball, true);
      super.paddleAtZero(paddle, hitTheTarget);

    } else {

      if (initSoundPlaying) {

        super.moveBallToStart(ball, false);

      } else {


        if(ball.state === 'bounce'){
          super.bounceTrajectory(ball,paddle,initialTime);

        }else{

          super.trajectory(ball,initialTime);
        }

        super.drawBall(ball);
      }
    }

    // this.ctx.beginPath();
    // this.ctx.arc(targetLocH*super.Utils.SCALE, targetLocV*super.Utils.SCALE, 6, 0, Math.PI * 2, false);
    // this.ctx.fillStyle = super.Utils.redColor;
    // this.ctx.fill();
    // this.ctx.closePath();

  }



  getArraysum(a){

    return a.reduce((t,n)=>t+n);

  }

  getArrayMean(a){

    return this.getArraysum(a)/a.length;

  }

  subtractFromEachElement(a,val){

    return  a.map((v,index)=>v-val);

  }

  arrayProduct(a1,a2){

    return a1.map((value,index)=> value*a2[index]);

  }

  vectorCalculation(a){

    return this.subtractFromEachElement(a,this.getArrayMean(a));

  }

  /**
   * @method getPaddleVelocity
   * sum((time-mean(time)).*(position-mean(position)))/sum((time-mean(time)).*(time-mean(time)))
   * @param time
   * @param position
   * @returns {number}
   */
  getPaddleVelocity(time,position){

    let timeVector = this.vectorCalculation(time.slice(time.length-9,time.length));
    let positionVector = this.vectorCalculation(position.slice(position.length-9,position.length));

    return  this.getArraysum(this.arrayProduct(timeVector,positionVector))/this.getArraysum(this.arrayProduct(timeVector,timeVector));
  }



  /**
   *
   * Handle paddle collision here
   * Adjust velocity to the ball by restitution factor
   * @method paddleBallCollision
   */
  paddleBallCollision() {

    if((ball.position.y - paddle.position.y <= 0.05*super.Utils.SCALE && ball.position.y - paddle.position.y>=0 )&&(ball.position.x > (1.2810-0.025)*super.Utils.SCALE && ball.position.x < (1.3810+0.025)*super.Utils.SCALE )){

      bounceSound.play();
      paddle.paddleLastMovedMillis = new Date().getTime();
      ball.impactTime = new Date().getTime();
      ball.impactPosition = (this.canvas.height - paddle.position.y) / this.canvas.height;
      let paddleVelocity = this.getPaddleVelocity(paddle.times, paddle.positions);
      let iterator = super.getElapsedTime(initialTime);
      ball.velocity =super.TrajectoryVars.initV - super.TrajectoryVars.gravity * iterator;
      paddle.releaseVelocity = -alpha * (ball.velocity - paddleVelocity) + paddleVelocity;
      if(isNaN(paddle.releaseVelocity) ) {
        paddle.releaseVelocity = 1.56;
      }
      ball.state = 'bounce';

    }

  }


  /**
   *
   * Check if ball reached the target
   * @method collisionDetection
   * @return {boolean}
   */
  collisionDetection() {


    let YL = (targetLocV-0.25)*super.Utils.SCALE;
    let YH = (targetLocV+0.1)*super.Utils.SCALE;
    let XH = targetLocH *super.Utils.SCALE;

    if (ball.position.y > YL && ball.position.y < YH  && ball.position.x > XH ) {
      let currenImpactCoord = Math.abs(ball.position.y - targetLocV*super.Utils.SCALE);

      if (currenImpactCoord < 0.0825*super.Utils.SCALE){

        if(currenImpactCoord < 0.025*super.Utils.SCALE){

          ball.state = 'very good';

        }else{

          ball.state = 'good';
        }


      }else{

        ball.state = 'hit';

      }


      return true;

    }



    return false;
  }


  /**
   *
   * Initialize each game round with initial object parameters
   * Randomize number of obstructions
   * Reset the sounds sources for older browser versions
   * @method initGame
   */
  initGame() {



    ball = super.ballObject();

    initSoundPlaying = true;
    audio.play();
    //super.generateTrajectoryParams(hArray,0.65,0.75);
    audio.addEventListener('ended', function () {

      initSoundPlaying = false;
      initialTime = new Date().getTime();
    });
    super.initGame();

  }

  /**
   *
   * Export data
   * @method dataCollection
   */
  dataCollection() {
    super.dataCollection();
    let exportData = {
      game_type: 'feedCroc',
      ball_position_x: ball.position.x,
      ball_position_y: ball.position.y,
      paddle_position_x: paddle.position.x,
      paddle_position_y: paddle.position.y,
      trial: super.currentRounds,
      timestamp: new Date().getTime()

    };

    super.storeData(exportData);

  }

}
