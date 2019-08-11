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

        let game = {};

        switch (gameNumber) {

        case 0:

            game =   new FeedCroc(context, document);

        break;

        case 1:

            context.no_trees = true;
            game = new CatchCheese(context, document);

        break;

        case 2:

            game = new CatchCheese(context, document);

        break;

        case 3:

            game = new CatchMouse(context, document);

        break;

        case 4:

            game =   new FeedMice(context, document);

        break;

        case 5:

            game =  new FeedMouse(context, document);

        break;

        default:
            game =  new FeedCroc(context, document);
        break;

    }

        game.init();

    }

}
