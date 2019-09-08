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

let ball = {};
let targets = [];
let pressed = {};
let keys = ['y', 'g', 'v']; //Keyboard keys for upper,middle and lower windows
let windowImageURLS = [];
let shuttlImageURLS = [];
let audio = {};
let ballCatchFail = {};
let goodJob = {};
let currentTargetIndex = 0;
let initialTime = 0;
let initVmatrix = [];
let shuttles = [];
let jitterT = 0;


let ballImg = {};
let ballBoxImg = {};
let splatImg = {};

let windowImgs = [];
let shuttlImgs = [];

/**
 * Main implementation of feed  the mice in the house game.
 * The user will operate with keyboard keys to predict which ball trajectory will hit which window
 * in the house.
 * The trajectory is randomized with various values in trajectories array
 * Initialize the mice image for each mouse as an array
 * @class FeedMice
 * @extends Base
 */
export default class FeedMice extends Base {

  /**
   * @method constructor
   * @constructor
   * @param context
   * @param document
   */
  constructor(context, document) {
    super(context, document);
    windowImageURLS = [super.Utils.openWindowYellow, super.Utils.openWindowGreen, super.Utils.openWindowViolet];
    shuttlImageURLS = [super.Utils.shuttleNarrow, super.Utils.shuttle, super.Utils.shuttleWide];

  }


  targetCoord(index) {
    index = index + 1;

    let top = 1.12;
    let leftBorder = (1.5450) * super.Utils.SCALE;


    switch (index) {

      case 2:

        top = 1.25;
        leftBorder = (1.555) * super.Utils.SCALE;

        break;

      case 3:

        top = 1.39;
        leftBorder = (1.555) * super.Utils.SCALE;

        break;

    }

    let topBorder = top * super.Utils.SCALE;
    let image = new Image();
    image.src = windowImageURLS[index - 1];

    let target = {

      dimensions: {width: 86 / 2, height: 63 / 2},
      position: {
        x: leftBorder,
        y: topBorder
      },
      radius: 4,
      color: super.Utils.grayColor,
      roofcolor: super.Utils.redColor,
      windowbackground: super.Utils.blackColor,
      image: windowImgs[index-1]


    };

    return target;

  }



  /**
   * Draw house with roof according to coordinates
   * @method createShuttle
   */
  createShuttle() {


    //Draw House
    let leftBorder = 0.798 * super.Utils.SCALE;
    let topBorder = (0.78) * super.Utils.SCALE;

    let houseObj = {

      dimensions: {width: 1.19 * super.Utils.SCALE, height: 1.135 * super.Utils.SCALE},
      position: {x: leftBorder, y: topBorder}
    };


    this.getShuttle(houseObj);

  }


  /**
   *
   * Get shuttle image from sources
   * @method getShuttle
   */
  getShuttle(houseObj) {

    let index = shuttles[super.currentRounds];
    let shuttle = shuttlImgs[0];
    houseObj.position.x = 0.81 * super.Utils.SCALE;

    switch (index) {

      case 2:

        houseObj.position.x = 0.798 * super.Utils.SCALE;
        shuttle = shuttlImgs[1];

        break;
      case 3:

        houseObj.position.x = 0.77 * super.Utils.SCALE;
        shuttle = shuttlImgs[2];

        break;

    }

    super.drawImageObject(houseObj, shuttle);

  }


  /**
   * Create the window in the target
   * @method createWindow
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
    super.init();
    initVmatrix = super.uniformArr([1, 2, 3]);
    shuttles = super.uniformArr([1, 2, 3]);
    goodJob = new Audio(super.Utils.good3MouseSound);
    goodJob.load();

    ballCatchFail = new Audio(super.Utils.bad3MouseSound);
    ballCatchFail.load();

    audio = new Audio(super.Utils.monsterGrowl);
    audio.load();
    goodJob.src = super.Utils.good3MouseSound;
    ballCatchFail.src = super.Utils.bad3MouseSound;
    audio.src = super.Utils.monsterGrowl;


    ballImg = new Image();
    ballImg.src = super.Utils.slimeBall;

    ballBoxImg = new Image();
    ballBoxImg.src = super.Utils.slimeMonster;

    splatImg = new Image();
    splatImg.src = super.Utils.splat;

    super.fillImageArray(windowImageURLS,windowImgs);
    super.fillImageArray(shuttlImageURLS,shuttlImgs);

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
    initialTime = 0;
    pressed = Array(3).fill(false);
    jitterT = super.trialStartTime() / 10;
    ball = {
      position: {x: 0, y: 0},
      mass: super.Utils.ballMass,
      radius: 10,
      restitution: super.Utils.restitution,
      color: super.Utils.yellowColor,
      timeReached: new Date().getTime()

    };

    ball = super.ballObject();

    targets = Array(3).fill({}).map((_, index) =>

      (this.targetCoord(index))
    );
    audio.play();
    audio.addEventListener('playing', function () {
      initialTime = new Date().getTime();
    });

    super.initGame();

  }


  /**
   * Show the ball location in window.
   * Center the ball location.
   * @method showBallLocation
   * @param target
   */
  showBallLocation(index) {

    //Put the ball in the center of target once it hits window constraints
    let target = targets[index];

    let splat = {

      dimensions: {width: 162 / 4, height: 153 / 4},
      position: {x: target.position.x - 10, y: target.position.y}
    };

    super.drawImageObject(splat, splatImg);


  }


  /**
   * Set appropriate index value in pressed array, according to index of the key pressed
   * @method  keyDownHandler
   * @param e {object} event
   */
  keyDownHandler(e) {

    if (ball.state !== 'hit' && ball.state !== 'hit target') {
      pressed = pressed.fill(false);
      pressed = pressed.map((val, index) => keys[index] === e.key ? true : false);
    }

  }


  discreteLauncer(image) {


    let leftBorder = (0.7510 - 0.05) * super.Utils.SCALE;
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
   * Increase the score if ball hits the target.
   * Move the ball to initial position.
   * Wait for some time until rattle sound played.
   * @method keyDownHandler
   */
  loop() {
    super.loop();
    super.generateTrajectoryParamsDiscreteSpatial(initVmatrix);
    this.discreteLauncer(ballBoxImg);

    let index = pressed.findIndex(item => item !== false);


    if (ball.state === 'start') {
      super.moveBallToStart(ball, ballImg, false);
      if (initialTime > 0 && super.getElapsedTime(initialTime) > jitterT) {
        audio.pause();
        let startSound = new Audio(super.Utils.monsterLaunch);
        startSound.src = super.Utils.monsterLaunch;
        startSound.play();
        initialTime = new Date().getTime();
        ball.state = 'fall';

      }


    }


    if (ball.state === 'fall') {

      super.trajectory(ball, initialTime);
      super.drawBall(ball, ballImg);
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

        goodJob.play();

      } else {
        ballCatchFail = new Audio(super.Utils.bad3MouseSound);
        ballCatchFail.src = super.Utils.bad3MouseSound;
        ballCatchFail.play();
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
      if (super.getElapsedTime(initialTime) >= 2.5) {
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
   * @method dataCollection Data collection
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
