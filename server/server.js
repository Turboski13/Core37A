const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {
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
  } = require('./db');
  
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const SECRET_KEY = process.env.SECRET_KEY || 'shhhhh';

app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from React app
    credentials: true,
  }));

  app.use(express.json());



// get token from database

async function isCorrectJWTToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; 
  if (!token) {
    return res.status(401).send('Unauthorized, token missing');
  }
  try {
   jwt.verify(req.headers.authorization, SECRET_KEY);
          next();
      } catch (err) {
      res.status(401).send('Unauthorized, token invalid');
  }
}
// create user


//get all users
app.get('/api/users', async (req, res, next) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res, next) => {
  try {
    const response = await client.query("SELECT * FROM Users WHERE id = $1", [req.params.id]);
    const user = response.rows[0];
    const isCorrectJWTToken = await jwt.verify(user.token, SECRET_KEY);

    if (isCorrectJWTToken) {
      res.json(user);
    } else {
      res.status(401).send('Unauthorized');
    }
  } catch (err) {
    next(err);
  }
});

//user reviews by ID
app.get('/api/users/:id/reviews', async(req, res, next)=> {
  try {
    const reviews = await fetchUserReviews(req.params.id);
    res.json(reviews);
  }
  catch(ex){
    next(ex);
  }
});

//Fetch all items

app.get('/api/items', async(req, res, next)=> {
  try {
    const items = await fetchItems();
    res.json(items);
  } catch (err) {
    next(err);
  }
});


//Create a review
app.post('/api/users/:id/reviews', async(req, res, next)=> {
  try {
    const { item_id, rating, comments } = req.body;
    res.status(201).send(await createReview({ user_id: req.params.id, item_id, rating, comments }));
  }
  catch(ex){
    next(ex);
  }
});

//get a review by ID
app.get('/api/item/:id/reviews', async(req, res, next)=> {
  try {
    res.send(await fetchItemReviews(req.params.id));
  }
  catch(ex){
    next(ex);
  }
});


//Delete a review
app.delete('/api/users/:userId/reviews/:id', async(req, res, next)=> {
  try {
    await deleteReview({ id: req.params.id, user_id: req.params.userId });
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

//Update a review
app.put('/api/users/:userId/reviews/:id', async(req, res, next)=> {
  try {
    const { rating, comments } = req.body;
    res.send(await updateReview({ id: req.params.id, user_id: req.params.userId, rating, comments }));
  }
  catch(ex){
    next(ex);
  }
});

//Create a comment
app.post('/api/users/:userId/reviews/:reviewId/comments', async(req, res, next)=> {
  try {
    const { comment_text } = req.body;
    res.status(201).send(await createComment({ review_id: req.params.reviewId, user_id: req.params.userId, comment_text }));
  }
  catch(ex){
    next(ex);
  }
});

//get a comment by ID
app.get('/api/users/:userId/reviews/:reviewId/comments', async(req, res, next)=> {
  try {
    res.send(await fetchUserComments(req.params.userId, req.params.reviewId));
  }
  catch(ex){
    next(ex);
  }
});

//Delete a comment
app.delete('/api/users/:userId/reviews/:reviewId/comments/:id', async(req, res, next)=> {
  try {
    await deleteComment({ id: req.params.id, user_id: req.params.userId });
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

//update a comment
app.put('/api/users/:userId/reviews/:reviewId/comments/:id', async(req, res, next)=> {
  try {
    const { comment_text } = req.body;
    res.send(await updateComment({ id: req.params.id, user_id: req.params.userId, comment_text }));
  }
  catch(ex){
    next(ex);
  }
});

//search items
app.get('/api/items/search', async(req, res, next)=> {
  try {
    res.send(await searchItems(req.query.q));
  }
  catch(ex){
    next(ex);
  }
});

//get item details
app.get('/api/items/:id', async(req, res, next)=> {
  try {
    res.send(await fetchItemDetails(req.params.id));
  }
  catch(ex){
    next(ex);
  }
});

//sign up, create a user
app.post('/api/signup', async(req, res, next)=> {
  try {
    const { username, password } = req.body;
    res.status(201).send(await signUp({ username, password }));
  }
  catch(ex){
    next(ex);
  }
});

//log in
app.post('/api/login', async(req, res, next)=> {
  try {
    const { username, password } = req.body;
    const user = await logIn({ username, password });
    if (user) {
      const token = jwt.sign({ username: user.username }, SECRET_KEY);
      await client.query("UPDATE Users SET token  = $1 WHERE id = $2", [token, user.id]);
      res.json({ token });
    } else {
      res.status(401).send('Unauthorized');
    }
  }
  catch(ex){
    next(ex);
  }
});


const init = async()=> {
    await client.connect();
    console.log('connected to database');
    await createTables();
    console.log('tables created');

    // user buildout
    const [moe, lucy, ethyl] = await Promise.all([
      createUser({ username: 'moe', password: 's3cr3t' }),
      createUser({ username: 'lucy', password: 's3cr3t!!' }),
      createUser({ username: 'ethyl', password: 'shhh' })
    ]);
    //item buildout
    const [singing, dancing, juggling, plateSpinning] = await Promise.all([
      createItem({ name: 'singing' }),
      createItem({ name: 'dancing' }),
      createItem({ name: 'juggling' }),
      createItem({ name: 'plate spinning' })
    ]);
  //reviews
    await Promise.all([                                                        
        createReview({ user_id: moe.id, item_id: plateSpinning.id, rating: '5', comments: 'great'}),
        createReview({ user_id: moe.id, item_id: juggling.id, rating: '4', comments: 'good'}),
        createReview({ user_id: ethyl.id, item_id: juggling.id, rating: '3', comments: 'ok'}),
        createReview({ user_id: lucy.id, item_id: dancing.id, rating: '5', comments: 'great'}),
      ]);
    //comments
 await Promise.all([                                          
        createComment({ review_id: 1, user_id: moe.id, item_id: plateSpinning.id, comment_text: 'great. what a lost art.'}),
        createComment({ review_id: 2, user_id: ethyl.id, item_id: singing.id, comment_text: 'does not help me sing'}),
        createComment({ review_id: 3, user_id: ethyl.id, item_id: singing.id, comment_text: 'cannot carry a tune in a buycket'}),
        createComment({ review_id: 4, user_id: lucy.id, item_id: plateSpinning.id, comment_text: 'WTF is this? Who does plate spinning anymore?'}),
      ]);

    
      console.log('Data seeded');
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Error during initialization:', err);
  }
};

init();
