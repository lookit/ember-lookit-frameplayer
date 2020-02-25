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
let {
  $
} = Ember;


/**
 * Frame to implement various games interventions.
 * The games are developed as a separate HTML5 canvas modules.
 *
 * Current implementation of template has 3 scenarios to display :
 * - Intro page (shows the initial game image with door button)
 * - Progress page (shows the progress page with slot machines with dynamic button )
 * - Game instructions page (shows the game instructions set as template parameters)
 *
 * After each game, get the response that game is finished, save the data (pass the data to
 * the appropriate game object array) and proceed to the next game/step.
 *
 * Current implementation has 5 game types :
 * - 0: Light the night sky
 * - 1: Monster slime
 * - 2: Catch the rat
 * - 3: Space mechanic
 * - 4: Brake the wall
 *
 *
 ```
 "frames": {

        "intro": {
            "kind": "exp-lookit-games",
            "source": "https://piproject.s3.us-east-2.amazonaws.com/Resources/images/intro.png",
            "instructions": "You come across an abandoned arcade and you decide to enter. ",
            "showInstructions": true
        },

        "map": {
            "kind": "exp-lookit-games",
            "instructions": "Click on the START button to play the first game.",
            "showProgress": true,
            "gameType": 0,
            "sourceButton": "https://piproject.s3.us-east-2.amazonaws.com/Resources/images/start_button.png"
        },
        "game": {
            "kind": "exp-lookit-games",
            "playGame": true,
            "gameType": 1,
            "trialType" : "demo",
            "trialsNumber": 24
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
  doUseCamera: false,
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
         * Check if media is playing
         * @property {boolean} type
         * @default true
         */
        isPlaying: {
          type: 'boolean',
          default: true
        },
        /**
         * Show canvas with game
         * @property {boolean} type
         * @default false
         */
        playGame: {
          type: 'boolean',
          default: false

        },
        /**
         * List of possible heights for demo trial
         * @property {array}  demoTrajectories
         * @default []
         */
        demoTrajectories: {
          type: 'array',
          description: 'list of possible heights for demo trial',
          default: [],
          items: {
            type: 'number'
          }
        },
        /**
         * List of possible obstructions for demo trial
         * @property {array}  demoObstructions
         * @default []
         */
        demoObstructions: {
          type: 'array',
          description: 'list of possible obstructions for demo trial',
          default: [],
          items: {
            type: 'number'
          }
        },


        /**
         * Text to display for game instructions
         *
         * @property {String} instructions
         * @default 'empty'
         */
        instructions: {
          type: 'string',
          default: ''
        },

        /**
         *  Maximum number of trials per game
         * @property {integer} type
         * @default 0
         */
        trialsNumber: {
          type: 'integer',
          default: 24,
          description: 'Maximum number of trials per game '

        },

        /**
         * Current trial type : demo or intervention
         * @property {String} trialType
         * @default 'intervention'
         */
        trialType: {
          type: 'string',
          default: 'intervention',
          description: 'Current trial type : demo or intervention '
        },

        /**
         * Text to display for game description
         *
         * @property {String} gameDescription
         * @default 'empty'
         */
        gameDescription: {
          type: 'string',
          default: ''
        },
        /**
         * Whether to show the instructions for the Game
         *
         * @property {Boolean} showInstructions
         * @default false
         */
        showInstructions: {
          type: 'boolean',
          default: false
        },

        /**
         * Whether to show the video for the Game instructions
         *
         * @property {Boolean} showVideo
         * @default false
         */
        showVideo:{
          type: 'boolean',
          default: false

        },
        /**
         * Whether to show in full screen
         *
         * @property {Boolean} fullscreen
         * @default false
         */
        fullscreen: {
          type: 'boolean',
          default: false

        },

        /**
         * Resource root location
         * @property {String} source
         * @default 'empty'
         *
         */
        baseDir: {
          type: 'string',
          default: ''

        },

        /**
         * Media resource location (image, sound,video)
         * @property {String} source
         * @default 'empty'
         *
         */
        source: {
          type: 'string',
          default: ''

        },
        /**
         * Media resource location for button
         * @property {String} sourceButton
         * @default 'empty'
         */
        sourceButton: {
          type: 'string',
          default: ''

        },

        /**
         * Whether to show the progress page
         *
         * @property {Boolean} showInstructions
         * @default false
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

        mediaSource: {
          type: 'object',
          properties: {
            src: {
              type: 'string'
            },
            type: {
              type: 'string'
            }
          }
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
    mediaPlayed(e) {
      this.set('isPlaying', false);
    },
    checkAudioThenNext() {
      if(this.get('isPlaying') === false){
        this.send('next');
      }
    },
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

    this.set('isPlaying', true);
    if(this.get('fullscreen') === true){
      this.send('showFullscreen');
    }
    if (this.get('playGame') === true) {

      this.send('play');
    }
    if (this.get('showProgress') === true) {
      let current_game = this.get('gameType') + 1;
      let baseDir = this.get('baseDir');
      switch (current_game){
        case 1:
          this.set('buttonPosition','button button-1');
          this.set('machine1_url', baseDir + '/Resources/images/arcade_machine1.png');
          this.set('machine2_url', baseDir + '/Resources/images/arcade_machine2_off.png');
          this.set('machine3_url', baseDir + '/Resources/images/arcade_machine3_off.png');
          this.set('machine4_url', baseDir + '/Resources/images/arcade_machine4_off.png');
          this.set('machine5_url',baseDir +  '/Resources/images/arcade_machine5_off.png');
          this.set('arrow1_url',baseDir +  '/Resources/images/arrow1_off.png');
          this.set('arrow2_url',baseDir + '/Resources/images/arrow2_off.png');
          this.set('arrow3_url', baseDir + '/Resources/images/arrow3_off.png');
          this.set('arrow4_url', baseDir + '/Resources/images/arrow4_off.png');
          this.set('arrow5_url',baseDir +  '/Resources/images/arrow5_off.png');
          this.set('exit_url', baseDir + '/Resources/images/exit_off.png');
          break;
        case 2:
          this.set('buttonPosition','button button-2');
          this.set('machine1_url', baseDir + '/Resources/images/arcade_machine1.png');
          this.set('machine2_url', baseDir + '/Resources/images/arcade_machine2.png');
          this.set('machine3_url', baseDir + '/Resources/images/arcade_machine3_off.png');
          this.set('machine4_url', baseDir + '/Resources/images/arcade_machine4_off.png');
          this.set('machine5_url', baseDir + '/Resources/images/arcade_machine5_off.png');
          this.set('arrow1_url', baseDir + '/Resources/images/arrow1_on.png');
          this.set('arrow2_url', baseDir + '/Resources/images/arrow2_off.png');
          this.set('arrow3_url', baseDir + '/Resources/images/arrow3_off.png');
          this.set('arrow4_url', baseDir + '/Resources/images/arrow4_off.png');
          this.set('arrow5_url', baseDir + '/Resources/images/arrow5_off.png');
          this.set('exit_url', baseDir + '/Resources/images/exit_off.png');
          break;

        case 3:
          this.set('buttonPosition','button button-3');
          this.set('machine1_url', baseDir + '/Resources/images/arcade_machine1.png');
          this.set('machine2_url', baseDir + '/Resources/images/arcade_machine2.png');
          this.set('machine3_url', baseDir + '/Resources/images/arcade_machine3.png');
          this.set('machine4_url', baseDir + '/Resources/images/arcade_machine4_off.png');
          this.set('machine5_url', baseDir + '/Resources/images/arcade_machine5_off.png');
          this.set('arrow1_url', baseDir + '/Resources/images/arrow1_on.png');
          this.set('arrow2_url', baseDir + '/Resources/images/arrow2_on.png');
          this.set('arrow3_url', baseDir + '/Resources/images/arrow3_off.png');
          this.set('arrow4_url', baseDir + '/Resources/images/arrow4_off.png');
          this.set('arrow5_url', baseDir + '/Resources/images/arrow5_off.png');
          this.set('exit_url', baseDir + '/Resources/images/exit_off.png');
          break;

        case 4:
          this.set('buttonPosition','button button-4');
          this.set('machine1_url', baseDir + '/Resources/images/arcade_machine1.png');
          this.set('machine2_url', baseDir + '/Resources/images/arcade_machine2.png');
          this.set('machine3_url', baseDir + '/Resources/images/arcade_machine3.png');
          this.set('machine4_url', baseDir + '/Resources/images/arcade_machine4.png');
          this.set('machine5_url', baseDir + '/Resources/images/arcade_machine5_off.png');
          this.set('arrow1_url', baseDir + '/Resources/images/arrow1_on.png');
          this.set('arrow2_url', baseDir + '/Resources/images/arrow2_on.png');
          this.set('arrow3_url', baseDir + '/Resources/images/arrow3_on.png');
          this.set('arrow4_url', baseDir + '/Resources/images/arrow4_off.png');
          this.set('arrow5_url', baseDir + '/Resources/images/arrow5_off.png');
          this.set('exit_url', baseDir + '/Resources/images/exit_off.png');
          break;

        case 5:
          this.set('buttonPosition','button button-5');
          this.set('machine1_url', baseDir + '/Resources/images/arcade_machine1.png');
          this.set('machine2_url', baseDir + '/Resources/images/arcade_machine2.png');
          this.set('machine3_url', baseDir + '/Resources/images/arcade_machine3.png');
          this.set('machine4_url', baseDir + '/Resources/images/arcade_machine4.png');
          this.set('machine5_url', baseDir + '/Resources/images/arcade_machine5.png');
          this.set('arrow1_url', baseDir + '/Resources/images/arrow1_on.png');
          this.set('arrow2_url', baseDir + '/Resources/images/arrow2_on.png');
          this.set('arrow3_url', baseDir + '/Resources/images/arrow3_on.png');
          this.set('arrow4_url', baseDir + '/Resources/images/arrow4_on.png');
          this.set('arrow5_url', baseDir + '/Resources/images/arrow5_off.png');
          this.set('exit_url', baseDir + '/Resources/images/exit_off.png');
          break;

        case 6:
          this.set('button_position','button button-6');
          this.set('machine1_url', baseDir + '/Resources/images/arcade_machine1.png');
          this.set('machine2_url', baseDir + '/Resources/images/arcade_machine2.png');
          this.set('machine3_url', baseDir + '/Resources/images/arcade_machine3.png');
          this.set('machine4_url', baseDir + '/Resources/images/arcade_machine4.png');
          this.set('machine5_url', baseDir + '/Resources/images/arcade_machine5.png');
          this.set('arrow1_url', baseDir + '/Resources/images/arrow1_on.png');
          this.set('arrow2_url', baseDir + '/Resources/images/arrow2_on.png');
          this.set('arrow3_url', baseDir + '/Resources/images/arrow3_on.png');
          this.set('arrow4_url', baseDir + '/Resources/images/arrow4_on.png');
          this.set('arrow5_url', baseDir + '/Resources/images/arrow5_on.png');
          this.set('exit_url', baseDir + '/Resources/images/exit_on.png');
          break;
        default:
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
