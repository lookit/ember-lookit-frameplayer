import resolver from './helpers/resolver';
import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import {
  setResolver
} from 'ember-qunit';

setResolver(resolver);

setApplication(Application.create(config.APP));

start();
