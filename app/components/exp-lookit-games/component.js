/*
 * Developed by Gleb Iakovlev on 3/31/19 8:15 PM.
 * Last modified 3/31/19 7:58 PM.
 * Copyright (c) 2019 . All rights reserved.
 */
import ExpFrameBaseComponent from '../../components/exp-frame-base/component';
import layout from './template';
import FullScreen from '../../mixins/full-screen';
import VideoRecord from '../../mixins/video-record';
import Ember from 'ember';
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
    doUseCamera: true,
    currentGame: null,
    layout: layout,
    meta: {
        name: 'ExpLookitGames',
        description: 'This frame allows the participant to play a game intended for studies.',
        parameters: {
            type: 'object',
            properties: {
                scale_factor: {
                    default: 405,
                    type: 'number'
                },
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
                    default: false
                },

                /**
                 * Media resource location (image, sound,video)
                 */
                source: {
                    type: 'string',
                    default: ''

                  },
                /**
                 * Media resource location for button
                 */
                source_button: {
                  type: 'string',
                  default: ''

                },

                /**
                 * Whether to show the progress page
                 *
                 * @property {Boolean} showInstructions
                 * @default true
                 */
                showProgress: {
                    type: 'boolean',
                    default: false
                },

                /**
                 * Whether to show the intro page
                 *
                 * @property {Boolean} showInstructions
                 * @default true
                 */
                showIntro: {
                    type: 'boolean',
                    default: false
                },

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

                videoId: {
                    type: 'string'
                },
                videoList: {
                    type: 'list'
                },

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
            this.send('showFullscreen');
            this.set('showInstructions', false);
            this.set('showProgress', false);
            this.set('showIntro', false);
            this.set('export_arr', Ember.A());
            this.startRecorder();
            this.hideRecorder();
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
        if (this.get('showProgress') === true) {
            let current_game = this.get('gameType') + 1;
            switch (current_game){
              case 1:
                  this.set('button_position','button button-1');
                  this.set('machine1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine1.png');
                  this.set('machine2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine2_off.png');
                  this.set('machine3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine3_off.png');
                  this.set('machine4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine4_off.png');
                  this.set('machine5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine5_off.png');
                  this.set('arrow1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow1_on.png');
                  this.set('arrow2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow2_off.png');
                  this.set('arrow3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow3_off.png');
                  this.set('arrow4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow4_off.png');
                  this.set('arrow5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow5_off.png');
                  this.set('exit_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/exit_off.png');
                  break;
              case 2:
                  this.set('button_position','button button-2');
                  this.set('machine1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine1.png');
                  this.set('machine2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine2.png');
                  this.set('machine3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine3_off.png');
                  this.set('machine4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine4_off.png');
                  this.set('machine5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine5_off.png');
                  this.set('arrow1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow1_on.png');
                  this.set('arrow2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow2_on.png');
                  this.set('arrow3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow3_off.png');
                  this.set('arrow4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow4_off.png');
                  this.set('arrow5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow5_off.png');
                  this.set('exit_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/exit_off.png');
                  break;

              case 3:
                  this.set('button_position','button button-3');
                  this.set('machine1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine1.png');
                  this.set('machine2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine2.png');
                  this.set('machine3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine3.png');
                  this.set('machine4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine4_off.png');
                  this.set('machine5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine5_off.png');
                  this.set('arrow1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow1_on.png');
                  this.set('arrow2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow2_on.png');
                  this.set('arrow3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow3_on.png');
                  this.set('arrow4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow4_off.png');
                  this.set('arrow5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow5_off.png');
                  this.set('exit_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/exit_off.png');
                  break;

              case 4:
                  this.set('button_position','button button-4');
                  this.set('machine1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine1.png');
                  this.set('machine2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine2.png');
                  this.set('machine3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine3.png');
                  this.set('machine4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine4.png');
                  this.set('machine5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine5_off.png');
                  this.set('arrow1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow1_on.png');
                  this.set('arrow2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow2_on.png');
                  this.set('arrow3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow3_on.png');
                  this.set('arrow4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow4_on.png');
                  this.set('arrow5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow5_off.png');
                  this.set('exit_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/exit_off.png');
                  break;

              case 5:
                  this.set('button_position','button button-5');
                  this.set('machine1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine1.png');
                  this.set('machine2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine2.png');
                  this.set('machine3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine3.png');
                  this.set('machine4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine4.png');
                  this.set('machine5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine5.png');
                  this.set('arrow1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow1_on.png');
                  this.set('arrow2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow2_on.png');
                  this.set('arrow3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow3_on.png');
                  this.set('arrow4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow4_on.png');
                  this.set('arrow5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow5_on.png');
                  this.set('exit_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/exit_on.png');
                  break;
        }
        }

    },


    // Anything that should happen before destroying your frame, e.g. removing a keypress
    // handlers. You can delete this if not doing anything additional.
    willDestroyElement() {
        this._super(...arguments);
    }
});
