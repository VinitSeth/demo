const express = require('express');
const { add, get } = require('../data/user');
const { createJSONToken, isValidPassword } = require('../util/auth');
const { isValidEmail, isValidText } = require('../util/validation');
const msal = require('@azure/msal-node');

const router = express.Router();

router.post('/signup', async (req, res, next) => {
  const data = req.body;
  let errors = {};

  if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email.';
  } else {
    try {
      const existingUser = await get(data.email);
      if (existingUser) {
        errors.email = 'Email exists already.';
      }
    } catch (error) {}
  }

  if (!isValidText(data.password, 6)) {
    errors.password = 'Invalid password. Must be at least 6 characters long.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: 'User signup failed due to validation errors.',
      errors,
    });
  }

  try {
    const createdUser = await add(data);
    const authToken = createJSONToken(createdUser.email);
    res
      .status(201)
      .json({ message: 'User created.', user: createdUser, token: authToken });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  let user;
  try {
    user = await get(email);
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed.' });
  }

  const pwIsValid = await isValidPassword(password, user.password);
  if (!pwIsValid) {
    return res.status(422).json({
      message: 'Invalid credentials.',
      errors: { credentials: 'Invalid email or password entered.' },
    });
  }

  const token = createJSONToken(email);
  res.json({ token });
});



// MSAL Configuration
const msalConfig = {
  auth: {
    clientId: "caae822c-8c80-4b57-ad15-9fe8759d7e37",
    authority: "https://login.microsoftonline.com/b74ebfb9-6485-4ad0-86e6-76d883c78e7e", // Replace with your Azure AD Tenant ID - b74ebfb9-6485-4ad0-86e6-76d883c78e7e sethvinit98outlook.onmicrosoft.com
    clientSecret: "5b224f3f-45dd-4e5a-8581-0ceaba7c0b7d"
  },
};

const msalClient = new msal.ConfidentialClientApplication(msalConfig)

router.post('/sso', async(req,res,next) => {
  const {code} = req.body;

  if(!code) {
    return res.status(400).json({message: 'Authorization code is required.'});
  }

  const tokenRequest = {
    code,
    scopes: ['user.read'],
    redirectUri: "http://localhost:3000"
  }

  try {
    // EXchange the authorization code for an access token
    const tokenResponse = await msalClient.acquireTokenByCode(tokenRequest);

    // Extract user information from the ID token
    const {preferred_username, name} = tokenResponse.idTokenClaims;

    // Check if the user exists in the DB
    let user = await get(preferred_username);
    if(!user){
      user = await add({
        email: preferred_username,
        name,
      });
    }

        // Generate a JWT for the user
        const token = createJSONToken(preferred_username);

        res.json({
          message: 'SSO Login successful.',
          user,
          token,
        });
  } catch (error) {
    console.error('SSO Login error:', error);
    res.status(500).json({ message: 'Failed to log in with SSO.' });
  }
} )


// SSO login route

// router.post('/sso', async (req,res) => {
//   const email = req.body.email;

//   if(!isValidEmail(email)){
//     return res.status(422).json({
//       message : 'Invalid email format',
//     });
//   }

//   let user;
//   try {
//     user = await get(email);
//   } catch (error) {
//     return res.status(401).json({ message: 'Authentication failed.' });
//   }

//   const token = createJSONToken(email);
//   res.json({message: 'SSO login successful.', token})
// })

module.exports = router;
