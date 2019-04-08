import Base from "./base";

/**
 * Catch the mouse game implementaion 
 */


let mice = {};
let cheeseClock = {};
let basket = {};
let paddleWidth = 0;
let paddleHeight = 0;
let upPressed = false;
let downPressed = false;

export  default  class catchMouse extends Base{

    constructor(context,document){

        super(context,document);
        paddleWidth = this.canvas.width/9;
        paddleHeight = this.canvas.width/9;
        
    }


  /**
   * initialize on start button
   */
  init(){
      super.init();
      this.initGame();
  }





  createPaddleBox() {
        this.ctx.beginPath();
        this.ctx.rect(this.canvas.width/2 - paddleWidth,(this.canvas.height-paddleHeight)/2+basket.dimensions.height/3,basket.dimensions.width,basket.dimensions.width);
        this.ctx.fillStyle= "#020102";
        this.ctx.stroke();
        this.ctx.lineWidth = "4";
        this.ctx.strokeStyle = "#1931dd";
        this.ctx.fill();
        this.ctx.closePath();
  }



  initGame(){

        super.initGame();
        basket = {
            dimensions: {width: paddleWidth,height: paddleHeight},
            position: {x: this.canvas.width/2 - paddleWidth,y: (this.canvas.height-paddleHeight)/2 },
            velocity: this.context.paddle_speed,
            imageURL: 'https://i.ibb.co/3vtD1T1/Screen-Shot-2019-04-05-at-5-10-26-PM.png'
        };
        
        mice = {
            dimensions: {width: paddleWidth/1.2,height: paddleWidth/1.2},
            position : {x: this.canvas.width/2 - paddleWidth, y:(this.canvas.height-paddleHeight)/2 - 60*1.5},
            radius: 10,
            delay:1600,
            lastTime: new Date().getTime(),
            imageURL: 'https://i.ibb.co/xhChFFL/Screen-Shot-2019-04-05-at-5-10-09-PM.png'
        }; 

        cheeseClock = {
            dimensions: {width: paddleWidth/1.5,height: paddleWidth/1.5},
            position: {x: this.canvas.width/2 + paddleWidth/2,y: (this.canvas.height-paddleHeight)/2 - 100 },
            angle:0,
            velocity: 1.2,
            imageURL: 'https://i.ibb.co/QrJ5Y8Y/Screen-Shot-2019-04-05-at-5-10-17-PM.png'
        };


  }

  dataCollection(){


        let  exportData = {

            basket_x: basket.position.x,
            basket_y: basket.position.y,
            mice_x: mice.position.x,
            mice_y: mice.position.y,
            timestamp : new Date().getTime()

        };


        super.storeData(exportData);

    }


    /**
     * Mice appears after delay ,  paddle movements are  here
     */
    startClock(){
        super.drawImage(mice)
        super.paddleMove(basket);


        //Collision detection basket with mice

        if(mice.position.y > basket.position.y && mice.position.y < basket.position.y + basket.dimensions.height ){
            super.increaseScore();
            super.finishGame();
        }


        // fill the cheeseClock
        cheeseClock.angle = cheeseClock.angle + cheeseClock.velocity/50;
        let angle = Math.PI * (1.5 - cheeseClock.angle);

        if(cheeseClock.angle >= 1.6){

            super.finishGame();
        }

        this.ctx.beginPath();
        this.ctx.moveTo(cheeseClock.position.x+ cheeseClock.dimensions.width/2, cheeseClock.position.y+ cheeseClock.dimensions.height/2);
        this.ctx.fillStyle = "#020102";
        this.ctx.arc(cheeseClock.position.x+ cheeseClock.dimensions.width/2, cheeseClock.position.y+ cheeseClock.dimensions.height/2, cheeseClock.dimensions.height/2, angle, Math.PI*1.65);
        this.ctx.lineTo(cheeseClock.position.x+ cheeseClock.dimensions.width/2, cheeseClock.position.y+ cheeseClock.dimensions.height/2);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();



    }




    loop(){
        super.loop();
        this.createPaddleBox();
        super.drawImage(cheeseClock)

        if(new Date().getTime() -  mice.lastTime > mice.delay ){

            this.startClock();

        }

        super.drawImage(basket)
    
    }


}
