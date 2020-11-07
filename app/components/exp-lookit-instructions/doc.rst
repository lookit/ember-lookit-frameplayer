.. _exp-lookit-instructions:

exp-lookit-instructions
==============================================

Overview
------------------

A frame to display instructions to the user. The user's webcam may optionally be
displayed, and audio and video clips may be included in the instructions (and may be
required to be played before moving on).

What it looks like
~~~~~~~~~~~~~~~~~~

.. image:: /../images/Exp-lookit-instructions.png
    :alt: Example screenshot from exp-lookit-instructions frame

More general functionality
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Below is information specific to this particular frame. There may also be available parameters, events recorded,
and data collected that come from the following more general sources:

- the :ref:`base frame<base frame>` (things all frames do)

Examples
----------------

.. code:: javascript

    "instructions": {
        "kind": "exp-lookit-instructions",
        "blocks": [
            {
                "title": "At vero eos",
                "listblocks": [
                    {
                        "text": "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga."
                    },
                    {
                        "text": "Et harum quidem rerum facilis est et expedita distinctio."
                    }
                ]
            },
            {
                "text": "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
                "image": {
                    "alt": "Father holding child looking over his shoulder",
                    "src": "https://s3.amazonaws.com/lookitcontents/exp-physics/OverShoulder.jpg"
                },
                "title": "Lorem ipsum"
            },
            {
                "text": "unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
                "title": "Sed ut perspiciatis",
                "mediaBlock": {
                    "text": "You should hear 'Ready to go?'",
                    "isVideo": false,
                    "sources": [
                        {
                            "src": "https://s3.amazonaws.com/lookitcontents/exp-physics-final/audio/ready.mp3",
                            "type": "audio/mp3"
                        },
                        {
                            "src": "https://s3.amazonaws.com/lookitcontents/exp-physics-final/audio/ready.ogg",
                            "type": "audio/ogg"
                        }
                    ],
                    "mustPlay": true,
                    "warningText": "Please try playing the sample audio."
                }
            },
            {
                "text": "quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
                "title": "Nemo enim ipsam voluptatem",
                "mediaBlock": {
                    "text": "Look at that.",
                    "isVideo": true,
                    "sources": [
                        {
                            "src": "https://s3.amazonaws.com/lookitcontents/exp-physics-final/examples/7_control_same.mp4",
                            "type": "video/mp4"
                        },
                        {
                            "src": "https://s3.amazonaws.com/lookitcontents/exp-physics-final/examples/7_control_same.webm",
                            "type": "video/webm"
                        }
                    ],
                    "mustPlay": false
                }
            }
        ],
        "showWebcam": true,
        "webcamBlocks": [
            {
                "title": "Neque porro quisquam",
                "listblocks": [
                    {
                        "text": "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?"
                    },
                    {
                        "text": "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
                    }
                ]
            }
        ],
        "nextButtonText": "Next"
    }



Parameters
----------------

showWebcam [Boolean | ``false``]
    Whether to display the user's webcam

blocks [Array]
    Array of blocks to be rendered by :ref:`exp-text-block`, specifying text/images of instructions to display.
    In addition to the standard options allowed by ``exp-text-block`` (text, title, etc.) these blocks may have a
    field ``mediaBlock`` with fields:

    :title: [String] Title of section
    :text: [String] Text displayed below title
    :warningText: [String] Warning text shown if ``mustPlay`` is true and user moves on without playing media
    :sources: [Array] List of objects indicating where media is located, each with fields:

       :src: [String] URL of media file
       :type: [String] MIMEtype of media file, e.g. ``'video/mp4'``
    :isVideo: [Boolean] Whether this is a video file, vs. audio
    :mustPlay: [Boolean] whether to require user to play this to move on

webcamBlocks [Array]
    Array of objects specifying text/images of instructions to display under webcam view (if webcam is shown),
    rendered by :ref:`exp-text-block`

showPreviousButton [Boolean | ``true``]
    Whether to show a 'previous' button

nextButtonText [String | ``'Start the videos! \n (You\'ll have a moment to turn around.)'``]
    Text to display on the 'next frame' button

Data collected
----------------

No data is collected specifically for this frame type.


Events recorded
----------------

No events are recorded specifically by this frame.
