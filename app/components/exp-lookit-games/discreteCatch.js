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

let basket = {};
let ball = {};
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
// Media arrays for loading
let sounds = [];
let soundURLs = [];
let imageURls = [];
let images = [];
let obstructionsURLs = [];
let obstructionImages = [];
let trajectoryParameters = [];
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
 * The user will operate with paddle to catch the ball started
 * from ball box. The trajectory is randomized with various values in trajectories array
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
    soundURLs = [super.Utils.rattleSound,super.Utils.goodCatchSound,super.Utils.failcatchSound];
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

    basket = {
      positions:[],
      times:[],
      velocity: super.Utils.paddleSpeed,
      paddleLastMovedMillis: 0
    };

    document.addEventListener("mousemove",  super.onMouseMove);
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
    basket = super.basketObject(basket);
    obstructionsNum = trajectoryParameters[super.currentRounds][gameRandomization.OBSTRUCTION];
    ball = super.ballObject();
    ball.position.y = (1.1471 )* super.Utils.SCALE;
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
   * trajectory  : 1,2,3 ( Time when ball hits the basket at 500,600,700 ms )
   * obstruction : 0,1,2,3 (number of obstructions displayed)
   * @method dataCollection
   */
  dataCollection() {
    super.dataCollection();
    if(ball.state === 'hit' || ball.state === 'fall') {
      let exportData = {
        game_type: 'discreteCatch',
        trajectory: trajectoryParameters[super.currentRounds][gameRandomization.HEIGHT],
        ball_position_x: super.convertXvalue(ball.position.x),
        ball_position_y:  this.convertYvalue(ball.position.y),
        paddle_center_x: super.convertXvalue(basket.position.x   + (basket.dimensions.width / 2) ),
        paddle_x: super.convertXvalue(basket.position.x),
        paddle_position_y: this.convertYvalue(basket.position.y),
        red_dot_start_position: 1.3301 - redDotMargin,
        red_dot_width: redDotMargin*2,
        obstruction_number: trajectoryParameters[super.currentRounds][gameRandomization.OBSTRUCTION],
        trial: super.currentRounds,
        trialType: this.context.trialType,
        timestamp: super.getElapsedTime(initialTime)

      };

         super.storeData(exportData);
    }
  }




  /**
   * Check if ball reaches the target
   * @method collisionDetection
   * @return {boolean}
   */
  collisionDetection() {

    let basketPrevPosition = 0;
    if(basket.positions.length >2){

      basketPrevPosition = this.canvas.height - (basket.positions[basket.positions.length-2])*super.Utils.SCALE;
    }

    if(ball.positions.length >2 && ball.positions[ball.positions.length-2] <= basketPrevPosition && ball.position.y > basket.position.y){
      if (ball.position.x >= basket.position.x && ball.position.x <=  basket.position.x +  basket.dimensions.width ) {
        ball.hitstate = 'good';

        if (ball.position.x > (1.3301 - redDotMargin) * super.Utils.SCALE && ball.position.x < (1.3301 + redDotMargin) * super.Utils.SCALE) {

          ball.hitstate = 'very good';
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

      position: {x: basket.position.x + 0.01* super.Utils.SCALE , y: basket.position.y - 0.2* super.Utils.SCALE},
      dimensions: {width: 0.14*super.Utils.SCALE, height: 0.2*super.Utils.SCALE}
    };

  }


  /**
   * Draw initial ball box object
   * @method createLauncher
   * @param {image}  BallBox image
   */
  createLauncher(image) {

    let leftBorder = (0.075) * super.Utils.SCALE;
    let topBorder = (1.1471 )* super.Utils.SCALE;
    this.ctx.drawImage(image, leftBorder, topBorder, basket.dimensions.height*2.7, basket.dimensions.height*2.7);


  }

  /**
   * Override base  method to increase ball size
   * @param ball {object}
   * @param images {object}
   */
  drawBall(ball,images) {

    this.ctx.drawImage(images, ball.position.x, ball.position.y, GEAR_RADIUS * super.Utils.SCALE , GEAR_RADIUS * super.Utils.SCALE);

  }


  /**
   * Main loop of the game.
   * Set initial position of the ball in a box and starting  sound .
   * After that  start ball trajectory.
   * If ball hits the target or missed the target wait util user places the paddle to starting position.
   * Increase the score if ball hits the target.
   * @method loop
   */
  loop() {
    super.loop();
    super.generateTrajectoryParams(trajectoryParameters[super.currentRounds][gameRandomization.HEIGHT],Height);
    this.createLauncher(images[gameImage.BALLBOX]);
    let paddleBoxColor = super.Utils.blueColor;
    if(ball.state === 'start'){
      ball = this.ballObject();
      ball.position.y = (1.291 )* super.Utils.SCALE;
      if (startTime > 0 &&  !super.paddleIsMoved(basket) && super.getElapsedTime(startTime) > TRAVEL_TIME ){
        sounds[gameSound.START].play();
      }

      if(initialTime > 0 && super.paddleIsMoved(basket)){
        initialTime = new Date().getTime();
        paddleBoxColor = super.Utils.redColor;
      }

      if (initialTime > 0 && super.getElapsedTime(initialTime) > jitterT) {
        sounds[gameSound.START].pause();
        sounds[gameSound.START].currentTime = 0;
        initialTime = new Date().getTime();
        ball.state = 'fall';
      }

    }


    if(ball.state === 'fall'){
      if(initialTime > 0 && super.getElapsedTime(initialTime) <= TRAVEL_TIME) {
        ball.positions.push(ball.position.y);
        super.trajectory(ball, initialTime);
      }

      if(initialTime > 0 && super.ballIsOnFloor(ball)) {
        ball.state = 'hit';
      }

    }


    let hitTheTarget = this.collisionDetection();
    let hitTheWall = super.wallCollision(ball);

    if((hitTheTarget || hitTheWall) && ball.state === 'fall'){

      ball.state = 'hit';
    }


    if (ball.state === 'hit') {


      if (ball.hitstate === 'very good' || ball.hitstate === 'good') {
        super.increaseScore();
        consecutiveCounts++;
        sounds[gameSound.CATCH].play();
        ball.radius = 0;

      }else{

        sounds[gameSound.FAIL].play();
        consecutiveCounts = 0;
      }


      ball.state = 'done';

    }


    if(ball.state === 'done'){


      if (ball.hitstate === 'very good') {
        this.starsLocationUpdate();
        super.drawImageObject(targetStars,images[gameImage.STARS]);

      }

      // Remove ball and show in the starting point,
      //User should set the paddle to initial position , call stop after that
      super.paddleAtZero(basket,false);

    }
    if( ball.hitstate !== 'good' &&  ball.hitstate !== 'very good'  ) {
      this.drawBall(ball, images[gameImage.BALL]);
    }
    obstructions.forEach(obstruction => super.drawImage(obstruction, obstruction.image));
    this.basketObject(basket);
    super.createPaddleBox(paddleBoxColor,true);
    super.paddleMove(basket,initialTime,ball);
    super.drawImageObject(basket,images[gameImage.PADDLE]);

  }




}
