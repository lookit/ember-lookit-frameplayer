/*
* Developed by Gleb Iakovlev on 4/18/19 11:24 PM.
* Last modified 4/18/19 11:24 PM.
* Copyright (c) Cognoteq Software Solutions 2019.
* All rights reserved
*/

/**
 *
 * @submodule games
 *
 */
import FeedCroc from './feedCroc';
import CatchMouse from './catchMouse';
import FeedMouse from './feedMouse';
import FeedMice from './feedMice';
import CatchCheese from './catchCheese';

/**
 * Game orchestrator to set initial parameters and
 * execute requested game
 * Might have randomization of the games here
 * @class Game
 */
export default class Game {
    /**
     * @method constructor
     * @constructor Game
     * @param context
     * @param document
     * @param gameNumber current game id
     */
    constructor(context, document, gameNumber) {

        switch (gameNumber) {

        case 0:

            new FeedCroc(context, document).init();

        break;

        case 1:

            new CatchCheese(context, document).init();

        break;

        case 2:

            new CatchMouse(context, document).init();

        break;

        case 3:

            new FeedMice(context, document).init();

        break;

        case 4:

            new FeedMouse(context, document).init();

        break;

        default:
            new FeedCroc(context, document).init();
        break;

    }

    }

}
