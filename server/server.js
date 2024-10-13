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
   jwt.verify(token, SECRET_KEY);
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
    const isCorrectJWTToken = jwt.verify(user.token, SECRET_KEY);

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
  catch(err){
    next(err);
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
    const review = await createReview({ user_id: req.params.id, item_id, rating, comments });
    res.status(201).send(review);
  }
  catch(err){
    next(err);
  }
});

//get a review by ID
app.get('/api/item/:id/reviews', async(req, res, next)=> {
  try {
    const reviews = await fetchItemReviews(req.params.id); 
    res.json(reviews);
  }
  catch(err){
    next(err);
  }
});


//Delete a review
app.delete('/api/users/:userId/reviews/:id', async(req, res, next)=> {
  try {
    await deleteReview({ id: req.params.id, user_id: req.params.userId });
    res.sendStatus(204);
  }
  catch(err){
    next(err);
  }
});

//Update a review
app.put('/api/users/:userId/reviews/:id', async(req, res, next)=> {
  try {
    const { rating, comments } = req.body;
    res.send(await updateReview({ id: req.params.id, user_id: req.params.userId, rating, comments }));
  }
  catch(err){
    next(err);
  }
});

//Create a comment
app.post('/api/users/:userId/reviews/:reviewId/comments', async(req, res, next)=> {
  try {
    const { comment_text } = req.body;
    const comment = await createComment({ review_id: req.params.reviewId, user_id: req.params.userId, comment_text });
    res.status(201).send(comment); 
  }
  catch(err){
    next(err);
  }
});

//get a comment by ID
app.get('/api/users/:userId/reviews/:reviewId/comments', async(req, res, next)=> {
  try {
    const comments = await fetchUserComments(req.params.userId, req.params.reviewId);
    res.json(comments);
  }
  catch(err){
    next(err);
  }
});

//Delete a comment
app.delete('/api/users/:userId/reviews/:reviewId/comments/:id', async(req, res, next)=> {
  try {
    await deleteComment({ id: req.params.id, user_id: req.params.userId });
    res.sendStatus(204);
  }
  catch(err){
    next(err);
  }
});

//update a comment
app.put('/api/users/:userId/reviews/:reviewId/comments/:id', async(req, res, next)=> {
  try {
    const { comment_text } = req.body;
    const comment = await updateComment({ id: req.params.id, user_id: req.params.userId, comment_text });
    res.send(comment);
  }
  catch(ex){
    next(ex);
  }
});

//search items
app.get('/api/items/search', async(req, res, next)=> {
  try {
    const items = await searchItems(req.query.q);
    res.json(items);
  }
  catch(ex){
    next(ex);
  }
});

//get item details
app.get('/api/items/:id', async(req, res, next)=> {
  try {
    const itemDetails = await fetchItemDetails(req.params.id);
    res.json(itemDetails);
  }
  catch(ex){
    next(ex);
  }
});

//sign up, create a user
app.post('/api/signup', async(req, res, next)=> {
  try {
    const { username, password } = req.body;
    const user = await signUp({ username, password });
    res.status(201).send(user); 
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
  catch(err){
    next(err);
  }
});

//average rating
app.get('/api/items/:id', async (req, res, next) => {
  try {
    const itemDetails = await fetchItemDetails(req.params.id);
    const result = await client.query("SELECT AVG(rating) AS avg_rating FROM Reviews WHERE item_id = $1", [req.params.id]);
    const avgRating = result.rows[0].avg_rating;

    res.json({
      ...itemDetails,
      average_rating: avgRating ? parseFloat(avgRating).toFixed(2) : 'No ratings yet' // Rounded to 2 decimal places
    });
  } catch (err) {
    next(err);
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
  };

init();
