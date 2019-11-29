---
name: Bug report
about: Report a problem with the Lookit experiment player
title: ''
labels: bug
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is. 

Note: This is the correct form to use for any bugs that relate to the Lookit frameplayer: any problem that happens while previewing or participating in a Lookit study, or any problem with the data collected during the study. 

If you have a problem to report about the participant or experimenter interfaces outside of actual studies - for instance, an issue with logging in, the consent manager, or editing eligibility criteria - please [create a bug report in lookit-api](https://github.com/lookit/lookit-api/issues/new/choose) instead. (If you're not sure where your bug belongs, don't worry, we can move it :) )

**Which frame or frames does it affect?**
[E.g., exp-lookit-exit-survey, exp-lookit-observation; n/a for bugs affecting the frameplayer more generally]

**Example**
Link to your study (draft) where this problem occurs, if applicable: [e.g., https://staging-lookit.cos.io/exp/studies/89/]

**To Reproduce**
Steps to reproduce the behavior (edit the example below):
1. Go to staging-lookit.cos.io/exp and log in as an experimenter.
2. Create a study including the following frame definition. Build preview dependencies. (OR view our study at https://staging-lookit.cos.io/exp/studies/89/ for an example.)

```
   "my-study-frame": {
       "kind": "exp-lookit-text",
       "blocks": [
           {
               "emph": true,
               "text": "Important: your child does not need to be with you until the videos begin. First, let's go over what will happen!",
               "title": "Your baby, the physicist"
           },
           {
               "text": "Some introductory text about this study."
           },
           {
               "text": "Another paragraph about this study."
           }
       ],
       "showPreviousButton": false,
   }
```

4. Click 'preview' from the study edit page.
5. Proceed through the study until you reach the intro frame above.
6. Click "next"
7. Observe that a video of a dancing giraffe appears in place of the text, but you do not actually progress to the next frame. 

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment (please complete):**
 - Lookit environment (production, staging, local + previewing or participating in study):
 - Version of frameplayer code (`last_known_player_sha field` on the study edit page): 
 - Operating system [e.g. Windows, Mac, Linux]:
 - Browser [e.g. Chrome, Firefox, Safari] and version:

**Additional information**

If we have trouble reproducing the bug with this information, we'll likely ask for the following additional information:
 - Webcam used [built-in or external]:
 - Monitor used [laptop monitor or external and resolution]: 
 - Upload and download speed [using e.g. https://www.speedcheck.org/]: 
 - How many times have you been able to reproduce the error using the steps above? How many times have you seen the expected behavior? 

If you have tried to reproduce this bug under multiple circumstances, please note everything you have tried. For instance, perhaps this happens in BOTH Chrome and Firefox on your Mac, and in Chrome but not Firefox on your Windows machine.

[Here is a great article from a grumpy programmer where you can learn more about writing excellent bug reports.](https://www.chiark.greenend.org.uk/~sgtatham/bugs.html)
