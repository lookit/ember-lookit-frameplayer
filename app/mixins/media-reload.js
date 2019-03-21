import Ember from 'ember';

/**
 * @module exp-player
 * @submodule mixins
 */

/**
 * Allow any media-containing frame to correctly reset.
 * Fix LEI-93, an issue where the second of two consecutive videos did not play correctly.

 * Due to an internal ember quirk/optimization, the component instance is not destroyed if two of the same thing are
 *  used in a row, which means the same video tag was being dynamically reassigned- something HTML does not normally
 * allow. The page needs to be manually told to load the correct new video.
 *
 * See commentary here: http://stackoverflow.com/a/18454389/1422268
 *
 * @class MediaReload
 */
export default Ember.Mixin.create({
    mediaTags: ['audio', 'video'],

    didRender() {
        this._super(...arguments);
        for (var selector of this.get('mediaTags')) {
            Ember.$(selector).each(function () {
                this.pause();
                this.load();
            });
        }
    }
});
