/*
 * Developed by Gleb Iakovlev on 5/3/19 9:09 PM.
 * Last modified 4/29/19 8:18 PM.
 * Copyright (c) Cognoteq Software Solutions 2019.
 * All rights reserved
 */

import Base from './base';

/**
 *
 * @submodule games
 *
 */
const INITIAL_DELAY = 2.5;
let ball = {};
let targets = [];
let pressed = {};
let keys = ['y', 'g', 'v']; //Keyboard keys for upper,middle and lower windows
let currentTargetIndex = 0;
let initialTime = 0; // initial time for current game trial
let initVmatrix = []; //Initial velocity matrix uniformly distributed and randomized
let obstructions = []; // Array of possible obstructions parameters
let jitterT = 0; // Time jitter (variates from 500 ms to 1500 ms), time between sound start and ball starting to fly
let startTime = 0; // start of the game to wait before music playing

// Media arrays for loading
let windowImgs = [];
let windowImageURLS = [];
let obstrImgs = [];
let obstrImageURLS = [];
let sounds = [];
let soundURLs = [];
let imageURls = [];
let images = [];

// Media mapping as Enum
const gameSound = {
    START: 0,
    LAUNCH: 1,
    CATCH: 2,
    FAIL: 3
};

const gameImage = {
    LAUNCHER: 0,
    BALL: 1,
    TARGET: 2,
    window: {
      WINDOW1: 0,
      WINDOW2: 1,
      WINDOW3: 2
    },
    shuttle: {
      SMALL: 0,
      MIDDLE: 1,
      LARGE: 2
    }
};



/**
 * The user will operate with keyboard keys to predict which ball trajectory will hit which window
 * in the house.
 * The trajectory is randomized with various values in trajectories array
 * Initialize the mice image for each mouse as an array
 * @class DiscreteButtonSpatial
 * @extends Base
 */
export default class DiscreteButtonSpatial extends Base {

  /**
   * @method constructor
   * @constructor
   * @param context
   * @param document
   */
  constructor(context, document) {
    super(context, document);
    imageURls = [super.Utils.slimeMonster, super.Utils.slimeBall, super.Utils.splat];
    windowImageURLS = [super.Utils.openWindowYellow, super.Utils.openWindowGreen, super.Utils.openWindowViolet];
    obstrImageURLS = [super.Utils.shuttleNarrow, super.Utils.shuttle, super.Utils.shuttleWide];
    soundURLs = [super.Utils.monsterGrowl, super.Utils.monsterLaunch, super.Utils.good3MouseSound, super.Utils.bad3MouseSound];

  }

  /**
   * Get Current window position and align it according to possible obstruction (shuttle) size
   * @param index of the target (shuttle) in array of objects
   * @returns {{image: *, position: {x: number, y: number}, radius: number, dimensions: {width: number, height: number}}}
   */
  getWindow(index) {
    index = index + 1;
    let top = 1.12;
    let leftBorder = (1.5450) * super.Utils.SCALE;
    let windowPosition = gameImage.window.WINDOW1;
    switch (index) {

      case 2:

        top = 1.25;
        windowPosition = gameImage.window.WINDOW2;
        leftBorder = (1.555) * super.Utils.SCALE;

        break;

      case 3:

        top = 1.39;
        windowPosition = gameImage.window.WINDOW3;
        leftBorder = (1.555) * super.Utils.SCALE;
        break;

    }

    let topBorder = top * super.Utils.SCALE;

    return {
      dimensions: {width: 0.10238 * super.Utils.SCALE, height: 0.075 * super.Utils.SCALE},
      position: {
        x: leftBorder,
        y: topBorder
      },
      radius: 0.00956 * super.Utils.SCALE,
      image: windowImgs[windowPosition]
    };

  }



  /**
   * Draw target  according to coordinates
   * @method createShuttle
   */
  createShuttle() {

    let leftBorder = 0.798 * super.Utils.SCALE;
    let topBorder = 0.78 * super.Utils.SCALE;

    let targetParams = {

      dimensions: {width: 1.19 * super.Utils.SCALE, height: 1.135 * super.Utils.SCALE},
      position: {x: leftBorder, y: topBorder}
    };


    this.getShuttle(targetParams);

  }


  /**
   *
   * Get shuttle image from sources and display according to position parameters
   * @param targetParams target position parameters
   * @method getShuttle
   */
  getShuttle(targetParams) {

    let index = obstructions[super.currentRounds]; // Get current shuttle case
    let shuttle = {};
    targetParams.position.x = {};

    switch (index) {

      case 2:
        targetParams.position.x = 0.798 * super.Utils.SCALE;
        shuttle = obstrImgs[gameImage.shuttle.MIDDLE];
        break;
      case 3:
        targetParams.position.x = 0.77 * super.Utils.SCALE;
        shuttle = obstrImgs[gameImage.shuttle.LARGE];
        break;
      default:
        targetParams.position.x = 0.81 * super.Utils.SCALE;
        shuttle = obstrImgs[gameImage.shuttle.SMALL];
        break;


    }

    super.drawImageObject(targetParams, shuttle);

  }


  /**
   * Create the window in the target
   * @method createTargetWindow
   * @param target
   */
  createWindow(target) {

    super.drawImageObject(target, target.image);

  }

  /**
   * Main point to start the game.
   * Initialize static parameters and preload sounds here
   * @method init
   */
  init() {
    startTime = new Date().getTime();
    initVmatrix = super.uniformArr([1, 2, 3]);
    obstructions = super.uniformArr([1, 2, 3]);

    super.fillAudioArray(soundURLs,sounds);
    super.fillImageArray(imageURls,images);
    super.fillImageArray(windowImageURLS,windowImgs);
    super.fillImageArray(obstrImageURLS,obstrImgs);


    sounds[gameSound.START].addEventListener('onloadeddata', this.initGame(), false);
    sounds[gameSound.START].addEventListener('playing', function () {
      initialTime = new Date().getTime();
    });
    super.init();
  }


  /**
   * Initialize each game round with initial object parameters
   * Randomize number of obstructions (obstructions)
   * Reset the sounds sources for older browser versions
   * Wait for start sound and start the main game loop
   * @method initGame
   */
  initGame() {
    initialTime = 0;
    pressed = Array(3).fill(false);
    jitterT = super.trialStartTime();
    ball = {
      position: {x: 0, y: 0},
      radius: 0.02385 * super.Utils.SCALE,
      restitution: super.Utils.restitution,
      timeReached: new Date().getTime()

    };

    ball = super.ballObject();

    if(super.currentRounds > 0 ){
      sounds[gameSound.START].play();
    }

    targets = Array(3).fill({}).map((_, index) =>

      (this.getWindow(index))
    );
    if(super.getElapsedTime(startTime) >= 2) {
      sounds[gameSound.START].play();
    }

    super.initGame();

  }


  /**
   * Show the ball location in window.
   * Center the ball location.
   * @method showBallLocation
   * @param index Index of the object in array
   */
  showBallLocation(index) {

    //Put the ball in the center of target once it hits window constraints
    let target = targets[index];

    let splat = {

      dimensions: {width: 0.09645 * super.Utils.SCALE, height: 0.09107 * super.Utils.SCALE},
      position: {x: target.position.x - 0.0238 * super.Utils.SCALE, y: target.position.y}
    };

    super.drawImageObject(splat, images[gameImage.TARGET]);


  }


  /**
   * Set appropriate index value in pressed array, according to index of the key pressed
   * @method  keyDownHandler
   * @param e {object} event
   */
  keyDownHandler(e) {

    if (ball.state !== 'hit' && ball.state !== 'hit target') {
      pressed = pressed.fill(false);
      pressed = pressed.map((val, index) => keys[index] === e.key );
    }

  }

  /**
   * Display launcher
   * @param image of the Launcher
   */
  discreteLauncher(image) {


    let leftBorder = (0.701) * super.Utils.SCALE;
    let topBorder = (1.3671) * super.Utils.SCALE;

    let launcher = {

      dimensions: {width: 0.19 * super.Utils.SCALE, height: 0.273 * super.Utils.SCALE},
      position: {x: leftBorder, y: topBorder}
    };
    super.drawImageObject(launcher, image);


  }


  /**
   * Main loop of the game
   * Set initial position of the ball in a box and starting sound .
   * After that  start ball trajectory.
   * If ball hits the target or missed the target(window) show the ball in the window and selected window
   * clicked by user (indicate the window background with color).
   * Increase the score if ball hits the window.
   * Move the ball to initial position.
   * Wait for some time until rattle sound played.
   * @method keyDownHandler
   */
  loop() {
    super.loop();
    super.generateTrajectoryParamsDiscreteSpatial(initVmatrix);
    this.discreteLauncher(images[gameImage.LAUNCHER]);

    let index = pressed.findIndex(item => item !== false);

    if(initialTime === 0 && super.currentRounds === 0  && super.getElapsedTime(startTime) >= INITIAL_DELAY) {

      sounds[gameSound.START].play();

    }

    if (ball.state === 'start') {
      super.moveBallToStart(ball, images[gameImage.BALL]);
      if (initialTime > 0 && super.getElapsedTime(initialTime) > jitterT) {
        sounds[gameSound.START].pause();
        sounds[gameSound.LAUNCH].play();
        initialTime = new Date().getTime();
        ball.state = 'fall';

      }


    }


    if (ball.state === 'fall') {

      super.trajectory(ball, initialTime);
      super.drawBall(ball, images[gameImage.BALL]);
      if (super.getElapsedTime(initialTime) >= 0.5) {

        ball.state = 'hit house';
      }


    }

    if ((ball.state === 'fall' || ball.state === 'hit house') && index >= 0) {

      ball.state = 'hit';

    }


    if (ball.state === 'hit house') {
      if (super.getElapsedTime(initialTime) >= 2.5) {
        initialTime = new Date().getTime();
        ball.state = 'hit';
      }

    }


    if (ball.state === 'hit') {
      if (index >= 0) {
        let target = targets[index];
        this.createWindow(target);
        this.showWindow(index);
      }
      // Check if current index of the pressed item corresponds to the actual target index
      if (index === currentTargetIndex) {

        sounds[gameSound.CATCH].play();

      } else {
        sounds[gameSound.FAIL].play();
      }


      ball.state = 'hit target';

    }

    this.createShuttle();

    if (ball.state === 'hit target') {
      if (index >= 0) {
        let target = targets[index];
        this.createWindow(target);
        this.showWindow(index);
      }
      if (super.getElapsedTime(initialTime) >= 3) {
        super.finishGame(false);
      }


    }


  }


  /**
   * Show selected window
   * @method showWindow
   * @param index
   */
  showWindow(index) {
    let pressed_target = targets[index];

    if (pressed_target) {
      this.createWindow(pressed_target);

    }

    let indexArr = [2, 1, 0];
    currentTargetIndex = indexArr[initVmatrix[super.currentRounds] - 1];

    //Show ball only on button press
    if (index >= 0) {
      this.showBallLocation(currentTargetIndex);
    }
  }

  /**
   * @method dataCollection
   */
  dataCollection() {
    super.dataCollection();
    //Set  0,1,2,3,4,5,6  as buttons pressed values (0:  no buttons pressed, 1 : upper button pressed  , 2: middle
    // button pressed , 3 : down button pressed, 4 : upper button correct , 5 : middle button correct , 6 : down
    // button correct

    let target_state =  0;
    let index = pressed.findIndex(item => item !== false);
    if(keys[index] !== undefined){
      target_state = index + 1;

      if(index === currentTargetIndex){
        target_state = target_state +3;
      }
    }


    let exportData = {
      game_type: 'feedMice',
      ball_position_x: ball.position.x,
      ball_position_y: ball.position.y,
      key_pressed: target_state,
      trial: super.currentRounds,
      timestamp: new Date().getTime()

    };

    super.storeData(exportData);

  }

}
