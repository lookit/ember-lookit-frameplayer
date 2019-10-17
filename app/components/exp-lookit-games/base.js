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


const JITTER_MAX_TIME = 2000; // Max value for time Jitter randomizer
const JITTER_MIN_TIME = 850; // Min value for time Jitter randomizer
const DATA_COLLECTION_TIME = 20; // Data collection Timeout
let dataLoop = {}; // controlling data Collection loop
let gameLoop = {}; // controlling main game loop
let mouseY = 0; // mouse pointer  position on Y axis
let currentRounds = 0; // current game trial number
let maxRounds = 0;
let initBallY = 0.0; // Initial ball Y position
let initX = 0.52; // Initial ball X position
let initV = 0; //  Initial velocity
let gravity = 0;
let ballvx = 0;  // current ball velocity on X axis
let paddleBox = {
  position: {x: 0, y: 0},
  dimensions: {width: 0, height: 0}
};


// let INITIAL_SCREEN_WIDTH = this.canvas.width/1024; // X  screen from matlab
// let INITIAL_SCREEN_HEIGHT = this.canvas.height/768; // Y screen from matlab
const PADDLE_REST_TIME_MS = 2500;

/**
 * Base class for common game functions
 * TODO : some static methods could be extracted to a separate class, maybe Utils class
 * @class Base
 */
export default class Base {


  /**
   * Constructor to get parameters from caller
   * @method Constructor
   * @constructor Constructor
   * @param context from component
   * @param document object from component
   */
  constructor(context, document) {
    this.context = context;
    this.document = document;
    this.canvas = this.document.getElementById('gamesCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.currentScore = 0;
    this.canvas.style.cursor = 'none';
    // Event listener for mouse and keyboard here
    document.addEventListener('keydown', this.keyDownHandler, false);
    document.addEventListener('keyup', this.keyUpHandler, false);
    // this.canvas.requestPointerLock =  this.canvas.requestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
    // this.canvas.requestPointerLock()
    this.calculateCanvas();
    this.paddleBoxParameters();
    maxRounds = this.context.trialsNumber;
    this.loopTimer = function () {
      let inst = this;
      gameLoop = window.requestAnimationFrame(function () {
        inst.loop();
      });

    };


    this.dataTimer = function () {
      let inst = this;
      dataLoop = setTimeout(function () {
        inst.dataCollection();
      }, DATA_COLLECTION_TIME);

    };

  }


  paddleBoxParameters() {
    let leftBorder = (1.2035) * Utils.SCALE;
    let topBorder = (1.3671) * Utils.SCALE;
    let rightBorder = (1.4585) * Utils.SCALE;
    let downBorder = (1.5671) * Utils.SCALE;
    paddleBox.position.x = leftBorder;
    paddleBox.position.y = topBorder;
    paddleBox.dimensions.width = rightBorder - leftBorder;
    paddleBox.dimensions.height = downBorder - topBorder;
  }

  /**
   * Calculate canvas based on current Width Height
   * of the screen and initial Aspect ratio.
   * Currently using Matlab implementation Aspect ratio (4:3)
   * @method calculateCanvas
   */
  calculateCanvas(){

    //  this.canvas.height =  screen.height ;
    //  this.canvas.width = screen.width;
    //  let ratio = this.canvas.height/this.canvas.width;
    //  let height = this.Utils.SCREEN_HEIGHT;
    //  if(ratio >= 0.6 && ratio < 0.7 ){
    //    height = 800;
    //  }else if(ratio >= 0.7){
    //    height = 900;
    //  }
    //
    // this.Utils.SCALE  =  this.context.scale_factor * (this.canvas.height/height);

    // this.canvas.height = 768 ;
    // this.canvas.width =  1024;
    // this.Utils.SCALE  =  420;

    if(screen.height < screen.width) {
      this.canvas.height = screen.height;
      let coefficient = screen.height/768;
      this.canvas.width = coefficient * 1024;
      this.Utils.SCALE  =  420 * coefficient;
    }else{
      this.canvas.width = screen.width;
      let coefficient = screen.width/768;
      this.canvas.height = coefficient * 768;
      this.Utils.SCALE  =  420 * coefficient;
    }


  }


  /**
   * Initialize or start the game loop here
   * @method init
   */
  init() {
    this.currentScore = 0;
    this.currentRounds = 0;
    clearInterval(dataLoop);
    this.dataTimer();
  }

  generateHeights() {

    return this.uniformArr([1,5,9]);
  }



  /**
   * Generate main trajectory parameters per trial
   * @method generateTrajectoryParams
   * @param hArr array of equally distributed height
   * @param height height correction coefficient
   * @param Tf Flight time coefficient
   */
  generateTrajectoryParams(hArr, height) {
    let currentHeight = hArr[currentRounds] * 0.05 + height;
    let Tf = 0.75; // Time Flight for trajectory
    initX = 0.52;
    gravity = 2 * currentHeight / Math.pow(Tf, 2);
    ballvx = (1.051) / Tf;
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
    ballvx = (1.051) / Tf;
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
    ballvx = (1.051) / Tf;
    initV = 0.15 * initVmatrix[currentRounds] + 0.45;
    initX = 0.7510;
    initBallY = -0.02;
  }


  /**
   * Create and draw box for initial paddle location.
   * The box symbolizes initial paddle location in all games
   * @param color {int} Color of the Paddle box
   * @param fill {boolean} Set solid color paddle box
   * @method createPaddleBox
   */
  createPaddleBox(color = Utils.blueColor, fill = false) {

    if(fill){

      this.ctx.fillStyle = color;
      this.ctx.fillRect(paddleBox.position.x, paddleBox.position.y, paddleBox.dimensions.width, paddleBox.dimensions.height);

    }else{

      this.ctx.beginPath();
      this.ctx.rect(paddleBox.position.x, paddleBox.position.y, paddleBox.dimensions.width, paddleBox.dimensions.height);
      this.ctx.fillStyle = color;
      this.ctx.lineWidth = '8';
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }



  }


  get currentRounds() {

    return currentRounds;
  }

  set currentRounds(val) {

    currentRounds = val;
  }


  /**
   * Create Uniform array of values
   * @method uniformArr
   * @param vals {array} Array of values that  needed to be equally distributed
   * @return {array} array
   */
  uniformArr(vals) {
    let arr = [];
    vals.forEach((v) => {
      arr = arr.concat(Array(maxRounds / vals.length).fill(v));

    });

    return Utils.shuffle(arr);

  }



  stop() {

    clearInterval(dataLoop);

  }

  /**
   * Abstract method
   * Triggered when participant pressed some key on keyboard
   * @method keyDownHandler
   * @param {object} e event
   */
  keyDownHandler(e) {

    console.log(e);
  }

  /**
   * Abstract method
   * Triggered when participant released some key on keyboard
   * @method keyUpHandler
   * @param {object} e event
   */
  keyUpHandler(e) {

    console.log(e);
  }


  /**
   * Data collection abstract method
   * Executing method only once in DATA_COLLECTION_TIME timeout
   * @method dataCollection
   */
  dataCollection() {


    this.dataTimer();

  }

  /**
   * Current score accumulator
   * @method increaseScore
   */
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

    //this.drawScore();

    this.loopTimer();
  }


  /**
   * Create initial ball box object to start from
   * @method createLauncher
   * @param {object} Image object
   */
  createLauncher(image) {

    let leftBorder = 0.4 * Utils.SCALE;
    let topBorder = 1.2971 * Utils.SCALE;
    let rightBorder = (0.64) * Utils.SCALE;
    let downBorder = 1.5671 * Utils.SCALE;

    this.ctx.drawImage(image, leftBorder, topBorder, rightBorder - leftBorder, downBorder - topBorder);

  }

  /**
   * Set maximum number of trials per game
   * @method setMaxTrials
   * @param {int} trials
   */
  setMaxTrials(trials){

    maxRounds = trials;

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
   * @return {object} {{initX: number, ballvx: number, gravity: number, initV: number}}
   * @constructor
   */
  get TrajectoryVars() {

    return {initX: initX, gravity: gravity, ballvx: ballvx, initV: initV};
  }


  /**
   * Show current image
   * @method drawImage
   * @param {object} object  Current object with x,y position, width , height and URL of the image to show
   * @param {object} image Image object
   */
  drawImage(object, image) {
    this.ctx.fillStyle = Utils.blackColor;
    this.ctx.fillRect(object.position.x, object.position.y, object.dimensions.width, object.dimensions.height);
    this.ctx.drawImage(image, object.position.x, object.position.y, object.dimensions.width, object.dimensions.height);
  }


  /**
   * Fill image array with objects according to URL sources
   * @method fillImageArray
   * @param {array} array of URLs
   * @param {array} array of created objects
   */
  fillImageArray(urlArr,imgArr){

    urlArr.forEach(
      url =>{
        let img = new Image();
        img.src = url;
        imgArr.push(img);
      }

    );

  }

  /**
   * Fill audio array with objects according to URL sources
   * @method fillAudioArray
   * @param {array} array of URLs
   * @param {array} array of created objects
   */
  fillAudioArray(urlArr,audioArr){

    urlArr.forEach(
      url =>{
        let audio = new Audio();
        audio.src = url;
        audio.load();
        audioArr.push(audio);
      }

    );

  }

  /**
   * Store data and pass to  Lookit platform variable
   * @method storeData
   * @param {array} export Data array of objects with all data passed to Lookit platform
   */
  storeData(exportData) {

    this.context.get('export_arr').addObject(exportData);

  }


  /**
   * Initialize current round of the game
   * @method initGame
   */
  initGame() {

    this.loopTimer();

  }


  /**
   * Finish current round and check for rounds left
   * @method finishGame
   * @param score {boolean} should increase score
   */
  finishGame(score) {

    this.currentRounds++;
    this.clearInterval();
    cancelAnimationFrame(gameLoop);
    if (score) {
      this.increaseScore();
    }
    if (this.currentRounds < maxRounds) {
      this.initGame();

    } else {
      this.context.set('showInstructions', true);
      this.context.stopRecorder().finally(() => {
        this.context.destroyRecorder();
        this.context.send('export');
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
   * Basket object per Matlab coordinates
   * @method basketObject
   * @param basket paddle parameters
   * @return {object} basket parameters
   */
  basketObject(basket) {

    let position = (this.canvas.height - mouseY)/this.canvas.height ;
    let radiusRim = 0.1;
    let leftBorder = (1.3310 - radiusRim) * Utils.SCALE;
    let topBorder = (1.3671 - position) * Utils.SCALE;
    let rightBorder = (1.3310 + radiusRim) * Utils.SCALE;
    let downBorder = (1.5371 - position) * Utils.SCALE;

    basket.position = {x: leftBorder, y: mouseY};
    basket.dimensions = {width: rightBorder - leftBorder, height: downBorder - topBorder};


    return basket;

  }


  /**
   * Store paddle position and time history for velocity calculation
   * @method paddleHistory
   * @param {object} paddle
   * @param {int} trial initial Time in Unixtime
   */
  paddleHistory(paddle, initialTime) {


    paddle.times.push(this.getElapsedTime(initialTime));
    if(paddle.positions.length > 80){
      paddle.positions = paddle.positions.slice(-80);
    }
    paddle.positions.push((this.canvas.height - paddle.position.y) / this.canvas.height);

  }

  /**
   * Paddle object per Matlab coordinates
   * @method paddleObject
   * @param {object} paddle
   * @return {object} paddle {position: {x: number, y: number}, dimensions: {width: number, height: number}}
   */
  paddleObject(paddle){
    let position = (this.canvas.height - mouseY)/this.canvas.height ;
    let leftBorder = (1.256)*Utils.SCALE ;
    let topBorder = (1.3671-position)*Utils.SCALE;
    let rightBorder = (1.406)*Utils.SCALE;
    let downBorder =  (1.3871-position)*Utils.SCALE ;

    paddle.position = {x: leftBorder,y:mouseY};
    paddle.dimensions = {width: rightBorder - leftBorder, height: downBorder-topBorder};

    return paddle;

  }

  /**
   * Create initial ball object with state parameters for all games
   * Initial state is always 'start' for each game trial
   * @method ballObject
   * @return {object} ball  {{color: string, impactPosition: number, startTime: number, positions: {x: number, y:
   * number}[],
   * position: {x: number, y: number}, velocity: number, state: string, hitstate: string, radius: number, impactTime: number}}
   */
  ballObject(){

    let iterator = 0.001;
    let positionY = initBallY+initV*(iterator)+0.5*-gravity*Math.pow(iterator,2);
    let positionX  = initX + ballvx*(iterator);
    let leftBorder =  (positionX- 0.0175) * Utils.SCALE;
    let downBorder =  (1.3746-positionY) * Utils.SCALE ;

    return {

      position: {x: leftBorder, y: downBorder},
      velocity: 0,
      radius: (0.037) * Utils.SCALE,
      state: 'start',
      impactTime: 0,
      hitstate: '',
      startTime: 0,
      impactPosition: 0,
      positions: [{x: 0, y: 0}],
      color: Utils.yellowColor

    };
  }

  /**
   * Get elapsed time as iterator in seconds
   * @method getElapsedTime
   * @param intialTime {int} Unixtime formatted time
   * @return {number}  difference in seconds between current time and intialTime, decimal
   */
  getElapsedTime(intialTime) {

    return (new Date().getTime() - intialTime) / 1000;
  }

  /**
   * Projectile motion trajectory per maximum distance
   * @method trajectory
   * @param ball {Object} {position: {x: number, y: number}, radius: number, dimensions: {width: number, height:
   * number}}
   * @param initialTime {int}
   */
  trajectory(ball, initialTime) {

    let  iterator =  this.getElapsedTime(initialTime);
    this.ctx.beginPath();

    let positionY = initBallY+initV*(iterator)+0.5*-gravity*Math.pow(iterator,2);
    let positionX  = initX + ballvx*(iterator);
    let leftBorder =  (positionX- 0.0175)* Utils.SCALE;
    let downBorder =  (1.3746-positionY)*Utils.SCALE ;
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
   * Randomize trial start time
   * @method trialStartTime
   * @return {number} seconds
   */
  trialStartTime() {

    return ((Math.floor(Math.random() * (JITTER_MAX_TIME - JITTER_MIN_TIME + 1)) + JITTER_MIN_TIME) / 1000 );

  }

  /**
   * Check if ball is on the floor and missed target
   * @method ballIsOnFloor
   * @param ball {position: {x: number, y: number}, radius: number, dimensions: {width: number, height:
   * number}}
   * @return {boolean}
   */
  ballIsOnFloor(ball){

    return ball.position.y > paddleBox.position.y + paddleBox.dimensions.height - 0.048 * Utils.SCALE;
  }

  /**
   * Draw ball per x,y ball location
   * @method drawBall
   * @param ball {Object} {position: {x: number, y: number}, radius: number, dimensions: {width: number, height:
   * number}}
   */
  drawBall(ball,image) {

    this.ctx.drawImage(image, ball.position.x, ball.position.y, ball.radius, ball.radius);

  }


  /**
   * Set position of the ball to initial coordinates to symbolize the start of the game
   * @method moveBallToStart
   * @param {object} ball {position: {x: number, y: number}, radius: number, dimensions: {width: number, height: number}} object parameters set game to be over
   * @param {object} Image object
   */
  moveBallToStart(ball,image) {

    ball = this.ballObject();
    this.drawBall(ball,image);

  }

  /**
   * Check if user returned paddle to initial coordinates and call finish of the game to restart
   * current round
   * Check if paddle is stationary for PADDLE_REST_TIME_MS, if yes proceed to the next trial
   * @method paddleAtZero
   * @param {object} paddle {position: {x: number, y: number}, dimensions: {width: number, height: number}}
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
   * @method paddleIsMoved
   * @param {object} paddle parameters object {position: {x: number, y: number}, dimensions: {width: number, height: number}}
   * @param {boolean} checkPaddleHeight if height needed for reference (bounce game)
   * @return {boolean}
   */
  paddleIsMoved(paddle,checkPaddleHeight = false){

    if( paddle.positions.length > 2 && paddle.position.y !== (this.canvas.height - paddle.positions[paddle.positions.length-3]*this.canvas.height)){

      return true;
    }

    let paddleHeight = 0;
    if(checkPaddleHeight){
      paddleHeight = paddle.dimensions.height;
    }

    // Check if paddle is moved outside the box limits
    return paddle.position.y < paddleBox.position.y - paddleBox.dimensions.height + paddleHeight;

  }



  /**
   * Draw image object according to object parameters
   * @method  drawImageObject
   * @param {object} {position: {x: number, y: number}, dimensions: {width: number, height: number}}
   * @param {object} image
   */
  drawImageObject(object,image){

    this.ctx.drawImage(image, object.position.x, object.position.y, object.dimensions.width, object.dimensions.height);

  }


  /**
   * Set paddle coordinates up to velocity
   * Check if paddle not going past the paddle box bottom border
   * Move paddle inside paddle Box upon start of the game
   * @method paddleMove
   * @param {object} paddle {position: {x: number, y: number}, dimensions: {width: number, height: number}}
   * @param {int} initialTime,  Initial time (Unixtime) for current game round
   * @param {object} ball {position: {x: number, y: number}, radius: number, dimensions: {width: number, height: number}}
   */
  paddleMove(paddle,initialTime,ball) {


    //Do not go over the bottom border
    if(paddle.position.y > paddleBox.position.y + paddleBox.dimensions.height - paddle.dimensions.height){

      paddle.position.y = paddleBox.position.y + paddleBox.dimensions.height - paddle.dimensions.height;
    }

    // Move paddle inside paddle Box upon start of the game
    if(ball.state === 'start' && currentRounds === 0 && paddle.position.y < paddleBox.position.y) {

      mouseY = paddle.position.y + 0.0238 * Utils.SCALE;
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

  /**
   * Increment current position cursor by movementY value (difference in y coordinate between the given event and the
   * previous mousemove event )
   * Check initial cursor position, if the positio is lower then low paddle box border, stop t\
   * mouse pointer updates.
   * @method onMouseMove
   * @param e {Event} currrent mouse event
   */
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
