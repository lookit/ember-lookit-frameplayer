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
let jitterT = 0;
let Tf = 0.75;
let Height = 0.65;
let wrongSound = {};

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
    document.addEventListener("mousemove",  super.onMouseMove);
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

    bounceSound = new Audio(super.Utils.bouncingSound);
    bounceSound.load();

    goodJob = new Audio(super.Utils.crocSlurpSound);
    goodJob.load();

    ballCatchFail = new Audio(super.Utils.failcatchSound);
    ballCatchFail.load();

    crocEatingSound = new Audio(super.Utils.crocEatSound);
    crocEatingSound.load();
    audio = new Audio(super.Utils.rattleSound);
    audio.load();
    crocEatingSound.src =  super.Utils.crocEatSound;
    goodJob.src = super.Utils.crocSlurpSound;
    ballCatchFail.src = super.Utils.failcatchSound;
    bounceSound.src = super.Utils.bouncingSound;
    audio.src = super.Utils.rattleSound;
    audio.addEventListener('canplaythrough', this.initGame(), false);
    wrongSound = new Audio();
    wrongSound.src = super.Utils.wrongSound;

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
    paddle = super.paddleObject(paddle);
    let paddleBoxColor = super.Utils.blueColor;
    super.createPaddleBox(paddleBoxColor);
    super.generateTrajectoryParams(hArray,Height,Tf);
    super.createBallBox();
    this.drawImageAngle(target, target.imageURL,45);
    super.drawPaddle(paddle);
    super.paddleMove(paddle,initialTime);
    this.paddleBallCollision();
    let hitTheTarget = this.collisionDetection();
    let hitTheWall = super.wallCollision(ball);

    if (initialTime === 0 && super.currentRounds === 0 && !super.paddleIsMovedPlain(paddle)){

      audio.play();
    }

    if(ball.state === 'start'){
      super.moveBallToStart(ball, false);

      if(initialTime > 0 && super.paddleIsMovedPlain(paddle)){
        initialTime = new Date().getTime();
        paddleBoxColor = super.Utils.redColor;
        super.createPaddleBox(paddleBoxColor);
        wrongSound.play();
      }

      if (initialTime > 0 && super.getElapsedTime(initialTime) > jitterT) {

        audio.pause();
        ball.state = 'fall';
        initialTime = new Date().getTime();
      }

    }


    if(ball.state === 'fall' ){

      if(initialTime > 0 && super.getElapsedTime(initialTime) < 0.95) {
        super.trajectory(ball, initialTime);
      }

      if(initialTime > 0 && super.ballIsOnFloor(ball)) {
        ball.state = 'hit';
      }
      super.drawBall(ball);

    }

    if(ball.state === 'bounce'){

      super.bounceTrajectory(ball,paddle,initialTime);
      super.drawBall(ball);
    }


    if((hitTheTarget || hitTheWall) && ball.state !== 'done' ){

      ball.state = 'hit';
    }


    if(ball.state === 'hit'){
      // Remove ball and show in the starting point,
      //User should set the paddle to initial position , call stop after that

      if (ball.hitstate === 'very good') {
        goodJob.play();
        this.drawImageAngle(target, target.imageTargetReachedURL, 45);

      } else if(ball.hitstate === 'good'){
        crocEatingSound.play();
        this.drawImageAngle(target, super.Utils.crocclosednotongImage, 45);
      }else{

        ballCatchFail.play();
      }


      ball.state = 'done';

    }




    if(ball.state === 'done'){

      if(ball.hitstate === 'very good'){

        this.drawImageAngle(target, target.imageTargetReachedURL, 45);
      }

      if(ball.hitstate === 'good'){

        this.drawImageAngle(target, super.Utils.crocclosednotongImage, 45);
      }

      if(super.ballIsOnFloor(ball)){
        super.drawBall(ball);
      }

      super.paddleAtZero(paddle, hitTheTarget);

    }
    super.paddleMove(paddle,initialTime);


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

    let timeVector = this.vectorCalculation(time.slice(time.length-15,time.length));
    let positionVector = this.vectorCalculation(position.slice(position.length-15,position.length));

    return  this.getArraysum(this.arrayProduct(timeVector,positionVector))/this.getArraysum(this.arrayProduct(timeVector,timeVector));
  }



  /**
   *
   * Handle paddle collision here
   * Adjust velocity to the ball by restitution factor
   * @method paddleBallCollision
   */
  paddleBallCollision() {

    super.paddleMove(paddle,initialTime);
    //Detect the ball position on X axis , if the ball is between paddle edges
    if (ball.position.x >= (1.2810 - 0.025) * super.Utils.SCALE - 0.04*super.Utils.SCALE && ball.position.x <= (1.3810 + 0.025) * super.Utils.SCALE) {


      //Detect the ball position on Y axes, if the ball is within range  on Y axis
      let paddleDelta = paddle.positions[paddle.positions.length -1] - paddle.positions[paddle.positions.length -12];
      if(paddleDelta < 0.1){
        paddleDelta = 0.1;
      }

      if( Math.abs(ball.position.y - paddle.position.y) <= paddleDelta*super.Utils.SCALE  && ball.position.y - paddle.position.y>=0 ){
        let paddleVelocity = this.getPaddleVelocity(paddle.times, paddle.positions);
        super.trajectory(ball, initialTime);
        bounceSound.play();
        paddle.paddleLastMovedMillis = new Date().getTime();
        ball.impactTime = new Date().getTime() ;
        ball.impactPosition = (this.canvas.height - (paddle.position.y - paddle.dimensions.height - paddleDelta) ) / this.canvas.height ;
        let iterator = super.getElapsedTime(initialTime);
        ball.velocity = super.TrajectoryVars.initV - super.TrajectoryVars.gravity * iterator;
        paddle.releaseVelocity = -alpha * (ball.velocity - paddleVelocity) + paddleVelocity;
        //Fix for abrupt trajectory, make sure the trajectory is not negative
        // if(paddle.releaseVelocity <= 1){
        //   paddle.releaseVelocity  = 1;
        // }
        if (isNaN(paddle.releaseVelocity)) {
          paddle.releaseVelocity = 1.56;
        }
        ball.state = 'bounce';
        super.bounceTrajectory(ball,paddle,initialTime);
      }
    }

  }


  /**
   *
   * Check if ball reached the target
   * @method collisionDetection
   * @return {boolean}
   */
  collisionDetection() {


    let YL = (targetLocV-0.45)*super.Utils.SCALE;
    let YH = (targetLocV+0.12)*super.Utils.SCALE;
    let XH = targetLocH *super.Utils.SCALE;

    if (ball.position.y > YL && ball.position.y < YH  && ball.position.x > XH ) {
      let currenImpactCoord = Math.abs(ball.position.y - targetLocV*super.Utils.SCALE);

      if (currenImpactCoord < 0.087*super.Utils.SCALE){

        if(currenImpactCoord < 0.025*super.Utils.SCALE){

          ball.hitstate = 'very good';

        }else{

          ball.hitstate = 'good';
        }


      }else{

        ball.hitstate = 'hit';

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


    jitterT = super.trialStartTime();
    ball = super.ballObject();
    initialTime =0;
    initSoundPlaying = true;

    if(super.currentRounds >0 || (super.currentRounds === 0 && !super.paddleIsMovedPlain(paddle))) {
      audio.play();
    }
    //super.generateTrajectoryParams(hArray,0.65,0.75);
    audio.addEventListener('playing', function () {

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
