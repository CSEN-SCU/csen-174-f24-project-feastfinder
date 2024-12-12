
const { instrument } = require('@socket.io/admin-ui')

const fs = require('fs');
const cors = require('cors');
const express = require('express');

/************************ socket and server init ************************/
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
const { count } = require('console');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://feast-finder-95126.firebaseio.com" // Replace with your Firebase database URL
});

// Firestore initialization
const db = admin.firestore();

/************************ Global Variables & MiddleWare ************************/

let GROUP_ID; //rand generate group id and send to 
const users = [];
const votePreResults = [];
const voteRegister = []; 

// Middleware for CORS and parsing JSON
app.use(cors());
app.use(express.json());
// Serve static files
app.use(express.static('frontend'));

/************************ SERVER ROUTES ************************/

app.get('/profile', async(req, res) => { //this route must come before /:rand route otherwise it wont run
  const user_id = req.query.id;
  console.log('User id: ', user_id);

  const user_profile_data = await db.collection('users').doc(user_id).get();
  
  if (!user_profile_data.exists) {
    return res.status(404).json({ error: 'User not found'});
  }

  const userData = user_profile_data.data();
  console.log('User profile data: ', userData);

  const groupsRef = db.collection('groups');
  const groupSnapshot = await groupsRef.where('members', 'array-contains', user_id).get();

  const groups = groupSnapshot.docs.map(doc => doc.data());

  const profileData = {
    ...userData,
    groups: groups,
  };

  console.log('Profile data to send: ', profileData);

  // Send response with profile data including groups
  res.json(profileData);
})
  
//get resturant data
app.get('/getRestData', (req, res) => {
  const { longitude, latitude } = req.query;

  const url = `https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}&sort_by=best_match&limit=20`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer fRRjPsm7vqVt3YL_Po5RdpuubNO05LyLg8_6JYRzHwWrSRvC5mFQzEJjXOjmBmwWZJR5Z_GQzOF9WEc57Co6n8dbPXmBZ8UTL27gHYkFw1TTdwBmkukPhBR5539LZ3Yx'
    }
  };

  console.log('resturant names:')
  fetch(url, options)
    .then(res => res.json())
    .then(json => {
      json.businesses.forEach(r => console.log(r.name));
    })
    .catch(err => console.error(err));

  res.send({});
})

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

io.on('connection', (socket) => {
  console.log('user connected :)');

  //join page
  socket.on('created-groupID', (id) => { //GET GROUP ID FROM user that created group
    GROUP_ID = id;
    io.emit('receiveGroup', GROUP_ID); //send to all users
    console.log('group id sent!');
  })


  //start page
  socket.on('join-party', (n, ack) => {
    console.log('USER: ',n);

    if(users.every( u => u.email !== n.email)){ //user doesn't exist on server yet
      users.push({
        name: n.name, 
        img: n.img, 
        status: n?.status || 0, 
        socket_id: socket.id, 
        email: n.email,
        pref: []
      });
      console.log('\nUSERS in server atm: ')
      for(let u of users)
        console.log('email: ', u.email, ' socket: ', u.socket_id);

      ack(users);
      socket.broadcast.emit('new-user', users); //send list of all users to everyone but sender
    }
  })

  //start page -> update user to all sockets
  socket.on('update-status', (ustatus, ack) => { //username and status
    const index = users.findIndex( u => u.socket_id == ustatus.socket_id)
    if(index >= 0){
        ack('user updating');
        users[index].status = ustatus.status? 1: 0;
        socket.broadcast.emit('update-status-broad', ustatus);
    }else{
        console.log('ERROR: user does not exist!');//should be ack()
    }
  })    

    
  //preference selection page
  socket.on('user-pref', (upref, ack) => {
    users.map(u => {
        if(u.socket_id == socket.id && u.pref.length == 0){
            upref.forEach(p => {
                console.log(p);
                u.pref.push(p);
            });
        }
    })

    console.log('every user has pref set: ',users.every(u => u.pref.length !== 0))
    console.log('updated USERS in server atm: ', users);
    
    if(users.every(u => u.pref.length !== 0)) //if all users have pref set
        io.emit('all-pref-gotten', true); //all users update at once?? works
  })

  //voting page -> //generate resturant picks to send then send them
  socket.on('generate-resturants', async(location, ack) => {
      if(location){
          ack('working')
          console.log('sending resturant data');
          io.emit('rest-picks', await curateResturants(location.longitude, location.latitude)); //send all users same resturants
      }else
          ack('ERROR!')
  })

  //final vote page ->
  //calc top pick resturants for group then send //send data from client to server in format: // {restName: 'freshfood', voteCount: 2 }
  socket.on('is-vote-done', (data, ack) => { //find a way to actually count the people who voted  
    data.map(d => votePreResults.push(d));
    voteRegister.push(socket.id);
    console.log('vote preResults: ', votePreResults);  
    console.log('vote pre results length: ', votePreResults.length);
    console.log('user length: ', users.length);

    if(votePreResults.length === users.length*3){
      // console.log('IDK: ', data);
      const results = top3picks(votePreResults); 
        if(results){
            ack('working');
            console.log('Results: ', results);

            //erase vote pre results 
            votePreResults.splice(0, votePreResults.length);
            
            io.emit('vote-results', results); //to send emits to all users use io.emit
        }else
            ack('ERROR!');
    }else{
      console.log('not all users results recieved yet.')
    }
  });


  socket.on('disconnect', () => {
      let user_index = users.find(u => u.socket_id === socket.id);
      //remove user on disconnect
      if(user_index !== -1)
          users.splice(user_index, 1);
      
      //remove user vote
      let vote_index = voteRegister.find(u => u.socket_id === socket.id)
      if(vote_index !== -1)
        voteRegister.splice(vote_index, 3);

      console.log('user disconnected :(');
  });
});

function countOccurance(arr) { //only for cuisine array
  const counts = {}
  for(const a of arr)
    counts[a.name] = counts[a.name] ? counts[a.name] + 1 : 1;

  return counts;
}
async function curateResturants(longitude, latitude){
  // console.log('longitude: ', longitude, ', latitude: ', latixtude);

  //get all users top cuisine prefs
  const cuisinePicks = [];
  users.map((u) => {
      //no dup cuisines?
      for(const p of u.pref)
        cuisinePicks.push(p);
  }) 
  console.log('cuisine: ',cuisinePicks);
  const count = countOccurance(cuisinePicks);
  console.log('counts: ', count);

  //sort count and names then send back
  const entries = Object.entries(count);      //get all name of resturants
  entries.sort((a, b) => b[1] - a[1]);        // Sort the array by value in descending order
  const top3 = entries.slice(0, 3);           // Get the top 3 values
  console.log('sorted cuisine: ', top3);

  //randomly generate two resturants for top 3 cuisines
  const urls = []
  if(top3.length >= 3){ //top options vary more than 3
    top3.map(t => {
      urls.push(
        `https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}&term=${t[0]}&sort_by=best_match&limit=20`,
      )
    })
  }else{ //top options are less than 3
    top3.map(t => {
      console.log('term: ', t);
      urls.push(
        `https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}&term=${t[0]}&sort_by=best_match&limit=40`,
      )
    })
  }
  console.log('urls: ', urls);

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer fRRjPsm7vqVt3YL_Po5RdpuubNO05LyLg8_6JYRzHwWrSRvC5mFQzEJjXOjmBmwWZJR5Z_GQzOF9WEc57Co6n8dbPXmBZ8UTL27gHYkFw1TTdwBmkukPhBR5539LZ3Yx'
    }
  };

  const curatedRest = [];

  const PromiseRes = await Promise.all(urls.map(async(u) => await fetch(u, options).then(res => res.json()).then(d => d.businesses)));
  const fetchData = PromiseRes;
  //fetchData should either be [ [rests 1, ...], [rests 2, ...], [rests 1, ...]] or [[rests 1, ...]]
  // console.log('fetched Data: ', fetchData);
  // console.log('fetch data length: ', fetchData[0].length);
  // console.log('top3 length: ', top3.length);

  fetchData.map((dataSect, ind) => {
    let num = 0;
    if(top3.length >= 3)
      num = 4;
    else// if(top3.length = 2)
      num = 6;
    // else
    //   num = 12;

    for(let i=0; i < num; i++){
      let randInd = Math.floor(Math.random()*(dataSect.length));
      curatedRest.push({ 
        name: dataSect[randInd].name,
        img: dataSect[randInd].image_url,
        cuisine: dataSect[randInd].categories[0]?.alias,
        rating: dataSect[randInd].rating,
        review_count: dataSect[randInd].review_count,
        price: dataSect[randInd].price,
        distance: dataSect[randInd].distance,
        business_hours: dataSect[randInd].business_hours
      })
    } 
  })
  console.log('Curated Rest: ', curatedRest);

  return curatedRest;
}
function top3picks(data){
    // not in proper format atm
    console.log('top 3 picks data: ', data);

    const counts = {}
    if(data != []){
      data.sort((a, b) => a - b); //sorts array in descending vote count
      //count
      for(const name of data)
        counts[name] = counts[name] ? counts[name] + 1 : 1;
    }else
        return [];

    //turn objs into arr
    const keys = Object.keys(counts);
    const sortedCount = [];
    // console.log('counts: ',counts);
    // console.log('keys: ',keys);
    for(k of keys)
      sortedCount.push({name: k, count: counts[k]});
    // console.log('sorted count (pre sort): ', sortedCount);

    sortedCount.sort((a,b) => b.count - a.count);
    // console.log('sorted count (sort): ', sortedCount);

    return sortedCount; //return top 3 picks from 1st place to 3rd place 
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