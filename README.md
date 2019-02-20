# Ember-lookit-frameplayer

This is a small Ember application that allows both researchers to preview an experiment and users to
participate in an experiment. This is meant to be used in conjunction with the [Lookit API Django project](https://github.com/lookit/lookit-api), which contains the Experimenter and Lookit applications.
The Django applications will proxy to these Ember routes for previewing/participating in an experiment.
The Ember routes will fetch the appropriate models and then pass them to the exp-player component in [exp-addons](https://github.com/lookit/exp-addons).

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation

Before beginning, you will need to install Yarn, a package manager (like npm).

```bash
 git clone https://github.com/lookit/ember-lookit-frameplayer.git
 cd ember-lookit-frameplayer
 git submodule init
 git submodule update
 yarn install --pure-lockfile
 bower install

 cd lib/exp-player
 yarn install --pure-lockfile
 bower install
```

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Updating docs
Documentation of components is generated using YUIDoc:
 ```
 $ cd exp-player
 $ yarn run docs
 ```
 
At the moment, this is a manual process: whatever 
 files are in the top level `/docs/` folder of the master branch will be served via GitHub pages.
      

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
