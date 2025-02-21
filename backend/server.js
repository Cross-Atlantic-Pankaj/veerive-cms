import express from 'express'
import cors from 'cors'
import configDB from './config/db.js'
import dotenv from 'dotenv'
import passport from 'passport'
import setupOAuthStrategies from './config/oauthConfig.js'
import oauthRouth from './oauthRoutes.js'
import { checkSchema } from 'express-validator'
import {
  userRegisterSchema,
  userLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateEmailSchema
} from './app/validators/user-validator.js';
// import { userLoginSchema, userRegisterSchema } from './app/validators/user-validation-schema.js'
import {authenticateUser, conditionalAuth, checkPasswordExpiry }from './app/middlewares/authenticateUser.js'
import authorizeUser from './app/middlewares/authorizeUser.js'
import registerCltr from './app/controllers/register-cltr.js'
import usersCltr from './app/controllers/users-cltr.js'
import rolesCltr from './app/controllers/roles-cltr.js'
import profilesCltr from './app/controllers/profiles-cltr.js'

import contextsCltr from './app/controllers/contexts-cltr.js'
import postsCltr from './app/controllers/posts-cltr.js'
import postTypesCltr from './app/controllers/postTypes-cltr.js'

import companiesCltr from './app/controllers/companies-cltr.js'
import regionsCltr from './app/controllers/regions-cltr.js'
import countriesCltr from './app/controllers/countries-cltr.js'
import sectorsCltr from './app/controllers/sectors-cltr.js'
import subSectorsCltr from './app/controllers/subSectors-cltr.js'
import signalsCltr from './app/controllers/signals-cltr.js'
import subSignalsCltr from './app/controllers/subSignals-cltr.js'
import sourcesCltr from './app/controllers/sources-cltr.js'
import themesCltr from './app/controllers/themes-cltr.js'
import storyOrdersCltr from './app/controllers/storyOrders-cltr.js'

dotenv.config()

const app = express()

console.log('Environment Variables:', {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
});


 //app.use(cors())

// app.use(cors({
//   origin: 'https://veerive-frontend.vercel.app', // Allow your Vercel frontend
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
//   credentials: true, // Allow cookies and credentials if needed
//   allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
// }));

// const allowedOrigins = [
//   'http://localhost:3001', // Add your local development origin
//   'https://veerive-oct7.vercel.app',
//   'https://veerive-frontend.vercel.app'
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     // If the request origin is in the allowedOrigins array or is undefined (for server-to-server requests), allow it
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
//   credentials: true, // Allow credentials (e.g., cookies, authorization headers)
//   allowedHeaders: ['Content-Type', 'Authorization'] // Allow specific headers
// }));

// app.options('*', cors()); // Allow preflight requests on all routes

const allowedOrigins = [
  'http://localhost:3000', // User frontend
  'http://localhost:3001', // Admin Development
  'https://veerive-oct7.vercel.app', // Staging
  'https://veerive-frontend.vercel.app', // Production
];

// Remove the redundant `app.use(cors())`

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow requests from whitelisted origins
      } else {
        callback(new Error('Not allowed by CORS')); // Reject other origins
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allowed HTTP methods
    credentials: true, // Allow cookies or credentials
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers for secure requests
  })
);

app.options('*', cors()); // Preflight requests for all routes


configDB()

// Initialize Passport and OAuth Strategies
setupOAuthStrategies();
app.use(passport.initialize());

// Middleware to parse JSON
app.use(express.json())


// User routes
app.post('/api/users/register', conditionalAuth,checkSchema(userRegisterSchema), usersCltr.register);
app.post('/api/users/login', checkPasswordExpiry,checkSchema(userLoginSchema), usersCltr.login);
app.post('/api/users/forgot-password', checkSchema(forgotPasswordSchema), usersCltr.forgotPassword);
app.post('/api/users/reset-password', checkSchema(resetPasswordSchema), usersCltr.resetPassword);
app.put('/api/users/update-password', authenticateUser, checkSchema(updatePasswordSchema), usersCltr.updatePassword);
app.put('/api/users/update-email', authenticateUser, checkSchema(updateEmailSchema), usersCltr.updateEmail);

app.get('/api/users/account', authenticateUser,checkPasswordExpiry, usersCltr.account);
app.get('/api/users/list', authenticateUser, authorizeUser(['Admin', 'Moderator']), usersCltr.list);
app.delete('/api/users/:id', authenticateUser, authorizeUser(['Admin']), usersCltr.destroy);
app.put('/api/users/change-role/:id', authenticateUser, authorizeUser(['Admin']), usersCltr.changeRole);

// OAuth Routes
app.use('/api/auth', oauthRouth);

//profile routes
app.get('/api/profiles', authenticateUser, profilesCltr.list)
app.put('/api/profiles/:id', authenticateUser, profilesCltr.update)
//app.post('/api/profiles', profilesCltr.create) //- this is happening during registration

// Role types routes - blocked - add from schema
//app.get('/api/roles', authenticateUser, authorizeUser(['Admin']), rolesCltr.list)
//app.post('/api/roles', authenticateUser, authorizeUser(['Admin']), rolesCltr.create)
//app.put('/api/roles/:id', authenticateUser, authorizeUser(['Admin']), rolesCltr.update)
//app.delete('/api/roles/:id', authenticateUser, authorizeUser(['Admin']), rolesCltr.delete)

// context routes
app.get('/api/contexts', authenticateUser, contextsCltr.list)
//admin routes
app.get('/api/admin/contexts', authenticateUser, authorizeUser(['Admin', 'Moderator']), contextsCltr.list)
app.get('/api/admin/contexts/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), contextsCltr.show)
app.get('/api/admin/posts/:postId/contexts', authenticateUser, authorizeUser(['Admin', 'Moderator']), contextsCltr.postContext)
app.post('/api/admin/contexts', authenticateUser, authorizeUser(['Admin', 'Moderator']), contextsCltr.create)
app.put('/api/admin/contexts/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), contextsCltr.update)
app.put('/api/admin/contexts/:contextId/postId', authenticateUser, authorizeUser(['Admin', 'Moderator']), contextsCltr.updatePostId) // for updating postId in context when a post is saved
app.delete('/api/admin/contexts/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), contextsCltr.delete)
// ✅ Route for fetching all posts (for Context Form)
app.get('/api/admin/posts/all', authenticateUser, authorizeUser(['Admin', 'Moderator']), postsCltr.getAllPosts);

// ✅ Route for fetching all contexts (for Post Form)
app.get('/api/admin/contexts/all', authenticateUser, authorizeUser(['Admin', 'Moderator']), contextsCltr.getAllContexts);

// post routes
app.get('/api/posts', authenticateUser, postsCltr.list)
//admin routes
app.get('/api/admin/posts', authenticateUser, authorizeUser(['Admin', 'Moderator']), postsCltr.list)
app.get('/api/admin/posts/date', authenticateUser, authorizeUser(['Admin', 'Moderator']), postsCltr.date)
app.post('/api/admin/posts', authenticateUser, authorizeUser(['Admin', 'Moderator']), postsCltr.create)
app.put('/api/admin/posts/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), postsCltr.update)
app.delete('/api/admin/posts/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), postsCltr.delete)

// post-type routes
app.get('/api/post-types', authenticateUser, postTypesCltr.list)
//admin routes
app.get('/api/admin/post-types', authenticateUser, authorizeUser(['Admin', 'Moderator']), postTypesCltr.list)
app.post('/api/admin/post-types', authenticateUser, authorizeUser(['Admin', 'Moderator']), postTypesCltr.create)
app.put('/api/admin/post-types/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), postTypesCltr.update)
app.delete('/api/admin/post-types/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), postTypesCltr.delete)

//themes routes
app.get('/api/themes', authenticateUser, themesCltr.list)

//admin routes
app.get('/api/admin/themes', authenticateUser, authorizeUser(['Admin', 'Moderator']), themesCltr.list)
app.post('/api/admin/themes', authenticateUser, authorizeUser(['Admin', 'Moderator']), themesCltr.create)
app.put('/api/admin/themes/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), themesCltr.update)
app.delete('/api/admin/themes/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), themesCltr.delete)

//company routes
app.get('/api/companies', authenticateUser, companiesCltr.list)

//admin routes
app.get('/api/admin/companies', authenticateUser, authorizeUser(['Admin', 'Moderator']), companiesCltr.list)
app.post('/api/admin/companies', authenticateUser, authorizeUser(['Admin', 'Moderator']), companiesCltr.create)
app.put('/api/admin/companies/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), companiesCltr.update)
app.delete('/api/admin/companies/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), companiesCltr.delete)

// region routes
app.get('/api/regions', authenticateUser, regionsCltr.list)

//admin routes
app.get('/api/admin/regions', authenticateUser, authorizeUser(['Admin', 'Moderator']), regionsCltr.list)
app.post('/api/admin/regions', authenticateUser, authorizeUser(['Admin', 'Moderator']), regionsCltr.create)
app.put('/api/admin/regions/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), regionsCltr.update)
app.delete('/api/admin/regions/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), regionsCltr.delete)

// country routes
app.get('/api/countries', authenticateUser, countriesCltr.list)

//admin routes
app.get('/api/admin/countries', authenticateUser, authorizeUser(['Admin', 'Moderator']), countriesCltr.list)
app.post('/api/admin/countries', authenticateUser, authorizeUser(['Admin', 'Moderator']), countriesCltr.create)
app.put('/api/admin/countries/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), countriesCltr.update)
app.delete('/api/admin/countries/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), countriesCltr.delete)

// sector routes
app.get('/api/sectors', authenticateUser, sectorsCltr.list)

//admin routes
app.get('/api/admin/sectors', authenticateUser, authorizeUser(['Admin', 'Moderator']), sectorsCltr.list)
app.post('/api/admin/sectors', authenticateUser, authorizeUser(['Admin', 'Moderator']), sectorsCltr.create)
app.put('/api/admin/sectors/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), sectorsCltr.update)
app.delete('/api/admin/sectors/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), sectorsCltr.delete)

// sub-sector routes
app.get('/api/sub-sectors', authenticateUser, subSectorsCltr.list)

//admin routes
app.get('/api/admin/sub-sectors', authenticateUser, authorizeUser(['Admin', 'Moderator']), subSectorsCltr.list)
app.post('/api/admin/sub-sectors', authenticateUser, authorizeUser(['Admin', 'Moderator']), subSectorsCltr.create)
app.put('/api/admin/sub-sectors/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), subSectorsCltr.update)
app.delete('/api/admin/sub-sectors/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), subSectorsCltr.delete)

// source routes
app.get('/api/sources', authenticateUser, sourcesCltr.list)

//admin routes
app.get('/api/admin/sources', authenticateUser, authorizeUser(['Admin', 'Moderator']), sourcesCltr.list)
app.post('/api/admin/sources', authenticateUser, authorizeUser(['Admin', 'Moderator']), sourcesCltr.create)
app.put('/api/admin/sources/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), sourcesCltr.update)
app.delete('/api/admin/sources/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), sourcesCltr.delete)

// signal routes
app.get('/api/signals', authenticateUser, signalsCltr.list)

//admin routes
app.get('/api/admin/signals', authenticateUser, authorizeUser(['Admin', 'Moderator']), signalsCltr.list)
app.post('/api/admin/signals', authenticateUser, authorizeUser(['Admin', 'Moderator']), signalsCltr.create)
app.put('/api/admin/signals/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), signalsCltr.update)
app.delete('/api/admin/signals/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), signalsCltr.delete)

// sub-signal routes
app.get('/api/sub-signals', authenticateUser, subSignalsCltr.list)

//admin routes
app.get('/api/admin/sub-signals', authenticateUser, authorizeUser(['Admin', 'Moderator']), subSignalsCltr.list)
app.post('/api/admin/sub-signals', authenticateUser, authorizeUser(['Admin', 'Moderator']), subSignalsCltr.create)
app.put('/api/admin/sub-signals/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), subSignalsCltr.update)
app.delete('/api/admin/sub-signals/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), subSignalsCltr.delete)

// source routes
app.get('/api/story-orders', authenticateUser, storyOrdersCltr.list)

//admin routes
app.get('/api/admin/story-orders', authenticateUser, authorizeUser(['Admin', 'Moderator']), storyOrdersCltr.list)
app.post('/api/admin/story-orders', authenticateUser, authorizeUser(['Admin', 'Moderator']), storyOrdersCltr.create)
app.put('/api/admin/story-orders/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), storyOrdersCltr.update)
app.delete('/api/admin/story-orders/:id', authenticateUser, authorizeUser(['Admin', 'Moderator']), storyOrdersCltr.delete)

// Route to serve data deletion instructions
app.get('/data-deletion.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'data-deletion.html'));
});


const port = process.env.PORT || 3050

app.listen(port, () => {
    console.log('server is running on port', port)
})
