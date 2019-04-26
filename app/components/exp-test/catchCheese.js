/*
 * Developed by Gleb Iakovlev on 4/6/19 12:12 PM.
 * Last modified 4/6/19 12:12 PM.
 * Copyright (c) Cognoteq Software Solutions 2019.
 * All rights reserved
 */

/**
 * Main implementation for catch cheese with obstruction game
 */
import Base from "./base";

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
let trajectories = [

    {velocity : {x: 5.8, y:-7.4}},
    {velocity : {x: 4.8, y:-8.2}},
    {velocity : {x: 5.0, y:-7.8}},
    {velocity : {x: 5.2, y:-7.6}}
];



export default class catchCheese extends Base{


    constructor(context,document) {
        super(context,document);
        paddleWidth = this.canvas.width/20;
        paddleHeight = this.canvas.width/15;


    }




    init() {
        super.init();


        basket = {
            dimensions: {width: paddleWidth,height: paddleWidth},
            position: {x: this.canvas.width/2 + paddleWidth*3,y: (this.canvas.height/2+paddleHeight*2) },
            velocity: super.Utils.paddleSpeed,
            imageURL: super.Utils.basketImage
        };



        goodJob  = new Audio(super.Utils.goodCatchSound);
        goodJob.load();
        ballCatchFail = new Audio(super.Utils.ballcatchFailSound);
        ballCatchFail.load();
        audio  = new Audio(super.Utils.rattleSound);
        audio.load();
        audio.addEventListener('onloadeddata', this.initGame(),false);



    }


    createPaddleBox() {
        this.ctx.beginPath();
        this.ctx.rect(this.canvas.width/2 + paddleWidth*3,this.canvas.height/2.5 + this.canvas.height/2 - paddleWidth,basket.dimensions.width,basket.dimensions.width);
        this.ctx.fillStyle= "#020102";
        this.ctx.lineWidth = "8";
        this.ctx.strokeStyle = "#1931dd";
        this.ctx.stroke();
    }


    initGame() {


        super.gameOver = false;
        super.initGame();

        let trajectory = trajectories[Math.floor(Math.random()*trajectories.length)];

        ball = {

            position : {x: paddleWidth*5 + 20, y:(this.canvas.height-paddleWidth*2)},
            velocity : {x:trajectory.velocity.x, y:trajectory.velocity.y},
            mass: super.Utils.ballMass,
            radius: 10,
            restitution: super.Utils.restitution,
            color:"#dadd0f"

        };


        obstructions =  Array(Math.floor(Math.random()*3)).fill({}).map((value,index) =>

            ({  dimensions: {width:paddleWidth*3.5, height: this.canvas.height / 1.5 },
                position: {x: this.canvas.width/2 -(index+1)*paddleWidth,y: this.canvas.height/2.5  - paddleWidth*1.5 },
                imageURL: super.Utils.treeImage
            })

        );


        initSoundPlaying = true;
        ballCatchFail.src = super.Utils.ballcatchFailSound;
        goodJob.src = super.Utils.goodCatchSound;
        audio.src = super.Utils.rattleSound;
        audio.play();
        audio.addEventListener("ended", function () {

            initSoundPlaying = false;
        });



    }

    dataCollection() {

        super.storeData();
    }

    collisionDetection(){



        if(ball.position.y > basket.position.y && ball.position.y - ball.radius < basket.position.y + basket.dimensions.height ){

            if(ball.position.x > basket.position.x && ball.position.x + ball.radius <ball.position.x + basket.dimensions.width){

                return true;
            }

        }

        return  false;

    }


    starsLocationUpdate(){

        targetStars = {

            position : {x: basket.position.x + paddleWidth , y: basket.position.y - paddleHeight/2},
            dimensions : {width: paddleWidth/1.5, height: paddleWidth/1.5},
            imageURL : super.Utils.basketStarsImage

        };

    }



    /**
     * TODO: randomize appearing objects number and trajectory a bit
     */
    loop() {
        super.loop();

        super.createBallBox(paddleWidth);

        let hitTheTarget = this.collisionDetection();
        let hitTheWall = super.wallCollision(ball);


        if(hitTheTarget || hitTheWall || super.gameOver ){

                if(hitTheTarget) {

                    if(!super.gameOver && goodJob.readyState === 4) {

                        goodJob.play();
                    }

                }else{
                    if(!super.gameOver) {

                        ballCatchFail.play();
                    }

                }
                // Remove ball and show in the starting point,
                //User should set the paddle to initial position , call stop after that
                super.moveBallToStart(ball,true);
                super.paddleAtZero(basket,hitTheTarget);
                if(hitTheTarget) {
                    this.starsLocationUpdate();
                    this.drawImage(targetStars);
                }

        }else{

            if(initSoundPlaying) {

                super.moveBallToStart(ball,false);

            }else{

                super.ballTrajectory(ball);

            }
        }

        this.createPaddleBox();
        super.paddleMove(basket);
        this.drawImage(basket);




        obstructions.forEach(obstruction => this.drawImage(obstruction));


    }



    drawImage(object){
        let image = new Image();
        image.src = object.imageURL;
        this.ctx.drawImage(image,object.position.x,object.position.y,object.dimensions.width,object.dimensions.height);
    }



}
