/*
 * Developed by Gleb Iakovlev on 3/31/19 8:15 PM.
 * Last modified 3/31/19 8:07 PM.
 * Copyright (c) 2019 . All rights reserved.
 */
import Base from './base';
/**
 * Main class for catch the crocodile game
 * This is only initial code. A lot will be redone here.
 */

let paddleWidth = 0;
let paddleHeight = 10;
let paddle = {};
let ball = {};
let target = {};

/**
 * FeedCroc implementation for crocodile game
 */
export default class FeedCroc extends Base{


  /**
   * Constructor to get parameters from caller
   * @param context from component
   * @param document object from component
   */
  constructor(context,document){

    super(context,document);
    paddleWidth = this.canvas.width/9;


  }

  /**
   * initialize on start button
   */
  init(){
    super.init();
    this.initGame();
  }




  drawPaddle () {
    this.ctx.beginPath();
    this.ctx.rect(paddle.position.x, paddle.position.y, paddle.dimensions.width, paddle.dimensions.height);
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fill();
    this.ctx.closePath();
  }

  createPaddleBox() {
    this.ctx.beginPath();
    this.ctx.rect(this.canvas.width/2-paddle.dimensions.width,this.canvas.height-paddle.dimensions.width*1.3,paddle.dimensions.width,paddle.dimensions.width);
    this.ctx.fillStyle= "#020102";
    this.ctx.stroke();
    this.ctx.lineWidth = "4";
    this.ctx.strokeStyle = "#1931dd";
    this.ctx.fill();
    this.ctx.closePath();
  }





  createBallBox() {

    this.ctx.beginPath();
    this.ctx.fillStyle= "#020102";
    this.ctx.lineWidth = "4";
    this.ctx.strokeStyle = "#1931dd";
    this.ctx.strokeRect(10,this.canvas.height-paddle.dimensions.width*1.56,paddle.dimensions.width/2,paddle.dimensions.width*1.2);
    this.ctx.fill();
    this.ctx.closePath();
  }


  /**
   * Main game loop
   */
  loop() {

    super.loop();


    this.createBallBox();
    this.drawPaddle();
    this.createPaddleBox();
    this.drawImage(target);
    this.drawScore();
    /**
     * Handle paddle collision here
     * Adjust velocity to the ball by restitution factor
     */
    if(ball.position.y >= (paddle.position.y - paddle.dimensions.height) && ball.position.y < (paddle.position.y + paddle.dimensions.height)){
      if ((ball.position.x > paddle.position.x && ball.position.x  < paddle.position.x + paddle.dimensions.width)) {

        ball.velocity.y *= ball.restitution;
        ball.velocity.x *= -ball.restitution;
        ball.position.y = paddle.position.y - ball.radius;

        /**
         *  Check if paddle moved recently and apply restitution coefficient
         *  Tolerate 10 millis
         */

        if(new Date().getTime() -  paddle.paddleLastMovedMillis < 10 ){

          ball.velocity.y *= paddle.paddleRestitution;
          ball.velocity.x *= -paddle.paddleRestitution;
        }

      }
    }



    super.wallCollision(ball);


    /**
     * Missed target
     */
    if(ball.position.x > target.position.x+ 40 && (ball.position.y < (target.position.y + target.dimensions.height)/1.6)){

      super.finishGame();

    }



    /**
     * Target is reached here
     */
    if((ball.position.y < target.position.y + target.dimensions.height) &&  (ball.position.y > (target.position.y + target.dimensions.height)/1.6) && ball.position.x > target.position.x + 40 ){


      super.increaseScore();
      super.finishGame();

    }





    /**
     * Handle paddle direction on key pressed
     */

    super.paddleMove(paddle);
    super.ballTrajectory(ball);

  }




  /**
   * Initialize game state before each round
   *
   */
  initGame(){

    super.initGame();
    paddle = {

      dimensions: {width: paddleWidth, height: paddleHeight},
      position: {x: this.canvas.width/2 - paddleWidth, y : (this.canvas.height-paddleHeight)/2 },
      paddleRestitution: -1 - this.context.paddle_restitution/10,
      paddleLastMovedMillis: 100,
      velocity:this.context.paddle_speed

    };

    ball = {

      position : {x: paddle.dimensions.width/2, y:this.canvas.height-paddle.dimensions.width*1.56 - paddle.dimensions.width*1.2},
      velocity : {x: this.context.x_velocity/10, y:-1*this.context.y_velocity/10},
      mass: this.context.ball_mass/10,
      radius: 10,
      restitution: -1 - this.context.restitution/10,
      color:"#dadd0f"

    };


    target = {

      dimensions: {width: this.canvas.width/3.5, height: this.canvas.width/3.5},
      position : {x: this.canvas.width - this.canvas.width/3.5 -20, y:10 },
      imageURL : 'https://i.ibb.co/yFYTmBJ/croc.png'

    };




  }

  /**
   * Export data
   */
  dataCollection(){


    let  exportData = {

      ball_position_x: ball.position.x,
      ball_position_y: ball.position.y,
      paddle_position_x: paddle.position.x,
      paddle_position_y: paddle.position.y,
      timestamp : new Date().getTime()

    };

   // this.context.get('export_arr').addObject(exportData);
    super.storeData(exportData);

  }










}
