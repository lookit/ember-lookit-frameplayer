.. _exp-lookit-mood-questionnaire:

exp-lookit-mood-questionnaire
==============================================

Overview
------------------

A simple mood survey with questions about factors that might affect a
child's responses. Includes Likert-type ratings of the CHILD's position on
the following scales:

- Tired to Rested
- Sick to Healthy
- Fussy to Happy
- Calm to Active

and of the PARENT's position on:

- Tired to Energetic
- Overwhelmed to On top of things
- Upset to Happy

It also asks for a response in hours:minutes for:
- how long ago the child last woke up from sleep or a nap
- how long until he/she is due for another nap/sleep (if regular nap schedule)
- how long ago the child last ate/drank

and for what the child was doing just before this (free-response). Responses
to all questions are required to move on.

What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-mood-questionnaire.png
    :alt: Example screenshot from exp-lookit-mood-questionnaire frame

More general functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Below is information specific to this particular frame. There may also be available parameters, events recorded,
and data collected that come from the following more general sources:

- the :ref:`base frame<base frame>` (things all frames do)

Example
----------------

.. code:: javascript

    "mood-survey": {
        "introText": "How are you two doing? We really want to know: we’re interested in how your child’s mood affects his or her looking preferences.",
        "kind": "exp-lookit-mood-questionnaire"
    }


Parameters
----------------

.. glossary::

    introText [String]
        Intro paragraph describing why we want mood info

Data collected
----------------

The fields added specifically for this frame type are:

rested [String]
    Rating for CHILD on tired - rested scale, '1' to '7' where '7' is rested

healthy [String]
    Rating for CHILD on sick - healthy scale, '1' to '7' where '7' is healthy

childHappy    [String]
    Rating for CHILD on fussy - happy scale, '1' to '7' where '7' is happy

active [String]
    Rating for CHILD on calm - active scale, '1' to '7' where '7' is active

energetic [String]
    Rating for PARENT on tired - energetic scale, '1' to '7' where '7' is energetic

ontopofstuff [String]
    Rating for PARENT on overwhelmed - on top of stuff scale, '1' to '7' where '7' is on top of stuff

parentHappy [String]
    Rating for PARENT on upset - happy scale, '1' to '7' where '7' is happy

napWakeUp [String]
    how long since the child woke up from nap, HH:mm

usualNapSchedule [String]
    whether the child has a typical nap schedule: 'no', 'yes', or 'yes-overdue' if child is overdue for nap

nextNap [String]
    only valid if usualNapSchedule is 'yes';  how long until child is due to sleep again, HH:mm

lastEat [String]
    how long since the child ate/drank, HH:mm

doingBefore [String]
    what the child was doing before this (free response)


Events recorded
----------------

No events are recorded specifically by this frame.