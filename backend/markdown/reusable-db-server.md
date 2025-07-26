db.js

import mongoose from "mongoose";

const configDB = async () => {

    const dbConnection = await mongoose.connect(process.env.DB_URL)
    const dbName = dbConnection.connection.name
    console.log('connected to database', dbName)
}

export default configDB

=============================================================================
ENV

PORT=3030
DB_URL=mongodb://127.0.0.1:27017/veerive-db-v1
JWT_SECRET=ctbi@2507

=============================================================================

SERVER 

import express from 'express'
import cors from 'cors'
import configDB from './config/db.js'
import dotenv from 'dotenv'
// import { checkSchema } from 'express-validator'
// import { userLoginSchema, userRegisterSchema } from './app/validators/user-validation-schema.js'
import authenticateUser from './app/middlewares/authenticateUser.js'
import authorizeUser from './app/middlewares/authorizeUser.js'
....other controllers

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
configDB()

////sample route
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

/////////////

const port = process.env.PORT || 3050

app.listen(port, () => {
    console.log('server is running on port', port)
})