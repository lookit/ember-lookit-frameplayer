/*
 * Developed by Gleb Iakovlev on 4/6/19 11:11 AM.
 * Last modified 4/6/19 11:11 AM.
 * Copyright (c) Cognoteq Software Solutions 2019.
 * All rights reserved
 */

/**
 * @class Utils
 * Shared Utility class for project static methods and constants
 */

let SCALE = 420;

export default class Utils{

  static get  frameRate() {  return 1 / 200; } // Seconds
  static get  frameDelay() { return 10; } // ms
  static get  paddleSpeed() {return 1;}
  static get  ballMass() {return 0.1;}
  static get  restitution() {return -1.2;}
  static get  gameRounds() {return 24;}
  static get  gravityFactor() {return 1;}
  static get  SCALE(){return SCALE;}
  static set  SCALE(val){ SCALE = val;}
  static get  SCREEN_HEIGHT(){return 645;}



  //Sound Resources
  static get  bucketImageResource() {return 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/';}
  static get  bucketSoundResources() {return 'https://piproject.s3.us-east-2.amazonaws.com/Resources/sounds/';}
  static get  bouncingSound() {return this.bucketSoundResources + 'BallBouncing.mp3';}
  static get  rattleSound() {return this.bucketSoundResources + 'rattling_sound.mp3';}
  static get  doorbellSound() {return this.bucketSoundResources + 'doorbell.mp3';}
  static get  ballcatchFailSound() {return this.bucketSoundResources + 'BallCatchFail.mp3';}
  static get  bad3MouseSound() {return this.bucketSoundResources + 'bad_3mouse.mp3';}
  static get  crocSlurpSound() {return this.bucketSoundResources + 'croc_slurp.mp3';}
  static get  crocEatSound() {return this.bucketSoundResources + 'crocodile_eating.mp3';}
  static get  good3MouseSound() {return this.bucketSoundResources + 'good_3mouse.mp3';}
  static get  goodCatchSound() {return this.bucketSoundResources + 'goodcatch.mp3';}
  static get  drumRollSound() {return this.bucketSoundResources + 'drumroll.mp3';}
  static get  yaySound() {return this.bucketSoundResources + 'ChildrenYayShort.mp3';}
  static get  swooshSound() {return this.bucketSoundResources + 'Swoosh.mp3';}
  static get  cheese_ser1Sound() {return this.bucketSoundResources + 'cheese_ser1.mp3';}
  static get  cheese_ser2Sound() {return this.bucketSoundResources + 'cheese_ser2.mp3';}
  static get  cheese_ser3Sound() {return this.bucketSoundResources + 'cheese_ser3.mp3';}
  static get  wrongSound() {return this.bucketSoundResources + 'wrongSound.mp3';}
  static get  failcatchSound(){return this.bucketSoundResources + 'failcatch.mp3';}

  // Brick smasher Sounds

  static get  brickHitsmall(){return this.bucketSoundResources + 'brickhit_small.mp3';}
  static get  brickHitlarge(){return this.bucketSoundResources + 'brickhit_big.mp3';}
  static get  brickHitwall(){return this.bucketSoundResources + 'brickhit_wall_impact.mp3';}



  // Fireworks Sounds

  static get  firework_big(){return this.bucketSoundResources + 'firework_big.mp3';}
  static get  firework_small(){return this.bucketSoundResources + 'firework_small.mp3';}
  static get  firework_hidden(){return this.bucketSoundResources + 'firework_hidden.mp3';}
  static get  firework_whistle(){return this.bucketSoundResources + 'firework_whistle.mp3';}
  static get  fuse(){return this.bucketSoundResources + 'fuse.mp3';}


  // Slime game Sounds

  static get  monsterLaunch(){return this.bucketSoundResources + 'Monster_launch.mp3';}
  static get  monsterSplash(){return this.bucketSoundResources + 'Monster_splash.mp3';}
  static get  monsterGrowl(){return this.bucketSoundResources + 'Monster_growl.mp3';}





  //Image Resources
  static get  treeImage() {return this.bucketImageResource + 'tree_original.png';}
  static get  tree2Image() {return this.bucketImageResource + 'tree2.png';}
  static get  tree3Image() {return this.bucketImageResource + 'tree3.png';}
  static get  crocdoneImage() {return this.bucketImageResource + 'croc_done.png';}
  static get  croctongImage() {return this.bucketImageResource + 'croc_tong.png';}
  static get  crocclosednotongImage() {return this.bucketImageResource + 'croc_closed_notong.png';}
  static get  crocStartImage() {return this.bucketImageResource + 'crocodile_start.png';}
  static get  cheeseMissedImage() {return this.bucketImageResource + 'cheese_missed.jpg';}
  static get  miceImage() {return this.bucketImageResource + 'mice.png';}
  static get  basketStarsImage() {return this.bucketImageResource + 'Stars.png';}
  static get  cheeseImage() {return this.bucketImageResource + 'Slide1.jpg';}
  static get  basketImage() {return this.bucketImageResource + 'netball.png';}
  static get  blueMouseImage() {return this.bucketImageResource + 'mouse-blue.png';}
  static get  redMouseImage() {return this.bucketImageResource + 'mouse-red.png';}
  static get  greenMouseImage() {return this.bucketImageResource + 'mouse-green.png';}


  // Brick smasher Images
  static get paddleImage() {return this.bucketImageResource + 'Paddle1.png';}
  static get wallInitial() {return this.bucketImageResource + 'wall_hor.png';}
  static get wallMissed() {return this.bucketImageResource + 'wall_hor_clip.png';}
  static get basketBalls() {return this.bucketImageResource + 'BasketballsPile2.png';}
  static get basketBall() {return this.bucketImageResource + 'basketball.png';}
  static get tokenImage() {return this.bucketImageResource + 'coin.png';}
  static get smallbricksImage() {return this.bucketImageResource + 'SmallBricksPile.png';}
  static get largebricksImage() {return this.bucketImageResource + 'LargeBricksPile.png';}


  //Space Junk Sounds



  // Fireworks Images


  static get skyline() {return this.bucketImageResource + 'skyline_clipped.png';}
  static get Explosion_big_blue() {return this.bucketImageResource + 'Explosion_big_blue.png';}
  static get Explosion_big_green() {return this.bucketImageResource + 'Explosion_big_green.png';}
  static get Explosion_big_red() {return this.bucketImageResource + 'Explosion_big_red.png';}
  static get Explosion_big() {return this.bucketImageResource + 'Explosion_big.png';}
  static get Explosion_small() {return this.bucketImageResource + 'Explosion_small.png';}
  static get Fireball() {return this.bucketImageResource + 'Fireball.png';}
  static get boxOfFireworks() {return this.bucketImageResource + 'Box_of_fireworks.png';}
  static get star() {return this.bucketImageResource + 'white-star-th.png';}




  //Space Junk Images
  static get robotImage() {return this.bucketImageResource + 'Robot.png';}
  static get obstruction1() {return this.bucketImageResource + 'Obstruction1.png';}
  static get obstruction2() {return this.bucketImageResource + 'Obstruction2.png';}
  static get obstruction3() {return this.bucketImageResource + 'Obstruction3.png';}
  static get gear() {return this.bucketImageResource + 'Gear.png';}
  static get ironBasket() {return this.bucketImageResource + 'Basket_metal.png';}




  //Slime Quest Images

  static get shuttleNarrow() {return this.bucketImageResource + 'Shuttle7_narrow.png';}
  static get shuttleWide() {return this.bucketImageResource + 'Shuttle7_wide.png';}
  static get shuttle() {return this.bucketImageResource + 'Shuttle7.png';}
  static get slimeBall() {return this.bucketImageResource + 'SlimeBall_orange.png';}
  static get splat() {return this.bucketImageResource + 'Splat_orange2.png';}
  static get slimeMonster() {return this.bucketImageResource + 'Monster2_orange.png';}
  static get openWindowGreen() {return this.bucketImageResource + 'Open_window_Green.png';}
  static get openWindowViolet() {return this.bucketImageResource + 'Open_window_Violet.png';}
  static get openWindowYellow() {return this.bucketImageResource + 'Open_window_Yellow.png';}




  //Catch mouse Images
  static get rat() {return this.bucketImageResource + 'Rat.png';}
  static get pizza() {return this.bucketImageResource + 'Pizza.png';}
  static get rectangleCage() {return this.bucketImageResource + 'Rectangle_cage.png';}



  //Colors
  static  get redColor() {return '#ff2d23';}
  static  get grayColor() {return '#808080';}
  static  get blackColor() {return '#020102';}
  static  get yellowColor() {return '#dadd0f';}
  static  get whiteColor() {return '#dde5d7';}
  static  get blueColor() {return '#1931dd';}
  static  get greenColor() {return '#3CB371';}
  static  get scoreColor() {return '#09b4dd';}




  static getArraysum(a) {

    return a.reduce((t, n) => t + n);

  }

  static getArrayMean(a) {

    return Utils.getArraysum(a) / a.length;

  }

  static subtractFromEachElement(a, val) {

    return a.map((v, index) => v - val);

  }

  static arrayProduct(a1, a2) {

    return a1.map((value, index) => value * a2[index]);

  }

  static vectorCalculation(a) {

    return Utils.subtractFromEachElement(a, Utils.getArrayMean(a));

  }

  /**
   * Calculates paddle velocity from past n values in paddle vector of y coordinates
   * @method getPaddleVelocity
   * @param time {int} timestamp in Unixtime of paddle position
   * @param position {Object} {position: {x: number, y: number}, dimensions: {width: number, height: number}}
   * @return {number}  sum((time-mean(time)).*(position-mean(position)))/sum((time-mean(time)).*(time-mean(time)))
   */
  static getPaddleVelocity(time, position) {

    let timeVector = this.vectorCalculation(time.slice(time.length - 15, time.length));
    let positionVector = this.vectorCalculation(position.slice(position.length - 15, position.length));

    return Utils.getArraysum(Utils.arrayProduct(timeVector, positionVector)) / Utils.getArraysum(Utils.arrayProduct(timeVector, timeVector));
  }


  /**
   * Fisher-Yates shuffle for uniform distribution
   * @method shuffle
   * @param {array} initial array
   * @return {array} shuffled array
   */
  static shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }


}
