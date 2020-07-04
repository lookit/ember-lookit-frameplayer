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
let currentRounds = 0; // current game trial number
let maxRounds = 0;
let initBallY = 0.0; // Initial ball Y position
let initX = 0.52; // Initial ball X position
let initV = 0; //  Initial velocity
let gravity = 0;
let ballvx = 0;  // current ball velocity on X axis
let ball = {};
let gameState = {
  initialTime : 0,
  startTime: 0

};
let exportData = {};


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


    let isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

    this.canvas.requestPointerLock =  this.canvas.requestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
    if(isSafari) {
      this.canvas.requestPointerLock();
    }else{

      //fix for google chrome and firefox, request pointer lock only after full screen event
      document.addEventListener('fullscreenchange', (event) => {

        if (document.fullscreenElement) {
          document.fullscreenElement.requestPointerLock();
          document.fullscreenElement.style.setProperty('cursor', 'none', 'important');

        } else {
          console.log('Leaving full-screen mode.');
        }
      });
    }
    this.canvas.requestFullscreen = this.canvas.requestFullscreen || this.canvas.msRequestFullscreen || this.canvas.mozRequestFullScreen || this.canvas.webkitRequestFullscreen;
    this.canvas.requestFullscreen();


    this.calculateCanvas();
    this.ballObject();
    this.currentRounds = 0;
    maxRounds = this.context.trialsNumber;
    this.loopTimer = function () {
      let inst = this;
      gameLoop = window.requestAnimationFrame(function () {
        inst.loop();
      });

    };


    this.dataTimer = function () {
      let inst = this;
      dataLoop = setInterval(function () {
        inst.dataCollection();
      }, DATA_COLLECTION_TIME);

    };

  }





  /**
   * Calculate canvas based on current Width Height
   * of the screen and initial Aspect ratio.
   * Currently using Matlab implementation Aspect ratio (4:3)
   * @method calculateCanvas
   */
  calculateCanvas(){


    if(screen.height < screen.width) {
      this.canvas.height = screen.height;
      let coefficient = screen.height/768;
      this.canvas.width = coefficient * 1024;
      this.Utils.SCALE  =  420 * coefficient;
    }else{
      this.canvas.width = screen.width;
      let coefficient = screen.width/1024;
      this.canvas.height = coefficient * 768;
      this.Utils.SCALE  =  420 * coefficient;
    }


  }


  /**
   * Initialize or start the game loop here
   * @method init
   */
  init() {
    clearInterval(dataLoop);
    this.dataTimer();
  }

  generateHeights() {

    return this.uniformArr([1,5,9]);
  }



  /**
   * Generate main trajectory parameters per trial
   * @method generateTrajectoryParams
   * @param current trial  height
   * @param heightAdjuster height correction coefficient
   * @param Tf Flight time coefficient
   */
  generateTrajectoryParams(trialHeight, heightAdjuster) {
    let currentHeight = trialHeight * 0.05 + heightAdjuster;
    let Tf = 0.75; // Time Flight for trajectory
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
   * @param initVelocity  init velocity for trial
   */
  generateTrajectoryParamsDiscreteSpatial(initVelocity) {
    let Tf = 0.9;
    gravity = 1.8;
    ballvx = (1.051) / Tf;
    initV = 0.15 * initVelocity + 0.45;
    initX = 0.7510;
    initBallY = -0.02;
  }



  get exportData(){

    return exportData;
  }


  set exportData(val){

    exportData = val;
  }

  get currentRounds() {

    return currentRounds;
  }

  set currentRounds(val) {

    currentRounds = val;
  }


  get initX(){

    return initX;
  }

  get initBallY(){

    return initBallY;
  }


  set initX(val){

    initX = val;
  }

  set initBallY(val){

    initBallY = val;
  }


  set ball(val){
    ball = val;
  }

  get ball(){

    return ball;
  }

  get PADDLE_REST_TIME_MS(){
    return PADDLE_REST_TIME_MS;
  }

  set gameState(val){
    gameState = val;
  }

  get gameState(){

    return gameState;
  }


  /**
   * Create Uniform array of values
   * @method uniformArr
   * @param vals {array} Array of values that  needed to be equally distributed
   * @return {array} array
   */
  uniformArr(vals, arrLength = maxRounds) {
    let arr = [];
    vals.forEach((v) => {
      arr = arr.concat(Array(arrLength / vals.length).fill(v));

    });

    return Utils.shuffle(arr);

  }

  /**
   * Create uniform array of trajectory parameters(height,velocity) for each obstacle
   * @method getTrajectoriesObstacles
   * @param {Array} obstructions array of obstructions,  all possible ex. [1,2,3]
   * @param  {Array} trajectoryParams array of all possible  trajectory parameters ex. heights : [1,4,5]
   * @returns {Array} shuffled 2d array [[obstruction, trajectoryParam]]
   */
  getTrajectoriesObstacles(obstructions,trajectoryParams){

    let array =  obstructions.flatMap(  (obstruction) =>  this.uniformArr(trajectoryParams, maxRounds/obstructions.length).map((trajectory) => [obstruction,trajectory]));

    return Utils.shuffle(array);

  }


  stop() {

   // clearTimeout(dataLoop);

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
        img.src = this.context.baseDir+url;
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
        audio.src = this.context.baseDir+url;
        audio.load();
        audioArr.push(audio);
      }

    );

  }



  /**
   * Initialize current round of the game
   * @method initGame
   */
  initGame() {
    gameState.initialTime =0;
    this.loopTimer();

  }


  cloneMessage(object) {
    var clone ={};
    for( var key in object ){
      if(object.hasOwnProperty(key)) //ensure not adding inherited props
        clone[key]=object[key];
    }
    return clone;
  }

  /**
   * Finish current round and check for rounds left
   * @method finishGame
   * @param score {boolean} should increase score
   */
  finishGame(score) {

    this.currentRounds++;
    cancelAnimationFrame(gameLoop);
    let clone = this.cloneMessage(this.exportData);
    this.context.export_arr.push(clone);
    if (score) {
      this.increaseScore();
    }
    if (this.currentRounds < maxRounds) {
      gameState.startTime = 0;
      this.initGame();

    } else {
      clearInterval(dataLoop);
      this.context.set('showInstructions', true);
      document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
      document.exitPointerLock();
      document.fullscreenElement.style.setProperty('cursor', 'default', 'important');
      this.context.stopRecorder().finally(() => {
          this.context.destroyRecorder();
          this.context.send('next');
      });
    }

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

    this.ball = {

      position: {x: leftBorder, y: downBorder},
      velocity: 0,
      timestamp: 0,
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


  convertYvalue(val){

    return ((this.canvas.height - val)/Utils.SCALE).toFixed(3);

  }

  convertXvalue(val){

    return (val/Utils.SCALE).toFixed(3);

  }



  /**
   * Get elapsed time as iterator in seconds
   * @method getElapsedTime
   * @param intialTime {int} Unixtime formatted time
   * @return {number}  difference in seconds between current time and intialTime, decimal
   */
  getElapsedTime(time = gameState.initialTime) {

    if(time === 0){
      return  0;
    }
    return (new Date().getTime() - time) / 1000;
  }

  /**
   * Projectile motion trajectory per maximum distance
   * @method trajectory
   * @param ball {Object} {position: {x: number, y: number}, radius: number, dimensions: {width: number, height:
   * number}}
   * @param initialTime {int}
   */
  trajectory(time = gameState.initialTime) {

    let  iterator =  this.getElapsedTime(time);
    this.ctx.beginPath();

    let positionY = initBallY+initV*(iterator)+0.5*-gravity*Math.pow(iterator,2);
    let positionX  = initX + ballvx*(iterator);
    let leftBorder =  (positionX- 0.0175)* Utils.SCALE;
    let downBorder =  (1.3746-positionY)*Utils.SCALE ;
    ball.position.x = leftBorder;
    ball.position.y = downBorder;
    ball.timestamp = iterator;
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
   * Draw ball per x,y ball location
   * @method drawBall
   * @param ball {Object} {position: {x: number, y: number}, radius: number, dimensions: {width: number, height:
   * number}}
   */
  drawBall(image) {

    this.ctx.drawImage(image, ball.position.x, ball.position.y, ball.radius, ball.radius);

  }


  /**
   * Set position of the ball to initial coordinates to symbolize the start of the game
   * @method moveBallToStart
   * @param {object} ball {position: {x: number, y: number}, radius: number, dimensions: {width: number, height: number}} object parameters set game to be over
   * @param {object} Image object
   */
  moveBallToStart(image) {

    this.ballObject();
    this.drawBall(image);

  }


  /**
   * Check if ball is on the floor and missed target
   * @method ballIsOnFloor
   * @param ball {position: {x: number, y: number}, radius: number, dimensions: {width: number, height:
   * number}}
   * @return {boolean}
   */
  ballIsOnFloor(down=Utils.paddleBoxValues.down){

    return ball.position.y >  down  - 0.048 * Utils.SCALE;
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
   * Walls and target collisions detection
   * @method wallCollision
   * @param {object} ball
   * @return {boolean} if hit any edge of the screen
   */
  wallCollision() {

    if (ball.position.y > this.canvas.height + ball.radius || ball.position.x > this.canvas.width + ball.radius || ball.position.x < ball.radius) {

      return true;

    }

    return false;

  }

  /**
   * Get ball state as number
   * @returns {number}
   */
  ballState() {
    let ballState = 0;
    if (ball.hitstate === 'good') {
      ballState = 2;
    } else if (ball.hitstate === 'very good') {
      ballState = 1;
    }
    return ballState;
  }


  onSoundEvent(e){

    gameState.startTime = 0;
    gameState.initialTime = new Date().getTime();
  }




}
