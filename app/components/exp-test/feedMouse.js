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
let paddleHeight = 0;
let target = {};
let ball = {};
let keyPressed = false;

let initSoundPlaying = false;
let startSound = {};
let ballCatchFail = {};
let goodJob = {};

export default class feedMouse extends Base{

    constructor(context,document){

        super(context,document);
        paddleWidth = this.canvas.width/20;
        paddleHeight = this.canvas.width/15;



    }



    createHouse(){

        let houseX = this.canvas.width/2 + paddleWidth;
        let houseY = this.canvas.height/2.5;
        let houseWidth = this.canvas.width/3.5;
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

        goodJob  = new Audio(super.Utils.doorbellSound);
        goodJob.load();

        ballCatchFail = new Audio(super.Utils.ballcatchFailSound);
        ballCatchFail.load();

        startSound  = new Audio(super.Utils.rattleSound);
        startSound.load();
        startSound.addEventListener('onloadeddata', this.initGame(),false);


    }

    initGame() {


        target = {

          dimensions: {width : paddleWidth, height: paddleWidth},
          position: {x: (this.canvas.width - paddleWidth*3 - this.canvas.width/3.2) + this.canvas.width/6.4 - paddleWidth/2 , y:this.canvas.height/3 +  this.canvas.height/4},
          radius : 4,
          color:  "#8f909c",
          roofcolor: "#ff2d23",
          windowbackground: "#020102"

        };


        ball = {
            position : {x: paddleWidth*5 + 20, y:(this.canvas.height-paddleWidth*2)},
            velocity : {x: 5.8, y:-7.6},
            mass: super.Utils.ballMass,
            radius: 10,
            restitution: super.Utils.restitution,
            color:"#dadd0f"

        };


        initSoundPlaying = true;
        goodJob.src = super.Utils.doorbellSound;
        ballCatchFail.src = super.Utils.ballcatchFailSound;
        startSound.src = super.Utils.rattleSound;

        startSound.play();
        startSound.addEventListener("ended", function () {

            initSoundPlaying = false;
        });

        super.initGame();


    }

    dataCollection() {


    }


    collisionDetection(){

        // Window collision detection
        if(ball.position.x > target.position.x && ball.position.x + ball.radius < target.position.x + target.dimensions.width/2){

            if(ball.position.y  - ball.radius > target.position.y  && ball.position.y + ball.radius < target.position.y + target.dimensions.height/2 ){


                ball.position.x = target.position.x + target.dimensions.width/2 - ball.radius/2;
                ball.position.y = target.position.y + target.dimensions.height/2 - ball.radius/2;


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


        if(super.gameOver){
            super.waitSeconds(2000);
            super.finishGame(false);

        }else{

            super.wallCollision(ball);
            if (!didHitWindow) {
                if(!initSoundPlaying) {
                    super.ballTrajectory(ball);
                }else{

                    super.moveBallToStart(ball,false);
                }
            }
            super.createBallBox(paddleWidth);
            this.createHouse();
            this.createWindow();
            if (didHitWindow) {

                if (keyPressed) {
                    target.windowbackground = "#dde5d7";
                    this.createWindow(target);
                    goodJob.play();

                }else{
                    ballCatchFail.play();

                }
                super.ballTrajectory(ball);
                super.moveBallToStart(ball,true);

            }
        }

    }


}
