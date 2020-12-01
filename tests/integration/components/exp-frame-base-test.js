import Ember from 'ember';
import DS from 'ember-data';
import {moduleForComponent, test} from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

const BasicTemplate = hbs`<button id="save-frame" {{action 'saveHandler'}}>Save</button>
  <button id="go-next" {{action 'next'}}>Next</button>`;

moduleForComponent('exp-frame-base', 'Integration | Component | exp frame base', {
    integration: true,

    beforeEach() {
        // Define a fake service so that we can monitor whether specific methods were called
        const errorSpy = sinon.spy();
        const toastStub = Ember.Service.extend({
            error: errorSpy
        });

        this.register('service:toast', toastStub);
        // Give the base frame a temporary template, so that we can trigger specific actions as desired
        //  Refs: http://toranbillups.com/blog/archive/2016/04/17/integration-testing-dynamic-templates-and-the-component-helper/
        this.register('template:components/exp-frame-base', BasicTemplate);

        this.errorSpy = errorSpy;
    }
});

test('it shows an error and does not advance when it encounters an adapter 400 error', function (assert) {
    assert.expect(3);

    const nextAction = sinon.spy();
    const saveHandler = sinon.spy(() => Ember.RSVP.reject(new DS.InvalidError()));

    this.on('nextAction', nextAction);
    this.on('saveFrame', saveHandler);

    this.render(
        hbs`{{exp-frame-base
                next=(action 'nextAction')
                saveHandler=(action 'saveFrame')
            }}`);

    // Logic: click next button to trigger the internal next action. Since save fails, the passed-in next action
    //  won't propagate up.
    this.$('#go-next').click();
    assert.ok(saveHandler.calledOnce, 'Clicking next button should attempt to save the frame');
    assert.ok(nextAction.calledOnce, 'When save fails, the passed-in next action is still called');
    assert.ok(this.errorSpy.calledOnce, 'When save fails, a message should be presented to the user');
});

test('Moves to the next frame when save is successful', function (assert) {
    assert.expect(3);

    const nextAction = sinon.spy();
    const saveHandler = sinon.spy(() => Ember.RSVP.resolve());

    this.on('nextAction', nextAction);
    this.on('saveFrame', saveHandler);

    this.render(
        hbs`{{exp-frame-base
                next=(action 'nextAction')
                saveHandler=(action 'saveFrame')
            }}`);

    // Logic: click next button to trigger the internal next action. Save succeeds, so the passed-in next action fires
    this.$('#go-next').click();
    assert.ok(saveHandler.calledOnce, 'Clicking next button should attempt to save the frame');
    assert.ok(nextAction.calledOnce, 'When save succeeds, the passed-in next action should be called');
    assert.notOk(this.errorSpy.calledOnce, 'Because save succeeds, the user should not see any error messages');
});
