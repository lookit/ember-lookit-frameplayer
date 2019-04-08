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

    static get  frameRate(){  return  1/200; } // Seconds
    static get  frameDelay() { return  this.frameRate * 1000; } // ms

}