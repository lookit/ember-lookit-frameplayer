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
let paddleWidth = 0;
let paddleHeight = 0;
let paddleBox = {x:0,y:0};
const PADDLE_REST_TIME_MS = 1300;

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
    let height  =  580;
    this.canvas.height = height;
    this.canvas.width = height * 2;
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
    clearInterval(gameLoop);

  }

  /**
   * Get standard paddle width
   * @method paddleWidth
   * @return {number}
   */
  get paddleWidth(){

    return paddleWidth;
  }

  /**
   * Get standard paddle height
   * @method paddleHeight
   * @return {number}
   */
  get paddleHeight(){

    return paddleHeight;
  }

  /**
   * Draw paddle according to the location parameters
   * @method drawPaddle
   *
   */
  drawPaddle(x,y) {
    this.ctx.beginPath();
    this.ctx.rect(x, y, paddleWidth*1.3, paddleWidth/4);
    this.ctx.fillStyle = Utils.whiteColor;
    this.ctx.fill();
    this.ctx.closePath();
  }


  /**
   * The box symbolizes initial paddle location
   * @method createPaddleBox
   */
  createPaddleBox(x,y) {
    this.ctx.beginPath();
    paddleBox = {x:x,y:y};
    this.ctx.rect(x,y, paddleWidth*1.3 ,paddleWidth*1.3);
    this.ctx.fillStyle = Utils.blackColor;
    this.ctx.lineWidth = '8';
    this.ctx.strokeStyle = Utils.blueColor;
    this.ctx.stroke();
  }

  /**
   * Stop all the game functions
   * @method stop
   */
  stop() {

    clearInterval(dataLoop);
    clearInterval(gameLoop);

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
        }, 10);

    };

    this.loopTimer();

  }

  increaseScore() {
    this.currentScore++;
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
      gameLoop = setTimeout(function () {
        inst.loop();
      }, Utils.frameDelay);
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

    this.ctx.moveTo(paddleWidth * 5, this.canvas.height / 2.5 + this.canvas.height / 2 - paddleWidth * 1.5);
    this.ctx.lineTo(paddleWidth * 5, this.canvas.height / 2.5 + this.canvas.height / 2);
    this.ctx.lineTo(paddleWidth * 5 + paddleWidth, this.canvas.height / 2.5 + this.canvas.height / 2);
    this.ctx.lineTo(paddleWidth * 5 + paddleWidth, this.canvas.height / 2.5 + this.canvas.height / 2 - paddleWidth * 0.8);
    this.ctx.moveTo(paddleWidth * 5, this.canvas.height / 2.5 + this.canvas.height / 2 - paddleWidth * 1.5 + 4);
    this.ctx.lineTo(paddleWidth * 5 + paddleWidth / 3, this.canvas.height / 2.5 + this.canvas.height / 2 - paddleWidth * 1.5 + 4);
    this.ctx.stroke();
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

  /**
   * @method currentRound
   * get currrent round (Trial) of game.
   */
  get currentRounds(){

    return currentRounds;
  }


  set currentRounds(val){

    currentRounds = val;
  }

  /**
   * @method gameOver Get method if game is over
   * @return {boolean} game is over
   */
  get gameOver() {

    return gameOver;
  }

  /**
   * @method Utils Get shared Utils objects
   * Get Utilities game constants
   * @return {Utils}
   * @constructor
   */
  get Utils() {

    return Utils;
  }

  /**
   * @method drawImage Show current image
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
    // this.context.export_arr.push(exportData);
  }


  /**
   * Initialize current round of the game
   * @method initGame
   */
  initGame() {

    this.loopTimer = function () {
      let inst = this;
      gameLoop = setTimeout(function () {
        inst.loop();
      }, Utils.frameDelay);

      dataLoop = setTimeout(function () {
        inst.dataCollection();
      }, 10);

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
    this.clearInterval();
    if (score) {
      this.increaseScore();
    }
    this.gameOver = false;
    if (this.currentRounds < Utils.gameRounds) {
      this.initGame();

    }else {
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
   * Set velocity of moving object to scaling factor of the screen
   * @method velocityToScale
   * @param object
   * @return {{x: number, y: number}}
   */
  velocityToScale(object) {
    let trajectory  = {x: 0, y: 0 };
    let height  =  this.canvas.offsetHeight;
    let width  =  this.canvas.offsetWidth;
    let heightSF =  height / 600;
    let widthSF =  width / 1200;
    trajectory.x =  object.x * widthSF;
    trajectory.y =  object.y * heightSF;
    return trajectory;
  }

  /**
   * Create ball movement up to some trajectory
   * Set time coefficients scaleX,scaleY  as time parameters to control
   * speed in time
   * @method ballTrajectory
   * @param {object} ball
   * @param {number} scaleX
   * @param {number} scaleY
   */
  ballTrajectory(ball,scaleX=1,scaleY=1) {
    let gravity =  9.81;  // m / s^2
    //density of the environment
    let rho = 1; // kg/ m^3
    let Cd = 1;  // Dimensionless/
    // frontal area or frontal projection of the object (ball)
    let A = Math.PI * ball.radius * ball.radius / (10000); // m^2
    //Aerodynamics drag
    let Fx = -0.5 * Cd  * A  * rho * ball.velocity.x * ball.velocity.x * ball.velocity.x / Math.abs(ball.velocity.x);
    let Fy = -0.5 * Cd  *A  * rho * ball.velocity.y * ball.velocity.y * ball.velocity.y / Math.abs(ball.velocity.y);

    Fx = (isNaN(Fx) ? 0 : Fx);
    Fy = (isNaN(Fy) ? 0 : Fy);

    let ax = Fx ;
    let ay = gravity + (Fy );

    ball.velocity.x += ax * Utils.frameRate*scaleX;
    ball.velocity.y += ay * Utils.frameRate*scaleY;
    ball.position.x += ball.velocity.x * Utils.frameRate * 100 * scaleX;
    ball.position.y += ball.velocity.y * Utils.frameRate * 100 * scaleY ;

    this.ctx.translate(ball.position.x, ball.position.y);
    this.ctx.beginPath();
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

    this.ctx.beginPath();
    this.ctx.arc(paddleWidth * 5 + 20, this.canvas.height - paddleWidth * 2, ball.radius, 0, Math.PI * 2, true);
    this.ctx.fillStyle = ball.color;
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.restore();
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

    if (paddle.position.y >= paddleBox.y &&  paddle.position.y < paddleBox.y + paddleWidth*1.3 ) {
      // Check if paddle is not moving inside the box
      if(paddle.paddleLastMovedMillis === 0 || paddle.position.y !== paddle.prevposition.y){
        paddle.paddleLastMovedMillis = new Date().getTime();

      }else if(new Date().getTime() - paddle.paddleLastMovedMillis  >= PADDLE_REST_TIME_MS){
        paddle.paddleLastMovedMillis = 0;
        this.finishGame(score);
      }

    }else{

      paddle.paddleLastMovedMillis = 0;
    }

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
  paddleMove(paddle) {

    paddle.position.y = this.mouseY;

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
