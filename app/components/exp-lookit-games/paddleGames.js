/*
 * Developed by Gleb Iakovlev on 1/11/20 12:42 PM.
 * Last modified 1/11/20 12:42 PM.
 * Copyright (c) Cognoteq Software Solutions 2020.
 * All rights reserved
 */

import Base from './base';

let mouseY = 0; // mouse pointer  position on Y axis
let paddle = {};
let paddleBox = {
  position: {x: 0, y: 0},
  dimensions: {width: 0, height: 0}
};

export default class PaddleGames extends Base {

  constructor(context, document) {
    super(context, document);
    this.paddleBoxParameters();
  }



  set paddle(val){

    paddle = val;
  }

  get paddle(){

    return paddle;
  }


  set paddleBox(val){

    paddleBox = val;
  }

  get paddleBox(){

    return paddleBox;
  }


  /**
   * Create and draw box for initial paddle location.
   * The box symbolizes initial paddle location in all games
   * @param color {int} Color of the Paddle box
   * @param fill {boolean} Set solid color paddle box
   * @method createPaddleBox
   */
  createPaddleBox(color = super.Utils.blueColor, fill = false) {

    if(fill){

      this.ctx.fillStyle = color;
      this.ctx.fillRect(paddleBox.position.x, paddleBox.position.y, paddleBox.dimensions.width, paddleBox.dimensions.height);

    }else{

      this.ctx.beginPath();
      this.ctx.rect(paddleBox.position.x, paddleBox.position.y, paddleBox.dimensions.width, paddleBox.dimensions.height);
      this.ctx.fillStyle = color;
      this.ctx.lineWidth = '8';
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }



  }




  /**
   * Basket object per Matlab coordinates
   * @method basketObject
   * @param basket paddle parameters
   * @return {object} basket parameters
   */
  basketObject() {

    let position = (this.canvas.height - mouseY)/super.Utils.SCALE;
    let radiusRim = 0.1;
    let leftBorder = (1.3310 - radiusRim) * super.Utils.SCALE;
    let topBorder = (1.3671 - position) * super.Utils.SCALE;
    let rightBorder = (1.3310 + radiusRim) * super.Utils.SCALE;
    let downBorder = (1.5371 - position) * super.Utils.SCALE;

    paddle.position = {x: leftBorder, y: mouseY};
    paddle.dimensions = {width: rightBorder - leftBorder, height: downBorder - topBorder};

  }


  /**
   * Store paddle position and time history for velocity calculation
   * @method paddleHistory
   * @param {object} paddle
   * @param {int} trial initial Time in Unixtime
   */
  paddleHistory() {


    paddle.times.push(super.getElapsedTime());
    if(paddle.positions.length > 80){
      paddle.positions = paddle.positions.slice(-80);
    }
    paddle.positions.push((this.canvas.height - paddle.position.y) / super.Utils.SCALE);

  }

  /**
   * Paddle object per Matlab coordinates
   * @method paddleObject
   * @param {object} paddle
   * @return {object} paddle {position: {x: number, y: number}, dimensions: {width: number, height: number}}
   */
  paddleObject(){
    let position = (this.canvas.height - mouseY)/super.Utils.SCALE ;
    let leftBorder = (1.256)*super.Utils.SCALE ;
    let topBorder = (1.3671-position)*super.Utils.SCALE;
    let rightBorder = (1.406)*super.Utils.SCALE;
    let downBorder =  (1.3871-position)*super.Utils.SCALE ;

    paddle.position = {x: leftBorder,y:mouseY};
    paddle.dimensions = {width: rightBorder - leftBorder, height: downBorder-topBorder};
    paddle.time = super.getElapsedTime();

  }






  /**
   * Check if user returned paddle to initial coordinates and call finish of the game to restart
   * current round
   * Check if paddle is stationary for PADDLE_REST_TIME_MS, if yes proceed to the next trial
   * @method paddleAtZero
   * @param {object} paddle {position: {x: number, y: number}, dimensions: {width: number, height: number}}
   * @param {boolean} score should increase score
   */
  paddleAtZero(score) {


    let topBorder = 1.3671 * super.Utils.SCALE;

    if (paddle.position.y >= topBorder) {
      // Check if paddle is not moving inside the box
      let paddleTimeArrSize = paddle.positions.length;
      if (paddle.paddleLastMovedMillis === 0 || (paddle.position.y !== (this.canvas.height - paddle.positions[paddleTimeArrSize - 1] * super.Utils.SCALE))) {
        paddle.paddleLastMovedMillis = new Date().getTime();

      } else if (new Date().getTime() - paddle.paddleLastMovedMillis >= super.PADDLE_REST_TIME_MS) {
        paddle.paddleLastMovedMillis = 0;
        this.finishGame(score);
      }

    } else {

      paddle.paddleLastMovedMillis = 0;
    }

  }


  /**
   * Check if paddle is moved ahead of time
   * @method paddleIsMoved
   * @param {object} paddle parameters object {position: {x: number, y: number}, dimensions: {width: number, height: number}}
   * @param {boolean} checkPaddleHeight if height needed for reference (bounce game)
   * @return {boolean}
   */
  paddleIsMoved(){

    if( paddle.positions.length > 2 && paddle.position.y !== (this.canvas.height - paddle.positions[paddle.positions.length-3]*super.Utils.SCALE)){

      return true;
    }


    // Check if paddle is moved outside the box limits
    return this.isOutsideBox();

  }


  isOutsideBox(paddleHeight = 1) {

    return paddle.position.y < paddleBox.position.y - paddleBox.dimensions.height + paddle.dimensions.height * paddleHeight;

  }



  /**
   * Set paddle coordinates up to velocity
   * Check if paddle not going past the paddle box bottom border
   * Move paddle inside paddle Box upon start of the game
   * @method paddleMove
   * @param {object} paddle {position: {x: number, y: number}, dimensions: {width: number, height: number}}
   * @param {int} initialTime,  Initial time (Unixtime) for current game round
   * @param {object} ball {position: {x: number, y: number}, radius: number, dimensions: {width: number, height: number}}
   */
  paddleMove() {


    //Do not go over the bottom border
    if(paddle.position.y > paddleBox.position.y + paddleBox.dimensions.height - paddle.dimensions.height){

      paddle.position.y = paddleBox.position.y + paddleBox.dimensions.height - paddle.dimensions.height;
    }

    // Move paddle inside paddle Box upon start of the game
    if(super.ball.state === 'start' && super.currentRounds === 0 && paddle.position.y < paddleBox.position.y  &&  paddle.positions.length == 0 ) {

       mouseY = paddleBox.position.y + paddle.dimensions.height/2 ;
    }

    paddle.time = super.getElapsedTime();

    this.paddleHistory();


  }

  paddleBoxParameters() {
    let leftBorder = super.Utils.paddleBoxValues.left;
    let topBorder = super.Utils.paddleBoxValues.top;
    let rightBorder = super.Utils.paddleBoxValues.right;
    let downBorder = super.Utils.paddleBoxValues.down;
    paddleBox.position.x = leftBorder;
    paddleBox.position.y = topBorder;
    paddleBox.dimensions.width = rightBorder - leftBorder;
    paddleBox.dimensions.height = downBorder - topBorder;
  }





  /**
   * Increment current position cursor by movementY value (difference in y coordinate between the given event and the
   * previous mousemove event )
   * Check initial cursor position, if the position is lower then low paddle box border, stop t\
   * mouse pointer updates.
   * @method onMouseMove
   * @param e {Event} current mouse event
   */
  onMouseMove(e) {

    let border = paddleBox.position.y + paddleBox.dimensions.height - paddle.dimensions.height;
    mouseY += e.movementY;
    //Check for down border
    if (mouseY > border && e.movementY > 0) {
      mouseY = border;
    }

    //Check for upper border
    if (mouseY < paddle.dimensions.height) {
      mouseY = paddle.dimensions.height;

    }


  }

}
