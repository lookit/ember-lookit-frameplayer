import Base from "./base";

/**
 * Catch the mouse game implementaion 
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

export  default  class catchMouse extends Base{

    constructor(context,document){

        super(context,document);
        paddleWidth = this.canvas.width/20;
        paddleHeight = this.canvas.width/15;
        
    }


  /**
   * initialize on start button
   */
  init(){
      super.init();

      audio  = new Audio(super.Utils.rattleSound);
      audio.load();
      audio.addEventListener('onloadeddata', this.initGame(),false);

      goodJob  = new Audio(super.Utils.goodCatchSound);
      goodJob.load();

      ballCatchFail = new Audio(super.Utils.ballcatchFailSound);
      ballCatchFail.load();

      this.initGame();
  }


  drawImage(object){
        let image = new Image();
        image.src = object.imageURL;
        this.ctx.drawImage(image,object.position.x,object.position.y,object.dimensions.width,object.dimensions.height);
  }


  createPaddleBox() {
        this.ctx.beginPath();
        this.ctx.rect(this.canvas.width/2 - paddleWidth,this.canvas.height/2.5 + this.canvas.height/2 - 1.5*paddleWidth,paddleWidth*2,paddleWidth*2);
        this.ctx.lineWidth = "8";
        this.ctx.strokeStyle = "#1931dd";
        this.ctx.stroke();
        this.ctx.closePath();
  }



  initGame(){


        basket = {
            dimensions: {width: paddleWidth*1.5     ,height: paddleWidth*1.5},
            position: {x: 15 + this.canvas.width/2 - paddleWidth,y: this.canvas.height/2.5 + this.canvas.height/2 - 1.5*paddleWidth },
            velocity: super.Utils.paddleSpeed,
            imageURL: super.Utils.basketImage
        };
        
        mice = {
            dimensions: {width: paddleWidth,height: paddleWidth},
            position : {x: this.canvas.width/2 - paddleWidth/2, y:(this.canvas.height-paddleHeight)/2 - paddleHeight },
            radius: 20,
            delay:2000,
            lastTime: new Date().getTime(),
            imageURL: super.Utils.miceImage
        }; 

        cheeseClock = {
            dimensions: {width: paddleWidth,height: paddleWidth},
            position: {x: this.canvas.width/2 + paddleWidth,y: mice.position.y},
            angle:0,
            velocity: 1.4,
            imageURL: super.Utils.cheeseImage
        };



      initSoundPlaying = true;
      goodJob.src = super.Utils.goodCatchSound;
      ballCatchFail.src = super.Utils.ballcatchFailSound;
      audio.src = super.Utils.rattleSound;
      audio.play();
      audio.addEventListener("ended", function () {

          initSoundPlaying = false;
      });


      super.initGame();
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
     * Mice appears after delay
     */
    startClock(){

        this.drawImage(mice);

        //Collision detection basket with mice
        if(mice.position.y > basket.position.y - mice.dimensions.height/3  && mice.position.y < basket.position.y + basket.dimensions.height ){
            goodJob.play();
            super.gameOver = true ;

        }else{

            // fill the cheeseClock
            cheeseClock.angle = cheeseClock.angle + cheeseClock.velocity/50;

        }

        // Ran out of time
        if(cheeseClock.angle >= 2){
            ballCatchFail.play();
            super.gameOver = true;
            cheeseClock.angle = 0.1;
            cheeseClock.imageURL = super.Utils.cheeseMissedImage;
        }


    }

    /**
     *  Show cheese portion according to angle
     */
    showCheese() {

        if(super.gameOver){

            cheeseClock.dimensions.width = paddleWidth*1.5;
            cheeseClock.dimensions.height = paddleWidth*1.5;
        }

        let angle = Math.PI * (1.65 - cheeseClock.angle);
        this.ctx.beginPath();
        this.ctx.moveTo(cheeseClock.position.x + cheeseClock.dimensions.width / 2, cheeseClock.position.y + cheeseClock.dimensions.height / 2);
        this.ctx.fillStyle = "#020102";
        this.ctx.arc(cheeseClock.position.x + cheeseClock.dimensions.width / 2, cheeseClock.position.y + cheeseClock.dimensions.height / 2, cheeseClock.dimensions.height / 2, angle, Math.PI * 1.65);
        this.ctx.lineTo(cheeseClock.position.x + cheeseClock.dimensions.width / 2, cheeseClock.position.y + cheeseClock.dimensions.height / 2);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
    }



    loop(){
        super.loop();
        this.createPaddleBox();
        this.drawImage(cheeseClock);

        if(super.gameOver){

            super.paddleAtZero(basket,true);

        }else{

            // Start the clock and check if we ran out of time
            if(!initSoundPlaying &&  new Date().getTime() -  mice.lastTime > mice.delay ){

                this.startClock();

            }
        }
        this.showCheese();
        this.drawImage(basket)
        super.paddleMove(basket);

    }


}
