Pushing the code to github for the first time
https://www.youtube.com/watch?v=wrb7Gge9yoE&t=10s
- Create a new repository on github
- follow other steps as detailed in the video

OR FOLLOW THE STEPS BELOW:
If You Haven’t Set Up a Remote Repository Yet:
Link Your Local Repository to GitHub: Add the remote repository URL (your GitHub repository URL) to your local repository. Run the following command:

bash
Copy code
git remote add origin https://github.com/username/repository-name.git
Replace username with your GitHub username and repository-name with your repository's name.

Push for the First Time: If you're pushing for the first time or setting a default branch, you might need to run:

bash
Copy code
git push -u origin <branch-name>
This sets the upstream branch for future pushes and pulls.
=========================================================================
PULL THE CODE FROM GITHUB

Pull Latest Changes from GitHub: Before starting development, ensure your local environment is up to date:

git pull origin <branch-name>  # Pull the latest changes

=========================================================================

PUSH UPDATED CODE TO GITHUB

Steps to Push Updated Code to GitHub:
1. Navigate to Your Local Project Directory
Open your terminal (or command prompt) and navigate to the root folder of your project repository on your local machine. Use the cd command to change the directory.

Example:

bash
Copy code
cd /path/to/your/project
2. Check the Git Status
Check the status of your repository to see which files have been changed, added, or deleted since your last commit.

git status
This will list the files that have been modified or newly created but not yet added to the repository.

3. Add the Changes to the Staging Area
Use the git add command to add the modified and newly created files to the staging area, preparing them to be committed.

To add all the changes (modified, added, and deleted files), run:

bash
Copy code
git add .
Alternatively, if you want to add individual files, use:

bash
Copy code
git add <file-path>
Example:

bash
Copy code
git add index.js
4. Commit the Changes
After adding your changes to the staging area, commit them with a meaningful commit message that describes what you've changed.

bash
Copy code
git commit -m "Your commit message here"
Example:

bash
Copy code
git commit -m "Added new feature for database sync and fixed bugs"
5. Push the Changes to GitHub
Now, push your committed changes to the remote GitHub repository using the git push command.

bash
Copy code
git push origin <branch-name>
Replace <branch-name> with the name of the branch you're working on (e.g., main, master, develop).
Example:

bash
Copy code
git push origin main
If this is your first time pushing, you might need to enter your GitHub credentials. If you are using GitHub Personal Access Tokens (required for newer GitHub versions due to deprecation of password authentication), you will use your token as the password when prompted.

To find out which branch you're on, you can run the following command in your project directory:

bash
Copy code
git branch
This will list all the branches in your local repository and put a * next to the branch you're currently on.

Example output:

css
Copy code
* main
  develop
  feature-branch
In this case, you're on the main branch because of the * next to main.

Common Branch Names:

main or master: These are the most commonly used branch names for the primary codebase.
If you're using GitHub and you set up the repository recently, it's likely that the default branch is named main (older repositories may still use master).
develop: Some teams use this branch for ongoing development.
Feature branches: You may also have feature branches like feature-branch, which developers use to work on specific features.
What to Use for <branch-name>:
If you're unsure which branch to use, you can typically use the main branch unless your project is configured differently.
To verify, run the git branch command as shown above.
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
6. Verify the Changes on GitHub
Go to your GitHub repository in your web browser and verify that the changes have been successfully pushed to the repository.

==================================================================
PUSHING DB FROM COMPASS TO ATLAS

1. STEP 1 - GO TO C:\Program Files\MongoDB\mongodb-database-tools-windows-x86_64-100.10.0\bin\
AND RUN MONGODUMP.EXE. iT WILL CREATE A DUMP FILE IN THE SAME FOLDER.
2. STEP 2 - GO TO COMMAND PROMPT AND RUN THE FOLLOWING COMMAND
mongorestore --uri "mongodb+srv://chaubeyp@veerive.tta8g.mongodb.net/veerive-db-v1?retryWrites=true&w=majority" "C:\Program Files\MongoDB\mongodb-database-tools-windows-x86_64-100.10.0\bin\dump\veerive-db-v1"

ORIGINAL CONNECTION STRING - NOTE PASSWORD AND APPNAME ATTRIBUTE HAS BEEN REMOVED
mongorestore --uri "mongodb+srv://chaubeyp:<password>@veerive.tta8g.mongodb.net/?retryWrites=true&w=majority&appName=veerive" C:\Program Files\MongoDB\mongodb-database-tools-windows-x86_64-100.10.0\bin\dump\veerive-db-v1
ENTER PASSWORD AND IT WILL WORK
==================================================================

LOG OF CHANGES DONE ON GITHUB
1. Chnages to package.json in backend

2. Base URL in CMS/config/axios.js updated to https://veeriveoct5-1.onrender.com

4. Chnaged DB URL in db.js in backend to mongodb+srv://chaubeyp:ConsTrack360@veerive.tta8g.mongodb.net/?retryWrites=true&w=majority&appName=veerive

5. Commented containerProvider in App.js in cms

6. Commented // register route
    app.post('/api/users/register', registerCltr.create )

7. Added app.options('*', cors()); // Allow preflight requests on all routes in server.js

8. Server.js - cors
app.use(cors({
  origin: 'https://veerive-oct7.vercel.app', // Allow your Vercel frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  credentials: true, // Allow cookies and credentials if needed
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
}));

=========================================================================
SWITCHING FROM SERVER TO LOCAL AND VICE-VERSA

1. Changes to backend:
- server.js - change cors in local machine - app.use(cors()) and comment out server code

- env - DB URL for local machine - DB_URL=mongodb://localhost:27017/my-local-database
for server - 'mongodb+srv://chaubeyp:ConsTrack360@veerive.tta8g.mongodb.net/veerive-db?retryWrites=true&w=majority&appName=veerive';
2. Changes to CMS frontend
- in axios.js - REACT_APP_API_BASE_URL=http://localhost:3030
- in axios.js - REACT_APP_API_BASE_URL=https://veeriveoct5.onrender.com
