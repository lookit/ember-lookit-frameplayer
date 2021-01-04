
import PaddleGames from './paddleGames';
/**
 *
 * @submodule games
 *
 */

let obstructions = []; // Possible obstructions array
let targetStars = {}; // Start location (shows upon reaching the rim on basket )
let Height = 0.8; // Current trajectory height
let jitterT = 0;
let radiusRim = 0.1; //Rim size on basket
let redDotMargin = radiusRim / 4;
let obstructionsNum = 0; // Current number of obstructions (randomized each trial)
let consecutiveCounts = 0;  // Calculate number of consecutive successful attempts
const GEAR_RADIUS = 0.05;
const TRAVEL_TIME = 1.3;
const SOUND_DELAY = 1.6;
// Media arrays for loading
let sounds = [];
let catchSeriesSounds = [];
let soundURLs = [];
let imageURls = [];
let catchSeriesURls = [];
let images = [];
let obstructionsURLs = [];
let obstructionImages = [];
let trajectoryParameters = [];
let ball = {};
let soundTimeStamp = 0;
// Media mapping as Enum
const gameSound = {
  START:0,
  CATCH:1,
  FAIL:2
};
const gameImage = {
  PADDLE: 0,
  BALL: 1,
  STARS: 2,
  BALLBOX: 3

};

const gameRandomization = {

  OBSTRUCTION:0,
  HEIGHT:1


};

const gameArrayValues = {

  OBSTRUCTIONS: [0,1,2,3],
  HEIGHTS:[1, 5, 9]

};




/**
 * Main implementation of catch game.
 * The user will operate with paddle to catch the super.ball started
 * from super.ball box. The trajectory is randomized with various values in trajectories array
 * Number of obstructions currently randomized from 0 to 3 obstructions shown
 * @class DiscreteCatch
 * @extends Base
 */
export default class DiscreteCatch extends PaddleGames {
  /**
   * @method constructor
   * @constructor constructor
   * @param context
   * @param document
   */
  constructor(context, document) {
    super(context, document);
    soundURLs = [super.Utils.rattleSound,super.Utils.catchSeries,super.Utils.failcatchSound];
    catchSeriesURls = [
      super.Utils.catchSeries_1, super.Utils.catchSeries_2, super.Utils.catchSeries_3, super.Utils.catchSeries_4,
      super.Utils.catchSeries_5, super.Utils.catchSeries_6, super.Utils.catchSeries_7, super.Utils.catchSeries_8,
      super.Utils.catchSeries_9, super.Utils.catchSeries_10, super.Utils.catchSeries_11
    ];
    imageURls = [super.Utils.ironBasket,super.Utils.gear,super.Utils.basketStarsImage,super.Utils.robotImage];
    obstructionsURLs = [super.Utils.obstruction1, super.Utils.obstruction2, super.Utils.obstruction3];

  }


  /**
   * Main point to start the game.
   * Initialize static parameters and preload sounds here
   * @method init
   */
  init() {

    if(this.context.trialType === 'demo'){
      trajectoryParameters = this.context.demoObstructions.map((obstruction,index)=> [obstruction,this.context.demoTrajectories[index]]);
    }else {
      trajectoryParameters = super.getTrajectoriesObstacles(gameArrayValues.OBSTRUCTIONS,gameArrayValues.HEIGHTS);
    }

    super.fillAudioArray(soundURLs,sounds);
    super.fillAudioArray(catchSeriesURls, catchSeriesSounds);
    super.fillImageArray(imageURls,images);
    super.fillImageArray(obstructionsURLs,obstructionImages);




    super.paddle = {
      positions:[],
      times:[],
      velocity: super.Utils.paddleSpeed,
      paddleLastMovedMillis: 0
    };

    document.addEventListener("mousemove",  super.onMouseMove);
    sounds[gameSound.START].addEventListener('playing', super.onSoundEvent);
    sounds[gameSound.START].addEventListener('onloadeddata', this.initGame(), false);
    super.init();

  }





  /**
   * Initialize each game round with initial object parameters
   * Randomize number of obstructions
   * Wait for start sound and start the main game loop
   * @method initGame
   */
  initGame() {

    super.exportData = {
      game_type: 'discreteCatch',
      trajectory: [],
      ball_position_x: [],
      obstruction_number:[],
      ball_position_y: [],
      ball_timestamp: [],
      paddle_position_y: [],
      paddle_timestamp: [],
      trial: [],
      feedback: [],
      timestamp: [],
      paddle_x:'',
      trialType:'',
      paddle_center_x:'',
      red_dot_width:'',
      red_dot_start_position:''

    };

    super.initX = 0.51;
    super.initBallY = 0.08;
    jitterT = super.trialStartTime();
    super.createPaddleBox();
    super.basketObject();
    obstructionsNum = trajectoryParameters[super.currentRounds][gameRandomization.OBSTRUCTION];
    this.ballObject();
    super.ball.position.y = (1.291 )* super.Utils.SCALE;
    // Generate array of obstruction objects
    obstructions = Array(obstructionsNum).fill({}).map((value, index) =>

      ( this.getObstruction(index+1))
    );

    super.gameState.startTime = new Date().getTime();
    super.initGame();

  }


  /**
   * Obstruction object with coordinates
   * @method getObstruction
   * @param obstructionIndex
   * @return {{imageURL: *, position: {x: number, y: number}, dimensions: {width: number, height: number}}}
   */
  getObstruction(obstructionIndex = 1) {

    let leftBorder = (1 - 0.105 * obstructionIndex) * super.Utils.SCALE ;
    let topBorder = (0.94) * super.Utils.SCALE;
    let rightBorder = 1.18  * super.Utils.SCALE;
    let downBorder = (1.622) * super.Utils.SCALE;
    return {
      position: {x: leftBorder, y: topBorder},
      dimensions: {width: rightBorder - leftBorder, height: downBorder - topBorder},
      image: obstructionImages[obstructionIndex-1]
    };

  }

  /**
   * trajectory  : 1,2,3 ( Time when super.ball hits the basket at 500,600,700 ms )
   * obstruction : 0,1,2,3 (number of obstructions displayed)
   * @method dataCollection
   */
  dataCollection() {
    if(super.ball.state === 'hit' || super.ball.state === 'fall') {

      super.exportData.ball_position_x.push(parseFloat(super.convertXvalue(super.ball.position.x)));
      super.exportData.ball_position_y.push(parseFloat(super.convertYvalue(super.ball.position.y)));
      super.exportData.ball_timestamp.push(parseFloat(super.ball.timestamp));
      super.exportData.timestamp = soundTimeStamp;
      super.exportData.paddle_position_y.push(parseFloat(super.convertYvalue(super.paddle.position.y)));
      super.exportData.trial = super.currentRounds;
      super.exportData.trajectory = trajectoryParameters[super.currentRounds][gameRandomization.HEIGHT];
      super.exportData.feedback = this.ballState();
      super.exportData.obstruction_number = trajectoryParameters[super.currentRounds][gameRandomization.OBSTRUCTION];
      super.exportData.paddle_x = super.convertXvalue(super.paddle.position.x);
      super.exportData.trialType = this.context.trialType;
      super.exportData.paddle_center_x = super.convertXvalue(super.paddle.position.x   +  (super.paddle.dimensions.width / 2));
      super.exportData.red_dot_width =redDotMargin*2;
      super.exportData.red_dot_start_position = (1.3301 - redDotMargin).toFixed(3);
      super.exportData.scale = super.Utils.SCALE.toFixed(1);
      super.exportData.window_height =  screen.height;
      super.exportData.window_width = screen.width;
      super.exportData.canvas_height = this.canvas.height;
      super.exportData.canvas_width =  this.canvas.width;
      super.exportData.dpi = window.devicePixelRatio;


    }
    super.dataCollection();
  }




  /**
   * Check if super.ball reaches the target
   * @method collisionDetection
   * @return {boolean}
   */
  collisionDetection() {

    let basketPrevPosition = 0;
    if(super.paddle.positions.length >2){

      basketPrevPosition = this.canvas.height - (super.paddle.positions[super.paddle.positions.length-2])*super.Utils.SCALE;
    }

    let xballWithinPaddle = super.ball.position.x >= super.paddle.position.x && super.ball.position.x <=  super.paddle.position.x +  super.paddle.dimensions.width;
    let yballWithinPaddle = super.ball.positions.length >2 && super.ball.positions[super.ball.positions.length-2] <= basketPrevPosition && super.ball.position.y > super.paddle.position.y;

    if(xballWithinPaddle){
      // Prevent catching by side of the paddle
      // if(super.ball.positions.length > 2 && (super.ball.positions[super.ball.positions.length - 2] > super.paddle.position.y) ){
      //
      //   return  false;
      // }

      if (yballWithinPaddle) {



        super.ball.hitstate = 'good';

        if (super.ball.position.x > (1.3301 - redDotMargin) * super.Utils.SCALE && super.ball.position.x < (1.3301 + redDotMargin) * super.Utils.SCALE) {

          super.ball.hitstate = 'very good';
        }




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

      position: {x: super.paddle.position.x + 0.01* super.Utils.SCALE , y: super.paddle.position.y - 0.2* super.Utils.SCALE},
      dimensions: {width: 0.14*super.Utils.SCALE, height: 0.2*super.Utils.SCALE}
    };

  }


  /**
   * Draw initial super.ball box object
   * @method createLauncher
   * @param {image}  BallBox image
   */
  createLauncher(image) {

    let leftBorder = (0.075) * super.Utils.SCALE;
    let topBorder = (1.1471 )* super.Utils.SCALE;
    this.ctx.drawImage(image, leftBorder, topBorder, super.paddle.dimensions.height*2.7, super.paddle.dimensions.height*2.7);


  }

  /**
   * Override base  method to increase super.ball size
   * @param super.ball {object}
   * @param images {object}
   */
  drawBall(images) {

    this.ctx.drawImage(images, super.ball.position.x, super.ball.position.y, GEAR_RADIUS * super.Utils.SCALE , GEAR_RADIUS * super.Utils.SCALE);

  }


  /**
   * Main loop of the game.
   * Set initial position of the super.ball in a box and starting  sound .
   * After that  start super.ball trajectory.
   * If super.ball hits the target or missed the target wait util user places the paddle to starting position.
   * Increase the score if super.ball hits the target.
   * @method loop
   */
  loop() {
    super.loop();
    super.generateTrajectoryParams(trajectoryParameters[super.currentRounds][gameRandomization.HEIGHT],Height);
    this.createLauncher(images[gameImage.BALLBOX]);
    let paddleBoxColor = super.Utils.blueColor;
    ball = super.ball;
    if(super.ball.state === 'start'){
      this.ballObject();
      super.ball.position.y = (1.291 )* super.Utils.SCALE;
      if (super.gameState.startTime > 0 &&   super.getElapsedTime(super.gameState.startTime) > TRAVEL_TIME ){
        sounds[gameSound.START].play();
      }

      if(super.gameState.initialTime > 0 && super.isOutsideBox()){
        super.gameState.initialTime = new Date().getTime();
        super.gameState.startTime = new Date().getTime();
        sounds[gameSound.START].pause();
        sounds[gameSound.START].currentTime = 0;
        paddleBoxColor = super.Utils.redColor;
        super.createPaddleBox(paddleBoxColor);

      }

      if (super.gameState.initialTime > 0 && super.getElapsedTime() > jitterT) {
        sounds[gameSound.START].pause();
        sounds[gameSound.START].currentTime = 0;
        soundTimeStamp  = super.getElapsedTime();
        super.gameState.initialTime  = new Date().getTime();
        super.ball.state = 'fall';
      }

    }


    if(super.ball.state === 'fall'){
      if(super.gameState.initialTime > 0 && super.getElapsedTime() <= TRAVEL_TIME) {
        super.ball.positions.push(super.ball.position.y);
        super.trajectory();
      }

      if(super.gameState.initialTime > 0 && super.ballIsOnFloor()) {
        super.ball.state = 'hit';
      }

    }


    let hitTheTarget = this.collisionDetection();
    let hitTheWall = super.wallCollision();

    if((hitTheTarget || hitTheWall) && super.ball.state === 'fall'){

      super.ball.state = 'hit';
    }



    if (super.ball.state === 'hit') {


      if (super.ball.hitstate === 'very good') {

        super.increaseScore();
        // Limit consecutive sounds to 10 only
        if (consecutiveCounts > 10) {
          consecutiveCounts = 10;
        }
        //start from second count to make different sound from regular catch
        if(consecutiveCounts === 0){
          consecutiveCounts = 2;
        }
        catchSeriesSounds[consecutiveCounts].play();
        super.ball.radius = 0;

      }else if(super.ball.hitstate === 'good'){
        super.ball.radius = 0;
        consecutiveCounts = 0;
        catchSeriesSounds[consecutiveCounts].play();

      }else{
        consecutiveCounts = 0;
        sounds[gameSound.FAIL].play();
      }

      this.dataCollection();
      super.ball.state = 'done';

    }


    if(super.ball.state === 'done'){


      if (super.ball.hitstate === 'very good') {
        this.starsLocationUpdate();
        super.drawImageObject(targetStars,images[gameImage.STARS]);

      }

      // Remove super.ball and show in the starting point,
      //User should set the paddle to initial position , call stop after that
      super.paddleAtZero(false);

    }
    if( super.ball.hitstate !== 'good' &&  super.ball.hitstate !== 'very good'  ) {
      this.drawBall( images[gameImage.BALL]);
    }
    obstructions.forEach(obstruction => super.drawImage(obstruction, obstruction.image));
    this.basketObject();
    super.createPaddleBox(paddleBoxColor,true);
    super.paddleMove();
    super.drawImageObject(super.paddle,images[gameImage.PADDLE]);

  }




}
