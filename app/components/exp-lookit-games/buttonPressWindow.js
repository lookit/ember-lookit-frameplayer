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
let keyPressed = {}; // Current key pressed status
let initialTime = 0;  // initial time for current game trial
let randomNumber = 0; // Current random number for fireworks (decide which color to display)
let TfArr = []; // Time Flight array
const TARGETX = 1.3310; // Current X position
let jitterT = 0; // Time jitter (variates from 500 ms to 1500 ms), time between sound start and ball starting to fly
const WINDOW_SIZE = 0.056; //Current window size
const TARGET_SIZE = 0.02;  // Current target (star) size
const CENTER = 1.30715; // Appropriate star position in center
let startTime = 0; // start of the game to wait before music playing
const INITIAL_DELAY = 2.5;
const TOTAL_FLIGHT_TIME = 1.5;
// Media arrays for loading
let targetImgs = [];
let sounds = [];
let soundURLs = [];
let imageURLs = [];
let images = [];
let fireworksURLs = [];

// Media mapping as Enum
const gameSound = {
  START: 0,
  CATCH_GREAT: 1,
  CATCH_GOOD: 2,
  FAIL:3
};
const gameImage = {
  BACKGROUND: 0,
  BALL: 1,
  STARS: 2,
  BALLBOX: 3,
  fireworks: {
    BLUE: 0,
    GREEN: 1,
    RED: 2
  }

};



/**
 * @class ButtonPressWindow
 * @extends Base
 * Main implementation of feed  the mouse in the house game.
 * The user will operate with keyboard keys to predict when ball trajectory will hit the window.
 * The trajectory is randomized with various values in trajectories array
 */
export default class ButtonPressWindow extends Base {
  /**
   * @method constructor
   * @constructor constructor
   * @param context
   * @param document
   */
  constructor(context, document) {

    super(context, document);
    fireworksURLs = [super.Utils.Explosion_big_blue, super.Utils.Explosion_big_green, super.Utils.Explosion_big_red, super.Utils.Explosion_small];
    soundURLs = [super.Utils.fuse, super.Utils.firework_big, super.Utils.firework_small, super.Utils.ballcatchFailSound];
    imageURLs = [super.Utils.skyline,super.Utils.Fireball,super.Utils.star,super.Utils.boxOfFireworks];

  }


  /**
   * Draw house with roof according to coordinates
   * @method createShuttle
   */
  createShuttle() {

    let leftBorder = (TARGETX - 0.75) * super.Utils.SCALE;
    let topBorder = (0.8) * super.Utils.SCALE;

    let houseObj = {

      dimensions: {width: 1.54 * super.Utils.SCALE, height: 0.9 * super.Utils.SCALE},
      position: {x: leftBorder, y: topBorder}

    };

    super.drawImageObject(houseObj, images[gameImage.BACKGROUND]);

  }

  /**
   * Create target window
   * @method createTargetWindow
   */
  createTargetWindow() {

    super.drawImageObject(target, images[gameImage.STARS]);

  }

  /**
   * Show the current  ball location .
   * Center the ball location.
   * @method showBallLocation
   */
  showBallLocation(){

    super.drawBall(ball, images[gameImage.BALL]);

  }


  /**
   * Main point to start the game.
   * Initialize static parameters and preload sounds here
   * @method init
   */
  init() {

    startTime = new Date().getTime();
    TfArr = super.uniformArr([0.8, 0.9, 1]); // Fill out uniform the Time Flight array
    this.setTargetBackground();
    super.fillAudioArray(soundURLs,sounds);
    super.fillImageArray(fireworksURLs,targetImgs);
    super.fillImageArray(imageURLs,images);
    images.push(targetImgs);

    sounds[gameSound.START].addEventListener('onloadeddata', this.initGame(), false);
    sounds[gameSound.START].addEventListener('playing', function () {
      initialTime = new Date().getTime();
    });

    super.init();

  }


  /**
   * Initialize each game round with initial object parameters
   * Wait for start sound and start the main game loop
   * @method initGame
   */
  initGame() {
    initialTime = 0;
    ball.startTime = 0;
    jitterT = super.trialStartTime();
    keyPressed.value = 0;
    this.setTargetBackground();

    ball = {
      position: {x: 0, y: 0},
      velocity: 0,
      radius: 0.02381 * super.Utils.SCALE,
      restitution: super.Utils.restitution,
      timeReached: 0

    };

    randomNumber = Math.floor(Math.random() * 3); // Get random value from 0 to 2
    ball = super.ballObject();

    if(super.currentRounds > 0 ) {
      sounds[gameSound.START].play();
    }

    super.initGame();

  }


  setTargetBackground() {
    let topBorder = (1.155) * super.Utils.SCALE;
    let downBorder = (1.235) * super.Utils.SCALE;
    let leftBorder = (TARGETX - 0.05) * super.Utils.SCALE;
    let rightBorder = (TARGETX + 0.05) * super.Utils.SCALE;

    target = {

      dimensions: {width: rightBorder - leftBorder, height: downBorder - topBorder},
      position: {
        x: leftBorder,
        y: topBorder
      },
      radius: 0.007143 * super.Utils.SCALE
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

      game_type: 'buttonPressWindow',
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
   * Draw launcher image
   * @method createLauncher
   * @param image
   */
  createLauncher(image) {

    let initX  = 0.7510;
    let leftBorder = (initX - 0.05) * super.Utils.SCALE;
    let topBoarder = (1.3171) * super.Utils.SCALE;

    let launcher = {
      position: {x:leftBorder, y:topBoarder },
      dimensions: {width: 0.13605 * super.Utils.SCALE , height:0.1548 * super.Utils.SCALE }
    };

    super.drawImageObject(launcher, image);

  }


  /**
   *
   * Main loop of the game
   * Set initial position of the ball in a box and initiate starting sound.
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
    this.createShuttle();
    this.createTargetWindow();

    // Delay before music start
    if(initialTime === 0 && super.currentRounds === 0  && super.getElapsedTime(startTime) >= INITIAL_DELAY) {

      sounds[gameSound.START].play();

    }


    if (ball.state === 'start') {

      super.moveBallToStart(ball, images[gameImage.BALL]);
      if (initialTime > 0 && super.getElapsedTime(initialTime) > jitterT) {
        sounds[gameSound.START].pause();
        sounds[gameSound.START].currentTime = 0;
        ball.state = 'fall';
        initialTime = new Date().getTime();


      }

    }


    if (ball.state === 'fall') {

      if (initialTime > 0 && super.getElapsedTime(initialTime) < TOTAL_FLIGHT_TIME) {
        super.trajectory(ball, initialTime);
      }

      if (initialTime > 0 && super.getElapsedTime(initialTime) > 0.1 && super.ballIsOnFloor(ball)) {
        sounds[gameSound.FAIL].play();
        ball.state = 'hit';
      }


      super.drawBall(ball, images[gameImage.BALL]);
      this.createShuttle();
      this.createTargetWindow();


      //Check for target (star) position , if we are within the window size
      if (keyPressed.value === 1) {

        let position = Math.abs(ball.position.x - CENTER * super.Utils.SCALE );

        if (position < TARGET_SIZE * super.Utils.SCALE) {
          super.increaseScore();
          ball.hitstate = 'great';
          keyPressed.value = 3;
          sounds[gameSound.CATCH_GREAT].play();


        } else if (position < (WINDOW_SIZE) * super.Utils.SCALE) {
          keyPressed.value = 2;
          ball.hitstate = 'good';
          sounds[gameSound.CATCH_GOOD].play();

        } else {
          sounds[gameSound.FAIL].play();

        }

        ball.state = 'hit';

      }

    }


    if (ball.state === 'hit') {

      let difference = ball.position.x - CENTER * super.Utils.SCALE;
      if (ball.hitstate === 'great') {
        let explosion = this.setExplosionPosition(4, 0.03572 * super.Utils.SCALE);
        super.drawImageObject(explosion, targetImgs[randomNumber]);
      }

      if (ball.hitstate === 'good') {
        let explosion = this.setExplosionPosition(2, difference);
        super.drawImageObject(explosion, targetImgs[3]);
      }


      if (super.getElapsedTime(initialTime) > 3.5) {
        super.finishGame(false);
      }

      if(ball.hitstate !== 'good' && ball.hitstate !== 'great' ){

        this.showBallLocation();
      }

    }

    this.createLauncher(images[gameImage.BALLBOX]);

  }


  setExplosionPosition(multiplier, difference) {

    return {

      dimensions: {width: target.dimensions.width * multiplier, height: target.dimensions.height * multiplier},
      position: {
        x: CENTER * super.Utils.SCALE - (target.dimensions.width * multiplier / 2) + difference,
        y: ball.position.y - target.dimensions.height * multiplier / 2 + 0.02381 * super.Utils.SCALE
      }

    };
  }



}
