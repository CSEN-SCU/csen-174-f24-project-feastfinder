
const { instrument } = require('@socket.io/admin-ui')

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
  console.log('hi route was called!')
  res.send({'serverRes':'hello'});
})
app.get('/:groupID', async (req, res) => {
  const { groupID } = req.params;
  console.log('req params: ', groupID);

  let groupData;
  await db.collection('groups').doc(groupID).get()
  .then(data => {
    if(!data.exists)
      console.log('no doc exists');
    else{
      console.log('data: ', data.data().members);
      groupData = data.data().members;
    }
  })
  res.send({members: groupData});
})


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

/************************ SERVER SOCKETS ************************/

const groupID = 121212; //rand generate group id and send to 
const users = [];
io.on('connection', (socket) => {

    console.log('user connected :)');

    //join page
    socket.emit('receiveGroup', groupID); 

    //start page
    console.log('************** start page **************');
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
            ack('ERROR: user does not exist');
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
        console.log('************** user pref **************');
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
        ack(prefAdded);

        console.log('no users have length 0: ',users.some(u => u.pref.length != 0))
        if(users.some(u => u.pref.length != 0)) //if all users have pref set
            socket.emit('all-ready', {ready: true});
    })

    //voting page
        //generate resturant picks to send then send them
    socket.on('generate-resturants', (d, ack) => {
        if(d == 1){
            ack('working')
            socket.emit('rest-picks', curateResturants());
        }else
            ack('ERROR!')
    })

    //calc top pick resturants for group then send
    //send data from client to server in format:
    // {restName: 'freshfood', voteCount: 2 }
    socket.on('is-vote-done', (data, ack) => {
        const results = top3picks(data);
        if(results){
            ack('working');
            socket.emit('vote-results', results);
        }else
            ack('ERROR!');
    });


    socket.on('disconnect', () => {
        var index = users.find(u => u.socket_id == socket.id);
        // console.log('index: ', index);
        if(index != -1)
            users.splice(index, 1);
        console.log('user disconnected :(');
    });
});

function curateResturants(){
    //get all users top cuisine prefs
    const cuisinePicks = [];
    users.map((u) => {
        //no dup cuisines?
        console.log('pref: ', u.pref[0]);
        cuisinePicks.push(u.pref[0]);
        //cuisinePicks.push(u.pref['second']);
    }) 
    // console.log('cuisinePicks: ', cuisinePicks);

    //randomly generate two resturants for each cuisine
    const randRest = [];
    cuisinePicks.map(c => {
        const restData = JSON.parse(fs.readFileSync(`./restaurant_data/${c}_resturants.json`, { encoding: 'utf8', flag: 'r' }));
        if(restData){ // console.log('rest data: ', restData[0]);
            randRest.push(restData[0]);
            randRest.push(restData[1]);
        }
    });

    // console.log('randRest: ', randRest);
    return randRest;
}
    // [ {restName: 'freshfood', voteCount: 2 }, ... ]
function top3picks(data){
    console.log(data);
    if(data != [])
        data.sort((a, b) => b.voteCount - a.voteCount); //sorts array in descending vote count
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