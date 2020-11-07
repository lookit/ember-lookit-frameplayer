.. _base frame:

All frames support...
======================

All Lookit frames share some common features. While frame-specific features are described on the pagse for those frames,
like exp-lookit-video, you can also use any of the parameters listed here to customize any frame, and will receive
the data and events described here.

Parameters
------------------

There are several parameters that ALL frames accept to allow you to customize the study "flow," which are:

.. _select next frame:

selectNextFrame [String]
    Function to select which frame index to go to when using the 'next' action on this
    frame. Allows flexible looping / short-circuiting based on what has happened so far
    in the study (e.g., once the child answers N questions correctly, move on to next
    segment). Must be a valid Javascript function, returning a number from 0 through
    frames.length - 1, provided as a string.

    Arguments that will be provided are:
    ``frames``, ``frameIndex``, ``expData``, ``sequence``, ``child``, ``pastSessions``

    ``frames`` is an ordered list of frame configurations for this study; each element
    is an object corresponding directly to a frame you defined in the
    JSON document for this study (but with any randomizer frames resolved into the
    particular frames that will be used this time).

    ``frameIndex`` is the index in ``frames`` of the current frame

    ``expData`` is an object consisting of ``frameId``: ``frameData`` pairs; the data associated
    with a particular frame depends on the frame kind.

    ``sequence`` is an ordered list of frameIds, corresponding to the keys in ``expData``.

    ``child`` is an object that has the following properties - use child.get(propertyName)
    to access:

    - ``additionalInformation``: String; additional information field from child form
    - ``ageAtBirth``: String; child's gestational age at birth in weeks. Possible values are
      "24" through "39", "na" (not sure or prefer not to answer),
      "<24" (under 24 weeks), and "40>" (40 or more weeks).
    - ``birthday``: timestamp in format "Mon Apr 10 2017 20:00:00 GMT-0400 (Eastern Daylight Time)"
    - ``gender``: "f" (female), "m" (male), "o" (other), or "na" (prefer not to answer)
    - ``givenName``: String, child's given name/nickname
    - ``id``: String, child UUID

    ``pastSessions`` is a list of previous response objects for this child and this study,
    ordered starting from most recent (at index 0 is this session!). Each has properties
    (access as pastSessions[i].get(propertyName)):

    - ``completed``: Boolean, whether they submitted an exit survey
    - ``completedConsentFrame``: Boolean, whether they got through at least a consent frame
    - ``conditions``: Object representing any conditions assigned by randomizer frames
    - ``createdOn``: timestamp in format "Thu Apr 18 2019 12:33:26 GMT-0400 (Eastern Daylight Time)"
    - ``expData``: Object consisting of frameId: frameData pairs
    - ``globalEventTimings``: list of any events stored outside of individual frames - currently
      just used for attempts to leave the study early
    - ``sequence``: ordered list of frameIds, corresponding to keys in expData

    Example that just sends us to the last frame of the study no matter what:
    ``"function(frames, frameIndex, frameData, expData, sequence, child, pastSessions) {return frames.length - 1;}"```

    Example that just sends us to the next frame no matter what:
    ``"function(frames, frameIndex, frameData, expData, sequence, child, pastSessions) {return frameIndex + 1;}"```


.. _generateProperties:

generateProperties [String]
    Function to generate additional properties for this frame (like {"kind": "exp-lookit-text"})
    at the time the frame is initialized. Allows behavior of study to depend on what has
    happened so far (e.g., answers on a form or to previous test trials).
    Must be a valid Javascript function, returning an object, provided as
    a string.

    Arguments that will be provided are: ``expData``, ``sequence``, ``child``, ``pastSessions``, ``conditions``.

    ``expData``, ``sequence``, and ``conditions`` are the same data as would be found in the session data shown
    on the Lookit experimenter interface under 'Individual Responses', except that
    they will only contain information up to this point in the study:

    - ``expData`` is an object consisting of ``frameId``: ``frameData`` pairs; the data associated
      with a particular frame depends on the frame kind.

    - ``sequence`` is an ordered list of frameIds, corresponding to the keys in ``expData``.

    - ``conditions`` is an object representing the data stored by any randomizer frames;
      each key is a ``frameId`` for a randomizer frame and data stored depends on the randomizer
      used.

    - ``child`` is an object that has the following properties - use ``child.get(propertyName)``
      to access:

      - ``additionalInformation``: String; additional information field from child form
      - ``ageAtBirth``: String; child's gestational age at birth in weeks. Possible values are
        "24" through "39", "na" (not sure or prefer not to answer),
        "<24" (under 24 weeks), and "40>" (40 or more weeks).
      - ``birthday``: Date object
      - ``gender``: "f" (female), "m" (male), "o" (other), or "na" (prefer not to answer)
      - ``givenName``: String, child's given name/nickname
      - ``id``: String, child UUID
      - ``languageList``: String, space-separated list of languages child is exposed to
        (2-letter codes)
      - ``conditionList``: String, space-separated list of conditions/characteristics
        of child from registration form, as used in criteria expression, e.g.
        "autism_spectrum_disorder deaf multiple_birth"

    - ``pastSessions`` is a list of previous response objects for this child and this study,
      ordered starting from most recent (at index 0 is this session!). Each has properties
      (access as pastSessions[i].get(propertyName)):

      - ``completed``: Boolean, whether they submitted an exit survey
      - ``completedConsentFrame``: Boolean, whether they got through at least a consent frame
      - ``conditions``: Object representing any conditions assigned by randomizer frames
      - ``createdOn``: Date object
      - ``expData``: Object consisting of frameId: frameData pairs
      - ``globalEventTimings``: list of any events stored outside of individual frames - currently
        just used for attempts to leave the study early
      - ``sequence``: ordered list of frameIds, corresponding to keys in expData
      - ``isPreview``: Boolean, whether this is from a preview session (possible in the event
        this is an experimenter's account)

    Example:

    .. code:: javascript

        function(expData, sequence, child, pastSessions, conditions) {
         return {
            'blocks':
                 [
                     {
                         'text': 'Name: ' + child.get('givenName')
                     },
                     {
                         'text': 'Frame number: ' + sequence.length
                     },
                     {
                         'text': 'N past sessions: ' + pastSessions.length
                     }
                 ]
           };
        }

    Note: This example is split across lines for readability; when added to JSON it would need
    to be on one line.

parameters
    An object containing values for any parameters (variables) to use in this frame.
    Any property VALUES in this frame that match any of the property NAMES in `parameters`
    will be replaced by the corresponding parameter value. For details, see :ref:`frame parameters`.

There are also some miscellaneous parameters you can set on any frame:

displayFullscreenOverride [Boolean | ``false``]
     Set to `true` to display this frame in fullscreen mode, even if the frame type
     is not always displayed fullscreen. (For instance, you might use this to keep
     a survey between test trials in fullscreen mode.)

startSessionRecording [Boolean | ``false``]
    Whether to start a session (multi-frame) recording as soon as possible upon loading this frame. It is
    recommended to use the dedicated frame exp-lookit-start-recording to start a session recording instead of
    adding this to an arbitrary frame.

    Session recording allows you to
    to conduct video recording across multiple frames, simply specifying which frame to start and end on. Individual
    frames may also provide frame-specific recording capabilities; it is best NOT to conduct both a multiframe
    'session' recording and frame-specific recording simultaneously as multiple video streams will eat up bandwidth.
    If you decide to use session recording, turn off recording for any frames that would otherwise record.
    There can be multiple session recordings in an experiment, e.g. from frames 1-3 and 5-10.

sessionMaxUploadSeconds: [Number | ``10``]
    Maximum time allowed for whole-session video upload before proceeding, in seconds.
    Only used if ``endSessionRecording`` is true.  Can be overridden by researcher, based on tradeoff between making
    families wait and losing data.

endSessionRecording [Boolean | ``false``]
    Whether to end any session (multi-frame) recording at the end of this frame.  It is
    recommended to use the dedicated frame exp-lookit-stop-recording to stop a session recording instead of
    adding this to an arbitrary frame.

Data collected
------------------

generatedProperties
    Any properties generated via a custom generateProperties function provided to this
    frame (e.g., a score you computed to decide on feedback). In general will be null.

frameDuration
    Duration between frame being inserted and call to ``next``

frameType
    Type of frame: ``EXIT`` (exit survey), ``CONSENT`` (consent or assent frame), or ``DEFAULT``

eventTimings
    Ordered list of events captured during this frame (oldest to newest). See "Events recorded"
    below as well as events specific to the particular frame type.


Events recorded
------------------

Events recorded by a frame will be available inside the ``expData`` for this session and frame. If the
frame ID is ``'0-video-config'``, then you could find a list of events in ``expData['0-video-config']['eventTimings']``.

Each event is an object with at least the properties:

    :eventType: the name of the event - like ``'nextFrame'`` below
    :timestamp: the time when the event happened

Some events may have additional properties, which will be listed under the event description on the relevant
frame.

The events recorded by the base frame are:

:nextFrame: When moving to next frame

:previousFrame: When moving to previous frame