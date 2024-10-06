To include in this project:
Public Routes (Any User)
GET /api/items – Browse and read reviews of items.
GET /api/items – View details, rating, and information of a specific item.
GET /api/items/:name Search for items by name or keyword.
POST /api/signup – Sign up for a new account.
POST /api/login – Log in with an existing account.

Logged-In User Routes (Authenticated Users)
POST /api/reviews – Write and submit a review for an item (text + rating).
PUT /api/reviews – Edit an existing review (text + rating).
DELETE /api/reviews – Delete a review the user has written.
GET /api/reviews/:userId – View all reviews written by the user.
POST /api/comments – Write a comment on another user's review.
PUT /api/comments – Edit a comment the user has written.
DELETE /api/comments – Delete a comment the user has written.
GET /api/comments/:userId – View all comments the user has written.

GitHub project
A project plan that was created by using GitHub Projects

Schema
A clear database schema for the e-commerce application

Unit tests
Unit tests written for each API endpoint

Routes
A functioning API and the working base routes with placeholder endpoints