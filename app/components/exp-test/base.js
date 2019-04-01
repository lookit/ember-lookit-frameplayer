/*
 * Developed by Gleb Iakovlev on 3/31/19 8:15 PM.
 * Last modified 3/31/19 8:11 PM.
 * Copyright (c) 2019 . All rights reserved.
 */

/**
 * Initial base class for common game functions
 */
export default  class Base {

    constructor(context, document) {
        this.context = context;
        this.document = document;
        this.canvas = this.document.getElementById('myCanvas');
        this.ctx = this.canvas.getContext('2d');
    }

}
