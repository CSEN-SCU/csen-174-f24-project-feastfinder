
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

