.. _exp-lookit-exit-survey:

exp-lookit-exit-survey
==============================================

Overview
------------------

Standard exit survey for Lookit studies. On the first screen, the parent confirms participant birthdate, provides
video sharing permission level & Databrary sharing selection, has an option to withdraw video, and can give freeform
comments. On the second screen your custom debriefing text is shown.

What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-exit-survey.png
    :alt: Example screenshot from exp-lookit-video frame

Recording
~~~~~~~~~~

There is no recording on this frame unless you set up a session-level recording.

Display
~~~~~~~~~~

By default, this frame is not shown fullscreen.

More general functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Below is information specific to this particular frame. There may also be available parameters, events recorded,
and data collected that come from the following more general sources:

- the :ref:`base frame<base frame>` (things all frames do)

Example
----------------

This frame will display the exit survey and a debriefing page about the Lookit physics study.

.. code:: javascript

    "my-exit-survey": {
        "kind": "exp-lookit-exit-survey",
        "debriefing": {
            "title": "Thank you!",
            "text": "PLACEHOLDER DEBRIEFING TEXT. SEE DOCS FOR ADVICE ON WHAT TO INCLUDE HERE.",
            "image": {
                "src": "https://s3.amazonaws.com/lookitcontents/ducks/duck.png",
                "alt": "Very cute duck"
            }
        }
    }

For information about what belongs in the debriefing, see the :ref:`Lookit docs <docs:debriefing-info>`.


Parameters
----------------

debriefing [Object]
    Object specifying information to show on second page of exit survey, before returning to main Lookit site.

    :title: [String]
        Title of debriefing page

    :text: [String]
        Debriefing text. You can include line breaks (\n) and links (<a href='https://...' rel='noopener' target='_blank'>Link text</a>)

    :image: [Object]
        Image to show at top of debriefing (optional)

        :src: [String]
            Image URL

        :alt: [String]
            Image alt-text

showShareButton [Boolean | ``true``]
    Whether to show a 'share this study on Facebook' button

additionalVideoPrivacyText [String]
    Optional additional text to display under the header "Use of video clips and images", above the options. This may
    be used, for example, if you have separately asked for permission to use the videos as stimuli for other parents and want
    to clarify that these options are in addition to that.

Data collected
----------------

The fields added specifically for this frame type are:

birthDate [String]
    Child's birthdate as entered into exit survey; timestamp string starting YYYY-mm-dd.
    @attribute birthDate

databraryShare [String]
    Whether data can be shared with Databrary: 'yes' or 'no'
    @attribute databraryShare

useOfMedia [String]
    Video privacy level: 'private', 'scientific', or 'public'

withdrawal [Boolean]
    Whether the the box to withdraw video data is checked

feedback [String]
    Freeform comments entered by parent

Events recorded
----------------

No events are recorded specifically by this frame.
