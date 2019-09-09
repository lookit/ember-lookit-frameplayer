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
let startSound = {};
let ballCatchFail = {};
let goodJob = {};
let greatJob = {};
let initialTime = 0;
let randomNumber = 0;
let TfArr = [];
let wallsize = 0.25;
let targetX = 1.3310;
let jitterT = 0;
let winsize = 0.056;
let targetsize = 0.02;
let fireworksURLs = [];
const CENTER = 1.30715;

let ballImg = {};
let targetImgs = [];
let ballBoxImg = {};
let starImg = {};
let background = {};


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
    fireworksURLs = [super.Utils.Explosion_big_blue, super.Utils.Explosion_big_green, super.Utils.Explosion_big_red, super.Utils.Explosion_small];


  }


  /**
   * Draw house with roof according to coordinates
   * @method createShuttle
   */
  createHouse() {

    let leftBorder = (targetX - 0.5 - wallsize) * super.Utils.SCALE;
    let topBorder = (0.8) * super.Utils.SCALE;

    let houseObj = {

      dimensions: {width: 1.54 * super.Utils.SCALE, height: 0.9 * super.Utils.SCALE},
      position: {x: leftBorder, y: topBorder}

    };

    super.drawImageObject(houseObj, background);

  }

  /**
   * Create the window in the house
   * @method createWindow
   * @param target
   */
  createWindow() {

    super.drawImageObject(target, starImg);

  }


  /**
   * Main point to start the game.
   * Initialize static parameters and preload sounds here
   * @method init
   */
  init() {


    TfArr = super.uniformArr([0.8, 0.9, 1]);
    goodJob = new Audio(super.Utils.firework_small);
    goodJob.load();

    ballCatchFail = new Audio(super.Utils.firework_hidden);
    ballCatchFail.load();

    startSound = new Audio(super.Utils.fuse);
    startSound.src = super.Utils.fuse;
    goodJob.src = super.Utils.firework_small;

    greatJob = new Audio(super.Utils.firework_big);
    greatJob.src = super.Utils.firework_big;
    greatJob.load();

    ballCatchFail.src = super.Utils.ballcatchFailSound;
    startSound.load();

    ballImg = new Image();
    ballImg.src = super.Utils.Fireball;

    ballBoxImg = new Image();
    ballBoxImg.src = super.Utils.boxOfFireworks;

    this.createTarget();
    super.fillImageArray(fireworksURLs,targetImgs);

    starImg = new Image();
    starImg.src = super.Utils.star;

    background = new Image();
    background.src = super.Utils.skyline;


    startSound.addEventListener('onloadeddata', this.initGame(), false);
    super.init();

  }


  /**
   * Initialize each game round with initial object parameters
   * Randomize number of obstructions
   * Reset the sounds sources for older browser versions
   * Wait for start sound and start the main game loop
   * @method initGame
   */
  initGame() {
    initialTime = 0;
    ball.startTime = 0;
    jitterT = super.trialStartTime();
    keyPressed.value = 0;
    this.createTarget();

    ball = {
      position: {x: 0, y: 0},
      velocity: 0,
      mass: super.Utils.ballMass,
      radius: 0.02381 * super.Utils.SCALE,
      restitution: super.Utils.restitution,
      color: super.Utils.yellowColor,
      timeReached: 0

    };

    randomNumber = Math.floor(Math.random() * 3); // Get random value from 0 to 2
    ball = super.ballObject();
    startSound = new Audio(super.Utils.fuse);
    startSound.play();
    startSound.addEventListener('playing', function () {
      initialTime = new Date().getTime();
    });

    super.initGame();

  }


  createTarget() {
    let topBorder = (1.155) * super.Utils.SCALE;
    let downBorder = (1.235) * super.Utils.SCALE;
    let leftBorder = (targetX - 0.05) * super.Utils.SCALE;
    let rightBorder = (targetX + 0.05) * super.Utils.SCALE;

    target = {

      dimensions: {width: rightBorder - leftBorder, height: downBorder - topBorder},
      position: {
        x: leftBorder,
        y: topBorder
      },
      radius: 0.007143 * super.Utils.SCALE,
      color: super.Utils.grayColor,
      roofcolor: super.Utils.redColor,
      houseColor: super.Utils.grayColor,
      windowbackground: super.Utils.blackColor

    };

  }

  /**
   * @method dataCollection
   */
  dataCollection() {
    super.dataCollection();
    //Set  0,1,2,3 as button pressed values (0:  no button pressed, 1 : pressed , missed target, 2 : pressed, within
    // window, 3 : hit the target)

    let exportData = {

      game_type: 'feedMouse',
      ball_position_x: ball.position.x / this.canvas.width,
      ball_position_y: (this.canvas.height - ball.position.y) / this.canvas.height,
      button_pressed: keyPressed.value,
      trial: super.currentRounds,
      timestamp: new Date().getTime()

    };

    super.storeData(exportData);

  }


  //Might need to set the key as a super parameter
  /**
   * @method keyDownHandler Get current keyboard event on press button
   * @param {object} e
   */
  keyDownHandler(e) {

    if (e.key === ' ' || e.key === 'Spacebar') {

      keyPressed = {value: 1, when: new Date().getTime()};
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
  loop(){

    super.loop();
    super.generateTrajectoryParamsDiscrete(TfArr);
    this.createHouse();
    this.createWindow();

    if (ball.state === 'start') {

      super.moveBallToStart(ball, ballImg, false);
      if (initialTime > 0 && super.getElapsedTime(initialTime) > jitterT) {
        startSound.pause();
        startSound.currentTime = 0;
        ball.state = 'fall';
        initialTime = new Date().getTime();


      }

    }


    if (ball.state === 'fall') {

      if (initialTime > 0 && super.getElapsedTime(initialTime) < 1.5) {
        super.trajectory(ball, initialTime);
      }

      if (initialTime > 0 && super.getElapsedTime(initialTime) > 0.1 && super.ballIsOnFloor(ball)) {
        ballCatchFail.play();
        ball.state = 'hit';
      }


      super.drawBall(ball, ballImg);
      this.createHouse();
      this.createWindow();


      //Check for target (red dot) position , if we are within the window size
      if (keyPressed.value === 1) {

        let position = Math.abs(ball.position.x - CENTER * super.Utils.SCALE );

        if (position < targetsize * super.Utils.SCALE) {
          super.increaseScore();
          ball.hitstate = 'great';
          keyPressed.value = 3;
          greatJob.play();


        } else if (position < (winsize) * super.Utils.SCALE) {
          keyPressed.value = 2;
          ball.hitstate = 'good';
          goodJob.play();

        } else {
          ballCatchFail.play();

        }

        ball.state = 'hit';

      }

    }


    if (ball.state === 'hit') {

      let difference = ball.position.x - CENTER * super.Utils.SCALE;
      if (ball.hitstate === 'great') {
        let explosion = this.setExplosionPosition(4, ball, 0.03572 * super.Utils.SCALE);
        super.drawImageObject(explosion, targetImgs[randomNumber]);
      }

      if (ball.hitstate === 'good') {
        let explosion = this.setExplosionPosition(2, ball, difference);
        super.drawImageObject(explosion, targetImgs[3]);
      }


      if (super.getElapsedTime(initialTime) > 3.5) {
        super.finishGame(false);
      }

    }

    super.discreteLauncer(ballBoxImg);

  }


  setExplosionPosition(multiplier, ball, difference) {

    let explosion = {

      dimensions: {width: target.dimensions.width * multiplier, height: target.dimensions.height * multiplier},
      position: {
        x: CENTER * super.Utils.SCALE - (target.dimensions.width * multiplier / 2) + difference,
        y: ball.position.y - target.dimensions.height * multiplier / 2 + 0.02381 * super.Utils.SCALE
      }

    };
    return explosion;
  }


}
