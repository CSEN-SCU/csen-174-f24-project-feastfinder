
run node with [node <filename>.js]
npm package express helps with server http stuff?
nodemon for keeping server running?


GOALS: 
1. connect server to firebase
    a. connect to database -> read data / write data [X]
    b. google sign in 
2. connect server to socket.io???
3. connect server to api request to yelp??


ideal struct of database: (*try to keep db as flat as possible)

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


Useful git command

git add * [or] git add . -> add all files to staging area
    git status -> check all files and see which are added to staging area and which arent
git commit -m "commit message" -> move staging area files to commit
    git log -> see history of all commits on branch

 git remote add origin https://github.com/CSEN-SCU/csen-174-f24-project-feastfinder.git -> adds remote git repo
    git remote -> check remote connections
    git remote -v -> see remote connections and links

git checkout -b <branch name> -> create new branch and set curr branch to new one
    git branch -> see all branches
    git branch -vv -> see branches and last commit message

git push <remote> <branch name> -> push commits to remote git repo
