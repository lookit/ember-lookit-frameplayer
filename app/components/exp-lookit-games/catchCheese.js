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
let redDot = {};




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
    goodJob = new Audio(super.Utils.goodCatchSound);
    goodJob.load();
    ballCatchFail = new Audio(super.Utils.ballcatchFailSound);
    ballCatchFail.load();
    audio = new Audio(super.Utils.rattleSound);
    audio.load();
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
      dimensions: {width: super.paddleWidth * 1.3, height: super.paddleWidth * 1.3},
      position: {x: this.canvas.width / 2 + super.paddleWidth * 3, y: (this.canvas.height / 2 + super.paddleHeight * 2)},
      prevposition:{x: this.canvas.width / 2 + super.paddleWidth * 3, y: (this.canvas.height / 2 + super.paddleHeight * 2)},
      velocity: super.Utils.paddleSpeed,
      paddleLastMovedMillis: 0,
      imageURL: super.Utils.basketImage
    };



    let trajectories = [

      {velocity: {x: 4.2, y: -7.7}},
      {velocity: {x: 4.7, y: -7.0}},
      {velocity: {x: 4.5, y: -7.6}},
      {velocity: {x: 4.5, y: -7.4}}
    ];

    let obstructionsNum = Math.floor(Math.random() * trajectories.length);
    let trajectory = trajectories[Math.floor(Math.random() * trajectories.length)];
    trajectory.velocity  = super.velocityToScale(trajectory.velocity);
    ball = {

      position: {x: super.paddleWidth * 5 + 20, y: (this.canvas.height - super.paddleWidth * 2)},
      velocity: trajectory.velocity,
      mass: super.Utils.ballMass,
      radius: 10,
      restitution: super.Utils.restitution,
      color: '#dadd0f'

    };

    obstructions = Array(obstructionsNum).fill({}).map((value, index) =>

      ({
        dimensions: {width: super.paddleWidth * 3.5, height: this.canvas.height / 1.5},
        position: {
          x: this.canvas.width / 2 - (index + 1) * super.paddleWidth,
          y: this.canvas.height / 2.5 - super.paddleWidth * 1.5
        },
        imageURL: super.Utils.treeImage
      })
    );

    initSoundPlaying = true;
    ballCatchFail.src = super.Utils.ballcatchFailSound;
    goodJob.src = super.Utils.goodCatchSound;
    audio.src = super.Utils.rattleSound;
    audio.play();
    audio.addEventListener('ended', function () {

      initSoundPlaying = false;
    });

  }


  drawRedDot(){

    redDot ={
      position:{x:basket.position.x+basket.dimensions.width/2 - ball.radius,y:basket.position.y},
      radius: 4,
      color:super.Utils.redColor

    };
    this.ctx.beginPath();
    this.ctx.fillStyle = redDot.color;
    this.ctx.fillRect(redDot.position.x, redDot.position.y, ball.radius*2, ball.radius);
    this.ctx.fill();
    this.ctx.closePath();
  }

  dataCollection() {

    let exportData = {
      game_type: 'catchCheese',
      ball_position_x: ball.position.x,
      ball_position_y: ball.position.y,
      paddle_position_x: basket.position.x,
      paddle_position_y: basket.position.y,
      trial: super.currentRound,
      timestamp: new Date().getTime()

    };

    super.storeData(exportData);
  }


  /**
   * Check if paddle is moving up or down
   * @method paddleMovingUp
   * @return {boolean}
   */
  paddleIsMovingUp(){

    if(basket.position.y < basket.prevposition.y){
      return  true;
    }

    return false;
  }

  /**
   * Check if ball reaches the target
   * @method collisionDetection
   * @return {boolean}
   */
  collisionDetection() {

    let midPAddlePoint = basket.position.x+basket.dimensions.width/2;

    if ( ball.position.y > basket.position.y && ball.position.y - ball.radius < basket.position.y + basket.dimensions.height) {

      if ( ball.position.x > midPAddlePoint - ball.radius && ball.position.x - ball.radius < midPAddlePoint + ball.radius ) {

        if(this.paddleIsMovingUp()) {
          return true;
        }
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
    let hitTheTarget = this.collisionDetection();
    let hitTheWall = super.wallCollision(ball);

    if (hitTheTarget || hitTheWall || super.gameOver) {

      if (hitTheTarget) {

        if (!super.gameOver && goodJob.readyState === 4) {

          goodJob.play();
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
      if (hitTheTarget) {
        this.starsLocationUpdate();
        this.drawImage(targetStars);
      }

    } else {

      if (initSoundPlaying) {

        super.moveBallToStart(ball, false);

      } else {

        super.ballTrajectory(ball);

      }
    }

    super.createPaddleBox(this.canvas.width / 2 + super.paddleWidth * 3, this.canvas.height / 2.5 + this.canvas.height / 2 - super.paddleWidth * 1.3);
    basket.prevposition.y = basket.position.y;
    super.paddleMove(basket);
    this.drawImage(basket);
    this.drawRedDot();

    obstructions.forEach(obstruction => this.drawImage(obstruction));

  }


  /**
   * @method
   * Draw image object according to object locations
   * @param object
   */
  drawImage(object) {
    let image = new Image();
    image.src = object.imageURL;
    this.ctx.drawImage(image, object.position.x, object.position.y, object.dimensions.width, object.dimensions.height);
  }

}
