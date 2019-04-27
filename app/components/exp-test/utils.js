/*
 * Developed by Gleb Iakovlev on 4/6/19 11:11 AM.
 * Last modified 4/6/19 11:11 AM.
 * Copyright (c) Cognoteq Software Solutions 2019.
 * All rights reserved
 */

/**
 * Utility class for project static methods and constants
 */


export default class Utils{

    static get  frameRate() {  return  1/100; } // Seconds
    static get  frameDelay() { return  this.frameRate * 1000; } // ms
    static get  paddleSpeed() {return 4;}
    static get  ballMass() {return 0.1;}
    static get  restitution() {return -1.2;}
    static get  gameRounds() {return 30;}
    static get  gravityFactor() {return 1;}



    //Sound Resources
    static get  bucketImageResource(){return "https://s3.us-east-2.amazonaws.com/piproject/Resources/images/";}
    static get  bucketSoundResources(){return "https://s3.us-east-2.amazonaws.com/piproject/Resources/sounds/";}
    static get  bouncingSound(){return this.bucketSoundResources+"BallBouncing.mp3";}
    static get  rattleSound(){return this.bucketSoundResources+"rattling_sound.mp3";}
    static get  doorbellSound(){return this.bucketSoundResources+"doorbell.mp3";}
    static get  ballcatchFailSound(){return this.bucketSoundResources+"BallCatchFail.mp3";}
    static get  bad3MouseSound(){return this.bucketSoundResources+"bad_3mouse.mp3";}
    static get  crocSlurpSound(){return this.bucketSoundResources+"croc_slurp.mp3";}
    static get  good3MouseSound(){return this.bucketSoundResources+"good_3mouse.mp3";}
    static get  goodCatchSound(){return this.bucketSoundResources+"goodcatch.mp3";}


    //Image Resources
    static get  treeImage(){return this.bucketImageResource+"tree.png";}
    static get  crocdoneImage(){return this.bucketImageResource+"croc_done.png";}
    static get  crocStartImage(){return this.bucketImageResource+"crocodile_start.png";}
    static get  cheeseMissedImage(){return this.bucketImageResource+"cheese_missed.jpg";}
    static get  miceImage(){return this.bucketImageResource+"mice.png";}
    static get  basketStarsImage(){return this.bucketImageResource+"Stars.png";}
    static get  cheeseImage(){return this.bucketImageResource+"Slide1.jpg";}
    static get  basketImage(){return this.bucketImageResource+"netball.png";}
    static get  blueMouseImage(){return this.bucketImageResource+"mouse-blue.png";}
    static get  redMouseImage(){return this.bucketImageResource+"mouse-red.png";}
    static get  greenMouseImage(){return this.bucketImageResource+"mouse-green.png";}

    //Colors
    static  get redColor() {return "#ff2d23";}
    static  get grayColor() {return "#8f909c";}
    static  get blackColor() {return "#020102";}
    static  get yellowColor() {return "#dadd0f";}
    static  get whiteColor() {return "#dde5d7";}
    static  get blueColor() {return "#1931dd";}
    static  get scoreColor() {return "#09b4dd";}
}
