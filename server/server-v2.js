
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

/************************ Global Variables ************************/

const groupID = 121212; //rand generate group id and send to 
const users = [];
let currUser;

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

app.get('/profile', async(req, res) => { //this route must come before /:groupID route otherwise it wont run
  console.log('PROFILE ROUTE HAS BEEN CALLLED RAHHHHH')

  //fetch data from database
  console.log('User: ', currUser);

  const user_profile_data = await db.collection('users').doc(currUser.uid).get();

  console.log('user profile data: ', user_profile_data.data());
  for(keys in user_profile_data)
    console.log('user profile key: ', keys);

  //format data
  const resData = user_profile_data.data()
  console.log('resUser data : ', resData);
  //send data  
  res.json(resData);
})

app.post('/loginData', (req, res) => {
  console.log('user data: ', req.body);
  currUser = req.body;
  res.send({data: 'ack'});
})

//get resturant data
app.get('/getRestData', (req, res) => {
  const { longitude, latitude } = req.query;
  // console.log('req data: ', longitude, ' , ', latitude);

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
// app.post('/login/google', async (req, res) => {
//   console.log('/login/google route called :)')
//   try {
//     const { idToken } = req.body;
//     if (!idToken) {
//       return res.status(400).json({ error: 'Missing ID token.' });
//     }

//     // Verify ID token with Firebase Admin SDK
//     const decodedToken = await getAuth().verifyIdToken(idToken);
//     const uid = decodedToken.uid;

//     currUser = {
//       uid,
//       name: decodedToken.name,
//       email: decodedToken.email,
//       lastLogin: new Date().toISOString()
//     }
//     console.log('user info check: ', currUser);

//     // Store user data in Firestore
//     await db.collection('users').doc(uid).set(
//       {
//         uid,
//         name: decodedToken.name,
//         email: decodedToken.email,
//         lastLogin: new Date().toISOString()
//       },
//       { merge: true } // Merge with existing data if the user already exists
//     );

//     res.status(200).json({
//       message: "User signed in successfully",
//       user: { uid, name: decodedToken.name, email: decodedToken.email }
//     });
//   } catch (error) {
//     console.error("Login failed", error);
//     res.status(500).json({ error: "Login failed", details: error.message });
//   }
// });

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
    socket.emit('receiveGroup', groupID); 

    //start page
    console.log('************** start page sockets **************');
    socket.on('join-party', (n) => {
      console.log('USER: ',n);
        if(!users.some( u => u.email == n.email)){ //add new user if not already in
            // ack('user added');
            users.push({'name': n.name, 'img': n.img, status: n.status, 'socket_id': socket.id, pref: []});
            // socket.broadcast.emit('new-user', n); //send new user to other sockets
            socket.emit('new-user', users);
        }
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

        console.log('no users have prefs array length 0: ',users.some(u => u.pref.length != 0))
        if(users.some(u => u.pref.length != 0)) //if all users have pref set
            socket.emit('all-ready', {ready: true});
    })

    //voting page
        //generate resturant picks to send then send them
    socket.on('generate-resturants', async(location, ack) => {
      console.log('************** voting sockets **************');
        if(location){
            ack('working')
            // ack(curateResturants(location.longitude, location.latitude));
            console.log('sending resturant data');
            socket.emit('rest-picks', await curateResturants(location.longitude, location.latitude));
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


    socket.on('disconnect', () => {
        var index = users.find(u => u.socket_id == socket.id);
        // console.log('index: ', index);
        if(index != -1)
            users.splice(index, 1);
        console.log('user disconnected :(');
    });
});

function countOccurance(arr) {
  const counts = {}
  for(const name of arr)
    counts[name] = counts[name] ? counts[name] + 1 : 1;

  return counts;
}
async function curateResturants(longitude, latitude){
  // console.log('longitude: ', longitude, ', latitude: ', latixtude);

  //get all users top cuisine prefs
  const cuisinePicks = [];
  users.map((u) => {
      //no dup cuisines?
      for(const p of u.pref)
        cuisinePicks.push(p.name);
  }) 
  console.log('cuisine: ',cuisinePicks);
  const count = countOccurance(cuisinePicks);
  console.log('counts: ', count);

  //sort by descending
  cuisinePicks.sort((a, b) => count[a] - count[b]);
  console.log('sorted cuisine: ', cuisinePicks);

  //randomly generate two resturants for top 3 cuisines
  const urls = [
    `https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}&term=${cuisinePicks[0]}&sort_by=best_match&limit=5`,
    `https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}&term=${cuisinePicks[1]}&sort_by=best_match&limit=5`,
    `https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}&term=${cuisinePicks[2]}&sort_by=best_match&limit=5`
  ];
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer fRRjPsm7vqVt3YL_Po5RdpuubNO05LyLg8_6JYRzHwWrSRvC5mFQzEJjXOjmBmwWZJR5Z_GQzOF9WEc57Co6n8dbPXmBZ8UTL27gHYkFw1TTdwBmkukPhBR5539LZ3Yx'
    }
  };

  console.log('check 1 !!!!');
  const curatedRest = [];
  // await Promise.all(urls.map((u) => fetch(u, options) ))
  // .then(res => console.log(res.body))
  // .then(data => {
  //   curatedRest.push({ 
  //     name: data.businesses[0].name,
  //     img: data.businesses[0].image_url,
  //     cuisine: data.businesses[0].categories[0].alias,
  //     rating: data.businesses[0].rating,
  //     review_count: data.businesses[0].review_count,
  //     price: data.businesses[0].price,
  //     distance: data.businesses[0].distance,
  //     business_hours: data.businesses[0].business_hours
  //   })
  //   curatedRest.push({ 
  //     name: data.businesses[1].name,
  //     img: data.businesses[1].image_url,
  //     cuisine: data.businesses[1].categories[0].alias,
  //     rating: data.businesses[1].rating,
  //     review_count: data.businesses[1].review_count,
  //     price: data.businesses[1].price,
  //     distance: data.businesses[1].distance,
  //     business_hours: data.businesses[1].business_hours
  //   });
  // });

  const fetchRes = await Promise.all(urls.map(u => fetch(u, options)));
  const fetchData = await Promise.all(fetchRes.map(p => p.json()));
  fetchData.map(d => {
    curatedRest.push({ 
      name: d.businesses[0].name,
      img: d.businesses[0].image_url,
      cuisine: d.businesses[0].categories[0].alias,
      rating: d.businesses[0].rating,
      review_count: d.businesses[0].review_count,
      price: d.businesses[0].price,
      distance: d.businesses[0].distance,
      business_hours: d.businesses[0].business_hours
    })
    curatedRest.push({ 
      name: d.businesses[1].name,
      img: d.businesses[1].image_url,
      cuisine: d.businesses[1].categories[0].alias,
      rating: d.businesses[1].rating,
      review_count: d.businesses[1].review_count,
      price: d.businesses[1].price,
      distance: d.businesses[1].distance,
      business_hours: d.businesses[1].business_hours
    })
  })

  console.log('curatedRest: ', curatedRest);

  return curatedRest;
}

// function curateResturants(){
//     //get all users top cuisine prefs
//     const cuisinePicks = [];
//     users.map((u) => {
//         //no dup cuisines?
//         console.log('pref: ', u.pref[0]);
//         cuisinePicks.push(u.pref[0]);
//         //cuisinePicks.push(u.pref['second']);
//     }) 
//     // console.log('cuisinePicks: ', cuisinePicks);

//     //randomly generate two resturants for each cuisine
//     const randRest = [];
//     cuisinePicks.map(c => {
//         const restData = JSON.parse(fs.readFileSync(`./restaurant_data/${c}_resturants.json`, { encoding: 'utf8', flag: 'r' }));
//         if(restData){ // console.log('rest data: ', restData[0]);
//             randRest.push(restData[0]);
//             randRest.push(restData[1]);
//         }
//     });

//     // console.log('randRest: ', randRest);
//     return randRest;
// }
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