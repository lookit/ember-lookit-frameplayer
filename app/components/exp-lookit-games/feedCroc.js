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
let initialTime = 0;
let alpha = 0.7;
let hArray = [];
let targetLocH = 1.66;
let targetLocV = 0.69;
let jitterT = 0;
let Tf = 0.75;
let Height = 0.65;
let token = {};
let tokenReached = {};
let bricks = {};


let sounds = [];
let soundURLs = [];
let imageURLs = [];
let images = [];


const gameSound = {
  START: 0,
  BOUNCING: 1,
  CATCH_GREAT: 2,
  CATCH_GOOD: 3,
  FAIL:4
};

const gameImage = {
  PADDLE: 0,
  WALL_INITIAL: 1,
  WALL_MISSED: 2,
  BALL: 3,
  BALLBOX: 4,
  BRICKS_SMALL: 5,
  BRICKS_LARGE: 6,
  TOKEN: 7
};





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
    soundURLs = [super.Utils.drumRollSound, super.Utils.bouncingSound, super.Utils.brickHitlarge, super.Utils.brickHitsmall, super.Utils.ballcatchFailSound];
    imageURLs = [this.Utils.paddleImage, super.Utils.wallInitial, super.Utils.wallMissed, super.Utils.basketBall, super.Utils.basketBalls, super.Utils.smallbricksImage, super.Utils.largebricksImage, super.Utils.tokenImage];

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
      releaseVelocity: 1,
      positions: [],
      times: [],

    };
    hArray = super.generateHeights();


    let leftBorder = (1.48) * super.Utils.SCALE;
    let downBorder = (0.43) * super.Utils.SCALE;

    target = {

      dimensions: {width: 0.5 * super.Utils.SCALE, height: 0.5 * super.Utils.SCALE},
      position: {x: leftBorder, y: downBorder}
    };


    bricks = {

      dimensions: {width: 0.2 * super.Utils.SCALE, height: 0.2 * super.Utils.SCALE},
      position: {x: 1.7 * super.Utils.SCALE, y: 1.367 * super.Utils.SCALE}

    };


    token = {

      dimensions: {width: 0.21 * super.Utils.SCALE, height: 0.2 * super.Utils.SCALE},
      position: {x: 1.85 * super.Utils.SCALE, y: 0.34 * super.Utils.SCALE}

    };

    tokenReached = {

      dimensions: {width: token.dimensions.width * 2, height: token.dimensions.height * 2},
      position: {
        x: token.position.x - token.dimensions.width / 2,
        y: token.position.y - token.dimensions.height / 2
      }
    };

    super.fillAudioArray(soundURLs,sounds);
    super.fillImageArray(imageURLs,images);

    sounds[gameSound.START].addEventListener('canplaythrough', this.initGame(), false);
    sounds[gameSound.START].addEventListener('playing', function () {
      initialTime = new Date().getTime();
    });
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
    super.createBallBox(images[gameImage.BALLBOX]);
    super.drawImageObject(paddle, images[gameImage.PADDLE]);
    super.paddleMove(paddle, initialTime, ball);
    this.paddleBallCollision();
    super.drawImageObject(token, images[gameImage.TOKEN]);
    let hitTheTarget = this.collisionDetection();
    let hitTheWall = super.wallCollision(ball);

    if (initialTime === 0 && super.currentRounds === 0 && !super.paddleIsMovedPlain(paddle)) {

      sounds[gameSound.START].play();
    }

    if (ball.state === 'start') {
      super.moveBallToStart(ball, images[gameImage.BALL], false);
      if (initialTime > 0 && super.paddleIsMovedPlain(paddle)) {
        initialTime = new Date().getTime();
        paddleBoxColor = super.Utils.redColor;
        super.createPaddleBox(paddleBoxColor);
      }

      if (initialTime > 0 && super.getElapsedTime(initialTime) > jitterT) {
        sounds[gameSound.START].pause();
        sounds[gameSound.START].currentTime = 0;
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
      super.drawBall(ball, images[gameImage.BALL]);
    }

    if (ball.state === 'bounce') {
      super.bounceTrajectory(ball, paddle, initialTime);
      super.drawBall(ball, images[gameImage.BALL]);

    }


    if ((hitTheTarget || hitTheWall) && ball.state !== 'done') {

      ball.state = 'hit';
    }


    if (ball.state === 'hit') {
      // Remove ball and show in the starting point,
      //User should set the paddle to initial position , call stop after that
      super.drawImageObject(token, images[gameImage.TOKEN]);
      if (ball.hitstate === 'very good') {
        sounds[gameSound.CATCH_GREAT].play();
        super.increaseScore();

      } else if (ball.hitstate === 'good') {
        sounds[gameSound.CATCH_GOOD].play();
        super.increaseScore();

      } else {
        sounds[gameSound.FAIL].play();
      }


      ball.state = 'done';

    }


    if (ball.state === 'done') {

      if (ball.hitstate === 'very good') {
        super.drawImageObject(bricks, images[gameImage.BRICKS_LARGE]);
        super.drawImageObject(tokenReached, images[gameImage.TOKEN]);
      } else if (ball.hitstate === 'good') {
        super.drawImageObject(target, images[gameImage.WALL_MISSED]);
        super.drawImageObject(bricks, images[gameImage.BRICKS_SMALL]);
      } else {
        super.drawImageObject(target, images[gameImage.WALL_INITIAL]);
        super.drawBall(ball, images[gameImage.BALL]);
      }

      super.paddleAtZero(paddle, false);


    }

    if (ball.state !== 'done') {

      super.drawImageObject(target, images[gameImage.WALL_INITIAL]);
    }

    super.paddleMove(paddle, initialTime, ball);


  }


  static getArraysum(a) {

    return a.reduce((t, n) => t + n);

  }

  getArrayMean(a) {

    return FeedCroc.getArraysum(a) / a.length;

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

    return FeedCroc.getArraysum(this.arrayProduct(timeVector, positionVector)) / FeedCroc.getArraysum(this.arrayProduct(timeVector, timeVector));
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
        sounds[gameSound.BOUNCING].play();
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
    if (super.currentRounds > 0 || (super.currentRounds === 0 && !super.paddleIsMovedPlain(paddle))) {
      sounds[gameSound.START].play();
    }

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
