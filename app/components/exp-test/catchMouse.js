import Base from './base';

/**
 *
 * @submodule games
 *
 */
let mice = {};
let cheeseClock = {};
let basket = {};
let paddleWidth = 0;
let paddleHeight = 0;
let initSoundPlaying = false;
let audio = {};
let ballCatchFail = {};
let goodJob = {};


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
        paddleWidth = this.canvas.width / 20;
        paddleHeight = this.canvas.width / 15;

    }


    /**
     *
     * Main point to start the game.
     * Initialize static parameters and preload sounds here
     * @method init
     */
    init() {
        super.init();

        audio = new Audio(super.Utils.rattleSound);
        audio.load();
        audio.addEventListener('onloadeddata', this.initGame(), false);

        goodJob = new Audio(super.Utils.goodCatchSound);
        goodJob.load();

        ballCatchFail = new Audio(super.Utils.ballcatchFailSound);
        ballCatchFail.load();

        this.initGame();
    }

    /**
     *
     * Draw image object according to object locations
     * @method drawImage
     * @param object
     */
    drawImage(object) {
        let image = new Image();
        image.src = object.imageURL;
        this.ctx.drawImage(image, object.position.x, object.position.y, object.dimensions.width, object.dimensions.height);
    }

    /**
     *
     * The box symbolizes initial paddle location
     * @method createPaddleBox
     */
    createPaddleBox() {
        this.ctx.beginPath();
        this.ctx.rect(this.canvas.width / 2 - paddleWidth, this.canvas.height / 2.5 + this.canvas.height / 2 - 1.5 * paddleWidth, paddleWidth * 2, paddleWidth * 2);
        this.ctx.lineWidth = '8';
        this.ctx.strokeStyle = super.Utils.blueColor;
        this.ctx.stroke();
        this.ctx.closePath();
    }


    /**
     *
     * Initialize each game round with initial object parameters
     * Randomize number of obstructions
     * Reset the sounds sources for older browser versions
     * @method initGame
     */
    initGame() {

        basket = {
            dimensions: {width: paddleWidth * 1.5, height: paddleWidth * 1.5},
            position: {
                x: 15 + this.canvas.width / 2 - paddleWidth,
                y: this.canvas.height / 2.5 + this.canvas.height / 2 - 1.5 * paddleWidth
            },
            velocity: super.Utils.paddleSpeed,
            imageURL: super.Utils.basketImage
        };

        mice = {
            dimensions: {width: paddleWidth, height: paddleWidth},
            position: {x: this.canvas.width / 2 - paddleWidth / 2, y: (this.canvas.height - paddleHeight) / 2 - paddleHeight},
            radius: 20,
            delay: 2000,
            lastTime: new Date().getTime(),
            imageURL: super.Utils.miceImage
        };

        cheeseClock = {
            dimensions: {width: paddleWidth, height: paddleWidth},
            position: {x: this.canvas.width / 2 + paddleWidth, y: mice.position.y},
            angle: 0,
            velocity: 1.4,
            imageURL: super.Utils.cheeseImage
        };

        initSoundPlaying = true;
        goodJob.src = super.Utils.goodCatchSound;
        ballCatchFail.src = super.Utils.ballcatchFailSound;
        audio.src = super.Utils.rattleSound;
        audio.play();
        audio.addEventListener('ended', function () {

            initSoundPlaying = false;
        });

        super.initGame();
    }

  /**
   * @method  dataCollection Collect data
   */
  dataCollection() {

        let exportData = {

                basket_x: basket.position.x,
                basket_y: basket.position.y,
                mice_x: mice.position.x,
                mice_y: mice.position.y,
                timestamp: new Date().getTime()

            };

        super.storeData(exportData);

    }


    /**
     *
     * Start showing the mouse and the cheese.
     * Update the radians angle  of the cheese with each iteration.
     * Detect collision with paddle(basket) here and set gameOver object to true
     * if the basket reached or not the target (mouse)
     * @method startClock
     */
    startClock() {

        this.drawImage(mice);

        //Collision detection basket with mice
        if (mice.position.y > basket.position.y - mice.dimensions.height / 3 && mice.position.y < basket.position.y + basket.dimensions.height) {
            goodJob.play();
            super.gameOver = true;

        } else {

            // fill the cheeseClock
            cheeseClock.angle = cheeseClock.angle + cheeseClock.velocity / 50;

        }

        // Ran out of time
        if (cheeseClock.angle >= 2) {
            ballCatchFail.play();
            super.gameOver = true;
            cheeseClock.angle = 0.1;
            cheeseClock.imageURL = super.Utils.cheeseMissedImage;
        }

    }

    /**
     *
     *  Show cheese portion according to angle
     *  @method showCheese
     */
    showCheese() {

        if (super.gameOver) {

            cheeseClock.dimensions.width = paddleWidth * 1.5;
            cheeseClock.dimensions.height = paddleWidth * 1.5;
        }

        let angle = Math.PI * (1.65 - cheeseClock.angle);
        this.ctx.beginPath();
        this.ctx.moveTo(cheeseClock.position.x + cheeseClock.dimensions.width / 2, cheeseClock.position.y + cheeseClock.dimensions.height / 2);
        this.ctx.fillStyle = super.Utils.blackColor;
        this.ctx.arc(cheeseClock.position.x + cheeseClock.dimensions.width / 2, cheeseClock.position.y + cheeseClock.dimensions.height / 2, cheeseClock.dimensions.height / 2, angle, Math.PI * 1.65);
        this.ctx.lineTo(cheeseClock.position.x + cheeseClock.dimensions.width / 2, cheeseClock.position.y + cheeseClock.dimensions.height / 2);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
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
        this.createPaddleBox();
        this.drawImage(cheeseClock);

        if (super.gameOver) {

            super.paddleAtZero(basket, true);

        } else {

            // Start the clock and check if we ran out of time
            if (!initSoundPlaying && new Date().getTime() - mice.lastTime > mice.delay) {

                this.startClock();

            }
        }
        this.showCheese();
        this.drawImage(basket);
        super.paddleMove(basket);

    }

}
