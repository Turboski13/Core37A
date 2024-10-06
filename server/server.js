const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
const PORT = 8080;



/* const {
    client,
    createTables,
    createUser,
    createSkill,
    createUserSkill,
    fetchUsers,
    fetchSkills,
    fetchUserSkills,
    userUserSkill,
    deleteUserSkill
  } = require('./db');
const app = express();

app.get('/api/users', async(req, res, next)=> {
    try {
      res.send(await fetchUsers());
    }
    catch(ex){
      next(ex);
    }
  });
  
app.get('/api/skills', async(req, res, next)=> {
    try {
      res.send(await fetchSkills());
    }
    catch(ex){
      next(ex);
    }
  });

app.get('/api/users/:id/userSkills', async(req, res, next)=> {
    try {
      res.send(await fetchUserSkills(req.params.id));
    }
    catch(ex){
      next(ex);
    }
  });

app.post('/api/users/:id/userSkills', async(req, res, next)=> {
    try {
      res.status(201).send(await createUserSkill({ user_id: req.params.id, skill_id: req.body.skill_id}));
    }
    catch(ex){
      next(ex);
    }
  });
  
app.delete('/api/users/:userId/userSkills/:id', async(req, res, next)=> {
    try {
      await deleteUserSkill({ id: req.params.id, user_id: req.params.userId });
      res.sendStatus(204);
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
    const [moe, lucy, ethyl, singing, dancing, juggling, plateSpinning] = await Promise.all([
      createUser({ username: 'moe', password: 's3cr3t' }),
      createUser({ username: 'lucy', password: 's3cr3t!!' }),
      createUser({ username: 'ethyl', password: 'shhh' }),
      createSkill({ name: 'singing'}),
      createSkill({ name: 'dancing'}),
      createSkill({ name: 'juggling'}),
      createSkill({ name: 'plate spinning'}),
    ]);
    const users = await fetchUsers();
    console.log(users);
  
    const skills = await fetchSkills();
    console.log(skills);
  
    const userSkills = await Promise.all([
        createUserSkill({ user_id: moe.id, skill_id: plateSpinning.id}),
        createUserSkill({ user_id: moe.id, skill_id: juggling.id}),
        createUserSkill({ user_id: ethyl.id, skill_id: juggling.id}),
        createUserSkill({ user_id: lucy.id, skill_id: dancing.id}),
      ]);
    
      console.log(await fetchUserSkills(moe.id));
      await deleteUserSkill({ user_id: moe.id, id: userSkills[0].id});
      console.log(await fetchUserSkills(moe.id));
    
      console.log(`curl localhost:3000/api/users/${ethyl.id}/userSkills`);
    
      console.log(`curl -X POST localhost:3000/api/users/${ethyl.id}/userSkills -d '{"skill_id": "${dancing.id}"}' -H 'Content-Type:application/json'`);
      console.log(`curl -X DELETE localhost:3000/api/users/${ethyl.id}/userSkills/${userSkills[3].id}`);
      
      console.log('data seeded');
    
      const port = process.env.PORT || 3000;
      app.listen(port, ()=> console.log(`listening on port ${port}`));
    };
    
    init();

  */
 
 
 


app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from React app
  credentials: true,
}));
app.use(express.json());

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
      console.log(userData);

     await pool.query("INSERT INTO oauthusers (github_id,login, access_token) VALUES ($1, $2, $3)", [userData.id, userData.login, accessToken]);
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
      console.log('Received GitHub ID:', req.params.id);
      const { id } = req.params;
  
      try {
          // Find the user by GitHub ID in the database
          const result = await pool.query('SELECT github_id, login FROM users WHERE github_id = $1', [id]);
          console.log(result)
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
  
  
  app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
  });