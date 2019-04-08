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
let obstructionNumber = 2;
let obstructions = [];

export default class catchCheese extends Base{


    constructor(context,document) {
        super(context,document);
        paddleWidth = this.canvas.width/9;
        paddleHeight = this.canvas.width/9;
        obstructionNumber = this.context.obstructionNumber;

    }

    createBallBox() {

        this.ctx.beginPath();
        this.ctx.fillStyle= "#020102";
        this.ctx.lineWidth = "4";
        this.ctx.strokeStyle = "#1931dd";
        this.ctx.strokeRect(10,(this.canvas.height/2+paddleHeight*1.5),basket.dimensions.width/2,basket.dimensions.width*1.2);
        this.ctx.fill();
        this.ctx.closePath();
    }




    init() {
        super.init();
        this.initGame();
    }





    initGame() {
        super.initGame();
        basket = {
            dimensions: {width: paddleWidth,height: paddleHeight},
            position: {x: this.canvas.width/2 + paddleWidth*2,y: (this.canvas.height/2+paddleHeight) },
            velocity: this.context.paddle_speed,
            imageURL: 'https://i.ibb.co/3vtD1T1/Screen-Shot-2019-04-05-at-5-10-26-PM.png'
        };

        ball = {

            position : {x: 100, y:this.canvas.height-basket.dimensions.width*1.56 - basket.dimensions.width*1.2},
            velocity : {x: this.context.x_velocity/10, y:-1*this.context.y_velocity/10},
            mass: this.context.ball_mass/10,
            radius: 10,
            restitution: -1 - this.context.restitution/10,
            color:"#dadd0f"

        };


        obstructions =  Array(obstructionNumber).fill({}).map((value,index) =>

            ({  dimensions: {width:paddleWidth*1.5, height: this.canvas.height / 1.5 },
            position: {x: this.canvas.width/2 + (paddleWidth - 30) -index*paddleWidth/1.5,y: (this.canvas.height-paddleHeight)/2 - paddleHeight },
            imageURL: 'https://i.ibb.co/tMS8VhL/Fir-Tree-PNG-Transparent-Image.png'
             })

        );

    }

    dataCollection() {

        super.storeData();
    }

    collisionDetection(){


        super.wallCollision(ball);

        if(ball.position.y > basket.position.y && ball.position.y + ball.radius < basket.position.y + basket.dimensions.height ){

            if(ball.position.x > basket.position.x && ball.position.x- ball.radius <ball.position.x + basket.dimensions.width){
                super.increaseScore();
                super.finishGame();
            }

        }


    }

    loop() {
        super.loop();


        this.collisionDetection();

        this.createBallBox();
        super.drawImage(basket);
        super.ballTrajectory(ball);
        obstructions.forEach( obstruction=> super.drawImage(obstruction) );
        super.paddleMove(basket);



    }






}
