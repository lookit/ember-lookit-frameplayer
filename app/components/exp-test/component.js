/*
 * Developed by Gleb Iakovlev on 3/31/19 8:15 PM.
 * Last modified 3/31/19 7:58 PM.
 * Copyright (c) 2019 . All rights reserved.
 */

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';
import layout from './template';
import FeedCroc from './feedCroc';
import catchMouse from './catchMouse';
import feedMouse from "./feedMouse";
import feedMice from "./feedMice";
import catchCheese from "./catchCheese";
import FullScreen from "../../mixins/full-screen";

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * Main template implementation for games
 * TODO: parameters TBD
 *
```json
 "frames": {
    "test-trial": {
        "kind": "exp-your-frame-name",
        "id": "test-trial"
    }
 }

 * ```
 * @class ExpYourFrameName TODO: change to your actual frame name
 * @extends ExpFrameBase
 * @uses FullScreen TODO: add any mixins that your frame uses like this
 */





export default ExpFrameBaseComponent.extend(FullScreen,{

    type: 'exp-test',
    displayFullscreen: false,
    fullScreenElementId: 'experiment-player',
    layout: layout,
    meta: {
        name: 'ExpTest',
        description: 'TODO: a description of this frame goes here.',
        parameters: {
            type: 'object',
            properties: {
                // define configurable parameters of your frame here. Each should have
                // a YUIdoc comment as shown in the example below.

                /**
                 * Whether to show a picture of a cat.
                 *
                 * @property {Boolean} showCatPicture
                 * @default false
                 */
                title: {
                    type: 'string',
                    default: 'Consent',
                    description: 'Simple consent test form '
                },

                body: {

                    type: 'string',
                    default: 'Do you consent for study ?'

                },


                    export_arr:{
                      type:'array',
                      default:[],
                      items:{
                        type: 'object',
                        properties: {

                          ball_object: {
                            type: 'object',
                            properties: {
                              x:{
                                type: 'string'
                              },
                              y:{

                                type: 'string'
                              }
                            }

                          },
                          paddle_object:{
                            type: 'object',
                            properties:{
                              x:{
                                type: 'string'
                              },
                              y:{

                                type: 'string'
                              }
                            }


                          },
                          timestamp:{
                            type: 'string'

                          }

                        }

                      }



                    },


                consentLabel: {

                    type: 'string',
                    default: 'I agree'
                }
            }
        },
        data: {
            /**
            * Parameters captured and sent to the server
            *
            * @method serializeContent
            * @param {String} exampleStoredData Some data about this frame
            */
            type: 'object',
            properties: {
                // define data to be sent to the server here
              export_arr:{
                type:'array',
                default:[],
                items:{
                  type: 'object',
                  properties: {

                    ball_object: {
                      type: 'object',
                      properties: {
                        x:{
                          type: 'string'
                        },
                        y:{

                          type: 'string'
                        }
                      }

                    },
                    paddle_object:{
                      type: 'object',
                      properties:{
                        x:{
                          type: 'string'
                        },
                        y:{

                          type: 'string'
                        }
                      }


                    },
                    timestamp:{
                      type: 'string'

                    }

                  }

                }



              }
            }
        }
    },
    actions: {

        play() {
            this.set('export_arr', Ember.A());

            if(this.title === 'Feed the croc') {

                new FeedCroc(this, document).init();
            }

            if(this.title === 'Feed the mouse in the house') {

                new feedMouse(this,document).init();
            }

            if(this.title === 'Feed mice in the house') {

                new feedMice(this, document).init();
            }


            if(this.title === 'Catch the cheese') {

                new catchCheese(this, document).init();
            }

            if(this.title === 'Catch the mouse') {

                new catchMouse(this, document).init();
            }



        },
      export(){

       //   this.jsonToCSVConvertor(this.export_arr,"Data",true);

      }
        // Define any actions that you need to be able to trigger from within the template here
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
    },




   jsonToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
      //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
        var arrData = typeof JSONData !== 'object' ? JSON.parse(JSONData) : JSONData;

        var CSV = '';
        //Set Report title in first row or line

        CSV += ReportTitle + '\r\n\n';

        //This condition will generate the Label/Header
        if (ShowLabel) {
          var row = "";

          //This loop will extract the label from 1st index of on array
          for (var index in arrData[0]) {

            //Now convert each value to string and comma-seprated
            row += index + ',';
          }

          row = row.slice(0, -1);

          //append Label row with line break
          CSV += row + '\r\n';
        }

        //1st loop is to extract each row
        for (var i = 0; i < arrData.length; i++) {
          var row = "";

          //2nd loop will extract each column and convert it in string comma-seprated
          for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
          }

          row.slice(0, row.length - 1);

          //add a line break after each row
          CSV += row + '\r\n';
        }

        if (CSV == '') {
          alert("Invalid data");
          return;
        }

        //Generate a file name
        var fileName = "Report_";
        //this will remove the blank-spaces from the title and replace it with an underscore
        fileName += ReportTitle.replace(/ /g,"_");

        //Initialize file format you want csv or xls
        var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

        // Now the little tricky part.
        // you can use either>> window.open(uri);
        // but this will not work in some browsers
        // or you will not get the correct file extension

        //this trick will generate a temp <a /> tag
        var link = document.createElement("a");
        link.href = uri;

        //set the visibility hidden so it will not effect on your web-layout
        link.style = "visibility:hidden";
        link.download = fileName + ".csv";

        //this part will append the anchor tag and remove it after automatic click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
}






});
