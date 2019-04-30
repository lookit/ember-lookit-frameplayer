/*
 * Developed by Gleb Iakovlev on 4/6/19 12:12 PM.
 * Last modified 4/6/19 12:12 PM.
 * Copyright (c) Cognoteq Software Solutions 2019.
 * All rights reserved
 */

import Base from './base';
/**
 *
 * @submodule games
 *
 */
let paddleWidth = 0;
let paddleHeight = 0;
let basket = {};
let ball = {};
let obstructions = [];
let audio = {};
let goodJob = {};
let initSoundPlaying = true;
let ballCatchFail = {};
let targetStars = {};



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
        paddleWidth = this.canvas.width / 20;
        paddleHeight = this.canvas.width / 15;

    }


    /**
     * Main point to start the game.
     * Initialize static parameters and preload sounds here
     * @method init
     */
    init() {
        super.init();

        basket = {
            dimensions: {width: paddleWidth, height: paddleWidth},
            position: {x: this.canvas.width / 2 + paddleWidth * 3, y: (this.canvas.height / 2 + paddleHeight * 2)},
            velocity: super.Utils.paddleSpeed,
            imageURL: super.Utils.basketImage
        };

        goodJob = new Audio(super.Utils.goodCatchSound);
        goodJob.load();
        ballCatchFail = new Audio(super.Utils.ballcatchFailSound);
        ballCatchFail.load();
        audio = new Audio(super.Utils.rattleSound);
        audio.load();
        audio.addEventListener('onloadeddata', this.initGame(), false);

    }

    /**
     * The box symbolizes initial paddle location
     * @method createPaddleBox
     */
    createPaddleBox() {
        this.ctx.beginPath();
        this.ctx.rect(this.canvas.width / 2 + paddleWidth * 3, this.canvas.height / 2.5 + this.canvas.height / 2 - paddleWidth, basket.dimensions.width, basket.dimensions.width);
        this.ctx.fillStyle = super.Utils.blackColor;
        this.ctx.lineWidth = '8';
        this.ctx.strokeStyle = super.Utils.blueColor;
        this.ctx.stroke();
    }

    /**
     * Initialize each game round with initial object parameters
     * Randomize number of obstructions
     * Reset the sounds sources for older browser versions
     * Wait for start sound and start the main game loop
     * @method initGame
     */
    initGame() {

        super.gameOver = false;
        super.initGame();
        let trajectories = [

          {velocity: {x: 5.8, y: -7.4}},
          {velocity: {x: 4.8, y: -8.2}},
          {velocity: {x: 5.0, y: -7.8}},
          {velocity: {x: 5.2, y: -7.6}}
        ];

        let trajectory = trajectories[Math.floor(Math.random() * trajectories.length)];
        trajectory.velocity  = super.velocityToScale(trajectory.velocity);
        ball = {

            position: {x: paddleWidth * 5 + 20, y: (this.canvas.height - paddleWidth * 2)},
            velocity: trajectory.velocity,
            mass: super.Utils.ballMass,
            radius: 10,
            restitution: super.Utils.restitution,
            color: '#dadd0f'

        };

        obstructions = Array(Math.floor(Math.random() * 3)).fill({}).map((value, index) =>

          ({
            dimensions: {width: paddleWidth * 3.5, height: this.canvas.height / 1.5},
            position: {
                x: this.canvas.width / 2 - (index + 1) * paddleWidth,
                y: this.canvas.height / 2.5 - paddleWidth * 1.5
            },
            imageURL: super.Utils.treeImage
        })
        );

        initSoundPlaying = true;
        ballCatchFail.src = super.Utils.ballcatchFailSound;
        goodJob.src = super.Utils.goodCatchSound;
        audio.src = super.Utils.rattleSound;
        audio.play();
        audio.addEventListener('ended', function () {

            initSoundPlaying = false;
        });

    }

    dataCollection() {

        super.storeData();
    }


    /**
     * Check if ball reaches the target
     * @method collisionDetection
     * @return {boolean}
     */
    collisionDetection() {

        if (ball.position.y > basket.position.y && ball.position.y - ball.radius < basket.position.y + basket.dimensions.height) {

            if (ball.position.x > basket.position.x && ball.position.x - ball.radius < ball.position.x + basket.dimensions.width) {

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

            position: {x: basket.position.x + paddleWidth, y: basket.position.y - paddleHeight / 2},
            dimensions: {width: paddleWidth / 1.5, height: paddleWidth / 1.5},
            imageURL: super.Utils.basketStarsImage

        };

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

        super.createBallBox(paddleWidth);

        let hitTheTarget = this.collisionDetection();
        let hitTheWall = super.wallCollision(ball);

        if (hitTheTarget || hitTheWall || super.gameOver) {

            if (hitTheTarget) {

                if (!super.gameOver && goodJob.readyState === 4) {

                    goodJob.play();
                }

            } else {
                if (!super.gameOver) {

                    ballCatchFail.play();
                }

            }
            // Remove ball and show in the starting point,
            //User should set the paddle to initial position , call stop after that
            super.moveBallToStart(ball, true);
            super.paddleAtZero(basket, hitTheTarget);
            if (hitTheTarget) {
                this.starsLocationUpdate();
                this.drawImage(targetStars);
            }

        } else {

            if (initSoundPlaying) {

                super.moveBallToStart(ball, false);

            } else {

                super.ballTrajectory(ball);

            }
        }

        this.createPaddleBox();
        super.paddleMove(basket);
        this.drawImage(basket);

        obstructions.forEach(obstruction => this.drawImage(obstruction));
    }


    /**
     * @method
     * Draw image object according to object locations
     * @param object
     */
    drawImage(object) {
        let image = new Image();
        image.src = object.imageURL;
        this.ctx.drawImage(image, object.position.x, object.position.y, object.dimensions.width, object.dimensions.height);
    }

}
