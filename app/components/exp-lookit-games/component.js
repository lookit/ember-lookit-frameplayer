/*
 * Developed by Gleb Iakovlev on 3/31/19 8:15 PM.
 * Last modified 3/31/19 7:58 PM.
 * Copyright (c) 2019 . All rights reserved.
 */
import ExpFrameBaseComponent from '../../components/exp-frame-base/component';
import layout from './template';
import FullScreen from '../../mixins/full-screen';
import VideoRecord from '../../mixins/video-record';
import Game from './Game';
/**
 * @module exp-lookit-games
 * @submodule frames
 */

/**
 * Frame to implement various games interventions.
 * The games are developed as a separate HTML5 canvas modules.
 *
 * After each game, get the response that game is finished, save the data (pass the data to
 * the appropriate game object array) and proceed to the next game/step.
 *
 * Current implementation has 5 game types :
 * - 0: Feed the crocodile
 * - 1: Catch the cheese
 * - 2: Catch the mouse
 * - 3: Feed the mice
 * - 4: Feed the mouse in the house
 *
 *
 ```
 "frames": {
        "game": {
            "kind": "exp-lookit-games",
            "gameType": 0,
            "gameDescription": "Feed the Crocodile Game",
            "instructions" : "Use mouse to move paddle up and down",
            "showInstructions": true
        }
    }
 ```
 * @class ExpFrameGamesComponent
 * @extends FullScreen
 * @extends VideoRecord
 */

export default ExpFrameBaseComponent.extend(FullScreen, VideoRecord, {

    type: 'exp-lookit-games',
    displayFullscreen: false,
    currentGame: null,
    layout: layout,
    meta: {
        name: 'ExpLookitGames',
        description: 'This frame allows the participant to play a game intended for studies.',
        parameters: {
            type: 'object',
            properties: {


                /**
                 * Set current game type
                 *
                 * @property {integer} type
                 * @default 0
                 */
                gameType: {
                    type: 'integer',
                    default: 0,
                    description: 'Game type  to display '
                },

                /**
                 * Text to display for game instructions
                 *
                 * @property {String} nextButtonText
                 * @default 'Next'
                 */
                instructions: {
                    type: 'string',
                    default: ''
                },

                /**
                 * Text to display for game description
                 *
                 * @property {String} nextButtonText
                 * @default 'Next'
                 */
                gameDescription: {
                    type: 'string',
                    default: ''
                },
                /**
                 * Whether to show the instructions for the Game
                 *
                 * @property {Boolean} showInstructions
                 * @default true
                 */
                showInstructions: {
                    type: 'boolean',
                    default: true
                }
            }
        },
        data: {
            /**
             * Parameters captured game data and sent to the server
             * This might be changed in near future for some game type
             * @method serializeContent
             * @param {Array} export_arr Game data array with objects positions locations
             * @param {Object} items The name of the current game object : ball_object {x,y }, paddle_object{x,y}
             * @param {Object}  ball_object items The name of the current game object
             * @param {String} timestamp current timestamp in milliseconds for each x,y point of object
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
                // define data to be sent to the server here
                export_arr: {
                    type: 'array',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {

                            ball_object: {
                                type: 'object',
                                properties: {
                                    x: {
                                        type: 'string'
                                    },
                                    y: {

                                        type: 'string'
                                    }
                                }

                            },
                            paddle_object: {
                                type: 'object',
                                properties: {
                                    x: {
                                        type: 'string'
                                    },
                                    y: {

                                        type: 'string'
                                    }
                                }

                            },
                            timestamp: {
                                type: 'string'

                            }

                        }

                    }

                }
            }
        }
    },
    actions: {
        // Define any actions that you need to be able to trigger from within the template here

        play() {
            this.set('showInstructions', false);
            new Game(this, document, this.gameType);
        }

    },

    // Other functions that are just called from within your frame can be defined here, on
    // the same level as actions and meta. You'll be able to call them as this.functionName(arguments)
    // rather than using this.send('actionName')

    // Anything that should happen immediately after loading your frame (see
    // https://guides.emberjs.com/release/components/the-component-lifecycle/ for other
    // hooks you can use and when they're all called). You can delete this if not doing
    // anything additional.
    didInsertElement() {

        this._super(...arguments);

    },

    // Anything that should happen before destroying your frame, e.g. removing a keypress
    // handlers. You can delete this if not doing anything additional.
    willDestroyElement() {
        this._super(...arguments);
    }

});
