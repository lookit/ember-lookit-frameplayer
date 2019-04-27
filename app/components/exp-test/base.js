/*
 * Developed by Gleb Iakovlev on 3/31/19 8:15 PM.
 * Last modified 3/31/19 8:11 PM.
 * Copyright (c) 2019 . All rights reserved.
 */
import Utils from './utils';

/**
 *
 * @submodule games
 *
 */

let dataLoop = {};
let gameLoop = {};
let mouseY = 0;
let gameOver = false;
let paddleWidth = 0;

/**
 * Base class for common game functions
 * @class Base
 */
export default class Base {


    /**
     * @method Constructor to get parameters from caller
     * @constructor Constructor to get parameters from caller
     * @param context from component
     * @param document object from component
     */
    constructor(context, document) {
        this.context = context;
        this.document = document;
        this.canvas = this.document.getElementById('gamesCanvas');
        // this.canvas.style.width = window.innerWidth + 'px';
        // this.canvas.style.height = window.innerHeight + 'px';
        this.ctx = this.canvas.getContext('2d');
        this.currentRounds = 0;
        this.currentScore = 0;
        this.canvas.style.cursor = 'none';
        paddleWidth = this.canvas.width / 20;
        // Event listener for mouse and keyboard here
        document.addEventListener('keydown', this.keyDownHandler, false);
        document.addEventListener('keyup', this.keyUpHandler, false);
        document.addEventListener('mousemove', this.onMouseMove);
    }


    /**
     * Initialize or start the game loop here
     * @method init
     */
    init() {
        this.currentScore = 0;
        this.currentRounds = 0;
        clearInterval(dataLoop);
        clearInterval(gameLoop);

    }

    /**
     * Abstract method
     * Triggered when participant pressed some key on keyboard
     * @method keyDownHandler
     * @param e event
     */
    keyDownHandler(e) {

        console.log(e);
    }

    /**
     * Abstract method
     * Triggered when participant released some key on keyboard
     * @method keyUpHandler
     * @param e event
     */
    keyUpHandler(e) {

        console.log(e);
    }


    /**
     * Data collection abstract method
     * @method dataCollection
     */
    dataCollection() {

    }

    increaseScore() {
        this.currentScore++;
    }


    /**
     * Draw the game score
     * @method drawScore
     */
    drawScore() {
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = Utils.scoreColor;
        this.ctx.fillText('Score: ' + this.currentScore, 8, 20);
    }


    /**
     * Abstract Main game loop method
     * @method loop
     */
    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = Utils.blackColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();

        this.drawScore();
    }


    /**
     * Create initial ball box object to start from
     * @method createBallBox
     * @param {int} paddleWidth
     */
    createBallBox(paddleWidth) {

        this.ctx.beginPath();
        this.ctx.lineWidth = '8';
        this.ctx.strokeStyle = Utils.blueColor;

        this.ctx.moveTo(paddleWidth * 5, this.canvas.height / 2.5 + this.canvas.height / 2 - paddleWidth * 1.5);
        this.ctx.lineTo(paddleWidth * 5, this.canvas.height / 2.5 + this.canvas.height / 2);
        this.ctx.lineTo(paddleWidth * 5 + paddleWidth, this.canvas.height / 2.5 + this.canvas.height / 2);
        this.ctx.lineTo(paddleWidth * 5 + paddleWidth, this.canvas.height / 2.5 + this.canvas.height / 2 - paddleWidth * 0.8);
        this.ctx.moveTo(paddleWidth * 5, this.canvas.height / 2.5 + this.canvas.height / 2 - paddleWidth * 1.5 + 4);
        this.ctx.lineTo(paddleWidth * 5 + paddleWidth / 3, this.canvas.height / 2.5 + this.canvas.height / 2 - paddleWidth * 1.5 + 4);
        this.ctx.stroke();
        this.ctx.closePath();

    }

    /**
     * @method mouseY Set current cursor position
     * @param {number} mouse cursor Y coordinate
     */
     set mouseY(val) {

        mouseY = val;
     }

  /**
   * @method  mouseY Get current cursor position
   * @return {number} mouse cursor Y coordinate
   */
    get mouseY() {

        return mouseY;
    }

  /**
   * @method gameOver Set method if game is over
   * @param {boolean} game is over
   */
  set gameOver(val) {

        gameOver = val;
    }


  /**
   * @method gameOver Get method if game is over
   * @return {boolean} game is over
   */
  get gameOver() {

        return gameOver;
    }

    /**
     * @method Utils Get shared Utils objects
     * Get Utilities game constants
     * @return {Utils}
     * @constructor
     */
    get Utils() {

        return Utils;
    }

  /**
   * @method drawImage Show current image
   * @param {object} Current object with x,y position, width , height and URL of the image to show
   * @param {String} URL
   */
    drawImage(object, URL) {
        this.ctx.fillStyle = Utils.blackColor;
        this.ctx.fillRect(object.position.x, object.position.y, object.dimensions.width, object.dimensions.height);
        let image = new Image();
        image.src = URL;
        this.ctx.drawImage(image, object.position.x, object.position.y, object.dimensions.width, object.dimensions.height);
    }

    /**
     * Disabled for now
     * @method storeData Store data in proposed array
     * @param {array} exportData
     */
    storeData(exportData) {

        // this.context.get('export_arr').addObject(exportData);
        // this.context.export_arr.push(exportData);
    }


    /**
     * Initialize current round of the game
     * @method initGame
     */
    initGame() {

        this.loopTimer = function () {
            let inst = this;
            gameLoop = setInterval(function () {
                inst.loop();
            }, Utils.frameDelay);

            dataLoop = setInterval(function () {
                inst.dataCollection();
            }, 10);

        };

        this.loopTimer();

    }


    /**
     * Finish current round and check for rounds left
     * @method finishGame
     * @param {boolean} should increase score
     */
    finishGame(score) {

        this.currentRounds++;
        clearInterval(dataLoop);
        clearInterval(gameLoop);
        if (score) {
            this.increaseScore();
        }
        this.gameOver = false;
        if (this.currentRounds < Utils.gameRounds) {
            this.initGame();

        } else {

            this.context.next();
        }

    }


    /**
     * Create ball movement up to some trajectory
     * @method ballTrajectory
     * @param {object} ball
     */
    ballTrajectory(ball) {
        let gravity = Utils.gravityFactor * 9.81;  // m / s^2
        let rho = 1.22; // kg/ m^3
        let Cd = 0.47;  // Dimensionless
        let A = Math.PI * ball.radius * ball.radius / (10000); // m^2
        let Fx = -0.5 * Cd * A * rho * ball.velocity.x * ball.velocity.x * ball.velocity.x / Math.abs(ball.velocity.x);
        let Fy = -0.5 * Cd * A * rho * ball.velocity.y * ball.velocity.y * ball.velocity.y / Math.abs(ball.velocity.y);

        Fx = (isNaN(Fx) ? 0 : Fx);
        Fy = (isNaN(Fy) ? 0 : Fy);

        let ax = Fx / ball.mass;
        let ay = gravity + (Fy / ball.mass);

        ball.velocity.x += ax * Utils.frameRate;
        ball.velocity.y += ay * Utils.frameRate;
        ball.position.x += ball.velocity.x * Utils.frameRate * 100;
        ball.position.y += ball.velocity.y * Utils.frameRate * 100;

        this.ctx.translate(ball.position.x, ball.position.y);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, ball.radius, 0, Math.PI * 2, true);
        this.ctx.fillStyle = ball.color;
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();

    }

    /**
     * Set position of the ball to initial coordinates to symbolize the start of the game
     * @method moveBallToStart
     * @param {object} ball object parameters
     * @param {boolean} gameOver set game to be over
     */
    moveBallToStart(ball, gameOver) {

        this.ctx.beginPath();
        this.ctx.arc(paddleWidth * 5 + 20, this.canvas.height - paddleWidth * 2, ball.radius, 0, Math.PI * 2, true);
        this.ctx.fillStyle = ball.color;
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
        if (gameOver) {
            this.gameOver = true;
        }
    }

    /**
     * Check if user returned paddle to initial coordinates and call finish of the game to restart
     * current round
     * @method paddleAtZero
     * @param {object} paddle
     * @param {boolean} score should increase score
     */
    paddleAtZero(paddle, score) {

        if (paddle.position.y >= this.canvas.height / 2.5 + this.canvas.height / 2 - 1.5 * paddleWidth) {

            this.finishGame(score);
        }

    }


    /**
     * Minimal implementation of interruption between rounds
     * @method waitSeconds
     * @param {int} iMilliSeconds
     */
    waitSeconds(iMilliSeconds) {
        let counter = 0;
        let start = new Date().getTime();
        let end = 0;

        while (counter < iMilliSeconds) {
            end = new Date().getTime();
            counter = end - start;

        }
    }

    /**
     * Set paddle coordinates up to velocity
     * @method paddleMove
     * @param {object} paddle
     */
    paddleMove(paddle) {

        paddle.position.y = this.mouseY;

    }


    /**
     * Walls and target collisions detection
     * @method wallCollision
     * @param {object} ball
     * @return {boolean} if hit any edge of the screen
     */
    wallCollision(ball) {

        if (ball.position.y > this.canvas.height + ball.radius || ball.position.x > this.canvas.width + ball.radius || ball.position.x < ball.radius) {

            return true;

        }

        return false;

    }

    onMouseMove(e) {

        mouseY = e.clientY;
    }

}
