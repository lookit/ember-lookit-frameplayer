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

let obstructions = []; // Possible obstructions array
let targetStars = {}; // Start location (shows upon reaching the rim on basket )
let initialTime = 0; // initial time for current game trial
let Height = 0.8; // Current trajectory height
let jitterT = 0;
let radiusRim = 0.1; //Rim size on basket
let redDotMargin = radiusRim / 4;
let obstructionsNum = 0; // Current number of obstructions (randomized each trial)
let consecutiveCounts = 0;  // Calculate number of consecutive successful attempts
let startTime = 0;
const GEAR_RADIUS = 0.05;
const TRAVEL_TIME = 1.3;
const SOUND_DELAY = 1.6;
// Media arrays for loading
let sounds = [];
let soundURLs = [];
let imageURls = [];
let images = [];
let obstructionsURLs = [];
let obstructionImages = [];
let trajectoryParameters = [];
let ball = {};
// Media mapping as Enum
const gameSound = {
  START:0,
  CATCH:1,
  FAIL:2
};
const gameImage = {
  PADDLE: 0,
  BALL: 1,
  STARS: 2,
  BALLBOX: 3

};

const gameRandomization = {

  OBSTRUCTION:0,
  HEIGHT:1


};

const gameArrayValues = {

  OBSTRUCTIONS: [0,1,2,3],
  HEIGHTS:[1, 5, 9]

};

/**
 * Main implementation of catch game.
 * The user will operate with paddle to catch the super.ball started
 * from super.ball box. The trajectory is randomized with various values in trajectories array
 * Number of obstructions currently randomized from 0 to 3 obstructions shown
 * @class DiscreteCatch
 * @extends Base
 */
export default class DiscreteCatch extends Base {
  /**
   * @method constructor
   * @constructor constructor
   * @param context
   * @param document
   */
  constructor(context, document) {
    super(context, document);
    soundURLs = [super.Utils.rattleSound,super.Utils.catchSeries,super.Utils.failcatchSound];
    imageURls = [super.Utils.ironBasket,super.Utils.gear,super.Utils.basketStarsImage,super.Utils.robotImage];
    obstructionsURLs = [super.Utils.obstruction1, super.Utils.obstruction2, super.Utils.obstruction3];

  }


  /**
   * Main point to start the game.
   * Initialize static parameters and preload sounds here
   * @method init
   */
  init() {

    if(this.context.trialType === 'demo'){
      trajectoryParameters = this.context.demoObstructions.map((obstruction,index)=> [obstruction,this.context.demoTrajectories[index]]);
    }else {
      trajectoryParameters = super.getTrajectoriesObstacles(gameArrayValues.OBSTRUCTIONS,gameArrayValues.HEIGHTS);
    }

    super.fillAudioArray(soundURLs,sounds);
    super.fillImageArray(imageURls,images);
    super.fillImageArray(obstructionsURLs,obstructionImages);




    super.paddle = {
      positions:[],
      times:[],
      velocity: super.Utils.paddleSpeed,
      paddleLastMovedMillis: 0
    };

    document.addEventListener("mousemove",  super.onMouseMove);

    //Listener for catch events, make sounds play in sections of 19 milisecondsfor consecutive successful catches
    sounds[gameSound.CATCH].addEventListener('timeupdate', function (){
      if (this.currentTime >= (consecutiveCounts+1)*SOUND_DELAY) {
        this.pause();
        if(ball.hitstate === 'very good' ){
          consecutiveCounts++;
        }
      }
    }, false);

    sounds[gameSound.START].addEventListener('playing', function () {
      startTime = 0;
      initialTime = new Date().getTime();

    });
    sounds[gameSound.START].addEventListener('onloadeddata', this.initGame(), false);
    super.init();

  }


  /**
   * Initialize each game round with initial object parameters
   * Randomize number of obstructions
   * Wait for start sound and start the main game loop
   * @method initGame
   */
  initGame() {
    super.initX = 0.51;
    super.initBallY = 0.08;
    jitterT = super.trialStartTime();
    initialTime =0;
    super.createPaddleBox();
    super.basketObject();
    obstructionsNum = trajectoryParameters[super.currentRounds][gameRandomization.OBSTRUCTION];
    super.ballObject();
    super.ball.position.y = (1.1471 )* super.Utils.SCALE;
    // Generate array of obstruction objects
    obstructions = Array(obstructionsNum).fill({}).map((value, index) =>

      ( this.getObstruction(index+1))
    );

    startTime = new Date().getTime();
    super.initGame();

  }


  /**
   * Obstruction object with coordinates
   * @method getObstruction
   * @param obstructionIndex
   * @return {{imageURL: *, position: {x: number, y: number}, dimensions: {width: number, height: number}}}
   */
  getObstruction(obstructionIndex = 1) {

    let leftBorder = (1 - 0.105 * obstructionIndex) * super.Utils.SCALE ;
    let topBorder = (0.994) * super.Utils.SCALE;
    let rightBorder = 1.18  * super.Utils.SCALE;
    let downBorder = (1.622) * super.Utils.SCALE;
    return {
      position: {x: leftBorder, y: topBorder},
      dimensions: {width: rightBorder - leftBorder, height: downBorder - topBorder},
      image: obstructionImages[obstructionIndex-1]
    };

  }

  /**
   * trajectory  : 1,2,3 ( Time when super.ball hits the basket at 500,600,700 ms )
   * obstruction : 0,1,2,3 (number of obstructions displayed)
   * @method dataCollection
   */
  dataCollection() {
    super.dataCollection();
    if(super.ball.state === 'hit' || super.ball.state === 'fall') {

      let exportData = {
        game_type: 'discreteCatch',
        trajectory: trajectoryParameters[super.currentRounds][gameRandomization.HEIGHT],
        ball_position_x: super.convertXvalue(super.ball.position.x),
        ball_position_y:  this.convertYvalue(super.ball.position.y),
        ball_timestamp: super.ball.timestamp,
        paddle_center_x: super.convertXvalue(super.paddle.position.x   + (super.paddle.dimensions.width / 2) ),
        paddle_x: super.convertXvalue(super.paddle.position.x),
        paddle_position_y: this.convertYvalue(super.paddle.position.y),
        red_dot_start_position: (1.3301 - redDotMargin)* super.Utils.SCALE / this.canvas.width,
        red_dot_width: redDotMargin*2*super.Utils.SCALE / this.canvas.width,
        obstruction_number: trajectoryParameters[super.currentRounds][gameRandomization.OBSTRUCTION],
        trial: super.currentRounds,
        trialType: this.context.trialType,
        feedback: super.ballState(),
        timestamp: super.getElapsedTime(initialTime)

      };

         super.storeData(exportData);
    }
  }




  /**
   * Check if super.ball reaches the target
   * @method collisionDetection
   * @return {boolean}
   */
  collisionDetection() {

    let basketPrevPosition = 0;
    if(super.paddle.positions.length >2){

      basketPrevPosition = this.canvas.height - (super.paddle.positions[super.paddle.positions.length-2])*super.Utils.SCALE;
    }

    let xballWithinPaddle = super.ball.position.x >= super.paddle.position.x && super.ball.position.x <=  super.paddle.position.x +  super.paddle.dimensions.width;
    let yballWithinPaddle = super.ball.positions.length >2 && super.ball.positions[super.ball.positions.length-2] <= basketPrevPosition && super.ball.position.y > super.paddle.position.y;

    if(xballWithinPaddle){
      // Prevent catching by side of the paddle
      // if(super.ball.positions.length > 2 && (super.ball.positions[super.ball.positions.length - 2] > super.paddle.position.y) ){
      //
      //   return  false;
      // }

      if (yballWithinPaddle) {



        super.ball.hitstate = 'good';

        if (super.ball.position.x > (1.3301 - redDotMargin) * super.Utils.SCALE && super.ball.position.x < (1.3301 + redDotMargin) * super.Utils.SCALE) {

          super.ball.hitstate = 'very good';
        }




        return true;
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

      position: {x: super.paddle.position.x + 0.01* super.Utils.SCALE , y: super.paddle.position.y - 0.2* super.Utils.SCALE},
      dimensions: {width: 0.14*super.Utils.SCALE, height: 0.2*super.Utils.SCALE}
    };

  }


  /**
   * Draw initial super.ball box object
   * @method createLauncher
   * @param {image}  BallBox image
   */
  createLauncher(image) {

    let leftBorder = (0.075) * super.Utils.SCALE;
    let topBorder = (1.1471 )* super.Utils.SCALE;
    this.ctx.drawImage(image, leftBorder, topBorder, super.paddle.dimensions.height*2.7, super.paddle.dimensions.height*2.7);


  }

  /**
   * Override base  method to increase super.ball size
   * @param super.ball {object}
   * @param images {object}
   */
  drawBall(images) {

    this.ctx.drawImage(images, super.ball.position.x, super.ball.position.y, GEAR_RADIUS * super.Utils.SCALE , GEAR_RADIUS * super.Utils.SCALE);

  }


  /**
   * Main loop of the game.
   * Set initial position of the super.ball in a box and starting  sound .
   * After that  start super.ball trajectory.
   * If super.ball hits the target or missed the target wait util user places the paddle to starting position.
   * Increase the score if super.ball hits the target.
   * @method loop
   */
  loop() {
    super.loop();
    ball = super.ball;
    super.generateTrajectoryParams(trajectoryParameters[super.currentRounds][gameRandomization.HEIGHT],Height);
    this.createLauncher(images[gameImage.BALLBOX]);
    let paddleBoxColor = super.Utils.blueColor;
    if(super.ball.state === 'start'){
      this.ballObject();
      super.ball.position.y = (1.291 )* super.Utils.SCALE;
      if (startTime > 0 &&   super.getElapsedTime(startTime) > TRAVEL_TIME ){
        sounds[gameSound.START].play();
      }

      if(initialTime > 0 && super.isOutsideBox()){
        initialTime = new Date().getTime();
        startTime = new Date().getTime();
        sounds[gameSound.START].pause();
        sounds[gameSound.START].currentTime = 0;
        paddleBoxColor = super.Utils.redColor;
        super.createPaddleBox(paddleBoxColor);

      }

      if (initialTime > 0 && super.getElapsedTime(initialTime) > jitterT) {
        sounds[gameSound.START].pause();
        sounds[gameSound.START].currentTime = 0;
        initialTime = new Date().getTime();
        super.ball.state = 'fall';
      }

    }


    if(super.ball.state === 'fall'){
      if(initialTime > 0 && super.getElapsedTime(initialTime) <= TRAVEL_TIME) {
        super.ball.positions.push(super.ball.position.y);
        super.trajectory( initialTime);
      }

      if(initialTime > 0 && super.ballIsOnFloor()) {
        super.ball.state = 'hit';
      }

    }


    let hitTheTarget = this.collisionDetection();
    let hitTheWall = super.wallCollision();

    if((hitTheTarget || hitTheWall) && super.ball.state === 'fall'){

      super.ball.state = 'hit';
    }



    if (super.ball.state === 'hit') {


      if (super.ball.hitstate === 'very good') {

        super.increaseScore();
        if (consecutiveCounts > 10) {
          consecutiveCounts = 10;
        }
        sounds[gameSound.CATCH].currentTime = (SOUND_DELAY > 0 ? SOUND_DELAY + 0.16 : 0) * consecutiveCounts;
        sounds[gameSound.CATCH].play();
        super.ball.radius = 0;

      }else if(super.ball.hitstate === 'good'){
        super.ball.radius = 0;
        consecutiveCounts = 0;
        sounds[gameSound.CATCH].currentTime = consecutiveCounts;
        sounds[gameSound.CATCH].play();

      }else{
        consecutiveCounts = 0;
        sounds[gameSound.FAIL].play();
      }

      this.dataCollection();
      super.ball.state = 'done';

    }


    if(super.ball.state === 'done'){


      if (super.ball.hitstate === 'very good') {
        this.starsLocationUpdate();
        super.drawImageObject(targetStars,images[gameImage.STARS]);

      }

      // Remove super.ball and show in the starting point,
      //User should set the paddle to initial position , call stop after that
      super.paddleAtZero(false);

    }
    if( super.ball.hitstate !== 'good' &&  super.ball.hitstate !== 'very good'  ) {
      this.drawBall( images[gameImage.BALL]);
    }
    obstructions.forEach(obstruction => super.drawImage(obstruction, obstruction.image));
    this.basketObject();
    super.createPaddleBox(paddleBoxColor,true);
    super.paddleMove(initialTime);
    super.drawImageObject(super.paddle,images[gameImage.PADDLE]);

  }




}
