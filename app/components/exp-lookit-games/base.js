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
    // Event listener for mouse and keyboard here
    document.addEventListener('keydown', this.keyDownHandler, false);
    document.addEventListener('keyup', this.keyUpHandler, false);
    this.canvas.requestPointerLock =  this.canvas.requestPointerLock || this.canvas.mozRequestPointerLock;
    this.canvas.requestPointerLock()
    mouseY =  1.1*this.Utils.SCALE;
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
    let currentHeight = hArr[currentRounds] * 0.05 + height;
    gravity = 2 * currentHeight / Math.pow(Tf, 2);
    ballvx = (1.0310 + 0.02) / Tf;
    initV = 0.5 * gravity * Tf;

  }

  /**
   * Generate Trajectory  parameters for discrete games (using Time Flight array)
   * @method generateTrajectoryParamsDiscrete
   * @param TfArr Time Flight array
   */
  generateTrajectoryParamsDiscrete(TfArr) {
    let Tf = TfArr[currentRounds];
    let height = 0.8;
    initX = 0.7510;
    gravity = 2 * height / Math.pow(Tf, 2);
    ballvx = (1.0310 + 0.02) / Tf;
    initV = 0.5 * gravity * Tf;
  }


  /**
   * Generate Trajectory  parameters for spatial discrete games  (using init velocity matrix )
   * @method generateTrajectoryParamsDiscreteSpatial
   * @param initVmatrix  init velocity matrix
   */
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

  /**
   * Create Uniform array of values
   * @method uniformArr
   * @param indexes
   * @returns {Array}
   */
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

    let leftBorder = 390 - 50 - 55 * treeIndex + 0.25 * Utils.SCALE;
    let topBorder = (0.914 + 0.05) * Utils.SCALE;
    let rightBorder = 390 + 0.25 * Utils.SCALE;
    let downBorder = (1.542 + 0.05) * Utils.SCALE;
    let imgURL = Utils.obstruction1;
    switch (treeIndex) {

      case 1:

        imgURL = Utils.obstruction1;

        break;

      case 2:

        imgURL = Utils.obstruction2;

        break;

      case 3:

        imgURL = Utils.obstruction3;
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
      }, 30);

    };

    this.loopTimer();

  }

  increaseScore() {
    this.currentScore++;
  }


  downIndicator(paddle,index){

    this.ctx.save();
    let indicator = {
      position : {x:paddle.position.x+paddle.dimensions.width/4, y: paddle.position.y + index*0.1*Utils.SCALE + 0.15*Utils.SCALE},
      dimensions: {width: paddle.dimensions.width/2, height: 0.05*Utils.SCALE}
    }
    this.ctx.globalAlpha = index*0.3;
    this.ctx.beginPath();
    this.ctx.strokeStyle = Utils.greenColor;
    this.ctx.moveTo(indicator.position.x , indicator.position.y);
    this.ctx.lineTo(indicator.position.x + indicator.dimensions.width / 2, indicator.position.y + indicator.dimensions.height);
    this.ctx.lineTo(indicator.position.x + indicator.dimensions.width, indicator.position.y );
    this.ctx.lineWidth = '6';
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.restore();

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

    this.drawScore();

    this.loopTimer = function () {
      let inst = this;
      gameLoop = window.requestAnimationFrame(function () {
        inst.loop();
      });
    };
    this.loopTimer();
  }


  /**
   * Create initial ball box object to start from
   * @method createBallBox
   * @param {int} paddleWidth
   */
  createBallBox(imageURL) {

    let leftBorder = 0.4 * Utils.SCALE;
    let topBorder = 1.2971 * Utils.SCALE;
    let rightBorder = (0.64) * Utils.SCALE;
    let downBorder = 1.5671 * Utils.SCALE;

    let image = new Image();
    image.src = imageURL;
    this.ctx.drawImage(image, leftBorder, topBorder, rightBorder - leftBorder, downBorder - topBorder);

  }


  //TODO: merge this with launcher implementation for paddle games
  discreteLauncer(imageURL) {

    this.ctx.beginPath();
    this.ctx.lineWidth = '8';
    this.ctx.strokeStyle = Utils.blueColor;

    let leftBorder = (initX - 0.05) * Utils.SCALE;
    let topBorder = (1.3671 - 0.05) * Utils.SCALE;
    let rightBorder = (initX + 0.07) * Utils.SCALE;
    let downBorder = (1.3871 + 0.15) * Utils.SCALE;

    let image = new Image();
    image.src = imageURL;
    this.ctx.drawImage(image, leftBorder, topBorder, rightBorder - leftBorder, downBorder - topBorder);


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

    this.loopTimer = function () {
      let inst = this;
      gameLoop = window.requestAnimationFrame(function () {
        inst.loop();
      });

      dataLoop = setTimeout(function () {
        inst.dataCollection();
      }, 30);

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

      window.clearInterval(0);

  }




  /**
   * @method basketObject
   * Basket object per Matlab coordinates
   * @param basket
   * @returns {*}
   */
  basketObject(basket) {

    let position = (this.canvas.height - mouseY)/this.canvas.height ;
    let radiusRim = 0.1;
    let leftBorder = (1.3310 - radiusRim) * Utils.SCALE;
    let topBorder = (1.3671 - position) * Utils.SCALE;
    let rightBorder = (1.3310 + radiusRim) * Utils.SCALE;
    let downBorder = (1.3671 + 0.17 - position) * Utils.SCALE;

    basket.position = {x: leftBorder, y: mouseY};
    basket.dimensions = {width: rightBorder - leftBorder, height: downBorder - topBorder};


    return basket;

  }


  /**
   * @method paddleHistory
   * Store paddle position and time history for velocity calculation
   */
  paddleHistory(paddle, initialTime) {


    paddle.times.push(this.getElapsedTime(initialTime));
    if(paddle.positions.length > 80){
      paddle.positions = paddle.positions.slice(-80);
    }
    paddle.positions.push((this.canvas.height - paddle.position.y) / this.canvas.height);

  }

  /**
   * @method basketObject
   * Basket object per Matlab coordinates
   * @param basket
   * @returns {paddle}
   */
  paddleObject(paddle){
    let position = (this.canvas.height - mouseY)/this.canvas.height ;
    let leftBorder = (1.3310-0.075)*Utils.SCALE ;
    let topBorder = (1.3671-position)*Utils.SCALE;
    let rightBorder = (1.3310+0.075)*Utils.SCALE;
    let downBorder =  (1.3671+0.02-position)*Utils.SCALE ;

    paddle.position = {x: leftBorder,y:mouseY};
    paddle.dimensions = {width: rightBorder - leftBorder, height: downBorder-topBorder};

    return paddle;

  }

  /**
   * Create initial ball object with state parameters
   * @method ballObject
   * @returns {{color: string, mass: number, impactPosition: number, startTime: number, positions: {x: number, y: number}[], position: {x: number, y: number}, velocity: number, state: string, hitstate: string, radius: number, impactTime: number}}
   */
  ballObject(){

    let iterator = 0.001;
    let positionY = initBallY+initV*(iterator)+0.5*-gravity*Math.pow(iterator,2);
    let positionX  = initX + ballvx*(iterator);
    let leftBorder =  (positionX-.0175)* Utils.SCALE;
    let downBorder =  (1.3571-positionY+.0175)*Utils.SCALE ;

    let  ball = {

      position: {x: leftBorder, y:downBorder},
      velocity: 0,
      mass: Utils.ballMass,
      radius: (0.037)*Utils.SCALE,
      state: 'start',
      impactTime: 0,
      hitstate:'',
      startTime:0,
      impactPosition:0,
      positions:[{x:0,y:0}],
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

    let  iterator =  this.getElapsedTime(initialTime);
    this.ctx.beginPath();

    let positionY = initBallY+initV*(iterator)+0.5*-gravity*Math.pow(iterator,2);
    let positionX  = initX + ballvx*(iterator);
    let leftBorder =  (positionX-.0175)* Utils.SCALE;
    let downBorder =  (1.3571-positionY+.0175)*Utils.SCALE ;
    ball.position.x = leftBorder;
    ball.position.y = downBorder;

  }

  /**
   * Draw the game score
   * @method drawScore
   */
  drawScore() {
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = Utils.scoreColor;
    this.ctx.fillText('Score: ' + this.currentScore, 8, 20);
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
    if(ball.positions.length > 80){
      ball.positions = ball.positions.slice(-80);
    }
    ball.positions.push(ball.position);
    ball.position.x = leftBorder;
    ball.position.y = this.canvas.height - positionY * this.canvas.height ;


  }

  /**
   * Randomize trial start time
   * @method trialStartTime
   * @returns {number} seconds
   */
  trialStartTime() {

    let min = this.context.minTime + 350;
    return ((Math.floor(Math.random() * (this.context.maxTime - min + 1)) + min) / 1000 );

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
  drawBall(ball,ballURL) {


    let image = new Image();
    image.src = ballURL;
    this.ctx.drawImage(image, ball.position.x, ball.position.y, ball.radius, ball.radius);

  }


  /**
   * Set position of the ball to initial coordinates to symbolize the start of the game
   * @method moveBallToStart
   * @param {object} ball object parameters
   * @param {boolean} gameOver set game to be over
   */
  moveBallToStart(ball,ballURL ,gameOver) {

    ball = this.ballObject();
    this.drawBall(ball,ballURL);

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


    let topBorder = 1.3671 * Utils.SCALE;

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
  paddleIsMoved(paddle){

    if( paddle.positions.length > 2 && paddle.position.y !== (this.canvas.height - paddle.positions[paddle.positions.length-3]*this.canvas.height)){

      return true;
    }

    // Check if paddle is moved outside the box limits
    if (paddle.position.y  < paddleBox.position.y - paddleBox.dimensions.height + paddle.dimensions.height) {


      return true;
    }



    return false;
  }


  paddleIsMovedPlain(paddle){

    if( paddle.positions.length > 2 && paddle.position.y !== (this.canvas.height - paddle.positions[paddle.positions.length-3]*this.canvas.height)){

      return true;
    }

    // Check if paddle is moved outside the box limits
    if (paddle.position.y  < paddleBox.position.y - paddle.dimensions.height) {


      return true;
    }


    return false;
  }


  drawImageObject(object,imageURL){

    let image = new Image();
    image.src = imageURL;
    this.ctx.drawImage(image, object.position.x, object.position.y, object.dimensions.width, object.dimensions.height);

  }


  /**
   * Set paddle coordinates up to velocity
   * @method paddleMove
   * @param {object} paddle
   */
  paddleMove(paddle,initialTime,ball) {


    //Do not go over the bottom border
    if(paddle.position.y > paddleBox.position.y + paddleBox.dimensions.height - paddle.dimensions.height){

      paddle.position.y = paddleBox.position.y + paddleBox.dimensions.height - paddle.dimensions.height;
    }


    if(ball.state === 'start' && currentRounds === 0 && paddle.position.y < paddleBox.position.y) {

      mouseY = paddle.position.y + 10;
    }

    this.paddleHistory(paddle,initialTime);


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


  onMouseMove(e){


    let border = paddleBox.position.y+paddleBox.dimensions.height/2;

    mouseY += e.movementY;

    if(e.movementY === 0){
      mouseY -= 1;
    }

    if(mouseY  > border && e.movementY >0){
      mouseY =  border;
    }


  }




}
