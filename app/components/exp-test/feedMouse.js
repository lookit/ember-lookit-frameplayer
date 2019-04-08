/*
 * Developed by Gleb Iakovlev on 4/6/19 3:11 PM.
 * Last modified 4/6/19 3:11 PM.
 * Copyright (c) Cognoteq Software Solutions 2019.
 * All rights reserved
 */

/**
 * Implementation for feed the mouse in the house game
 */
import Base from "./base";

let paddleWidth = 0;
let target = {};
let ball = {};
let keyPressed = false;

export default class feedMouse extends Base{

    constructor(context,document){

        super(context,document);
        paddleWidth = this.canvas.width/13;

    }


    createBallBox() {

        this.ctx.beginPath();
        this.ctx.fillStyle= "#020102";
        this.ctx.lineWidth = "4";
        this.ctx.strokeStyle = "#1931dd";
        this.ctx.strokeRect(paddleWidth*3,(this.canvas.height-paddleWidth*2),paddleWidth/2,paddleWidth);
        this.ctx.fill();
        this.ctx.closePath();
    }



    createHouse(){

        let houseX = this.canvas.width - paddleWidth*2 - this.canvas.width/3.2;
        let houseY = this.canvas.height/3;
        let houseWidth = this.canvas.width/3.2;
        let houseHeight = this.canvas.height/2;
        let roofSpace = 20;

        this.ctx.beginPath();
        this.ctx.fillStyle= target.color;
        this.ctx.rect(houseX,houseY,houseWidth,houseHeight);
        this.ctx.fill();
        this.ctx.closePath();
        //Draw roof

        this.ctx.beginPath();
        this.ctx.fillStyle= target.roofcolor;
        this.ctx.moveTo(houseX - roofSpace  ,houseY);
        this.ctx.lineTo(houseX + houseWidth/2 ,houseY - houseHeight + 100);
        this.ctx.lineTo(houseX+houseWidth +roofSpace ,houseY);
        this.ctx.fill();
        this.ctx.closePath();
    }


    createWindow(){
        this.ctx.beginPath();
        this.ctx.fillStyle= target.windowbackground;
        this.ctx.rect(target.position.x,target.position.y,target.dimensions.width,target.dimensions.height);
        this.ctx.fill();
        this.ctx.closePath();

        //Draw window cross
        this.ctx.beginPath();
        this.ctx.strokeStyle= target.color;
        this.ctx.moveTo(target.position.x + target.dimensions.width/2  ,target.position.y);
        this.ctx.lineTo(target.position.x + target.dimensions.width/2 ,target.position.y + target.dimensions.height);
        this.ctx.moveTo(target.position.x  ,target.position.y  + target.dimensions.height/2);
        this.ctx.lineTo(target.position.x + target.dimensions.width ,target.position.y + target.dimensions.height/2);
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.closePath();


        //Draw red dot
        this.ctx.beginPath();
        this.ctx.arc(target.position.x + target.dimensions.width/2, target.position.y + target.dimensions.height/2, target.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = target.roofcolor;
        this.ctx.fill();
        this.ctx.closePath();


    }


    init() {
        super.init();
        this.initGame();
    }

    initGame() {
        super.initGame();

        target = {

          dimensions: {width : paddleWidth, height: paddleWidth},
          position: {x: (this.canvas.width - paddleWidth*2 - this.canvas.width/3.2) + this.canvas.width/6.4 - paddleWidth/2 , y:this.canvas.height/3 +  this.canvas.height/6},
          radius : 4,
          color:  "#8f909c",
          roofcolor: "#ff2d23",
          windowbackground: "#020102"

        };


        ball = {
            position : {x: paddleWidth*3, y:(this.canvas.height-paddleWidth*2)},
            velocity : {x: this.context.x_velocity/10, y:-1*this.context.y_velocity/10},
            mass: this.context.ball_mass/10,
            radius: 6,
            restitution: -1 - this.context.restitution/10,
            color:"#dadd0f"

        };

    }

    dataCollection() {






    }


    collisionDetection(){

        // Window collision detection
        if(ball.position.x > target.position.x && ball.position.x - ball.radius < target.position.x + target.dimensions.width){

            if(ball.position.y > target.position.y && ball.position.y - ball.radius < target.position.y + target.dimensions.height ){


                if(keyPressed){

                    super.increaseScore();
                    super.finishGame();

                }

                return true;

            }

        }

        return false;
    }



    keyDownHandler(e) {

        if(e.key === "l" || e.key === "L" ) {

            keyPressed = true;
        }

    }

    keyUpHandler(e) {

        if(e.key === "l" || e.key === "L" ) {

            keyPressed = false;
        }

    }


    loop() {
        super.loop();
        let didHitWindow = this.collisionDetection();
        super.wallCollision(ball);
        if(!didHitWindow) {
            super.ballTrajectory(ball);
        }
        this.createBallBox();
        this.createHouse();
        this.createWindow();
        if(didHitWindow){
            super.ballTrajectory(ball);
        }

    }


}
