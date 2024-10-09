const express = require('express');
const cors = require('cors');
require('dotenv').config();
const PORT = 8080;
const client = new pg.Client('postgres://localhost:5432/2405-ftb-et-web-pt')
const bcrypt = require('bcrypt');
app.use(express.json());

const {
    /* client,
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
    deleteReview */
  } = require('./db');
const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from React app
  credentials: true,
}));



// GitHub OAuth route - redirect to GitHub for authentication
app.get('/auth/github', (req, res) => {
  const redirect_uri = 'http://localhost:8080/auth/github/callback';
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirect_uri}&scope=user:email`;
  res.redirect(githubAuthUrl);
});

// OAuth callback handler
app.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query; // github sends code in query params
  // console.log('Received GitHub callback', code);

  try {
      // Exchange code for access token - step 1
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
          },
          body: JSON.stringify({
              client_id: process.env.GITHUB_CLIENT_ID,
              client_secret: process.env.GITHUB_CLIENT_SECRET,
              code,
          }),
      });

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

  //     // Get user info using access token - step 2 
      const userResponse = await fetch('https://api.github.com/user', {
          headers: {
              Authorization: `Bearer ${accessToken}`,
          },
      });

      const userData = await userResponse.json();
      

     await client.query(
      "INSERT INTO oauthusers (github_id,login, access_token) VALUES ($1, $2, $3)", [userData.id, userData.login, accessToken]);
      // // Redirect back to frontend with the user ID
      res.redirect(`http://localhost:5173?user_id=${userData.id}`);
  //     // console.log(response);
  } catch (error) {
      console.error('Error fetching access token or user info', error);
      res.status(500).json({ error: 'Failed to authenticate with GitHub' });
  }
});
   
  
  // API route to get the user data from PostgreSQL using GitHub ID
  app.get('/api/github/user/:id', async (req, res) => {
      /* console.log('Received GitHub ID:', req.params.id); */
      const { id } = req.params;
  
      try {
          // Find the user by GitHub ID in the database
          const result = await client.query('SELECT github_id, login FROM users WHERE github_id = $1', [id]);
          /* console.log(result) */
          if (result.rows.length === 0) {
              return res.status(404).json({ error: 'User not found' });
          }
  
          // Return user data
          const user = result.rows[0];
          res.json({
              github_id: user.github_id,
              login: user.login,
          });
      } catch (error) {
          console.error('Error fetching user from database', error);
          res.status(500).json({ error: 'Failed to fetch user' });
      }
  });
  
  
 
// now to build out the app.gets


app.get('/api/users', async(req, res, next)=> {
  try {
    res.send(await fetchUsers());
  }
  catch(ex){
    next(ex);
  }
});


app.get('/api/items', async(req, res, next)=> {
    try {
      res.send(await fetchItems());
    }
    catch(ex){
      next(ex);
    }
  });


app.get('/api/users/:id/reviews', async(req, res, next)=> {
    try {
      res.send(await fetchUserReviews(req.params.id));
    }
    catch(ex){
      next(ex);
    }
  });

app.get('/api/item/:id/reviews', async(req, res, next)=> {
    try {
      res.send(await fetchItemReviews(req.params.id));
    }
    catch(ex){
      next(ex);
    }
  });


// now to build out the app.posts

app.post('/api/users/:id/reviews', async(req, res, next)=> {
  try {
    const { item_id, rating, comments } = req.body;
    res.status(201).send(await createReview({ user_id: req.params.id, item_id, rating, comments }));
  }
  catch(ex){
    next(ex);
  }
});

// now to build out the app.deletes

app.delete('/api/users/:userId/reviews/:id', async(req, res, next)=> {
    try {
      await deleteReview({ id: req.params.id, user_id: req.params.userId });
      res.sendStatus(204);
    }
    catch(ex){
      next(ex);
    }
  });

  app.delete('/api/item/:itemId/reviews/:id', async(req, res, next)=> {
    try {
      await deleteReview({ id: req.params.id, item_id: req.params.itemId  });
      res.sendStatus(204);
    }
    catch(ex){
      next(ex);
    }
  });








//do I seed here, or should I build a seed file? *************************************************************************


  const init = async()=> {
    await client.connect();
    console.log('connected to database');
    await createTables();
    console.log('tables created');
    /* const [moe, lucy, ethyl, singing, dancing, juggling, plateSpinning] = await Promise.all([
      createUser({ username: 'moe', password: 's3cr3t' }),
      createUser({ username: 'lucy', password: 's3cr3t!!' }),
      createUser({ username: 'ethyl', password: 'shhh' }),
      createSkill({ name: 'singing'}),
      createSkill({ name: 'dancing'}),
      createSkill({ name: 'juggling'}),
      createSkill({ name: 'plate spinning'}),
    ]); */
    const users = await fetchUsers();
    console.log(users);
  
    const skills = await fetchItems();
    console.log(items);
  
    /* const userSkills = await Promise.all([
        createUserSkill({ user_id: moe.id, skill_id: plateSpinning.id}),
        createUserSkill({ user_id: moe.id, skill_id: juggling.id}),
        createUserSkill({ user_id: ethyl.id, skill_id: juggling.id}),
        createUserSkill({ user_id: lucy.id, skill_id: dancing.id}),
      ]); */
    
      c/* onsole.log(await fetchUserReviews(X.id));
      await deleteReview({ user_id: X.id, id: reviews[0].id});
      console.log(await fetchUserReviews(moe.id));
    
      console.log(`curl localhost:3000/api/users/${XX.id}/reviews`);
    
      console.log(`curl -X POST localhost:3000/api/users/${XX.id}/reviews -d '{"skill_id": "${Y.id}"}' -H 'Content-Type:application/json'`);
      console.log(`curl -X DELETE localhost:3000/api/users/${XX.id}/reviews/${Y[3].id}`); */
      
      console.log('data seeded');
    
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('Error during initialization:', error);
    };
  
  init();
