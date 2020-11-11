.. _<%= dasherizedModuleName %>:

<%= dasherizedModuleName %>
==============================================

Overview
------------------

TODO: Short description of what your randomizer does.

To use, define a frame with ``"kind": "choice"`` and ``"sampler": "<%= dasherizedModuleName %>"``,
as shown below, in addition to the parameters described under 'properties'.

Example
----------------

This frame ... <INSERT DESCRIPTION OF HOW THIS EXAMPLE WORKS AND INSERT WORKING EXAMPLE>

.. code:: javascript

    "select-randomizer-test": {
        "sampler": "<%= dasherizedModuleName %>",
        "kind": "choice",
        ...
    }


Parameters
----------------

parameter1 [Array]
    TODO: Describe each parameter this randomizer accepts like this.


Data collected
----------------

The information returned by this randomizer will be available in ``expData["conditions"]["THIS-RANDOMIZER-ID"]``. The
randomizer ID will depend on its order in the study - for instance, ``6-test-trials``.

datum1 [Array]
    TODO: Describe each piece of data the randomizer will store.
