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
let keys = ['y', 'g', 'v']; //Might need to set as super parameter
let imageURLS = [];
let audio = {};
let ballCatchFail = {};
let goodJob = {};
let currentTargetIndex = 0;
let initialTime = 0;
let initVmatrix = [];
let walls = [];
let jitterT = 0;

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
    imageURLS = [super.Utils.openWindowYellow, super.Utils.openWindowViolet, super.Utils.openWindowGreen];

  }

  /**
   * Draw image object according to object positions
   * @method drawImage
   * @param object
   */
  drawImage(object) {
    let image = new Image();
    image.src = object.imageURL;
    this.ctx.drawImage(image, object.position.x, object.position.y, object.dimensions.width, object.dimensions.height);
  }




  targetCoord(index){
    index = index+1;

    let top = 1.12;
    let leftBorder = (1.5450)*super.Utils.SCALE ;


    switch(index){

      case 2:

        top = 1.25;
        leftBorder = (1.555)*super.Utils.SCALE;

        break;

      case 3:

        top = 1.39;
        leftBorder = (1.555)*super.Utils.SCALE;

        break;

    }

    let topBorder =  top*super.Utils.SCALE;

    let target = {

      dimensions: {width: 86/2 , height:63/2},
      position: {
        x: leftBorder,
        y: topBorder
      },
      radius: 4,
      color: super.Utils.grayColor,
      roofcolor: super.Utils.redColor,
      windowbackground: super.Utils.blackColor,
      imageURL: imageURLS[index-1]

    }

    return target;

  }



  /**
   * Draw house with roof according to coordinates
   * @method createHouse
   */
  createHouse() {

    let leftBorder = 0.798*super.Utils.SCALE ;
    let topBorder = (0.78)*super.Utils.SCALE;

    let houseObj  = {

      dimensions:  {width: 1.19 *super.Utils.SCALE , height: 1.135 * super.Utils.SCALE},
      position: {x: leftBorder, y: topBorder}
    }



    this.getShuttle(houseObj);


  }

  /**
   *
   * Get shuttle image from sources
   * @method getShuttle
   */
  getShuttle(houseObj){

    let index = walls[super.currentRounds]
    let shuttle = super.Utils.shuttleNarrow;
    houseObj.position.x =  0.81*super.Utils.SCALE ;

    switch (index) {

      case 2:

        houseObj.position.x =  0.798*super.Utils.SCALE ;
        shuttle =  super.Utils.shuttle;

        break;
      case 3:

        houseObj.position.x =  0.77*super.Utils.SCALE ;
        shuttle =  super.Utils.shuttleWide;

        break;

    }

    super.drawImageObject(houseObj,shuttle);

  }


  /**
   * Create the window in the house
   * @method createWindow
   * @param target
   */
  createWindow(target) {

    super.drawImageObject(target,target.imageURL);

  }

  /**
   * Main point to start the game.
   * Initialize static parameters and preload sounds here
   * @method init
   */
  init() {
    super.init();
    initVmatrix = super.uniformArr([1,2,3]);
    super.generateTrajectoryParamsDiscreteSpatial(initVmatrix);
    walls = super.uniformArr([1,2]);
    goodJob = new Audio(super.Utils.good3MouseSound);
    goodJob.load();

    ballCatchFail = new Audio(super.Utils.bad3MouseSound);
    ballCatchFail.load();

    audio = new Audio(super.Utils.monsterGrowl);
    audio.load();
    goodJob.src = super.Utils.good3MouseSound;
    ballCatchFail.src = super.Utils.bad3MouseSound;
    audio.src = super.Utils.monsterGrowl;
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
    initialTime =0;
    pressed = Array(3).fill(false);
    jitterT = super.trialStartTime();
    ball = {
      position: {x: 0, y: 0},
      mass: super.Utils.ballMass,
      radius: 10,
      restitution: super.Utils.restitution,
      color: super.Utils.yellowColor,
      timeReached:new Date().getTime()

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
  showBallLocation(index){

    //Put the ball in the center of target once it hits window constraints
    let target = targets[index];

    let splat = {

      dimensions:{width:162/4,height: 153/4},
      position:{x:target.position.x- 10,y:target.position.y}
    }

    super.drawImageObject(splat,super.Utils.splat);


  }



  /**
   * Set appropriate index value in pressed array, according to index of the key pressed
   * @method  keyDownHandler
   * @param e {object} event
   */
  keyDownHandler(e) {

    if(ball.state !== 'hit' && ball.state !== 'hit target') {
      pressed = pressed.fill(false);
      pressed = pressed.map((val, index) => keys[index] === e.key ? true : false);
    }

  }


  showWindow(index) {
    let pressed_target = targets[index];

    if (pressed_target) {
      pressed_target.windowbackground = super.Utils.whiteColor;
      this.createWindow(pressed_target);

    }

    let indexArr = [2, 1, 0];
    currentTargetIndex = indexArr[initVmatrix[super.currentRounds] - 1];

    //Show ball only on button press
    if (index >= 0) {
      this.showBallLocation(currentTargetIndex);
    }
  }


  discreteLauncer(imageURL) {



    let leftBorder = (0.7510 - 0.05) * super.Utils.SCALE;
    let topBorder = (1.3671 ) * super.Utils.SCALE;
    let launcher = {

      dimensions: {width:0.19 * super.Utils.SCALE , height : 0.273 * super.Utils.SCALE},
      position:{x:leftBorder,y:topBorder}
    }
    super.drawImageObject(launcher,imageURL);


  }

  /**
   * Main loop of the game
   * Set initial position of the ball in a box and starting rattling sound (initSoundPlaying).
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
    this.discreteLauncer(super.Utils.slimeMonster);

    let index = pressed.findIndex(item => item !== false);


    if(ball.state === 'start'){
      this.createHouse();
      super.moveBallToStart(ball, super.Utils.slimeBall,false);
      if (initialTime > 0 && super.getElapsedTime(initialTime) > jitterT) {
        audio.pause();
        let startSound = new Audio(super.Utils.monsterLaunch);
        startSound.src = super.Utils.monsterLaunch;
        startSound.play();
        initialTime = new Date().getTime();
        ball.state = 'fall';

      }


    }


    if(ball.state === 'fall') {

      super.trajectory(ball, initialTime);
      super.drawBall(ball,super.Utils.slimeBall);
      this.createHouse();
      if(super.getElapsedTime(initialTime) >= 0.5 ){

        ball.state = 'hit house';
      }


    }

    if((ball.state === 'fall' || ball.state === 'hit house') &&  index >=0){

      ball.state = 'hit';

    }



    if(ball.state === 'hit house'){
      this.createHouse();
      if( super.getElapsedTime(initialTime) >= 3.7){
        initialTime = new Date().getTime();
        ball.state = 'hit';
      }

    }



    if(ball.state === 'hit') {
      this.createHouse();
      let target = targets[index];
      this.createWindow(target);
      this.showWindow(index);

      // Check if current index of the pressed item corresponds to the actual target index
      if (index === currentTargetIndex) {
        super.increaseScore();
        goodJob.play();

      } else {

        ballCatchFail.play();
      }


      ball.state = 'hit target';

    }





    if (ball.state === 'hit target') {
      this.createHouse();
      let target = targets[index];
      this.createWindow(target);
      this.showWindow(index);
      if(super.getElapsedTime(initialTime) >= 2.5){
        super.finishGame(false);
      }


    }



  }

  /**
   * @method dataCollection Data collection
   */
  dataCollection() {
    super.dataCollection();
    let exportData = {
      game_type: 'feedMice',
      ball_position_x: ball.position.x/this.canvas.width,
      ball_position_y:(this.canvas.height - ball.position.y)/this.canvas.height,
      key_pressed_up: pressed[0],
      key_pressed_mid: pressed[1],
      key_pressed_down: pressed[2],
      trial: super.currentRounds,
      timestamp: new Date().getTime()

    };

    super.storeData(exportData);

  }

}
