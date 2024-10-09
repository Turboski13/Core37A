const pg = require('pg');
const express = require('express');
const app = express();
const port = 2000;
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/this_is_new'); //fix this link
const uuid = require('uuid');
const bcrypt = require('bcrypt');

const createTables = async()=> {
  const SQL = `
    DROP TABLE IF EXISTS reviews;
    DROP TABLE IF EXISTS items;
    DROP TABLE IF EXISTS users;
    
    
    CREATE TABLE users(
      id UUID PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255)
    );

      CREATE TABLE items(
      id UUID PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      details VARCHAR(255),
      rating VARCHAR(10),
      reviews_id UUID REFERENCES reviews(id)
    );

    CREATE TABLE reviews(                                          
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) NOT NULL,
      item_id UUID REFERENCES items(id) NOT NULL,
      rating VARCHAR(10),
      comments VARCHAR(255),   
      CONSTRAINT unique_item_user UNIQUE (item_id, user_id)     
    );

    CREATE TABLE comments (
      id UUID PRIMARY KEY,
      review_id UUID REFERENCES reviews(id) NOT NULL,
      user_id UUID REFERENCES users(id) NOT NULL,
      comment_text VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
  `;
  await client.query(SQL);
};

//Public routes
//GET/API/items-browse and read reviews
const fetchItems = async()=> {
  const SQL = `
    SELECT * FROM items;
  `;
  const response = await client.query(SQL);
  return response.rows;
}

//GET/API/items-View details, rating, and information of a specific item
const fetchItemDetails = async(id)=> {
  const SQL = `
    SELECT * FROM reviews
    WHERE item_id = $1
  `;
  const response = await client.query(SQL, [ id ]);
  return response.rows;
}
//GET /api/items/:name Search for items by name or keyword.
const searchItems = async(name) => {
  const SQL = `
    SELECT * FROM items WHERE name ILIKE $1;
  `;
  const response = await client.query(SQL, [`%${name}%`]);
  return response.rows;
};

//POST /api/signup – Sign up for a new account.
const signUp = async({ username, password })=> {
  const SQL = `
    INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *;
  `;
  const response = await client.query(SQL, [uuid.v4(), username, await bcrypt.hash(password, 5)]);
  return response.rows[0];

}
//POST /api/login – Log in with an existing account.
const logIn = async({ username, password }) => {
  const SQL = `
    SELECT * FROM users WHERE username = $1;
  `;
  const response = await client.query(SQL, [username]);
  const user = response.rows[0];

  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid password');
  }

  return user;
};



//Logged in User Routes (authenticated users)
//POST /api/reviews – Write and submit a review for an item (text + rating).
const createReview = async({ user_id, item_id, rating, comments })=> {
  const SQL = `
    INSERT INTO reviews(id, user_id, item_id, rating, comments) VALUES($1, $2, $3, $4, $5) RETURNING *;
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id, item_id, rating, comments]);
  return response.rows[0];
}
//PUT /api/reviews – Edit an existing review (text + rating).
const updateReview = async({ id, user_id, rating, comments }) => {
  const SQL = `
    UPDATE reviews
    SET rating = $1, comments = $2
    WHERE id = $3 AND user_id = $4
    RETURNING *;
  `;
  const response = await client.query(SQL, [rating, comments, id, user_id]);
  return response.rows[0];
};
//DELETE /api/reviews – Delete a review the user has written.
const deleteReview = async({id, user_id})=> {
  const SQL = `
    DELETE FROM reviews
    WHERE id = $1 AND user_id = $2
  `;
  await client.query(SQL, [ id, user_id ]);
}
//GET /api/reviews/:userId – View all reviews written by the user.
const fetchUserReviews = async(id)=> {
  const SQL = `
    SELECT * FROM reviews
    WHERE user_id = $1
  `;
  const response = await client.query(SQL, [ id ]);
  return response.rows;
}
//POST /api/comments – Write a comment on another user's review.
const createComment = async({ review_id, user_id, comment_text }) => {
  const SQL = `
    INSERT INTO comments(id, review_id, user_id, comment_text)
    VALUES($1, $2, $3, $4) RETURNING *;
  `;
  const response = await client.query(SQL, [uuid.v4(), review_id, user_id, comment_text]);
  return response.rows[0];
};

//PUT /api/comments – Edit a comment the user has written.
const updateComment = async({ id, user_id, comment_text }) => {
  const SQL = `
    UPDATE comments
    SET comment_text = $1
    WHERE id = $2 AND user_id = $3
    RETURNING *;
  `;
  const response = await client.query(SQL, [comment_text, id, user_id]);
  return response.rows[0];
};

//DELETE /api/comments – Delete a comment the user has written.
const deleteComment = async({ id, user_id }) => {
  const SQL = `
    DELETE FROM comments
    WHERE id = $1 AND user_id = $2
  `;
  await client.query(SQL, [id, user_id]);
};

//GET /api/comments/:userId – View all comments the user has written.
const fetchUserComments = async(user_id) => {
  const SQL = `
    SELECT * FROM comments WHERE user_id = $1;
  `;
  const response = await client.query(SQL, [user_id]);
  return response.rows;
};



//ect extra?
// create a user
// create an item
const createItem = async({ name, details, rating, reviews_id })=> {
  const SQL = `
    INSERT INTO items(id, name, details, rating, reviews_id) VALUES($1, $2, $3, $4, $5) RETURNING *;
  `;
  const response = await client.query(SQL, [uuid.v4(), name, details, rating, reviews_id]);
  return response.rows[0];
}

// fetch all users
const fetchUsers = async()=> {
  const SQL = `
    SELECT * FROM users;
  `;
  const response = await client.query(SQL);
  return response.rows;
}
  



  module.exports = {
    client,
    createTables,
    signUp,
    logIn,
    createItem,
    fetchUsers,
    fetchItems,
    searchItems,
    fetchUserReviews,
    fetchItemDetails,
    createReview,
    updateReview,
    deleteReview, 
    createComment,
    updateComment,
    deleteComment,
    fetchUserComments
  };