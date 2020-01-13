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
let keyPressed = {}; // Current key pressed status
let randomNumber = 0; // Current random number for fireworks (decide which color to display)
let TfArr = []; // Time Flight array
let TfArrIndex = [0.85,1,1.15];
const TARGETX = 1.3310; // Current X position
let jitterT = 0; // Time jitter (variates from 500 ms to 1500 ms), time between sound start and ball starting to fly
const WINDOW_SIZE = 0.066; //Current window size
const TARGET_SIZE = 0.02;  // Current target (star) size
const CENTER = 1.30715;  // Appropriate star position in center
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
let STAR_SIZE = 0.03;


// Media mapping as Enum
const gameSound = {
  START: 0,
  CATCH_GREAT: 1,
  CATCH_GOOD: 2,
  FAIL:3,
  WHISTLE:4
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
 * Main implementation of feed  the mouse in the house game.
 * The user will operate with keyboard keys to predict when ball trajectory will hit the window.
 * The trajectory is randomized with various values in trajectories array
 * @class ButtonPressWindow
 * @extends Base
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
    soundURLs = [super.Utils.fuse, super.Utils.firework_big, super.Utils.firework_small, super.Utils.ballcatchFailSound, super.Utils.firework_whistle];
    imageURLs = [super.Utils.skyline,super.Utils.Fireball,super.Utils.star,super.Utils.boxOfFireworks];

  }


  /**
   * Draw house with roof according to coordinates
   * @method createBackground
   */
  createBackground() {

    let leftBorder = (TARGETX - 0.74) * super.Utils.SCALE;
    let topBorder = (0.8) * super.Utils.SCALE;

    let backgroundObj = {

      dimensions: {width: 1.54 * super.Utils.SCALE, height: 0.9 * super.Utils.SCALE},
      position: {x: leftBorder, y: topBorder}

    };

    super.drawImageObject(backgroundObj, images[gameImage.BACKGROUND]);

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

    super.drawBall(images[gameImage.BALL]);

  }


  /**
   * Main point to start the game.
   * Initialize static parameters and preload sounds here
   * @method init
   */
  init() {
    startTime = new Date().getTime();

    if(this.context.trialType === 'demo'){
      TfArr =   this.context.demoTrajectories;
    }else{
      TfArr = super.uniformArr(TfArrIndex); // Fill out uniform the Time Flight array
    }

    this.setTargetBackground();
    super.fillAudioArray(soundURLs,sounds);
    super.fillImageArray(fireworksURLs,targetImgs);
    super.fillImageArray(imageURLs,images);
    images.push(targetImgs);

    sounds[gameSound.START].addEventListener('onloadeddata', this.initGame(), false);
    sounds[gameSound.START].addEventListener('playing', super.onSoundEvent);

    super.init();

  }


  /**
   * Initialize each game round with initial object parameters
   * Wait for start sound and start the main game loop
   * @method initGame
   */
  initGame() {
    jitterT = super.trialStartTime();
    keyPressed.value = 0;
    this.setTargetBackground();
    randomNumber = Math.floor(Math.random() * 3); // Get random value from 0 to 2
    super.ballObject();
    if(super.currentRounds > 0 ) {
      sounds[gameSound.START].play();
    }

    super.initGame();

  }


  setTargetBackground() {
    let topBorder = (1.178) * super.Utils.SCALE;
    let leftBorder = (TARGETX - STAR_SIZE/2) * super.Utils.SCALE;

    target = {

      dimensions: {width: STAR_SIZE * super.Utils.SCALE , height: STAR_SIZE * super.Utils.SCALE},
      position: {
        x: leftBorder,
        y: topBorder
      },
      radius: 0.007143 * super.Utils.SCALE
    };

  }

  /**
   * trajectory  : 1,2,3 ( Time when ball hits the basket at 500,600,700 ms )
   * @method dataCollection
   */
  dataCollection() {
    //Set  0,1,2,3 as button pressed values (0:  no button pressed, 1 : pressed , missed target, 2 : pressed, within
    // window, 3 : hit the target)
    if(super.ball.state === 'hit' || super.ball.state === 'fall') {
      let currentTrajectory = TfArrIndex.indexOf(TfArr[this.currentRounds]) + 1;
      let exportData = {

        game_type: 'buttonPressWindow',
        trajectory: currentTrajectory,
        ball_position_x: super.convertXvalue(super.ball.position.x),
        ball_position_y: super.convertYvalue(super.ball.position.y),
        ball_timestamp: super.ball.timestamp,
        button_pressed: keyPressed.value,
        trial: super.currentRounds,
        trialType: this.context.trialType,
        timestamp: super.getElapsedTime(),
        feedback: super.ballState(),
        scale: super.Utils.SCALE.toFixed(1),
        window_height: screen.height,
        window_width: screen.width,
        target_position: TARGETX.toFixed(3)

      };

      super.storeData(exportData);
    }
    super.dataCollection();
  }


  /**
   * Get current keyboard event on press button
   * @method keyDownHandler
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
    this.createBackground();
    this.createTargetWindow();
    // Delay before music start
    if(super.gameState.initialTime === 0 && super.currentRounds === 0  && super.getElapsedTime(startTime) >= INITIAL_DELAY) {

      sounds[gameSound.START].play();

    }


    if (super.ball.state === 'start') {

      super.moveBallToStart(images[gameImage.BALL]);
      if (super.gameState.initialTime > 0 && super.getElapsedTime() > jitterT) {
        sounds[gameSound.START].pause();
        sounds[gameSound.START].currentTime = 0;
        super.ball.state = 'fall';
        sounds[gameSound.WHISTLE].play();
        super.gameState.initialTime = new Date().getTime();


      }

    }


    if (super.ball.state === 'fall') {

      if (super.gameState.initialTime > 0 && super.getElapsedTime() < TOTAL_FLIGHT_TIME) {
        super.trajectory();
      }

      if (super.gameState.initialTime > 0 && super.getElapsedTime() > 0.1 && super.ballIsOnFloor()) {
        sounds[gameSound.FAIL].play();
        super.ball.state = 'hit';
      }


      super.drawBall(images[gameImage.BALL]);
      this.createBackground();
      this.createTargetWindow();


      //Check for target (star) position , if we are within the window size
      if (keyPressed.value === 1) {
        sounds[gameSound.WHISTLE].pause();
        sounds[gameSound.WHISTLE].currentTime = 0;
        let position = Math.abs(super.ball.position.x - CENTER * super.Utils.SCALE );

        if (position < TARGET_SIZE * super.Utils.SCALE) {
          super.increaseScore();
          super.ball.hitstate = 'very good';
          keyPressed.value = 3;
          sounds[gameSound.CATCH_GREAT].play();


        } else if (position < (WINDOW_SIZE) * super.Utils.SCALE) {
          keyPressed.value = 2;
          super.ball.hitstate = 'good';
          sounds[gameSound.CATCH_GOOD].play();

        } else {
          sounds[gameSound.FAIL].play();

        }

        super.ball.state = 'hit';

      }

    }


    if (super.ball.state === 'hit') {

      let difference = super.ball.position.x - CENTER * super.Utils.SCALE;
      if (super.ball.hitstate === 'very good') {
        let explosion = this.setExplosionPosition(10, 0.03572 * super.Utils.SCALE);
        super.drawImageObject(explosion, targetImgs[randomNumber]);
      }

      if (super.ball.hitstate === 'good') {
        let explosion = this.setExplosionPosition(6, difference);
        super.drawImageObject(explosion, targetImgs[3]);
      }


      if (super.getElapsedTime() > 3.5) {
        super.finishGame(false);
      }

      if(super.ball.hitstate !== 'good' && super.ball.hitstate !== 'very good' ){

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
        y: super.ball.position.y - target.dimensions.height * multiplier / 2 + 0.02381 * super.Utils.SCALE
      }

    };
  }



}
