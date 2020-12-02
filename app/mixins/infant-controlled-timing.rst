.. _infant-controlled-timing mixin:

infant-controlled-timing mixin
==============================================

Overview
------------------

This mixin provides shared functionality for frames that allow the parent to live-code infant looking to determine
when to proceed. Frames using this mixin allow the parent to:

- end the trial by pressing the ``endTrialKey`` key
- hold down the ``lookawayKey`` (or the mouse button) to indicate that the child is not looking; the trial will automatically end
  after the lookaway criterion is met. If the 'lookawayTone' is not 'none' a noise is played while the child is looking
  away to help the parent know the looking coding is working.

You can disable either of these behaviors by setting the key to ``''``.

The frame will still end when it would have anyway if neither of these things happen! For instance, if you would have
displayed an image for 30 seconds, then after 30 seconds the frame will move on, serving as a "ceiling" on looking time.

Lookaway criterion
~~~~~~~~~~~~~~~~~~~~~~~

You have two options for how to determine when the child has looked away long enough to proceed.

1. Set the ``lookawayType`` to ``"total"`` to accumulate lookaway time until the child has looked away for a total of
`lookawayThreshold` seconds. (For instance, if the ``lookawayThreshold`` is 2, then the trial will end after the child
looks away for 0.5s, then 1s, then 0.5s.)
2. Set the ``lookawayType`` to ``"continuous"`` to require that the child look
away for a continuous ``lookawayThreshold``-second interval. (For instance, if the ``lookawayThreshold`` is 2, then the
child might look away for 1s, 1.5s, and 1s but the trial would continue until she looked away for 2s.)


Parameters
----------------

Any frame that uses this mixin will accept the following parameters in addition to the regular frame parameters:

lookawayType [String | ``'total'``]

    Type of lookaway criterion. Must be either
    'total' (to count total lookaway time) or 'continuous' (to count only continuous lookaway time).
    Whichever criterion type is used, only lookaways after the first look to the screen are considered.

lookawayThreshold [Number | 2]
    Lookaway threshold in seconds. How long does the child need to look away before the trial ends? Depending on
    the lookawayType, this will refer either to the total amount of time the child has looked away since their
    first look to the screen, or to the length of a single continuous lookaway.

lookawayKey [String | ``'p'``]
     Key parent should press to indicate the child is looking away. If a key is provided, then the trial will
     end if the child looks away looks long enough per the lookawayType and lookawayThreshold. You can also use
     'mouse' to indicate that mouse down/up should be used in place of key down/up events. Use an empty string,
     '', to not record any lookaways for this trial. You can look up the names of keys at https://keycode.info.

endTrialKey [String | ``'q'``]
     Key parent should press to manually move on to next trial. This allows you to have parents control the study
     by giving instructions like "press q when the child looks away for at least a few seconds" instead of "hold down
     w whenever the child isn't looking."  Use an empty string, '', to not allow this function
     for this trial. You can look up the names of keys at https://keycode.info. Default is 'q'.

lookawayTone [String | ``'noise'``]
     Type of audio to play during parent-coded lookaways - 'tone' (A 220), 'noise' (pink noise), or 'none'. These
     tones are available at https://www.mit.edu/~kimscott/placeholderstimuli/ if you want to use them in
     instructions.

lookawayToneVolume [Number | ``0.25``]
     Volume of lookaway tone, as fraction of full volume (1 = full volume, 0 = silent)

Data collected
----------------

In addition to data collected by the regular version of the frame, a frame that uses this mixin will collect
two pieces of data for convenience when coding or if implementing a live habituation procedure:

totalLookingTime [Number]
    Total looking time during this frame, in seconds.
    Looking time is calculated as the total time spent looking between:

    1. The start of the parent control period, or the first look during that period if the child is not looking initially and
    2. The end of the trial due to the parent pushing the end trial key, the child reaching the lookaway criterion,
       or the frame being completed without either of these happening (e.g., a video is played N times or an image is
       shown for N seconds).

    All time spent looking away, per parent coding, is excluded, regardless of the duration of the lookaway.

    This value will be null if the trial is not completed by any of the above mechanisms, for instance because
    the parent ends the study early during this frame.

trialEndReason [String]
    What caused the trial to end: 'lookaway' (the child reached the lookaway threshold), 'parentEnded' (the parent
    pressed the endTrialKey), or 'ceiling' (the frame ended without either of those happening).

    This value will be null if the trial is not completed by any of the above mechanisms, for instance because
    the parent ends the study early during this frame.

Events recorded
----------------

In addition to events recorded by the regular version of the frame, a frame that uses this mixin will record the following events:

:lookawayStart: When parent records a lookaway starting. This will be triggered at the start of this frame if the parent
    is already holding down the lookawayKey, and otherwise only when the key is newly pressed down. Lookaways
    are recorded regardless of whether the parent control period has started.

:lookawayEndedTrial:  When trial ends due to lookaway criterion being reached.

:lookawayEnd:  When parent records a lookaway ending. This will NOT be triggered at the start of this frame if the parent
    is not holding down the lookawayKey, only when the key is actually released. Lookaways
    are recorded regardless of whether the parent control period has started.

:parentControlPeriodStart:  When interval of parent control of trial begins - i.e., lookaways begin counting up to threshold.
    Lookaway events are recorded throughout, but do not count towards ending trial until parent control period
    begins.

:parentEndedTrial: When trial ends due to parent pressing key to end trial

:parentControlPeriodEnd: When interval of parent control of trial ends - i.e., lookaways cannot lead to ending trial, parent cannot
    press key to end trial.