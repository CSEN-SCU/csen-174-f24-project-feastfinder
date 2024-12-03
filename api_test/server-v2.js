
const { instrument } = require('@socket.io/admin-ui')

const { curateRestaurants } = require('./curateRestaurants');
const bodyParser = require('body-parser');

const axios = require('axios');
const fs = require('fs');
const cors = require('cors');
const express = require('express');

// socket and server init
const app = express();
const server = require('http').createServer(app);
const options =  {
    transports: ['websocket'],
    cors: {
        origin: '*'
    }
};
const io = require('socket.io')(server, options);
const PORT = 3000;

/************************ firebase configs? ************************/

const { getAuth } = require('firebase-admin/auth');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://feast-finder-95126.firebaseio.com" // Replace with your Firebase database URL
});

// Firestore initialization
const db = admin.firestore();

/************************ SERVER ROUTES ************************/

// Middleware for CORS and parsing JSON
app.use(cors());
app.use(express.json());
// Serve static files
app.use(express.static('frontend'));

//Test Routes
app.get('/hi', (req, res) => {
  // console.log('hi route was called!')
  res.send({'serverRes':'hello'});
})

app.get('/profile', (req, res) => { //this route must come before /:groupID route otherwise it wont run
  //fetch data from database
  //format data
  //send data
  console.log('PROFILE ROUTE HAS BEEN CALLLED RAHHHHH')
  res.json({
    "name": "John Doe",
    "age": 30,
    "description": "Food enthusiast and a world traveler.",
    "picture": "https://example.com/path/to/profile-picture.jpg",
    "preferences": ["Italian", "Chinese", "Mexican"],
    "recent": ["Sushi", "Tacos", "Burger"],
    "groups": [
      {
        "groupId": "12345",
        "name": "Food Lovers"
      },
      {
        "groupId": "67890",
        "name": "Cuisine Explorers"
      }
    ]
  });
})

// bad route - if placement is different it could skip a lot of other routes
// app.get('/:groupID', async (req, res) => {
//   const { groupID } = req.params;
//   console.log('req params: ', groupID);

//   let groupData;
//   await db.collection('groups').doc(groupID).get()
//   .then(data => {
//     if(!data.exists)
//       console.log('no doc exists');
//     else{
//       console.log('data: ', data.data().members);
//       groupData = data.data().members;
//     }
//   })
//   res.send({members: groupData});
// })

// Route for Google login
app.post('/login/google', async (req, res) => {
  console.log('/login/google route called :)')
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Missing ID token.' });
    }

    // Verify ID token with Firebase Admin SDK
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Store user data in Firestore
    await db.collection('users').doc(uid).set(
      {
        uid,
        name: decodedToken.name,
        email: decodedToken.email,
        lastLogin: new Date().toISOString()
      },
      { merge: true } // Merge with existing data if the user already exists
    );

    res.status(200).json({
      message: "User signed in successfully",
      user: { uid, name: decodedToken.name, email: decodedToken.email }
    });
  } catch (error) {
    console.error("Login failed", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});

// Create a new group
app.post('/create-group', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Generate a new group ID (you can choose a different strategy)
    const groupId = `group-${Date.now()}`;

    // Create the group in Firestore
    await db.collection('groups').doc(groupId).set({
      groupId,
      createdBy: userId,
      members: [userId], // Add the user who created the group as a member
      createdAt: new Date().toISOString()
    });

    res.status(200).json({ message: 'Group created successfully', groupId });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group', details: error.message });
  }
});

// Join an existing group
app.post('/join-group', async (req, res) => {
  const { userId, groupId } = req.body;
  if (!userId || !groupId) {
    return res.status(400).json({ error: "User ID and Group ID are required" });
  }

  try {
    // Check if the group exists
    const groupRef = db.collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Add the user to the group's members list if not already a member
    const groupData = groupDoc.data();
    if (!groupData.members.includes(userId)) {
      groupData.members.push(userId);
      await groupRef.update({ members: groupData.members });
    }

    res.status(200).json({ message: 'Joined group successfully' });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'Failed to join group', details: error.message });
  }
});

// Get group details by groupId
app.get('/group/:groupId', async (req, res) => {
    const { groupId } = req.params;
  
    try {
      const groupRef = db.collection('groups').doc(groupId);
      const groupDoc = await groupRef.get();
  
      if (!groupDoc.exists) {
        return res.status(404).json({ error: 'Group not found' });
      }
  
      const groupData = groupDoc.data();
      const members = groupData.members; // List of user IDs
  
      // Get details of each member
      const memberDetails = [];
      for (let uid of members) {
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
  
        if (userDoc.exists) {
          const userData = userDoc.data();
          memberDetails.push({
            uid: userData.uid,
            name: userData.name,
            email: userData.email,
            picture: userData.picture || 'default_picture_url', // Assuming you store picture URL
          });
        }
      }
  
      res.status(200).json({ groupId, members: memberDetails });
    } catch (error) {
      console.error('Error fetching group details:', error);
      res.status(500).json({ error: 'Failed to fetch group details', details: error.message });
    }
});

app.post('/getCuratedRestaurants', async (req, res) => {
  try {
    const preferences = req.body.preferences;
    console.log("preferences:", preferences);

    // Validate preferences format
    if (!preferences || !Array.isArray(preferences)) {
      console.error('Invalid preferences format:', preferences);
      return res.status(400).json({ error: 'Invalid preferences format' });
    }

    // Extract cuisines from preferences (use the 'name' field)
    const cuisines = preferences.map(pref => pref.name);
    console.log('Cuisines:', cuisines);  // Log the extracted cuisines for debugging

    // Call curateRestaurants with the extracted cuisines
    const curatedRestaurants = await curateRestaurants(cuisines);
    console.log("Curated restaurants:", curatedRestaurants);
    res.json(curatedRestaurants);
  } catch (error) {
    console.error('Error in /getCuratedRestaurants:', error.message);
    res.status(500).json({ error: 'Error fetching restaurant data' });
  }
});

/************************ SERVER SOCKETS ************************/

const groupID = 121212; //rand generate group id and send to 
const users = [];
io.on('connection', (socket) => {

    console.log('user connected :)');

    //join page
    socket.emit('receiveGroup', groupID); 

    //start page
    console.log('************** start page sockets **************');
    socket.on('start-page', (n, ack) => {
        if(!users.some( u => u.name == n.name)){ //add new user if not already in
            ack('user added');
            users.push({'name': n.name, 'img': n.img, status: n.status, 'socket_id': socket.id, pref: []});
            socket.broadcast.emit('new-user', n); //send new user to other sockets
        }else
            ack('ERROR: cannot add user');
    })
    socket.on('update-status', (ustatus, ack) => { //username and status
        // console.log('mathcing user: ',users.findIndex( u => u.name == ustatus.name))
        if(users.findIndex( u => u.name == ustatus.name) >= 0){
            ack('user updating');
            socket.broadcast.emit('update-status-broad', ustatus);
        }else{
            console.log('ERROR: user does not exist');//should be ack()
        }
    })
    socket.on('status-all', (ack) => { // REMOVE LATER DEBUGGING FUNC
        console.log('all users: ', users);
        ack(users);
    })
    
    //preference selection page
    //NOTE: upref should be in format:
    // ['chinese', 'american','french'] //first to third in order
    //NOTE: add error catch if cusine not part of expected cuisine
    socket.on('user-pref', (upref, ack) => {
        console.log('************** user pref sockets **************');
        let prefAdded=false;
        users.map(u => {
            if(u.socket_id == socket.id){
                upref.forEach(p => {
                    console.log(p);
                    u.pref.push(p);
                });
                prefAdded = true;
            }
        })
        // console.log('pref set', users);
        // console.log('pref value: ',prefAdded);
        // ack(prefAdded);

        console.log('no users have length 0: ',users.some(u => u.pref.length != 0))
        if(users.some(u => u.pref.length != 0)) //if all users have pref set
            socket.emit('all-ready', {ready: true});
    })

    //voting page
        //generate resturant picks to send then send them
    socket.on('generate-resturants', (d, ack) => {
      console.log('************** voting sockets **************');
        if(d == 1){
            ack('working')
            socket.emit('rest-picks', curateResturants());
        }else
            ack('ERROR!')
    })

    //calc top pick resturants for group then send
    //send data from client to server in format:
    // {restName: 'freshfood', voteCount: 2 }
    socket.on('is-vote-done', (data, ack) => { //find a way to actually count the people who voted
      console.log('************** results sockets **************');
      console.log('data sent to server: ', data);  
      const results = top3picks(data);
        if(results){
            ack('working');
            socket.emit('vote-results', results);
        }else
            ack('ERROR!');
    });

    // Listen for the 'send-curated-restaurants' event
  socket.on('send-curated-restaurants', async (data) => {
    console.log('Received curated restaurants data:', data);

    try {
      // Process the data as needed (this could be restaurant curation, etc.)
      // In this case, we are simply sending back the same data for now
      console.log("Sending curated restaurants back to client...");
      
      // Emit the 'all-ready' event after the data is sent
      socket.emit('all-ready', true); // This will notify the client that they are ready to navigate
      socket.emit('send-curated-restaurants', data);
    } catch (error) {
      console.error('Error processing curated restaurants:', error);
      socket.emit('all-ready', false); // If there’s an error, notify the client that it's not ready
    }
  });

    socket.on('disconnect', () => {
        var index = users.find(u => u.socket_id == socket.id);
        // console.log('index: ', index);
        if(index != -1)
            users.splice(index, 1);
        console.log('user disconnected :(');
    });
});


    // [ {restName: 'freshfood', voteCount: 2 }, ... ]
function top3picks(data){
    // not in proper format atm
    if(data != [])
        data.sort((a, b) => a.voteCount - b.voteCount); //sorts array in descending vote count
    else
        return [];

    console.log('sorted data: ', data);
    return [data[0], data[1], data[2]]; //return top 3 picks from 1st place to 3rd place 
}

 
server.listen(PORT, () => {
    console.log(`server available at http://localhost:${PORT}`);
});


instrument(io, {auth:false}) //for socket.io admin webpage access

module.exports = server; //export for servering test

//make sure ReactJS works w/ sockets
//devMetric -> rate of user joining, rate of backend failure, firestore graph for number of connection per unit time
//socket.emit('user-ready',) -> counts all current users are ready
//server: socket.on('all ready', htmlpage) -> on all users ready send html page

//sockets have to be in listening socket
// socket.on('hello', () => {
//     console.log('working?');
//     socket.emit('world', 'marioWorld!');
//     socket.emit('yolo', 'yeye');
// })

//user object structure
// {
//     name: ---, (string)
//     img: --.jpg, (url string)
//     status: -, (number)
//     socket_id: ----, (string)
//     pref: [--, --, --] (array of strings)
// }