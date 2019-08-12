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
let greatJob = {};
let initialTime = 0;


let TfArr = [];
let wallsize = 0.25;
let targetX = 1.3310;
let winsize = 0.1;
let targetsize = 0.005;
let jitterT = 0;
let fireworks =  []
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



  createRect(x,y,width,height,color){

    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.rect(x, y, width, height);
    this.ctx.fill();
    this.ctx.closePath();
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
    this.ctx.lineWidth = '4';
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

    ball = super.ballObject();

    initSoundPlaying = true;
    startSound.play();
    startSound.addEventListener('playing', function () {
      initSoundPlaying = false;
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
    super.discreteLauncer(super.Utils.boxOfFireworks);
    if(ball.state === 'start'){

      super.moveBallToStart(ball, super.Utils.Fireball,false);
      if (initialTime > 0 && super.getElapsedTime(initialTime) > jitterT) {
        startSound.pause();
        startSound.currentTime = 0;
        ball.state = 'fall';
        initialTime = new Date().getTime();


      }

    }


    if (ball.state === 'hit') {
      super.drawBall(ball, super.Utils.Fireball);
      super.waitSeconds(2500);
      super.finishGame(false);

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


      if (keyPressed.value === true ) {

        if(ball.position.x < (targetX+0.42)*super.Utils.SCALE   ){

          let position = Math.abs(ball.position.x - targetX*super.Utils.SCALE);
          if(position < targetsize*super.Utils.SCALE){
            let exposion = {

              dimensions:{width:target.dimensions.width*4 , height:target.dimensions.width*4 },
              position:ball.position

            }

            // this.createWindow();
            greatJob.play();
            this.drawImageObject(exposion,super.Utils.Explosion_big_blue);

          }else if(position < (winsize/2)*super.Utils.SCALE){

            let exposion = {

              dimensions:{width:target.dimensions.width*2 , height:target.dimensions.width*2 },
              position:ball.position

            }

            // this.createHouse();

            goodJob.play();
            this.drawImageObject(exposion,super.Utils.Explosion_small);


          }else{

            ballCatchFail.play();

          }


          this.showBallLocation();


        }else{

          ballCatchFail.play();

        }



        ball.state = 'hit';


      }





    }
  }

}
