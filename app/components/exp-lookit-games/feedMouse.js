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
let fireworkWhistle = {};
let randomNumber = 0;
let TfArr = [];
let wallsize = 0.25;
let targetX = 1.3310;
let jitterT = 0;
let winsize = 0.05;
let targetsize = 0.02;
let fireworks =  []
const CENTER  = 549;
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
    fireworks = [super.Utils.Explosion_big_blue,super.Utils.Explosion_big_green,super.Utils.Explosion_big_red];


  }




  /**
   * Draw house with roof according to coordinates
   * @method createHouse
   */
  createHouse() {

    let leftBorder = (targetX - 0.5-wallsize)*super.Utils.SCALE ;
    let topBorder = (0.8)*super.Utils.SCALE;

    let houseObj ={

      dimensions:  {width: 1.54*super.Utils.SCALE, height:  0.9 * super.Utils.SCALE},
      position : {x : leftBorder , y : topBorder}

    }

    super.drawImageObject(houseObj, super.Utils.skyline);

  }

  /**
   * Create the window in the house
   * @method createWindow
   * @param target
   */
  createWindow() {

    super.drawImageObject(target,super.Utils.star);

  }


  /**
   * Show the current  ball location .
   * Center the ball location.
   * @method showBallLocation
   * @param target
   */
  showBallLocation(){


    super.drawBall(ball, super.Utils.Fireball);


  }


  /**
   * Main point to start the game.
   * Initialize static parameters and preload sounds here
   * @method init
   */
  init() {
    super.init();
    TfArr = super.uniformArr([0.8,0.9,1]);
    goodJob = new Audio(super.Utils.firework_small);
    goodJob.load();

    ballCatchFail = new Audio(super.Utils.firework_hidden);
    ballCatchFail.load();

    startSound = new Audio(super.Utils.fuse);
    startSound.src = super.Utils.fuse;
    goodJob.src = super.Utils.firework_small;

    greatJob =  new Audio(super.Utils.firework_big);
    greatJob.src = super.Utils.firework_big;
    greatJob.load();

    ballCatchFail.src = super.Utils.ballcatchFailSound;
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
    initialTime = 0;
    ball.startTime =0;
    jitterT = super.trialStartTime();
    keyPressed.value = false;
    let topBorder = (1.14)*super.Utils.SCALE;
    let downBorder =  (1.22)*super.Utils.SCALE ;
    let leftBorder = (targetX-0.05)*super.Utils.SCALE ;
    let rightBorder = (targetX+0.05)*super.Utils.SCALE;


    target = {

      dimensions: {width: rightBorder-leftBorder,height: downBorder-topBorder},
      position: {
        x: leftBorder,
        y: topBorder
      },
      radius: 3,
      color: super.Utils.grayColor,
      roofcolor: super.Utils.redColor,
      houseColor: super.Utils.grayColor,
      windowbackground: super.Utils.blackColor

    };



    ball = {
      position: {x: 0, y: 0},
      velocity: 0,
      mass: super.Utils.ballMass,
      radius: 10,
      restitution: super.Utils.restitution,
      color: super.Utils.yellowColor,
      timeReached:0

    };

    randomNumber = Math.floor(Math.random() * 2) + 1;
    ball = super.ballObject();
    startSound = new Audio(super.Utils.fuse);
    startSound.play();
    startSound.addEventListener('playing', function () {
      initialTime = new Date().getTime();
    });

    super.initGame();

  }


  /**
   * @method dataCollection
   */
  dataCollection() {
    super.dataCollection();
    let exportData = {

      game_type: 'feedMouse',
      ball_position_x: ball.position.x/this.canvas.width,
      ball_position_y: (this.canvas.height - ball.position.y)/this.canvas.height,
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

      keyPressed = {value:true,when:new Date().getTime()};
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
    super.generateTrajectoryParamsDiscrete(TfArr);
    this.createHouse();
    this.createWindow();

    if(ball.state === 'start'){

      super.moveBallToStart(ball, super.Utils.Fireball,false);
      if (initialTime > 0 && super.getElapsedTime(initialTime) > jitterT) {
        startSound.pause();
        startSound.currentTime = 0;
        ball.state = 'fall';
        initialTime = new Date().getTime();


      }

    }




    if(ball.state === 'fall'){

      if(initialTime > 0 && super.getElapsedTime(initialTime) < 1.5) {
        super.trajectory(ball, initialTime);
      }

      if(initialTime > 0 && super.getElapsedTime(initialTime)> 1 && super.ballIsOnFloor(ball)) {
        ballCatchFail.play();
        ball.state = 'hit';
      }


      super.drawBall(ball,super.Utils.Fireball);
      this.createHouse();

      if(ball.state === 'fall') {

        if (initialTime > 0 && super.getElapsedTime(initialTime) < 1.5) {
          super.trajectory(ball, initialTime);
        }

        if (initialTime > 0 && super.getElapsedTime(initialTime) > 1 && super.ballIsOnFloor(ball)) {
          ballCatchFail.play();
          ball.state = 'hit';
        }


        super.drawBall(ball, super.Utils.Fireball);
        this.createHouse();
        this.createWindow();


        //Check for target (red dot) position , if we are within the window size
        if (keyPressed.value === true) {

          let position = Math.abs(ball.position.x - CENTER );

          if (position < targetsize * super.Utils.SCALE) {
            super.increaseScore();
            ball.hitstate = 'great';
            greatJob.play();


          }else if(position < (winsize)*super.Utils.SCALE){

            ball.hitstate = 'good';
            goodJob.play();

          } else {
            ballCatchFail.play();

          }

          ball.state = 'hit';

        }


      }





    }

    if (ball.state === 'hit') {

      // greatJob.currentTime = 0;
      //goodJob.currentTime = 0;
      //super.drawBall(ball, super.Utils.Fireball);
      // this.createWindow();
      let difference = ball.position.x - CENTER ;
      if(ball.hitstate === 'great'){
        let explosion = this.setExplostionPosition(4,ball);
        super.drawImageObject(explosion,fireworks[randomNumber]);
      }

      if(ball.hitstate === 'good'){
        let explosion = this.setExplostionPosition2(2,ball,difference);
        super.drawImageObject(explosion,super.Utils.Explosion_small);
      }


      if(super.getElapsedTime(initialTime) > 3.5) {
        super.finishGame(false);
      }

      this.showBallLocation();
    }

    super.discreteLauncer(super.Utils.boxOfFireworks);

  }

  setExplostionPosition(multiplier,ball) {

    let explosion = {

      dimensions: {width: target.dimensions.width * multiplier, height: target.dimensions.height * multiplier},
      position: {x:CENTER - (target.dimensions.width*multiplier/2)  + 15, y : ball.position.y - target.dimensions.height*multiplier/2 + 10}

    };
    return explosion;
  }


  setExplostionPosition2(multiplier,ball,difference) {


    let explosion = {

      dimensions: {width: target.dimensions.width * multiplier, height: target.dimensions.height * multiplier},
      position: {x:CENTER - (target.dimensions.width*multiplier/2) + difference , y : ball.position.y - target.dimensions.height*multiplier/2 + 10}

    };
    return explosion;
  }

}
