/*
 * Developed by Gleb Iakovlev on 5/3/19 9:09 PM.
 * Last modified 4/29/19 11:01 PM.
 * Copyright (c) Cognoteq Software Solutions 2019.
 * All rights reserved
 */

import Base from './base';
/**
 *
 * @submodule games
 *
 */
let target = {};
let ball = {};
let keyPressed = {};
let initSoundPlaying = false;
let startSound = {};
let ballCatchFail = {};
let goodJob = {};
const scale = [

  {scale_x:1.32,scale_y:1.1},
  {scale_x:1.56,scale_y:1.3},
  {scale_x:1.44,scale_y:1.2}
];
let current_index = 0;


/**
 * @class FeedMouse
 * @extends Base
 * Main implementation of feed  the mouse in the house game.
 * The user will operate with keyboard keys to predict when ball trajectory will hit the window.
 * The trajectory is randomized with various values in trajectories array
 */
export default class FeedMouse extends Base {
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
   * Draw house with roof according to coordinates
   * @method createHouse
   */
  createHouse() {

    let houseX = this.canvas.width / 2 + super.paddleWidth;
    let houseY = this.canvas.height / 2.5;
    let houseWidth = this.canvas.width / 3.5;
    let houseHeight = this.canvas.height / 2;
    let roofSpace = 20;

    this.ctx.beginPath();
    this.ctx.fillStyle = target.color;
    this.ctx.rect(houseX, houseY, houseWidth, houseHeight);
    this.ctx.fill();
    this.ctx.closePath();
    //Draw roof

    this.ctx.beginPath();
    this.ctx.fillStyle = target.roofcolor;
    this.ctx.moveTo(houseX - roofSpace, houseY);
    this.ctx.lineTo(houseX + houseWidth / 2, houseY - houseHeight + 100);
    this.ctx.lineTo(houseX + houseWidth + roofSpace, houseY);
    this.ctx.fill();
    this.ctx.closePath();
  }

  /**
   * Create the window in the house
   * @method createWindow
   * @param target
   */
  createWindow() {
    this.ctx.beginPath();
    this.ctx.fillStyle = target.windowbackground;
    this.ctx.rect(target.position.x, target.position.y, target.dimensions.width, target.dimensions.height);
    this.ctx.fill();
    this.ctx.closePath();

    //Draw window cross
    this.ctx.beginPath();
    this.ctx.strokeStyle = target.color;
    this.ctx.moveTo(target.position.x + target.dimensions.width / 2, target.position.y);
    this.ctx.lineTo(target.position.x + target.dimensions.width / 2, target.position.y + target.dimensions.height);
    this.ctx.moveTo(target.position.x, target.position.y + target.dimensions.height / 2);
    this.ctx.lineTo(target.position.x + target.dimensions.width, target.position.y + target.dimensions.height / 2);
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.closePath();


    //Draw red dot
    this.ctx.beginPath();
    this.ctx.arc(target.position.x + target.dimensions.width / 2, target.position.y + target.dimensions.height / 2, target.radius, 0, Math.PI * 2, false);
    this.ctx.fillStyle = target.roofcolor;
    this.ctx.fill();
    this.ctx.closePath();

  }


  /**
   * Show the current  ball location .
   * Center the ball location.
   * @method showBallLocation
   * @param target
   */
  showBallLocation(center){

    if(center){
      ball.position.x = target.position.x + target.dimensions.width / 2 - ball.radius / 2;
      ball.position.y = target.position.y + target.dimensions.height / 2 - ball.radius / 2;


    }

    //Put the ball in the center of target once it hits window constraint
    this.ctx.beginPath();
    this.ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2, true);
    this.ctx.fillStyle = ball.color;
    this.ctx.fill();
    this.ctx.closePath();




  }


  /**
   * Main point to start the game.
   * Initialize static parameters and preload sounds here
   * @method init
   */
  init() {
    super.init();

    goodJob = new Audio(super.Utils.doorbellSound);
    goodJob.load();

    ballCatchFail = new Audio(super.Utils.ballcatchFailSound);
    ballCatchFail.load();

    startSound = new Audio(super.Utils.rattleSound);
    startSound.load();
    startSound.addEventListener('onloadeddata', this.initGame(), false);

  }


  /**
   * Initialize each game round with initial object parameters
   * Randomize number of obstructions
   * Reset the sounds sources for older browser versions
   * Wait for start sound and start the main game loop
   * @method initGame
   */
  initGame() {

    let Angle = (100*(Math.PI)/180);
    const  trajectories = [
      {velocity: {x: 4.4* (60*(Math.PI)/180), y: -6.2*Math.sin(Angle)}},
      {velocity: {x: 4.4* (60*(Math.PI)/180), y: -6.2*Math.sin(Angle)}},
      {velocity: {x: 4.4* (60*(Math.PI)/180), y: -6.2*Math.sin(Angle)}}
    ];
    current_index = Math.floor(Math.random() * 3);
    // current_index = 1;
    let trajectory = trajectories[current_index];
    trajectory.velocity  = super.velocityToScale(trajectory.velocity);
    target = {

      dimensions: {width: super.paddleWidth, height: super.paddleWidth},
      position: {
        x: (this.canvas.width - super.paddleWidth * 3 - this.canvas.width / 3.2) + this.canvas.width / 6.4 - super.paddleWidth / 2,
        y: this.canvas.height / 3 + this.canvas.height / 4
      },
      radius: 4,
      color: super.Utils.grayColor,
      roofcolor: super.Utils.redColor,
      windowbackground: super.Utils.blackColor

    };



    ball = {
      position: {x: super.paddleWidth * 5 + 20, y: (this.canvas.height - super.paddleWidth * 2)},
      velocity: trajectory.velocity,
      mass: super.Utils.ballMass,
      radius: 10,
      restitution: super.Utils.restitution,
      color: super.Utils.yellowColor,
      timeReached:0

    };

    initSoundPlaying = true;
    goodJob.src = super.Utils.doorbellSound;
    ballCatchFail.src = super.Utils.ballcatchFailSound;
    startSound.src = super.Utils.rattleSound;

    startSound.play();
    startSound.addEventListener('ended', function () {
      ball.timeReached = new Date().getTime();
      initSoundPlaying = false;
    });

    super.initGame();

  }

  /**
   * @method dataCollection
   */
  dataCollection() {

    let exportData = {

      game_type: 'feedMouse',
      ball_position_x: ball.position.x,
      ball_position_y: ball.position.y,
      button_pressed: keyPressed.value,
      trial: super.currentRound,
      timestamp: new Date().getTime()

    };

    super.storeData(exportData);

  }

  /**
   *
   * Check collision of appropriate key and window
   * When ball hits the window set coordinates of the ball to the center of the window
   * @method collisionDetection
   * @return {boolean}
   */
  collisionDetection() {

    // Window collision detection
    if (ball.position.x > target.position.x && ball.position.x - ball.radius < target.position.x + target.dimensions.width) {

      return true;

    }

    return false;
  }


  //Might need to set the key as a super parameter
  /**
   * @method keyDownHandler Get current keyboard event on press button
   * @param {object} e
   */
  keyDownHandler(e) {

    if (e.key === 'l' || e.key === 'L') {

      keyPressed = {value:true,when:new Date().getTime()};
    }

  }

  /**
   * @method keyUpHandler Get current keyboard event on release button
   * @param {object} e
   */
  keyUpHandler(e) {

    if (e.key === 'l' || e.key === 'L') {

      keyPressed = {value:false,when:new Date().getTime()};
    }

  }

  /**
   *
   * Main loop of the game
   * Set initial position of the ball in a box and starting rattling sound (initSoundPlaying).
   * After that  start ball trajectory.
   * If ball hits the target or missed the target(window) show the ball in the window
   * Check if user hits the keyboard key when ball trajectory reached the window bounds.
   * Increase the score if ball hits the target.
   * Move the ball to initial position.
   * Wait for some time until rattle sound played.
   * @method loop
   */
  loop() {
    super.loop();

    let didHitWindow = this.collisionDetection();

    if (super.gameOver) {
      super.waitSeconds(2000);
      super.finishGame(false);

    } else {

      super.wallCollision(ball);
      if (!didHitWindow) {
        if (initSoundPlaying) {
          super.moveBallToStart(ball, false);
        } else {

          super.ballTrajectory(ball,scale[current_index].scale_x,scale[current_index].scale_y);
        }
      }
      super.createBallBox();
      this.createHouse();
      this.createWindow();


      if (keyPressed.value || new Date().getTime() -keyPressed.when < 150 ) {


        if(didHitWindow){

          target.color = super.Utils.whiteColor;
          this.createHouse();
          this.createWindow();
          super.increaseScore();
          goodJob.play();

        }else{

          ballCatchFail.play();

        }

        this.showBallLocation(didHitWindow);
        super.moveBallToStart(ball, true);
        didHitWindow = false;
      }


      if(didHitWindow){

        this.showBallLocation(didHitWindow);
        ballCatchFail.play();
        super.moveBallToStart(ball, true);
      }

    }

  }

}
