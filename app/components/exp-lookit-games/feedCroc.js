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
let initialTime = 0;
let alpha = 0.7;
let hArray = [];
let targetLocH = 1.66;
let targetLocV = 0.69;
let jitterT = 0;
let Tf = 0.75;
let Height = 0.65;
let token = {};
let bricks = {};


let paddleImg = {};
let brickImg = {};
let tokenImg = {};
let ballImg = {};
let wallImg = {};
let ballBoxImg = {};


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

    document.addEventListener("mousemove", super.onMouseMove);
    paddle = {

      position: {x: 0, y: 0},
      dimensions: {width: 0, height: 0},
      paddleLastMovedMillis: 100,
      velocity: super.Utils.paddleSpeed,
      releaseVelocity: 1,
      positions: [],
      times: [],
      imageURL: this.Utils.paddleImage

    };
    hArray = super.generateHeights();


    let leftBorder = (1.48) * super.Utils.SCALE;
    let downBorder = (0.43) * super.Utils.SCALE;

    target = {

      dimensions: {width: 0.5 * super.Utils.SCALE, height: 0.5 * super.Utils.SCALE},
      position: {x: leftBorder, y: downBorder},
      imageURL: super.Utils.wallMissed,
      imageTargetReachedURL: super.Utils.wallInitial

    };


    bricks = {

      dimensions: {width: 0.2 * super.Utils.SCALE, height: 0.2 * super.Utils.SCALE},
      position: {x: 1.7 * super.Utils.SCALE, y: 1.367 * super.Utils.SCALE},
      imageURL: super.Utils.smallbricksImage

    };


    token = {

      dimensions: {width: 0.21 * super.Utils.SCALE, height: 0.2 * super.Utils.SCALE},
      position: {x: 1.85 * super.Utils.SCALE, y: 0.34 * super.Utils.SCALE},
      imageURL: super.Utils.tokenImage

    };

    bounceSound = new Audio(super.Utils.bouncingSound);
    bounceSound.load();

    goodJob = new Audio(super.Utils.brickHitlarge);
    goodJob.load();

    ballCatchFail = new Audio(super.Utils.ballcatchFailSound);
    ballCatchFail.load();

    crocEatingSound = new Audio(super.Utils.brickHitsmall);
    crocEatingSound.load();
    audio = new Audio(super.Utils.drumRollSound);
    audio.load();
    crocEatingSound.src = super.Utils.brickHitsmall;
    goodJob.src = super.Utils.brickHitlarge;
    ballCatchFail.src = super.Utils.ballcatchFailSound;
    bounceSound.src = super.Utils.bouncingSound;


    paddleImg = new Image();
    paddleImg.src = paddle.imageURL;

    brickImg = new Image();
    brickImg.src = bricks.imageURL;

    wallImg = new Image();
    wallImg.src = target.imageURL;

    tokenImg = new Image();
    tokenImg.src = token.imageURL;

    ballImg = new Image();
    ballImg.src = super.Utils.basketBall;

    ballBoxImg = new Image();
    ballBoxImg.src = super.Utils.basketBalls;


    audio.src = super.Utils.drumRollSound;
    audio.addEventListener('canplaythrough', this.initGame(), false);

    super.init();
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
    super.generateTrajectoryParams(hArray, Height, Tf);
    super.createBallBox(ballBoxImg);
    super.drawImageObject(paddle, paddleImg);
    super.paddleMove(paddle, initialTime, ball);
    this.paddleBallCollision();
    super.drawImageObject(token, tokenImg);
    let hitTheTarget = this.collisionDetection();
    let hitTheWall = super.wallCollision(ball);

    if (initialTime === 0 && super.currentRounds === 0 && !super.paddleIsMovedPlain(paddle)) {

      audio.play();
    }

    if (ball.state === 'start') {
      super.moveBallToStart(ball, ballImg, false);
      if (initialTime > 0 && super.paddleIsMovedPlain(paddle)) {
        initialTime = new Date().getTime();
        paddleBoxColor = super.Utils.redColor;
        super.createPaddleBox(paddleBoxColor);
      }

      if (initialTime > 0 && super.getElapsedTime(initialTime) > jitterT) {

        audio.pause();
        audio.currentTime = 0;
        ball.state = 'fall';
        initialTime = new Date().getTime();
      }

    }


    if (ball.state === 'fall') {
      if (initialTime > 0 && super.getElapsedTime(initialTime) < 0.95) {
        super.trajectory(ball, initialTime);
      }

      if (initialTime > 0 && super.ballIsOnFloor(ball)) {
        ball.state = 'hit';
      }
      super.drawBall(ball, ballImg);
    }

    if (ball.state === 'bounce') {
      super.bounceTrajectory(ball, paddle, initialTime);
      super.drawBall(ball, ballImg);

    }


    if ((hitTheTarget || hitTheWall) && ball.state !== 'done') {

      ball.state = 'hit';
    }


    if (ball.state === 'hit') {
      // Remove ball and show in the starting point,
      //User should set the paddle to initial position , call stop after that
      super.drawImageObject(token, tokenImg);
      if (ball.hitstate === 'very good') {
        goodJob.play();
        super.increaseScore();

      } else if (ball.hitstate === 'good') {
        crocEatingSound.play();
        super.increaseScore();

      } else {
        ballCatchFail.play();
      }


      ball.state = 'done';

    }


    if (ball.state === 'done') {

      if (ball.hitstate === 'very good') {

        bricks.imageURL = super.Utils.largebricksImage;
        brickImg.src = bricks.imageURL;
        super.drawImageObject(bricks, brickImg);
        let token2 = {

          dimensions: {width: token.dimensions.width * 2, height: token.dimensions.height * 2},
          position: {
            x: token.position.x - token.dimensions.width / 2,
            y: token.position.y - token.dimensions.height / 2
          }
        }


        super.drawImageObject(token2, tokenImg);
      } else if (ball.hitstate === 'good') {

        target.imageURL = super.Utils.wallMissed;
        bricks.imageURL = super.Utils.smallbricksImage;
        brickImg.src = bricks.imageURL;
        wallImg.src = target.imageURL;
        super.drawImageObject(target, wallImg);
        super.drawImageObject(bricks, brickImg);
      } else {
        target.imageURL = super.Utils.wallInitial;
        super.drawImageObject(target, wallImg);
        super.drawBall(ball, ballImg);
      }

      super.paddleAtZero(paddle, false);


    }

    if (ball.state !== 'done') {

      super.drawImageObject(target, wallImg);
    }

    super.paddleMove(paddle, initialTime, ball);


  }


  getArraysum(a) {

    return a.reduce((t, n) => t + n);

  }

  getArrayMean(a) {

    return this.getArraysum(a) / a.length;

  }

  subtractFromEachElement(a, val) {

    return a.map((v, index) => v - val);

  }

  arrayProduct(a1, a2) {

    return a1.map((value, index) => value * a2[index]);

  }

  vectorCalculation(a) {

    return this.subtractFromEachElement(a, this.getArrayMean(a));

  }

  /**
   * @method getPaddleVelocity
   * sum((time-mean(time)).*(position-mean(position)))/sum((time-mean(time)).*(time-mean(time)))
   * @param time
   * @param position
   * @returns {number}
   */
  getPaddleVelocity(time, position) {

    let timeVector = this.vectorCalculation(time.slice(time.length - 15, time.length));
    let positionVector = this.vectorCalculation(position.slice(position.length - 15, position.length));

    return this.getArraysum(this.arrayProduct(timeVector, positionVector)) / this.getArraysum(this.arrayProduct(timeVector, timeVector));
  }


  /**
   *
   * Handle paddle collision here
   * Adjust velocity to the ball by restitution factor
   * @method paddleBallCollision
   */
  paddleBallCollision() {

    super.paddleMove(paddle, initialTime, ball);
    //Detect the ball position on X axis , if the ball is between paddle edges
    if (ball.position.x >= (1.256) * super.Utils.SCALE - 0.04 * super.Utils.SCALE && ball.position.x <= (1.406) * super.Utils.SCALE) {


      //Detect the ball position on Y axes, if the ball is within range  on Y axis
      let paddleDelta = paddle.positions[paddle.positions.length - 1] - paddle.positions[paddle.positions.length - 20];
      if (paddleDelta < 0.1) {
        paddleDelta = 0.1;
      }

      if (Math.abs(ball.position.y - paddle.position.y) <= paddleDelta * super.Utils.SCALE && ball.position.y - paddle.position.y >= 0) {
        let paddleVelocity = this.getPaddleVelocity(paddle.times, paddle.positions);
        super.trajectory(ball, initialTime);
        bounceSound.play();
        paddle.paddleLastMovedMillis = new Date().getTime();
        ball.impactTime = new Date().getTime();
        ball.impactPosition = (this.canvas.height - (paddle.position.y - paddle.dimensions.height - paddleDelta)) / this.canvas.height;
        let iterator = super.getElapsedTime(initialTime);
        ball.velocity = super.TrajectoryVars.initV - super.TrajectoryVars.gravity * iterator;
        paddle.releaseVelocity = -alpha * (ball.velocity - paddleVelocity) + paddleVelocity;
        //Fix for abrupt trajectory, make sure the trajectory is not negative
        if (paddle.releaseVelocity > 1.4) {
          paddle.releaseVelocity = 1.4;
        }
        if (isNaN(paddle.releaseVelocity)) {
          paddle.releaseVelocity = 1.56;
        }
        ball.state = 'bounce';
        super.bounceTrajectory(ball, paddle, initialTime);
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


    let YL = (targetLocV - 0.43) * super.Utils.SCALE;
    let YH = (targetLocV + 0.72) * super.Utils.SCALE;
    let XH = targetLocH * super.Utils.SCALE;

    if (ball.state !== 'done' && ball.position.y > YL && ball.position.y < YH && ball.position.x > XH) {
      let currenImpactCoord = Math.abs(ball.position.y - targetLocV * super.Utils.SCALE);

      if (currenImpactCoord < 0.27 * super.Utils.SCALE) {

        if (currenImpactCoord < 0.03 * super.Utils.SCALE) {

          ball.hitstate = 'very good';

        } else {

          ball.hitstate = 'good';
        }


      } else {

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
    initialTime = 0;

    token.dimensions = {width: 0.21 * super.Utils.SCALE, height: 0.2 * super.Utils.SCALE};
    target.imageURL = super.Utils.wallInitial;
    wallImg.src = target.imageURL;
    if (super.currentRounds > 0 || (super.currentRounds === 0 && !super.paddleIsMovedPlain(paddle))) {
      audio.play();
    }
    //super.generateTrajectoryParams(hArray,0.65,0.75);
    audio.addEventListener('playing', function () {
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
      ball_position_x: ball.position.x / this.canvas.width,
      ball_position_y: (this.canvas.height - ball.position.y) / this.canvas.height,
      paddle_center_x: paddle.position.x + paddle.dimensions.width / 2,
      paddle_width: paddle.dimensions.width,
      paddle_position_y: (this.canvas.height - paddle.position.y) / this.canvas.height,
      trial: super.currentRounds,
      timestamp: new Date().getTime()

    };

    super.storeData(exportData);

  }

}
