/*
 * Developed by Gleb Iakovlev on 5/3/19 9:09 PM.
 * Last modified 4/29/19 9:36 PM.
 * Copyright (c) Cognoteq Software Solutions 2019.
 * All rights reserved
 */

import Base from './base';
/**
 *
 * @submodule games
 *
 */

let basket = {};
let ball = {};
let obstructions = [];
let audio = {};
let goodJob = {};
let initSoundPlaying = true;
let ballCatchFail = {};
let targetStars = {};
let initialTime = 0;
let hArray = [];
let Tf = 0.8;
let Height = 0.8;
let obstrArr = [];
let jitterT = 0;
let radiusRim = 0.1;
let wrongSound = {};
let obstructionsNum = 0;

/**
 * Main implementation of catch the cheese game.
 * The user will operate with paddle to catch the ball started
 * from ball box. The trajectory is randomized with various values in trajectories array
 * Number of obstructions currently randomized from 0 to 3 trees shown
 * @class CatchCheese
 * @extends Base
 */
export default class CatchCheese extends Base {
  /**
   * @method constructor
   * @constructor constructor
   * @param context
   * @param document
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
    hArray = super.generateHeights();
    Tf = this.context.flightTime;
    Height = this.context.height;

    obstrArr  = super.uniformArr([1,2,3]);
    goodJob = new Audio(super.Utils.goodCatchSound);
    goodJob.load();
    ballCatchFail = new Audio(super.Utils.failcatchSound);
    ballCatchFail.load();
    audio = new Audio(super.Utils.rattleSound);
    audio.load();
    ballCatchFail.src = super.Utils.failcatchSound;
    goodJob.src = super.Utils.goodCatchSound;
    audio.src = super.Utils.rattleSound;
    wrongSound = new Audio();
    wrongSound.src = super.Utils.wrongSound;
    audio.addEventListener('onloadeddata', this.initGame(), false);

  }


  /**
   * Initialize each game round with initial object parameters
   * Randomize number of obstructions
   * Reset the sounds sources for older browser versions
   * Wait for start sound and start the main game loop
   * @method initGame
   */
  initGame() {
    jitterT = super.trialStartTime();
    initialTime =0;
    super.gameOver = false;
    super.initGame();
    basket = {
      positions:[],
      times:[],
      velocity: super.Utils.paddleSpeed,
      paddleLastMovedMillis: 0,
      imageURL: super.Utils.basketImage
    };

    super.createPaddleBox();
    basket = super.basketObject(basket);
     obstructionsNum = obstrArr[super.currentRounds];
    if(this.context.no_trees){
      obstructionsNum =0;
    }
    ball = super.ballObject();

    obstructions = Array(obstructionsNum).fill({}).map((value, index) =>

      ( super.treeObject(index+1))
    );


    initSoundPlaying = true;
    if(super.currentRounds >0 || (super.currentRounds === 0 && !super.paddleIsMoved(basket))) {
      audio.play();
    }
    audio.addEventListener('playing', function () {

      initSoundPlaying = false;
      initialTime = new Date().getTime();

    });

  }

  /**
   * Create red dot target location
   * @method drawRedDot
   */
  drawRedDot(){

    let redDot = super.basketCenter(basket);
    this.ctx.beginPath();
    this.ctx.fillStyle = redDot.color;
    this.ctx.fillRect(redDot.position.x, redDot.position.y, redDot.dimensions.width, redDot.dimensions.height);
    this.ctx.fill();
    this.ctx.closePath();
  }

  dataCollection() {
    super.dataCollection();
    let exportData = {
      game_type: 'catchCheese',
      ball_position_x: ball.position.x,
      ball_position_y: ball.position.y,
      paddle_position_x: basket.position.x,
      paddle_position_y: basket.position.y,
      trial: super.currentRounds,
      timestamp: new Date().getTime()

    };
    super.storeData(exportData);
  }




  /**
   * Check if ball reaches the target
   * @method collisionDetection
   * @return {boolean}
   */
  collisionDetection() {

    let basketPrevPosition = 0;
    if(basket.positions.length >2){

      basketPrevPosition = this.canvas.height - (basket.positions[basket.positions.length-2])*this.canvas.height;
    }

    if(ball.positions.length >2 && ball.positions[ball.positions.length-2] <= basketPrevPosition && ball.position.y > basket.position.y){
      if (ball.position.x >= basket.position.x && ball.position.x <=  basket.position.x +  basket.dimensions.width ) {

        ball.hitstate = 'good';

        if (ball.position.x > (1.3301 - radiusRim / 4) * super.Utils.SCALE && ball.position.x < (1.3301 + radiusRim / 4) * super.Utils.SCALE) {

          ball.hitstate = 'very good';
        }
        return true;
      }
    }

    return false;

  }

  /**
   * Update location of the basket stars(symbolize that user reached the target) with the basket location
   * @method starsLocationUpdate
   */
  starsLocationUpdate() {

    targetStars = {

      position: {x: basket.position.x + 0.01* super.Utils.SCALE , y: basket.position.y - 0.2* super.Utils.SCALE},
      dimensions: {width: 0.14*super.Utils.SCALE, height: 0.2*super.Utils.SCALE},
      imageURL: super.Utils.basketStarsImage

    };

  }


  /**
   * Main loop of the game.
   * Set initial position of the ball in a box and starting rattling sound (initSoundPlaying).
   * After that  start ball trajectory.
   * If ball hits the target or missed the target wait util user places the paddle to starting position.
   * Increase the score if ball hits the target.
   * @method loop
   */
  loop() {
    super.loop();
    super.createBallBox();
    super.generateTrajectoryParams(hArray,Height,Tf);
    let hitTheTarget = this.collisionDetection();
    let hitTheWall = super.wallCollision(ball);
    let paddleBoxColor = super.Utils.blueColor;


    if (initialTime === 0 && super.currentRounds === 0 && !super.paddleIsMoved(basket)){

      audio.play();
    }

    if(ball.state === 'start'){

      super.moveBallToStart(ball, false);

      if(initialTime > 0 && super.paddleIsMoved(basket)){
        initialTime = new Date().getTime();
        paddleBoxColor = super.Utils.redColor;
        wrongSound.play();
      }

      if (initialTime > 0 && super.getElapsedTime(initialTime) > jitterT) {
        audio.pause();
        ball.state = 'fall';
        initialTime = new Date().getTime();
      }

    }



    if((hitTheTarget || hitTheWall) && ball.state === 'fall'){

      ball.state = 'hit';
    }

    if(ball.state === 'fall'){
      if(initialTime > 0 && super.getElapsedTime(initialTime) <= 1.5) {
        ball.positions.push(ball.position.y);
        super.trajectory(ball, initialTime);
      }

      if(initialTime > 0 && super.ballIsOnFloor(ball)) {
        ball.state = 'hit';
      }


      super.drawBall(ball);
    }


    if (ball.state === 'hit') {


      if (ball.hitstate === 'very good' || ball.hitstate === 'good') {

        goodJob.play();

      }else{

        ballCatchFail.play();
      }


      ball.state = 'done';

    }


    if(ball.state === 'done'){


      if (ball.hitstate === 'very good') {
        this.starsLocationUpdate();
        super.drawImage(targetStars,super.Utils.basketStarsImage);
      }

      if(ball.hitstate === ''){

        super.drawBall(ball);
      }


      // Remove ball and show in the starting point,
      //User should set the paddle to initial position , call stop after that
      if(super.getElapsedTime(initialTime)  > 1.5) {
        super.moveBallToStart(ball, false);
        super.paddleAtZero(basket, hitTheTarget);
      }


    }


    obstructions.forEach(obstruction => super.drawImage(obstruction, obstruction.imageURL));

    this.basketObject(basket);
    super.paddleMove(basket,initialTime);
    super.drawImage(basket,basket.imageURL);
    super.createPaddleBox(paddleBoxColor);
    this.drawRedDot();
  }




}
