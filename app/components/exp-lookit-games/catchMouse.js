/*
 * Developed by Gleb Iakovlev on 5/3/19 9:09 PM.
 * Last modified 4/29/19 11:02 PM.
 * Copyright (c) Cognoteq Software Solutions 2019.
 * All rights reserved
 */

import Base from './base';


/**
 *
 * @submodule games
 *
 */
let mice = {};
let cheeseClock = {};
let basket = {};
let startSound = {};
let ballCatchFail = {};
let cheese1Sound = {};
let cheese2Sound = {};
let cheese3Sound = {};
let swooshSound = {};
let initBallY = 0.27;
let initX = 1.33;
let initialTime = 0;
let jitterT = 0;


let pizzaImg = {};
let miceImg = {};
let basketImg = {};

/**
 * @class CatchMouse
 * @extends Base
 * Main implementation of Catch the mouse game.
 * The user will with paddle (basket) to catch the mice.
 * The mice will appear with some unpredictable  delay.
 * The user should catch the mice until cheese(symbolizing the clock) is gone.
 */
export default class CatchMouse extends Base {
  /**
   * @method constructor
   * @constructor constructor
   * @param context Context of the game
   * @param document
   */
  constructor(context, document) {

    super(context, document);

  }


  /**
   *
   * Main point to start the game.
   * Initialize static parameters and preload sounds here
   * @method init
   */
  init() {
    document.addEventListener("mousemove", super.onMouseMove);
    startSound = new Audio();
    startSound.load();
    cheese1Sound = new Audio(super.Utils.cheese_ser1Sound);
    cheese1Sound.load();
    cheese2Sound = new Audio(super.Utils.cheese_ser2Sound);
    cheese2Sound.load();
    cheese3Sound = new Audio(super.Utils.cheese_ser1Sound);
    cheese3Sound.load();
    swooshSound = new Audio(super.Utils.swooshSound);
    swooshSound.load();
    ballCatchFail = new Audio(super.Utils.ballcatchFailSound);
    cheese1Sound.src = super.Utils.cheese_ser1Sound;
    cheese2Sound.src = super.Utils.cheese_ser2Sound;
    cheese3Sound.src = super.Utils.cheese_ser3Sound;
    ballCatchFail.src = super.Utils.ballcatchFailSound;
    swooshSound.src = super.Utils.swooshSound;
    startSound.src = super.Utils.drumRollSound;

    ballCatchFail.load();

    //Mice coord

    let x = initX;
    let leftBorder = (x - 0.08) * super.Utils.SCALE;
    let topBorder = (1.2971 - initBallY) * super.Utils.SCALE;

    mice = {
      dimensions: {width: 0.18 * super.Utils.SCALE, height: 0.18 * super.Utils.SCALE},
      position: {x: leftBorder, y: topBorder},
      radius: 0.09525 * super.Utils.SCALE,
      delay: 2000,
      state: 'start',
      showTime: 0,
      lastTime: new Date().getTime(),
      imageURL: super.Utils.rat
    };


    basket = {
      dimensions: {width: 0, height: 0},
      position: {
        x: 0,
        y: 0
      },
      positions: [],
      times: [],
      moved: 0,
      paddleLastMovedMillis: 0,
      velocity: super.Utils.paddleSpeed,
      imageURL: super.Utils.rectangleCage
    };


    this.setCheeseObj();


    pizzaImg = new Image();
    pizzaImg.src = cheeseClock.imageURL;
    miceImg = new Image();
    miceImg.src = mice.imageURL;
    basketImg = new Image();
    basketImg.src = basket.imageURL;

    startSound.addEventListener('onloadeddata', this.initGame(), false);
    super.init();

  }


  setCheeseObj() {

    //Cheese coord
    let leftBorder = (1.53)*super.Utils.SCALE ;
    let topBorder = (1.2974-initBallY)*super.Utils.SCALE;
    let width = 0.27777 * super.Utils.SCALE;
    let height = 0.26031 * super.Utils.SCALE;

    cheeseClock = {
      dimensions: {width: width, height: height},
      position: {x: leftBorder ,y: topBorder},
      angle: 0,
      state:10,
      velocity: 1.4,
      imageURL: super.Utils.pizza
    };

  }


  /**
   *
   * Draw image object according to object positions
   * @method drawImage
   * @param object
   * @param image Image object
   */
  drawImage(object, image) {
    this.ctx.drawImage(image, object.position.x, object.position.y, object.dimensions.width, object.dimensions.height);
  }


  /**
   *
   * Initialize each game round with initial object parameters
   * Randomize number of obstructions
   * Reset the sounds sources for older browser versions
   * @method initGame
   */
  initGame() {
    initialTime = 0;
    jitterT = super.trialStartTime();
    mice.state = 'start';
    mice.lastTime = new Date().getTime();

    this.setCheeseObj();
    super.createPaddleBox();
    basket = super.basketObject(basket);

    if (super.currentRounds > 0 || (super.currentRounds === 0 && !super.paddleIsMoved(basket))) {
      startSound.play();
    }

    startSound.addEventListener('playing', function () {
      initialTime = new Date().getTime();

    });

    super.initGame();
  }


  /**
   * @method  dataCollection Collect data
   */
  dataCollection() {
    super.dataCollection();
    let exportData = {
      game_type: 'catchMouse',
      basket_x: basket.position.x / this.canvas.width,
      basket_y: (this.canvas.height - basket.position.y) / this.canvas.height,
      mice_x: mice.position.x / this.canvas.width,
      mice_y: (this.canvas.height - mice.position.y) / this.canvas.height,
      trial: super.currentRounds,
      mice_state: mice.state,
      timestamp: new Date().getTime()

    };

    super.storeData(exportData);

  }


  /**
   *
   *  Show cheese portion according to angle
   *  @method showCheese
   */
  showCheese() {

    let angle = Math.PI * (0.2 * cheeseClock.state);
    this.ctx.beginPath();
    let margin = cheeseClock.dimensions.width * 0.2;
    this.ctx.moveTo(cheeseClock.position.x + cheeseClock.dimensions.width / 2, cheeseClock.position.y + cheeseClock.dimensions.height / 2);
    this.ctx.fillStyle = super.Utils.blackColor;
    this.ctx.arc(cheeseClock.position.x + cheeseClock.dimensions.width / 2, cheeseClock.position.y + cheeseClock.dimensions.height / 2, cheeseClock.dimensions.height / 2 + margin, angle, Math.PI * 2, false);
    this.ctx.lineTo(cheeseClock.position.x + cheeseClock.dimensions.width / 2, cheeseClock.position.y + cheeseClock.dimensions.height / 2);
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.restore();
  }


  cheeseState() {

    let time = super.getElapsedTime(mice.showTime);

    if (time < 0.1) {
      cheeseClock.state = 9;
    } else if (time < 0.2) {
      cheeseClock.state = 8;
    } else if (time < 0.3) {

      cheeseClock.state = 7;
    } else if (time < 0.4) {

      cheeseClock.state = 6;
    } else if (time < 0.5) {

      cheeseClock.state = 5;
    } else if (time < 0.6) {

      cheeseClock.state = 4;
    } else if (time < 0.7) {

      cheeseClock.state = 3;
    } else if (time < 0.8) {

      cheeseClock.state = 2;

    } else if (time < 0.9) {

      cheeseClock.state = 1;

    } else {
      cheeseClock.state = 0;
    }
    this.showCheese();
  }


  /**
   *
   * Main loop of the game.
   * Set initial position of the ball in a box and starting rattling sound (initSoundPlaying).
   * After that  start showing the mouse.
   * Increase the score if ball hits the target.
   * @method loop
   */
  loop() {
    super.loop();
    let paddleBoxColor = super.Utils.blueColor;
    super.createPaddleBox(paddleBoxColor);
    basket = super.basketObject(basket);
    super.paddleMove(basket, initialTime, mice);
    this.drawImage(cheeseClock, pizzaImg);

    if (initialTime === 0 && super.currentRounds === 0 && !super.paddleIsMoved(basket)) {

      startSound.play();
    }


    if (initialTime > 0 && super.paddleIsMoved(basket) && mice.state === 'start') {
      initialTime = new Date().getTime();
      paddleBoxColor = super.Utils.redColor;
      super.createPaddleBox(paddleBoxColor);
    }

    //Randomize initial wait time here
    if (mice.state === 'start' && initialTime > 0 && super.getElapsedTime(initialTime) > jitterT) {
      startSound.pause();
      startSound.currentTime = 0;
      mice.state = 'show';
      mice.showTime = new Date().getTime();
    }

    if (mice.state === 'show') {
      this.cheeseState();
      this.drawImage(mice, miceImg);

    }

    if (mice.state === 'done') {


      super.paddleAtZero(basket, false);


    }

    if (mice.state === 'show') {


      if (mice.showTime > 0 && super.getElapsedTime(mice.showTime) > 1) {

        mice.state = 'done';
        ballCatchFail.play();
        cheeseClock.imageURL = super.Utils.cheeseMissedImage;

      }


      if (basket.moved === 0 && basket.positions.length > 5 && basket.position.y - mice.position.y <= 100) {

        swooshSound.play();
        basket.moved = 1;

      }


      if ((mice.position.y + 20) - basket.position.y >= 0) {
        mice.state = 'done';
        if (cheeseClock.state > 0) {
          if (cheeseClock.state < 4) {

            cheese1Sound.play();
          } else if (cheeseClock.state >= 4 && cheeseClock.state < 8) {
            cheese2Sound.play();

          } else {

            cheese3Sound.play();
          }
          super.increaseScore();
          this.showCheese();

        }


      }


    }


    this.showCheese();
    this.drawImage(basket, basketImg);
  }

}
