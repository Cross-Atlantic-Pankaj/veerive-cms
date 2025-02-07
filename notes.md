========Basic Setup===============================
Backend Setup Steps
install dependencies - npm init -y express mongoose cors express-validator dotenv bcryptjs jsonwebtoken
Folder structure
-- app
--- models, validators, controllers, middlewares, routes
--- config --> db.js
-- index.js
Update env with port and db connection url
Start server in index.js
setup db in db.js
setup gitignore
===============================================================
Create model and schema
setup controllers and test through postman one by one. Create a folder structure for each modules and create CRUD requests

setup user authentication and authorization through middleware - req, res, next using jwt; attach id to req
-- check for errors through validationResult(req)
-- destructure body or fields from req.body
-- try - catch for subsequent steps in dealing with db communication
-- remember to pass token as     return res.status(200).json({token: token})


setup validations
-- add custom validation through async fn to check for email already exists during registration
setup routes in index.js or server.js - <route/url, validation through checkSchema / authentication for protected routes, controller>

final api testing
=============================================================
Frontend
================SETUP REACT================================
- npx create-react-app my-app
- Dependencies - npm install react-router-dom axios react-toastify
- npm start 
- create folders - components, config, reducers, pages, context
================SETUP INDEX AND BASIC NAVIGATION ROUTES==================================
Setup index.js and wrap App inside browserrouter

In App setup routes and create basic pages to render all UI
Setup Authentication Context
-- Context in context folder
-- AuthProvider component in components
-- in app import AuthContext and useContext 
-- in index wrap app in AuthProvider
Develop AuthProvider
-- Start inserting functions / actions that are required - just blank functions
-- All api calls should be in AuthProvider and not in pages

================PAGES==================================
submit form or retrieve info
do usual stuff - preventDefault, validations, create formData
then call function from parent component using context to pass on info

===================Context API=================================
Step 1: Inside context folder create context: e.g.:

import { createContext } from "react";
const NotesContext = createContext()
export default NotesContext

Step 2: In the parent file import context and wrap children while passing values

   return(
        <NotesContext.Provider value={{notes, notesDispatch}}>
        <div>
            <h2>My Notes</h2>
            <NotesList />
            <NotesForm />  
        </div>
        </NotesContext.Provider>
    )

Step 3: Use in children: e.g.

import { useContext } from "react"
import NotesContext from "../context/NotesContext"

export default function NotesList () {
    const {notes} = useContext(NotesContext)

    return(
      
        <ul>
            {notes.data.map((ele) => {
                return <li key={ele._id}>{ele.title}</li>
            })}
        </ul>
      
    )
}
======================handleRegister================================

======================handleLogin================================

======================handleLogout================================

======================handle page reload================================

***********************CRUD OPERATIONS*************************************************

list operation
axios.get('url', {headers: auth})

create operation
axios.post('url', formData, {headers: auth})

show operation
axios.get('url', {headers: auth})

update operation
axios.put('url', formData, {headers: auth})

delete operation
axios.delete('url', {headers: auth})


======================POST================================
======================GET================================
======================PUT / EDIT================================
1. introduce property --> state useReducer --> editid = null
2. insert button in UI
3. onClick set editId with selected ID
4. use editId inside the form using context API
5. perform a find of record and set the initial value of state - useEffect
6. onSubmit - if editid or note is present perform axios.put to update the record
7. dispatch UPDATE to reducer
8. else perform axios.post and dispatch ADD to reducer

======================DELETE================================


===================OTHER================================================
TOAST for notification:
-- install react-toastify and import ToastContainer from react-toastify in App + render it in App
-- import toast from react-toastify in component and then use - toast('Successfully Registered', { autoClose: 5000 })

Create config folder --> axios.js --> setup base URL
