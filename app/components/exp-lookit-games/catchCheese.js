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
let obstructions = [];
let targetStars = {};
let initialTime = 0;
let hArray = [];
let Tf = 0.8;
let Height = 0.8;
let obstrArr = [];
let jitterT = 0;
let radiusRim = 0.1;
let obstructionsNum = 0;
let consecutive_counts = 0;
let startTime = 0;
let sounds = [];
let soundURLs = [];
let imageURls = [];
let images = [];
const TRAVEL_TIME = 1.5;
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

/**
 * Main implementation of catch the cheese game.
 * The user will operate with paddle to catch the ball started
 * from ball box. The trajectory is randomized with various values in trajectories array
 * Number of obstructions currently randomized from 0 to 3 trees shown
 * @class CatchCheese
 * @extends Base
 */
export default class CatchCheese extends Base {
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

  }


  /**
   * Main point to start the game.
   * Initialize static parameters and preload sounds here
   * @method init
   */
  init() {
    hArray = super.generateHeights();
    obstrArr  = super.uniformArr([0,1,2,3]);
    super.fillAudioArray(soundURLs,sounds);
    super.fillImageArray(imageURls,images);

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
    jitterT = super.trialStartTime();
    initialTime =0;
    super.createPaddleBox();
    basket = super.basketObject(basket);
    obstructionsNum = obstrArr[super.currentRounds];
    ball = super.ballObject();

    obstructions = Array(obstructionsNum).fill({}).map((value, index) =>

      ( super.treeObject(index+1))
    );


    startTime = new Date().getTime();




    super.initGame();

  }



  dataCollection() {
    super.dataCollection();
    let exportData = {
      game_type: 'catchCheese',
      ball_position_x: ball.position.x/this.canvas.width,
      ball_position_y:  (this.canvas.height - ball.position.y)/this.canvas.height,
      paddle_position_x: basket.position.x/this.canvas.width,
      paddle_position_y: (this.canvas.height - basket.position.y)/this.canvas.height,
      trial: super.currentRounds,
      timestamp: new Date().getTime()

    };
      super.storeData(exportData);
  }




  /**
   * Check if ball reaches the target
   * @method collisionDetection
   * @return {boolean}
   */
  collisionDetection() {

    let basketPrevPosition = 0;
    if(basket.positions.length >2){

      basketPrevPosition = this.canvas.height - (basket.positions[basket.positions.length-2])*this.canvas.height;
    }

    if(ball.positions.length >2 && ball.positions[ball.positions.length-2] <= basketPrevPosition && ball.position.y > basket.position.y){
      if (ball.position.x >= basket.position.x && ball.position.x <=  basket.position.x +  basket.dimensions.width ) {
        let margin = radiusRim / 4;
        ball.hitstate = 'good';

        if (ball.position.x > (1.3301 - margin) * super.Utils.SCALE && ball.position.x < (1.3301 + margin) * super.Utils.SCALE) {

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
   * Create initial ball box object to start from
   * @method createBallBox
   * @param {int} paddleWidth
   */
  createBallBox(image) {

    let leftBorder = (0.05) * super.Utils.SCALE;
    let topBorder = (1.1471 )* super.Utils.SCALE;
    this.ctx.drawImage(image, leftBorder, topBorder, basket.dimensions.height*3, basket.dimensions.height*3);


  }


  /**
   * Main loop of the game.
   * Set initial position of the ball in a box and starting rattling sound (initSoundPlaying).
   * After that  start ball trajectory.
   * If ball hits the target or missed the target wait util user places the paddle to starting position.
   * Increase the score if ball hits the target.
   * @method loop
   */
  loop() {
    super.loop();
    super.generateTrajectoryParams(hArray,Height,Tf);
    this.createBallBox(images[gameImage.BALLBOX]);
    let paddleBoxColor = super.Utils.blueColor;
    if(ball.state === 'start'){

      super.moveBallToStart(ball, images[gameImage.BALL],false);

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


      super.drawBall(ball,images[gameImage.BALL]);
    }


    let hitTheTarget = this.collisionDetection();
    let hitTheWall = super.wallCollision(ball);

    if((hitTheTarget || hitTheWall) && ball.state === 'fall'){

      ball.state = 'hit';
    }


    if (ball.state === 'hit') {


      if (ball.hitstate === 'very good' || ball.hitstate === 'good') {
        super.increaseScore();
        consecutive_counts++;
        sounds[gameSound.CATCH].play();

      }else{

        sounds[gameSound.FAIL].play();
        consecutive_counts = 0;
      }


      ball.state = 'done';

    }


    if(ball.state === 'done'){


      if (ball.hitstate === 'very good') {
        this.starsLocationUpdate();
        super.drawImageObject(targetStars,images[gameImage.STARS]);

      }

      if(ball.hitstate === ''){

        super.drawBall(ball,images[gameImage.BALL]);
      }


      // Remove ball and show in the starting point,
      //User should set the paddle to initial position , call stop after that

      super.moveBallToStart(ball, images[gameImage.BALL],false);
      super.paddleAtZero(basket,false);



    }


    obstructions.forEach(obstruction => super.drawImage(obstruction, obstruction.image));

    this.basketObject(basket);
    super.fillPaddleBox(paddleBoxColor);
    super.paddleMove(basket,initialTime,ball);
    super.drawImageObject(basket,images[gameImage.PADDLE]);

  }




}
