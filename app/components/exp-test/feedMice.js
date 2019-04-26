/*
 * Developed by Gleb Iakovlev on 4/7/19 12:19 AM.
 * Last modified 4/7/19 12:19 AM.
 * Copyright (c) Cognoteq Software Solutions 2019.
 * All rights reserved
 */


/**
 * Main implementation for feed the mice game
 */
import Base from "./base";

let paddleWidth = 0;
let paddleHeight = 0;
let target = {};
let ball = {};
let targets = [];
let pressed = {};
let roofcolor= "#ff2d23";
let housecolor = "#8f909c";
let keys = ['o','k','m'];
let imageURLS = [];
let audio = {};
let ballCatchFail = {};
let goodJob = {};
let initSoundPlaying = false;

export default class feedMice extends Base{

    constructor(context,document) {
        super(context,document);
        paddleWidth = this.canvas.width/20;
        paddleHeight = this.canvas.width/15;
        imageURLS = [super.Utils.blueMouseImage,super.Utils.greenMouseImage,super.Utils.redMouseImage];
        /**
         * middle : velocity:{x:6.8  ,y:5.3 }
         * high : velocity:{x:6.8  ,y:7.0 }
         * low : velocity:{x:7.8  ,y:4.0 }
         *
         * @type {{velocity: {x: number, y: number}}[]}
         */

        this.trajectories= [

            {velocity:{x:5.8  ,y:7.0 }},
            {velocity:{x:6.5  ,y:6.8 }},
            {velocity:{x:7.5  ,y:4.8 }}

        ]



    }


    drawImage(object){
        let image = new Image();
        image.src = object.imageURL;
        this.ctx.drawImage(image,object.position.x,object.position.y,object.dimensions.width,object.dimensions.height);

    }



    createHouse(){

        let houseX = this.canvas.width/2 - paddleWidth;
        let houseY = this.canvas.height/2.5;
        let houseWidth = this.canvas.width/3.5;
        let houseHeight = this.canvas.height/2;
        let roofSpace = 20;

        this.ctx.beginPath();
        this.ctx.fillStyle= housecolor;
        this.ctx.rect(houseX,houseY,houseWidth,houseHeight);
        this.ctx.fill();
        this.ctx.closePath();
        //Draw roof

        this.ctx.beginPath();
        this.ctx.fillStyle= roofcolor;
        this.ctx.moveTo(houseX - roofSpace  ,houseY);
        this.ctx.lineTo(houseX + houseWidth/2 ,houseY - houseHeight + 100);
        this.ctx.lineTo(houseX+houseWidth +roofSpace ,houseY);
        this.ctx.fill();
        this.ctx.closePath();
    }


    createWindow(target){
        this.ctx.beginPath();
        this.ctx.fillStyle= target.windowbackground;
        this.ctx.rect(target.position.x,target.position.y,target.dimensions.width,target.dimensions.height);
        this.ctx.fill();
        this.ctx.closePath();

        // Add mouse to window

        this.drawImage(target)

    }


    init() {
        super.init();

        goodJob  = new Audio(super.Utils.good3MouseSound);
        goodJob.load();

        ballCatchFail = new Audio(super.Utils.bad3MouseSound);
        ballCatchFail.load();

        audio  = new Audio(super.Utils.rattleSound);
        audio.load();
        audio.addEventListener('onloadeddata', this.initGame(),false);


    }

    initGame() {
        super.initGame();
        pressed = Array(3).fill(false);

        let trajectory = this.trajectories[Math.floor(Math.random()*3)]
        target = {

            dimensions: {width : paddleWidth/2, height: paddleWidth/2},
            position: {x: (this.canvas.width - paddleWidth*2 - this.canvas.width/3.2) + this.canvas.width/6.4 - paddleWidth/2 , y:this.canvas.height/3 +  this.canvas.height/4},
            radius : 4,
            color:  "#8f909c",
            roofcolor: "#ff2d23",
            windowbackground: "#020102"

        };


        ball = {
            position : {x: paddleWidth*5 + 20, y:(this.canvas.height-paddleWidth*2)},
            velocity : {x: trajectory.velocity.x, y:-trajectory.velocity.y},
            mass: super.Utils.ballMass,
            radius: paddleWidth/6.5,
            restitution: super.Utils.restitution,
            color:"#dadd0f"

        };

        targets = Array(3).fill({}).map( (_,index) =>

            ({

                dimensions: {width : paddleWidth/1.5, height: paddleWidth/1.5},
                position: {x: (this.canvas.width/2 - paddleWidth*0.3) + this.canvas.width/5.0  , y:this.canvas.height/2.6 +  this.canvas.height/4 + index*paddleWidth*0.8 },
                radius : 4,
                color:  "#8f909c",
                roofcolor: "#ff2d23",
                windowbackground: "#020102",
                imageURL: imageURLS[index]


            })

        );



        initSoundPlaying = true;
        goodJob.src = super.Utils.good3MouseSound;
        ballCatchFail.src = super.Utils.bad3MouseSound;
        audio.src = super.Utils.rattleSound;
        audio.play();
        audio.addEventListener("ended", function () {

            initSoundPlaying = false;
        });


        super.initGame();


    }

    /**
     * Check collision of appropriate key and window
     * @param index
     * @returns {int}
     */
    collisionDetection(index){

        // Window collision detection
        let target = targets[index];
        if(ball.position.x > target.position.x && ball.position.x - ball.radius < target.position.x + target.dimensions.width/2){

            if(ball.position.y > target.position.y && ball.position.y - ball.radius < target.position.y + target.dimensions.height/2 ){

                //Put the ball in the center of target once it hits window constraints
                ball.position.x = target.position.x + target.dimensions.width/2 - ball.radius/2;
                ball.position.y = target.position.y + target.dimensions.height/2 - ball.radius/2;

                if(pressed[index]){


                    return 2;


                }

                return 1;

            }

        }

        return 0;
    }


    /**
     * Set appropriate index value in pressed array, according to index of the key pressed
     * @param e {object} event
     */
    keyDownHandler(e) {


        pressed =  pressed.map((val,index) => keys[index] === e.key?true:false);


    }




    loop() {
        super.loop();


        super.createBallBox(paddleWidth);

        let collisionArray = Array(3).fill(0).map((_, index) => this.collisionDetection(index));
        let didHitWindow = collisionArray.some(item => item >0);
        let didHitCorrectWindow = collisionArray.some(item => item === 2);


        if(super.gameOver){
            super.waitSeconds(1500);
            super.finishGame(false);

        }else{

            if (!didHitWindow) {
                if(!initSoundPlaying) {
                    super.ballTrajectory(ball);
                }else{

                    super.moveBallToStart(ball,false);
                }
            }
            this.createHouse();
            targets.forEach(target => this.createWindow(target));
            if (didHitWindow) {

                let index = pressed.findIndex(item => item !=false)
                let target = targets[index];
                if(target){
                    target.windowbackground = "#dde5d7";
                    this.createWindow(target);

                }

                if(didHitCorrectWindow) {
                    goodJob.play();

                }else{
                    ballCatchFail.play();

                }


                super.ballTrajectory(ball);
                super.moveBallToStart(ball,true);
                super.waitSeconds(600);

            }


        }

    }

    dataCollection() {



    }


}
