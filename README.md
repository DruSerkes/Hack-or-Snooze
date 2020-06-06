This is a Hacker News clone

Link to project: https://druserkes.github.io/Hack-or-Snooze/


** What this project was about:

This project was the Section-1 culminating project, a "front-end sprint." 
It made use of all of the skills I've learned in front-end development thus far, including: html, css, javascript, jquery, 
ajax with axios, interaction with API's, and OOP. 

** What I did:

I was provided a codebase to start with objects for StoryList, User, and Story already partially defined (attributes, some methods). 
I spent a large portion of my time on this project understanding the already written code, and the API Springboard provided for 
this project. 

I was then tasked with building functionality for: creating an account, logging in, creating a post, favoriting/unfavoriting posts,
viewing favorite posts, viewing and deleting my posts, and viewing and updating account information. All of these were done with 
the tools I've implemented over the course of my curriculum to date, making use of AJAX to make calls to API's with user input, 
handling the response and using it to update the UI accordingly. 

I believe this was the first project in which I had separate files for user interface and logic for API interaction, highlighting 
the importance of separation of concerns. 

Within my UI code, I created helper functions wherever I found myself writing repetative code, so keep my code digestible for the 
instructor who would ultimately be responsible for my code review. 

** What I learned:

I spent a considerable amount of time during this project understanding the API and existing codebase (expected inputs/outputs of 
functions, etc). I realized that this exercise was as much about learning to read someone else's code as it was building my own 
functionality for an application.   

This was also an exercise in patience: there were large chunks of time where I'd be jamming along, then everything would break 
and I'd have to retrace my steps to figure out where I went wrong. It was easy to get frustrated during these moments, but I 
learned to take breaks/deep breaths, and persist until I finally found the bug.  

** Looking forward:

I'd love to refactor my code to more specifically handle errors that arise when user tries to create an account with a username
that's already been taken. I'd also like to use the API response to make error messages displayed to the user more specific (for 
both account creation and login).

I would also like to break down my code into even more modular parts. For example, I'd keep separate files for helper functions, 
functions that handle posts, functions that handle creating/updating/deleting an account. 
