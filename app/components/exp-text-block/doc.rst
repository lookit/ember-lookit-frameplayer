.. _exp-text-block:

exp-text-block
==============================================

Overview
------------------

This is a small utility for displaying text that a variety of frames use. If the frame documentation said that some
parameter would be rendered by exp-text-block, or that it should be a list of blocks each to be rendered by exp-text-block,
you're in the right place to learn how to format that parameter.

Examples
----------------

Single block: title and text
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code:: javascript

    "example-text-frame": {
        "kind": "exp-lookit-text",
        "blocks": [
            {
                "title": "Lorem ipsum",
                "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Suscipit adipiscing bibendum est ultricies integer quis auctor. Imperdiet sed euismod nisi porta lorem mollis. Sollicitudin tempor id eu nisl nunc mi. Aliquet lectus proin nibh nisl condimentum. Ac tincidunt vitae semper quis lectus nulla at volutpat. Mauris sit amet massa vitae tortor condimentum lacinia. Tincidunt vitae semper quis lectus nulla at volutpat. Elementum curabitur vitae nunc sed. Pharetra convallis posuere morbi leo."
            }
        ]
    }

.. image:: /../images/Exp-text-block-1.png
    :alt: Example screenshot of title and text


Single block: text and image
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code:: javascript

    "example-text-frame": {
        "kind": "exp-lookit-text",
        "blocks": [
            {
                "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Suscipit adipiscing bibendum est ultricies integer quis auctor. Imperdiet sed euismod nisi porta lorem mollis. Sollicitudin tempor id eu nisl nunc mi. Aliquet lectus proin nibh nisl condimentum. Ac tincidunt vitae semper quis lectus nulla at volutpat.",
                "image": {
                    "src": "https://www.mit.edu/~kimscott/placeholderstimuli/img/apple.jpg",
                    "alt": "Red apple"
                }
            }
        ]
    }

.. image:: /../images/Exp-text-block-2.png
    :alt: Example screenshot of text and image

Note that there may be formatting applied to the image based on the particular frame.

Single block: text and listblocks
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code:: javascript

    "example-text-frame": {
        "kind": "exp-lookit-text",
        "blocks": [
            {
                "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                "listblocks": [
                    {
                        "text": "Suscipit adipiscing bibendum est ultricies integer quis auctor."
                    },
                    {
                        "text": "Imperdiet sed euismod nisi porta lorem mollis."
                    },
                    {
                        "text": "Sollicitudin tempor id eu nisl nunc mi."
                    }
                ]
            }
        ]
    }

.. image:: /../images/Exp-text-block-3.png
    :alt: Example screenshot of text and unordered list

Note that there may be formatting applied to the image based on the particular frame.


Three blocks
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

In many frames you can specify a list of blocks to be rendered by exp-text-block - here's an example:

.. code:: javascript

    "example-text-frame": {
        "kind": "exp-lookit-text",
        "blocks": [
            {
                "title": "Lorem ipsum",
                "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                "listblocks": [
                    {
                        "text": "Suscipit adipiscing bibendum est ultricies integer quis auctor."
                    },
                    {
                        "text": "Imperdiet sed euismod nisi porta lorem mollis."
                    },
                    {
                        "text": "Sollicitudin tempor id eu nisl nunc mi."
                    }
                ]
            },
            {
                "title": "Nulla porttitor",
                "text": " Nulla porttitor massa id neque aliquam. Ac felis donec et odio pellentesque diam. Nisl vel pretium lectus quam id leo. "
            },
            {
                "image": {
                    "src": "https://www.mit.edu/~kimscott/placeholderstimuli/img/apple.jpg",
                    "alt": "Red apple"
                },
                "listblocks": [
                    {
                        "text": "Est ante in nibh mauris cursus."
                    },
                    {
                        "text": "Ut aliquam purus sit amet luctus venenatis lectus."
                    },
                    {
                        "text": "Cras ornare arcu dui vivamus arcu felis bibendum ut."
                    }
                ]
            }
        ]
    }

.. image:: /../images/Exp-text-block-4.png
    :alt: Example screenshot of three blocks - title, text, and listblocks; title and text; image and listblocks.

Inserting a link
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code:: javascript

    "example-text-frame": {
        "kind": "exp-lookit-text",
        "blocks": [
            {
                "title": "Lorem ipsum",
                "text": "Here is a link to <a href='https://lookit.mit.edu/' target='_blank' rel='noopener'>Lookit</a>."
            }
        ]
    }

Parameters
----------------

All of the following are optional:

title [String]
    Title text to display at the top of this block

text [String]
    Main text of this block. You can use `\n` or `<br>` for paragraph breaks. You can use HTML inside the text,
    for instance to include a link or an image.

    :emph: whether to show this text in bold

image [Object]
    Image to display along with this block. Needs two fields:

    :src: URL of image
    :alt: alt-text for image

listblocks [Array]
    A list of items to display in bullet points. Each item is itself rendered with exp-text-block, so it is an
    object that can have title, text, image, listblocks, etc.