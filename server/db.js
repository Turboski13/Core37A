const pg = require('pg');
const express = require('express');
const app = express();
const port = 2000;
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_talent_agency_db'); ********************************
const uuid = require('uuid');
const bcrypt = require('bcrypt');

const createTables = async()=> {
  const SQL = `
    DROP TABLE IF EXISTS reviews;
    DROP TABLE IF EXISTS items;
    DROP TABLE IF EXISTS oauthusers;
    DROP TABLE IF EXISTS users;
    
    
    CREATE TABLE users(
      id UUID PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255)
    );

    CREATE TABLE oauthusers(                                  ********************************
      github_id UUID PRIMARY KEY,
      login VARCHAR(100) UNIQUE NOT NULL,
      access_token VARCHAR(255)
    );

    CREATE TABLE items(
      id UUID PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      details VARCHAR(255),
      rating VARCHAR(10),
      reviews_id UUID REFERENCES reviews(id)
    );

    CREATE TABLE reviews(                             ********************************              
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) NOT NULL,
      item_id UUID REFERENCES items(id) NOT NULL,
      rating VARCHAR(10),
      comments VARCHAR(255),
      CONSTRAINT unique_item_user UNIQUE (item_id, user_id)
    );
  `;
  await client.query(SQL);
};

// create a user
const createUser = async({ username, password })=> {
    const SQL = `
      INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *;
    `;
    const response = await client.query(SQL, [uuid.v4(), username, await bcrypt.hash(password, 5)]);
    return response.rows[0];
  
  }
  
  // create an Oauth user
  const createOauthUsers = async({ login })=> {
    const SQL = `
      INSERT INTO oauthusers(github_id, login, access_token) VALUES($1, $2, $3) RETURNING *;
    `;
    const response = await client.query(SQL, [uuid.v4(), login, uuid.v4()]);    //do I want to generate a token here?
    return response.rows[0];
  
  }

  // create an item
  const createItem = async({ name, details, rating, reviews_id })=> {
    const SQL = `
      INSERT INTO items(id, name, details, rating, reviews_id) VALUES($1, $2, $3, $4, $5) RETURNING *;
    `;
    const response = await client.query(SQL, [uuid.v4(), name, details, rating, reviews_id]);
    return response.rows[0];
  }
  // create a review
const createReview = async({ user_id, item_id, rating, comments })=> {
    const SQL = `
      INSERT INTO reviews(id, user_id, item_id, rating, comments) VALUES($1, $2, $3, $4, $5) RETURNING *;
    `;
    const response = await client.query(SQL, [uuid.v4(), user_id, item_id, rating, comments]);
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
  
  // fetch all items
  const fetchItems = async()=> {
    const SQL = `
      SELECT * FROM items;
    `;
    const response = await client.query(SQL);
    return response.rows;
  }

  //fetch review from a specific user
  const fetchUserReviews = async(id)=> {
    const SQL = `
      SELECT * FROM reviews
      WHERE user_id = $1
    `;
    const response = await client.query(SQL, [ id ]);
    return response.rows;
  }
  
//fetch review from a specific item
const fetchItemReviews = async(id)=> {
  const SQL = `
    SELECT * FROM reviews
    WHERE item_id = $1
  `;
  const response = await client.query(SQL, [ id ]);
  return response.rows;
}

// delete a review
  const deleteReview = async({id, user_id})=> {
    const SQL = `
      DELETE FROM reviews
      WHERE id = $1 AND user_id = $2
    `;
    await client.query(SQL, [ id, user_id ]);
  }



  module.exports = {
    client,
    createTables,
    createUser,
    createOauthUsers,
    createItem,
    fetchUsers,
    fetchOauthUsers,
    fetchItems,
    fetchUserReviews,
    fetchItemReviews,
    createReview,
    deleteReview
  };