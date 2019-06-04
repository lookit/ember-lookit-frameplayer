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
let uniformArr = [];

let radiusRim = 0.1;




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
    hArray = super.generateHeights();
    uniformArr  = super.uniformArr([1,2,3]);
    goodJob = new Audio(super.Utils.goodCatchSound);
    goodJob.load();
    ballCatchFail = new Audio(super.Utils.ballcatchFailSound);
    ballCatchFail.load();
    audio = new Audio(super.Utils.rattleSound);
    audio.load();
    ballCatchFail.src = super.Utils.ballcatchFailSound;
    goodJob.src = super.Utils.goodCatchSound;
    audio.src = super.Utils.rattleSound;
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

    super.gameOver = false;
    super.initGame();
    basket = {
      positions:[],
      times:[],
      velocity: super.Utils.paddleSpeed,
      paddleLastMovedMillis: 0,
      imageURL: super.Utils.basketImage
    };

    basket = super.basketObject(basket);


    let obstructionsNum = uniformArr[super.currentRounds];
    if(this.context.no_trees){
      obstructionsNum =0;
    }
    ball = super.ballObject();

    obstructions = Array(obstructionsNum).fill({}).map((value, index) =>

      ( super.treeObject(index+1))
    );


    initSoundPlaying = true;
    audio.play();
    audio.addEventListener('ended', function () {

      initSoundPlaying = false;
      initialTime = new Date().getTime();

    });

  }


  drawRedDot(){

    let redDot = super.basketCenter(basket);
    this.ctx.beginPath();
    this.ctx.fillStyle = redDot.color;
    this.ctx.fillRect(redDot.position.x, redDot.position.y, redDot.dimensions.width, redDot.dimensions.height);
    this.ctx.fill();
    this.ctx.closePath();
  }

  dataCollection() {

    super.storeData();
  }




  /**
   * Check if ball reaches the target
   * @method collisionDetection
   * @return {boolean}
   */
  collisionDetection() {


    // if (ball.positions.length > 2 && basket.positions.length >2 && ball.positions[ball.positions.length - 1].y > basket.position.y  && ball.position.y >= basket.position.y ){
    //     if (ball.position.x >= basket.position.x && ball.position.x <=  basket.position.x+  basket.dimensions.width ) {
    if (ball.positions.length > 2 && basket.positions.length >2 && ball.positions[ball.positions.length - 1].y > basket.position.y && ball.position.y > basket.position.y && ball.position.y - ball.radius < basket.position.y + basket.dimensions.height) {

      if (ball.position.x >= basket.position.x && ball.position.x <=  basket.position.x+  basket.dimensions.width ) {

        ball.state = 'good';

        if (ball.position.x > (1.3301 - radiusRim / 5) * super.Utils.SCALE && ball.position.x < (1.3301 + radiusRim / 5) * super.Utils.SCALE) {

          ball.state = 'very good';
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

      position: {x: basket.position.x + super.paddleWidth, y: basket.position.y - super.paddleHeight / 2},
      dimensions: {width: super.paddleWidth / 1.5, height: super.paddleWidth / 1.5},
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

    if (hitTheTarget || hitTheWall || super.gameOver) {

      if (hitTheTarget) {

        if (!super.gameOver && goodJob.readyState === 4) {

          goodJob.play();
        }

        if (hitTheTarget && ball.state === 'very good') {
          this.starsLocationUpdate();
          this.drawImage(targetStars);
        }


      } else {
        if (!super.gameOver) {

          ballCatchFail.play();
        }

      }
      // Remove ball and show in the starting point,
      //User should set the paddle to initial position , call stop after that
      super.moveBallToStart(ball, true);
      super.paddleAtZero(basket, hitTheTarget);


    } else {

      if (initSoundPlaying) {

        super.moveBallToStart(ball, false);

      } else {

        super.trajectory(ball,initialTime);
        super.drawBall(ball);
      }


    }
    obstructions.forEach(obstruction => this.drawImage(obstruction));
    super.createPaddleBox();
    super.paddleMove(basket,initialTime);
    this.drawImage(basket);
    this.drawRedDot();


  }


  /**
   * @method
   * Draw image object according to object positions
   * @param object
   */
  drawImage(object) {
    let image = new Image();
    image.src = object.imageURL;
    this.ctx.drawImage(image, object.position.x, object.position.y, object.dimensions.width, object.dimensions.height);
  }

}
