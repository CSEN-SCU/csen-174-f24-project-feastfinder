

# server get and post routes have been combined with sockets 
two problems however:
- firebase set up isn't correct
- get and post routes can't be used because firebase isn't connected

## New Adds:
- working server sockets
- server socket tests (8 that should all pass)
- server routes and sockets in one file
- nodemon added to keep server running

## TO DO:
- diagrams of data expected by server at routes and sockets
- returns from sockets and routes and the form of that data
- add tests for routes once firebase available
- connect server to api request to yelp (do later, for demo just use fake data)

## TO RUN
- before starting server run cmd `npm i` to install all dependencies listed in package.json
- look at package.json 
- to run server
    - `npm run start`
- to run tests 
    - run server on one terminal then run tests on different terminal
    1. `npm run start` on first terminal
    2. `npm run server-test` on second terminal


## Useful git command

- `git add *` or `git add .` &rarr; add all files to staging area
    - `git status` &rarr; check all files and see which are added to staging area and which arent
    - `git reset` &rarr; remove all files from staging area

- `git commit -m "commit message"` &rarr; move staging area files to commit
    - `git log` &rarr; see history of all commits on branch

 - `git remote add origin https://github.com/CSEN-SCU/csen-174-f24-project-feastfinder.git` &rarr; adds remote git repo
    - `git remote` &rarr; check remote connections
    - `git remote -v` &rarr; see remote connections and links

- `git checkout -b <branch name>` &rarr; create new branch and set curr branch to new one
    - `git branch` &rarr; see all branches
    - `git branch -vv` &rarr; see branches and last commit message

- `git push <remote> <branch name>` &rarr; push commits to remote git repo


## database info 

- link to database console: [here](https://console.firebase.google.com/u/4/project/feast-finder-95126/firestore/databases/-default-/data/~2Fgroups~2Fgroup-1731294464471?utm_source=email&utm_medium=newsletter&utm_campaign=firebase-welcome)

- Note: database log in with scu gmail accounts
