# User Guide

This guide will outline the new features that our team added to NodeBB.

DELETE THIS LATER. JUST INSTRUCTIONS.
"In this file, provide a detailed outline of how to use and user test your new feature(s)
You should also provide a link/description of where your added automated tests can be found, along with a description of what is being tested and why you believe the tests are sufficient for covering the changes that you have made"

## Feature 1: Badges

### Overview

The badges feature adds an icon next to the username based on a user's reputation score and post count. These badges are appended to the username, meaning that the badges will be propagated everywhere on the site including on profile, post comments, and more.

![Badges](UserGuideScreenshots/Badges.png)

### User Test

A user can test these changes by going to their profile. They can either increase their reputation score by getting upvotes from other users or increase their post count, and in turn they will see their badges change. Specifically, for reputation score, if it less than 5 the badge will be ⭐, less than 20 will be 🌟, and any score above 20 will be 💫. For the post count, if it less than 5 the badge will be 🌱, less than 20 will be 🌷, and any score above 20 will be 🌳.

### Automated Tests

Unit tests for the backend logic for this feature can be found in this [link](https://github.com/CMU-313/fall23-nodebb-hunan/blob/main/test/user.js). The tests written cover all branches in the conditional statements written in the `calculateBadge` function, which can be found in `src/user/data.js`. 

However, the larger challenge here was including tests that tested the integration of this feature with other existing features, including the authentication and post features. We needed to ensure that the username concatenated with the badges was being propagated throughout the application. Therefore, we also added tests in a variety of other files, including in `test/authentication.js`, `test/controllers-admin.js`, `test/controllers.js`, and `test/posts.js`. Here, we added testing to ensure that the username was being correctly propagated into these various other applications that interacted with the badges feature.

We also conducted strict manual testing, ensuring that the features included were behaving correctly on the NodeBB website itself. When completing code reviews, this is one of the main checkpoints that we looked for.

The vast range of tests added, from unit to integration to system and even manual tests, ensure that our feature is working correctly. These tests provide excellent coverage to ensure that the feature we have implemented is 1) bug-free and meets the specification requirements, and 2) interacts well with other existing features in the NodeBB application.

## Feature 2: Endorse Post

### Overview

This feature allows users, both administrators and students, to "endorse" and "unendorse" a post. Once a user has endosred a certain post, it also shows this result to other users.

![EndorsePost](UserGuideScreenshots/EndorsePost.png)

### User Test

A user can test these changes by going to any post. Above all the replies in a post, there will be a pale yellow button that says "Endorse This Post". When a user clicks on this, text will appear saying that "This post has been endorsed". If the post has already been endorsed, the button will display "Unendorse This Post", and once clicked, the text message will disappear.

### Automated Tests

The "endorse post" feature was solely a UI addition, and as a team, we did not invest in automated UI testing due to its complexity and due a team member dropping the course. This is one of our future plans, however.
