/*
 * Developed by Gleb Iakovlev on 5/3/19 9:09 PM.
 * Last modified 4/29/19 10:46 PM.
 * Copyright (c) Cognoteq Software Solutions 2019.
 * All rights reserved
 */
import Utils from './utils';

/**
 *
 * @submodule games
 *
 */

let dataLoop = {};
let gameLoop = {};
let mouseY = 0;
let gameOver = false;
let paddleWidth = 0;
let paddleHeight = 0;
let currentRounds = 0;
let initBallY = 0.0;
let initX = 0.52;
let initV = 0;
let gravity = 0;
let ballvx = 0;
let paddleBox = {
  position: {x: 0, y: 0},
  dimensions: {width: 0, height: 0}
};


// let INITIAL_SCREEN_WIDTH = this.canvas.width/1024; // X  screen from matlab
// let INITIAL_SCREEN_HEIGHT = this.canvas.height/768; // Y screen from matlab
const PADDLE_REST_TIME_MS = 800;

/**
 * Base class for common game functions
 * @class Base
 */
export default class Base {


  /**
   * @method Constructor to get parameters from caller
   * @constructor Constructor to get parameters from caller
   * @param context from component
   * @param document object from component
   */
  constructor(context, document) {
    this.context = context;
    this.document = document;
    this.canvas = this.document.getElementById('gamesCanvas');
    let height = 768;
    this.canvas.height = height;
    this.canvas.width = 1024;
    this.ctx = this.canvas.getContext('2d');
    this.currentScore = 0;
    this.canvas.style.cursor = 'none';
    paddleWidth = this.canvas.width / 20;
    paddleHeight = this.canvas.width / 15;
    // Event listener for mouse and keyboard here
    document.addEventListener('keydown', this.keyDownHandler, false);
    document.addEventListener('keyup', this.keyUpHandler, false);
    document.addEventListener('mousemove', this.onMouseMove);

  }


  /**
   * Initialize or start the game loop here
   * @method init
   */
  init() {
    this.currentScore = 0;
    this.currentRounds = 0;
    clearInterval(dataLoop);

  }

  /**
   * Get standard paddle width
   * @method paddleWidth
   * @return {number}
   */
  get paddleWidth() {

    return paddleWidth;
  }

  /**
   * Get standard paddle height
   * @method paddleHeight
   * @return {number}
   */
  get paddleHeight() {

    return paddleHeight;
  }

  /**
   * Draw paddle according to the location parameters
   * @method drawPaddle
   *
   */
  drawPaddle(paddle) {
    this.ctx.beginPath();
    this.ctx.rect(paddle.position.x, paddle.position.y, paddle.dimensions.width, paddle.dimensions.height);
    this.ctx.fillStyle = Utils.whiteColor;
    this.ctx.fill();
    this.ctx.closePath();
  }


  generateHeights() {

    return this.uniformArr([1, 1]);
  }


  /**
   * Generate main trajectory parameters per trial
   * @method generateTrajectoryParams
   * @param hArr array of equally distributed height
   * @param height height correction coefficient
   * @param Tf Flight time coefficient
   */
  generateTrajectoryParams(hArr, height, Tf) {
    Tf = this.context.flightTime / 100;
    height = this.context.height / 100;
    let currentHeight = hArr[currentRounds] * 0.05 + height;
    gravity = 2 * currentHeight / Math.pow(Tf, 2);
    ballvx = (1.0310 + 0.02) / Tf;
    initV = 0.5 * gravity * Tf;

  }

  generateTrajectoryParamsDiscrete(TfArr) {
    let Tf = TfArr[currentRounds];
    let height = 0.8;
    initX = 0.7510;
    gravity = 2 * height / Math.pow(Tf, 2);
    ballvx = (1.0310 + 0.02) / Tf;
    initV = 0.5 * gravity * Tf;
  }


  generateTrajectoryParamsDiscreteSpatial(initVmatrix) {
    let Tf = 0.9;
    gravity = 1.8;
    ballvx = (1.0310 + 0.02) / Tf;
    initV = 0.15 * initVmatrix[currentRounds] + 0.45;
    initX = 0.7510;
    initBallY = -0.02;
  }


  /**
   * The box symbolizes initial paddle location
   * @method createPaddleBox
   */
  createPaddleBox(color = Utils.blueColor) {
    this.ctx.beginPath();
    let leftBorder = (1.8560 - 0.6525) * Utils.SCALE;
    let topBorder = (1.3671 - 0.05 + 0.05) * Utils.SCALE;
    let rightBorder = (2.1110 - 0.6525) * Utils.SCALE;
    let downBorder = (1.3671 + 0.15 + 0.05) * Utils.SCALE;
    paddleBox.position.x = leftBorder;
    paddleBox.position.y = topBorder;
    paddleBox.dimensions.width = rightBorder - leftBorder;
    paddleBox.dimensions.height = downBorder - topBorder;
    this.ctx.rect(paddleBox.position.x, paddleBox.position.y, paddleBox.dimensions.width, paddleBox.dimensions.height);
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = '8';
    this.ctx.strokeStyle = color;
    this.ctx.stroke();


  }


  uniformArr(vals) {
    let arr = [];
    vals.forEach((v) => {
      arr = arr.concat(Array(Utils.gameRounds / vals.length).fill(v));

    });

    return this.shuffle(arr);

  }

  /**
   * Fisher-Yates shuffle for uniform distribution
   * @param array
   * @return {array}
   */
  shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  /**
   * Tree object with coordinates
   * @method treeObject
   * @param treeIndex
   * @returns {{imageURL: *, position: {x: number, y: number}, dimensions: {width: number, height: number}}}
   */
  treeObject(treeIndex = 1) {

    let leftBorder = 400 - 50 - 55 * treeIndex + 0.25 * Utils.SCALE;
    let topBorder = (0.914 + 0.05) * Utils.SCALE;
    let rightBorder = 400 + 0.25 * Utils.SCALE;
    let downBorder = (1.542 + 0.05) * Utils.SCALE;
    let imgURL = Utils.treeImage;
    switch (treeIndex) {

      case 1:

        imgURL = Utils.treeImage;

        break;

      case 2:

        imgURL = Utils.tree2Image;

        break;

      case 3:

        imgURL = Utils.tree3Image;
        break;


    }


    return {
      position: {x: leftBorder, y: topBorder},
      dimensions: {width: rightBorder - leftBorder, height: downBorder - topBorder},
      imageURL: imgURL
    };

  }


  /**
   * Stop all the game functions
   * @method stop
   */
  stop() {

    clearInterval(dataLoop);

  }

  /**
   * Abstract method
   * Triggered when participant pressed some key on keyboard
   * @method keyDownHandler
   * @param e event
   */
  keyDownHandler(e) {

    console.log(e);
  }

  /**
   * Abstract method
   * Triggered when participant released some key on keyboard
   * @method keyUpHandler
   * @param e event
   */
  keyUpHandler(e) {

    console.log(e);
  }


  /**
   * Data collection abstract method
   * @method dataCollection
   */
  dataCollection() {


    this.loopTimer = function () {
      let inst = this;
      dataLoop = setTimeout(function () {
        inst.dataCollection();
      }, 50);

    };

    this.loopTimer();

  }

  increaseScore() {
    this.currentScore++;
  }


  /**
   * Abstract Main game loop method
   * @method loop
   */
  loop() {

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = Utils.blackColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();

    this.loopTimer = function () {
      let inst = this;
      gameLoop = window.requestAnimationFrame(function () {
        inst.loop();
      })
    };
    this.loopTimer();
  }


  /**
   * Create initial ball box object to start from
   * @method createBallBox
   * @param {int} paddleWidth
   */
  createBallBox() {

    this.ctx.beginPath();
    this.ctx.lineWidth = '8';
    this.ctx.strokeStyle = Utils.blueColor;

    let leftBorder = 0.45 * Utils.SCALE;
    let topBorder = (1.3471 - 0.05) * Utils.SCALE;
    let rightBorder = (0.59) * Utils.SCALE;
    let downBorder = (1.3671 + 0.15 + 0.05) * Utils.SCALE;

    this.ctx.rect(leftBorder, downBorder, rightBorder - leftBorder, topBorder - downBorder);
    this.ctx.fillStyle = Utils.blackColor;
    this.ctx.lineWidth = '8';
    this.ctx.strokeStyle = Utils.blueColor;
    this.ctx.stroke();
    this.ctx.closePath();


    let InnerleftBorder = (0.52) * Utils.SCALE;
    let InnertopBorder = (1.2971) * Utils.SCALE;
    let InnerrightBorder = (0.59) * Utils.SCALE;
    let InnerdownBorder = (1.5171 - 0.12) * Utils.SCALE;

    this.ctx.beginPath();
    this.ctx.rect(InnerleftBorder, InnerdownBorder, InnerrightBorder - InnerleftBorder, InnertopBorder - InnerdownBorder);
    this.ctx.fillStyle = Utils.blackColor;
    this.ctx.strokeStyle = Utils.blackColor;
    this.ctx.lineWidth = '8';
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.closePath();
  }


  //TODO: merge this with launcher implementation for paddle games
  discreteLauncer() {

    this.ctx.beginPath();
    this.ctx.lineWidth = '8';
    this.ctx.strokeStyle = Utils.blueColor;

    let leftBorder = (initX - 0.05) * Utils.SCALE;
    let topBorder = (1.3671 - 0.05) * Utils.SCALE;
    let rightBorder = (initX + 0.07) * Utils.SCALE;
    let downBorder = (1.3871 + 0.15) * Utils.SCALE;

    this.ctx.rect(leftBorder, downBorder, rightBorder - leftBorder, topBorder - downBorder);
    this.ctx.fillStyle = Utils.blackColor;
    this.ctx.lineWidth = '8';
    this.ctx.strokeStyle = Utils.blueColor;
    this.ctx.stroke();
    this.ctx.closePath();


    let InnerleftBorder = (initX) * Utils.SCALE;
    let InnertopBorder = (1.2971) * Utils.SCALE;
    let InnerrightBorder = (initX + 0.07) * Utils.SCALE;
    let InnerdownBorder = (1.5171 - 0.12) * Utils.SCALE;

    this.ctx.beginPath();
    this.ctx.rect(InnerleftBorder, InnerdownBorder, InnerrightBorder - InnerleftBorder, InnertopBorder - InnerdownBorder);
    this.ctx.fillStyle = Utils.blackColor;
    this.ctx.strokeStyle = Utils.blackColor;
    this.ctx.lineWidth = '8';
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.closePath();
  }

  /**
   * @method mouseY Set current cursor position
   * @param {number} mouse cursor Y coordinate
   */
  set mouseY(val) {

    mouseY = val;
  }

  /**
   * @method  mouseY Get current cursor position
   * @return {number} mouse cursor Y coordinate
   */
  get mouseY() {

    return mouseY;
  }

  /**
   * @method gameOver Set method if game is over
   * @param {boolean} game is over
   */
  set gameOver(val) {

    gameOver = val;
  }

  get currentRounds() {

    return currentRounds;
  }

  set currentRounds(val) {

    currentRounds = val;
  }


  /**
   * Get method if game is over
   * @method gameOver
   * @return {boolean} game is over
   */
  get gameOver() {

    return gameOver;
  }

  /**
   * Get shared Utils objects
   * @method Utils
   * Get Utilities game constants
   * @return {Utils}
   * @constructor
   */
  get Utils() {

    return Utils;
  }


  /**
   * Get trajectory parameters per each trial
   * @method TrajectoryVars
   * @returns {{initX: number, ballvx: number, gravity: number, initV: number}}
   * @constructor
   */
  get TrajectoryVars() {

    return {initX: initX, gravity: gravity, ballvx: ballvx, initV: initV};
  }


  /**
   * Show current image
   * @method drawImage
   * @param {object} Current object with x,y position, width , height and URL of the image to show
   * @param {String} URL
   */
  drawImage(object, URL) {
    this.ctx.fillStyle = Utils.blackColor;
    this.ctx.fillRect(object.position.x, object.position.y, object.dimensions.width, object.dimensions.height);
    let image = new Image();
    image.src = URL;
    this.ctx.drawImage(image, object.position.x, object.position.y, object.dimensions.width, object.dimensions.height);
  }


  /**
   * Show current image
   * @method drawImage
   * @param {object} Current object with x,y position, width , height and URL of the image to show
   * @param {String} URL
   */
  drawImageAngle(object, URL, angle) {
    this.ctx.save();
    this.ctx.fillStyle = Utils.blackColor;
    this.ctx.fillRect(object.position.x - object.dimensions.width, object.position.y, object.dimensions.width * 4, object.dimensions.height * 4);
    //find center of rotation
    let x = (object.position.x + object.dimensions.width / 2);
    let y = (object.position.y + object.dimensions.height);
    this.ctx.translate(x, y);
    this.ctx.rotate(angle * Math.PI / 180);
    let image = new Image();
    image.src = URL;
    this.ctx.drawImage(image, -(object.dimensions.height / 2), -(object.dimensions.width / 2), object.dimensions.height, object.dimensions.width);
    this.ctx.restore();
  }

  /**
   * Disabled for now
   * @method storeData Store data in proposed array
   * @param {array} exportData
   */
  storeData(exportData) {

    this.context.get('export_arr').addObject(exportData);

  }


  /**
   * Initialize current round of the game
   * @method initGame
   */
  initGame() {
    mouseY = 0;
    this.loopTimer = function () {
      let inst = this;
      gameLoop = window.requestAnimationFrame(function () {
        inst.loop();
      })

      dataLoop = setTimeout(function () {
        inst.dataCollection();
      }, 50);

    };

    this.loopTimer();

  }


  /**
   * Finish current round and check for rounds left
   * @method finishGame
   * @param {boolean} should increase score
   */
  finishGame(score) {

    this.currentRounds++;
    console.log('finishGame');
    this.clearInterval();
    cancelAnimationFrame(gameLoop);
    if (score) {
      this.increaseScore();
    }
    this.gameOver = false;
    if (this.currentRounds < Utils.gameRounds) {
      this.initGame();

    } else {
      this.context.set('showInstructions', true);
      this.context.stopRecorder().finally(() => {
        this.context.destroyRecorder();
        this.context.send('next');
      });
    }

  }

  /**
   * Clear all current running game loops
   * @method clearInterval
   */
  clearInterval() {
    for (let i = 1; i < 99999; i++) {
      window.clearInterval(i);
    }
  }


  /**
   * @method basketCenter
   * Center of the basket target
   * @param basket
   * @returns {{color: string, position: {x: number, y: number}, dimensions: {width: number, height: number}}}
   */
  basketCenter(basket) {
    let radiusRim = 0.1;
    let leftBorder = (1.3310 - radiusRim / 5) * Utils.SCALE;
    let topBorder = basket.position.y;
    let rightBorder = (1.3310 + radiusRim / 5) * Utils.SCALE;


    return {
      position: {x: leftBorder, y: topBorder},
      dimensions: {width: rightBorder - leftBorder, height: (radiusRim / 5) * Utils.SCALE},
      color: Utils.redColor
    };
  }


  /**
   * @method basketObject
   * Basket object per Matlab coordinates
   * @param basket
   * @returns {*}
   */
  basketObject(basket) {

    let radiusRim = 0.1;
    let leftBorder = (1.3310 - radiusRim) * Utils.SCALE;
    let topBorder = 1.3671 * Utils.SCALE;
    let rightBorder = (1.3310 + radiusRim) * Utils.SCALE;
    let downBorder = (1.3671 + 0.17) * Utils.SCALE;

    basket.position = {x: leftBorder, y: topBorder};
    basket.dimensions = {width: rightBorder - leftBorder, height: downBorder - topBorder};

    return basket;

  }


  /**
   * @method paddleHistory
   * Store paddle position and time history for velocity calculation
   */
  paddleHistory(paddle, initialTime) {


    paddle.times.push(this.getElapsedTime(initialTime));
    paddle.positions.push((this.canvas.height - paddle.position.y) / this.canvas.height);

  }

  /**
   * @method basketObject
   * Basket object per Matlab coordinates
   * @param basket
   * @returns {paddle}
   */
  paddleObject(paddle) {

    let leftBorder = (1.3310 - 0.075) * Utils.SCALE;
    let topBorder = (1.3671 - 0 - paddle.position.y) * Utils.SCALE;
    let rightBorder = (1.3310 + 0.075) * Utils.SCALE;
    let downBorder = (1.3671 + 0.02 - paddle.position.y) * Utils.SCALE;

    paddle.position = {x: leftBorder, y: downBorder};
    paddle.dimensions = {width: rightBorder - leftBorder, height: downBorder - topBorder};

    return paddle;

  }


  ballObject() {

    let iterator = 0.01;
    let positionY = initBallY + initV * (iterator) + 0.5 * -gravity * Math.pow(iterator, 2);
    let positionX = initX + ballvx * (iterator);
    let leftBorder = (positionX - .0175) * Utils.SCALE;
    let downBorder = (1.3571 - positionY + .0175) * Utils.SCALE;

    let ball = {

      position: {x: leftBorder, y: downBorder},
      velocity: 0,
      mass: Utils.ballMass,
      radius: (0.04) * Utils.SCALE / 2,
      state: 'start',
      impactTime: 0,
      hitstate: '',
      impactPosition: 0,
      positions: [{x: 0, y: 0}],
      color: Utils.yellowColor

    };

    return ball;
  }

  /**
   * @method getElapsedTime
   * Get elapsed time as iterator in seconds
   * @param intialTime
   * @returns {number}
   */
  getElapsedTime(intialTime) {

    return (new Date().getTime() - intialTime) / 1000;
  }

  /**
   * @method trajectory
   * Projectile motion trajectory per maximum distance
   * @param ball
   * @param ballvx
   * @param initV
   * @param Gravity
   * @param iterator
   */
  trajectory(ball, initialTime) {

    let iterator = this.getElapsedTime(initialTime);
    this.ctx.beginPath();

    let positionY = initBallY + initV * (iterator) + 0.5 * -gravity * Math.pow(iterator, 2);
    let positionX = initX + ballvx * (iterator);
    let leftBorder = (positionX - .0175) * Utils.SCALE;
    let downBorder = (1.3571 - positionY + .0175) * Utils.SCALE;
    ball.positions.push(ball.position);
    ball.position.x = leftBorder;
    ball.position.y = downBorder;

  }


  /**
   * @method bounceTrajectory
   * Trajectory after bounce
   * @param ball
   * @param paddle
   * @param initialTime
   */
  bounceTrajectory(ball, paddle, initialTime) {
    let Xiterator = this.getElapsedTime(initialTime);
    let Yiterator = this.getElapsedTime(ball.impactTime);


    this.ctx.beginPath();
    let positionY = ball.impactPosition + paddle.releaseVelocity * (Yiterator) + 0.5 * -gravity * Math.pow(Yiterator, 2);
    let positionX = initX + ballvx * (Xiterator);
    let leftBorder = (positionX - .0175) * Utils.SCALE;
    let downBorder = (1.3571 - positionY + .0175) * Utils.SCALE;

    ball.positions.push(ball.position);
    ball.position.x = leftBorder;
    ball.position.y = downBorder;


  }

  trialStartTime() {

    return ((Math.floor(Math.random() * (this.context.maxTime - this.context.minTime + 1)) + this.context.minTime) / 1000 ) + 0.25;

  }

  /**
   * @method ballIsOnFloor
   * Check if ball is on the floor and missed target
   * @param ball
   * @returns {boolean}
   */
  ballIsOnFloor(ball){

    return ball.position.y > paddleBox.position.y + paddleBox.dimensions.height;
  }

  /**
   * @method drawBall
   * Draw ball per x,y ball location
   * @param ball
   */
  drawBall(ball) {

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.translate(ball.position.x, ball.position.y);
    this.ctx.arc(0, 0, ball.radius, 0, Math.PI * 2, true);
    this.ctx.fillStyle = ball.color;
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.restore();

  }


  /**
   * Set position of the ball to initial coordinates to symbolize the start of the game
   * @method moveBallToStart
   * @param {object} ball object parameters
   * @param {boolean} gameOver set game to be over
   */
  moveBallToStart(ball, gameOver) {

    ball = this.ballObject();
    this.drawBall(ball);

    if (gameOver) {
      this.gameOver = true;
    }
  }

  /**
   * Check if user returned paddle to initial coordinates and call finish of the game to restart
   * current round
   * Check if paddle is stationary for PADDLE_REST_TIME_MS, if yes proceed to the next trial
   * @method paddleAtZero
   * @param {object} paddle
   * @param {boolean} score should increase score
   */
  paddleAtZero(paddle, score) {


    let topBorder = (1.3671 - 0.05 + 0.05) * Utils.SCALE;

    if (paddle.position.y >= topBorder) {
      // Check if paddle is not moving inside the box
      let paddleTimeArrSize = paddle.positions.length;
      if (paddle.paddleLastMovedMillis === 0 || (paddle.position.y !== (this.canvas.height - paddle.positions[paddleTimeArrSize - 1] * this.canvas.height))) {
        paddle.paddleLastMovedMillis = new Date().getTime();

      } else if (new Date().getTime() - paddle.paddleLastMovedMillis >= PADDLE_REST_TIME_MS) {
        paddle.paddleLastMovedMillis = 0;
        this.finishGame(score);
      }

    } else {

      paddle.paddleLastMovedMillis = 0;
    }

  }

  /**
   * Check if paddle is moved ahead of time
   * @param paddle
   * @returns {boolean}
   */
  paddleIsMoved(paddle) {


    if (paddle.positions.length > 2 && paddle.position.y !== (this.canvas.height - paddle.positions[paddle.positions.length - 2] * this.canvas.height)) {

      return true;
    }

    // Check if paddle is moved outside the box limits
    if (paddle.position.y < paddleBox.position.y) {

      return true;
    }

    return false;
  }

  /**
   * Minimal implementation of interruption between rounds
   * @method waitSeconds
   * @param {int} iMilliSeconds
   */
  waitSeconds(iMilliSeconds) {
    let counter = 0;
    let start = new Date().getTime();
    let end = 0;

    while (counter < iMilliSeconds) {
      end = new Date().getTime();
      counter = end - start;

    }
  }

  /**
   * Set paddle coordinates up to velocity
   * @method paddleMove
   * @param {object} paddle
   */
  paddleMove(paddle, initialTime) {


    if (this.mouseY > 0) {
      paddle.position.y = this.mouseY;
    }

    if (paddle.position.y > paddleBox.position.y + paddleBox.dimensions.height - paddle.dimensions.height) {

      paddle.position.y = paddleBox.position.y + paddleBox.dimensions.height - paddle.dimensions.height;
    }


    this.paddleHistory(paddle, initialTime);


  }


  /**
   * Walls and target collisions detection
   * @method wallCollision
   * @param {object} ball
   * @return {boolean} if hit any edge of the screen
   */
  wallCollision(ball) {

    if (ball.position.y > this.canvas.height + ball.radius || ball.position.x > this.canvas.width + ball.radius || ball.position.x < ball.radius) {

      return true;

    }

    return false;

  }

  onMouseMove(e) {

    mouseY = e.clientY;

  }


}
