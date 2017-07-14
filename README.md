# Ember-frame-player

This is a small Ember application that allows you to preview/participate in an experiment. The routes fetch the appropriate models and then pass them to the exp-player component in [exp-addons](https://github.com/CenterForOpenScience/exp-addons).  It is a scaled-down version of [Lookit](https://github.com/CenterForOpenScience/lookit).  Lookit is also using the exp-models addon that is housed in exp-addons, but we are not using those models here.  Contains updated models to correspond with the new [Lookit api] (https://github.com/CenterForOpenScience/lookit-api).

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation

* `git clone <repository-url>` this repository
* `cd ember-frame-player`
* `npm install`
* `bower install`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
