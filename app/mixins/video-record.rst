.. _video-record:

video-record mixin
==============================================

Overview
------------------

This mixin allows frames to display the webcam to the user and/or make recordings specific to the frame. For instance,
:ref:`exp-lookit-video` can make a recording of the interval when the stimuli are displayed.

In general, the recorder is "installed" as soon as the frame loads. Once the recorder is installed, recording can begin
quickly. Recording may begin right away (e.g. upon showing stimuli), upon the user pressing a button
(e.g. in :ref:`exp-lookit-stimuli-preview`), or not at all (e.g. in :ref:`exp-video-config` where the webcam is displayed
but not recorded).

Individual-frame and session-level recording
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If there is an ongoing session-level recording, the camera will not be used by this frame and no recording will be made,
to avoid overlapping recordings. This may interfere with frames such as :ref:`exp-lookit-webcam-display` that need to
display the webcam.

If this occurs, a warning is displayed in the browser console.

Displaying a message during setup and/or upload
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

On frames that start and end recording automatically, you may want to hide stimuli and/or display an informative
message during the second or two when the recorder is being
set up and finishing video upload, to avoid displaying stimuli during time you won't have webcam video for.

You can set the following parameters to ``true`` independently:

- showWaitForRecordingMessage
- showWaitForUploadMessage

You can then customize what is displayed by setting the corresponding messages and their background colors. (The text
color will be automatically set to either black or white to be maximally visible against the background.) You can
additionally specify a single image or video to be shown during these periods.


Parameters
----------------

If your frame uses the video-record mixin, you can specify the following in addition to frame-specific parameters:

.. glossary::

    maxRecordingLength [Number | ``7200``]
        Maximum recording length in seconds

    maxUploadSeconds [Number | ``5``]
        Maximum time allowed for video upload before proceeding to next frame, in seconds. Can be overridden by
        researcher, based on tradeoff between making families wait and losing data.

    showWaitForRecordingMessage [Boolean | ``true``]
        Whether to initially show a message saying to wait until recording starts, covering the entire frame.
        This prevents participants from seeing any stimuli before recording begins. Only used if recording is being
        started immediately.

    waitForRecordingMessage [String | ``'Please wait... <br><br> starting webcam recording'``]
        [Only used if showWaitForRecordingMessage is true] Text to display while waiting for recording to begin.

    waitForRecordingMessageColor [String | ``'white'``]
        [Only used if showWaitForRecordingMessage is true] Background color of screen while waiting for recording to
        begin. See https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
        for acceptable syntax: can use either color names ('blue', 'red', 'green', etc.), or
        rgb hex values (e.g. '#800080' - include the '#'). The text on top of this will be either black or white
        depending on which will have higher contrast.

    showWaitForUploadMessage [Boolean | ``false``]
        Whether to stop media and hide stimuli with a message saying to wait for video upload when stopping recording.
        Do NOT set this to true if end of recording does not correspond to end of the frame (e.g. during consent or
        observation frames) since it will hide everything upon stopping the recording!

    waitForUploadMessage [String | ``'Please wait... <br><br> uploading video'``]
        [Only used if showWaitForUploadMessage is true] Text to display while waiting for recording to begin.

    waitForUploadMessageColor [String | ``'white'``]
        [Only used if showWaitForUploadMessage is true] Background color of screen while waiting for recording to
        upload. See https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
        for acceptable syntax: can use either color names ('blue', 'red', 'green', etc.), or
        rgb hex values (e.g. '#800080' - include the '#'). The text on top of this will be either black or white
        depending on which will have higher contrast.

    waitForWebcamImage [String]
        [Only used if showWaitForUploadMessage and/or showWaitForRecordingMessage are true] Image to display along with
        any wait-for-recording or wait-for-upload message. Either waitForWebcamImage or waitForWebcamVideo can be
        specified. This can be either a full URL ('https://...') or just a filename, which will be assumed to be
        inside ``baseDir/img/`` if this frame otherwise supports use of ``baseDir``.

    waitForWebcamVideo [String or Array]
        [Only used if showWaitForUploadMessage and/or showWaitForRecordingMessage are true] Video to display along with
        any wait-for-recording or wait-for-upload message (looping). Either waitForWebcamImage or waitForWebcamVideo can be
        specified. This can be either an array of ``{'src': 'https://...', 'type': '...'}`` objects (e.g. providing both
        webm and mp4 versions at specified URLS) or a single string relative to ``baseDir/<EXT>/`` if this frame otherwise
        supports use of ``baseDir``.


Data collected
----------------

If your frame uses the video-record mixin, you will receive the following in addition to frame-specific data:

.. glossary::

    videoId
        The last video filename used during this frame (typically the only one). Format is
        `videoStream_<experimentId>_<frameId>_<sessionId>_timestampMS_RRR`
        where RRR are random numeric digits.

    videoList
        A list of all video filenames created during this frame (a new one is created for each recording).

Events recorded
----------------

If your frame uses the video-record mixin, you may see the following in addition to frame-specific events:

:hasCamAccess: When recorder detects a change in camera access

    :hasCamAccess: [Boolean] whether the recorder now has access

:videoStreamConnection: When recorder detects a change in video stream connection status

    :status: [String] status status of video stream connection, e.g. 'NetConnection.Connect.Success' if successful

:recorderReady: When video recorder has been installed and can be started

:startRecording: When video recorder has actually started recording

    :pipeId: [String] Original filename assigned by the Pipe client. May be used for troubleshooting.

:stoppingCapture: Just before stopping webcam video capture

:destroyingRecorder: When video recorder is about to be destroyed before next frame
