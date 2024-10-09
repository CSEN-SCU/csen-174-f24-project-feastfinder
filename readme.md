
## GOALS:

1. connect server to firebase
    - connect to database -> read data / write data [X]
    - google sign in 
2. connect server to socket.io???
3. connect server to api request to yelp??

## Ideal struct of database: (Note: try to keep db as flat as possible)

`<pre>
FeastFinderdb
      |--- Users
            |- rand id
                  |- user name
                  |- password
                  |- age
                  |- preferences
                  |- groups names
            |- ...
      |--- Groups
            |- group name
                  |- member user name : true
                  |- ...
      |--- cache of resturant?
      |--- ??
</pre>`

## Useful git command

- `git add *` or `git add .` &rarr; add all files to staging area
    - `git status` &rarr; check all files and see which are added to staging area and which arent

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

- link to database console: [here](https://console.firebase.google.com/u/3/project/csen174-feastfinder/database/csen174-feastfinder-default-rtdb/data)

- Note: database log in with dthuita2002 gmail account

## Server addons?

- run node with `node <filename>.js`
- npm package express helps with server http stuff?
- nodemon for keeping server running?