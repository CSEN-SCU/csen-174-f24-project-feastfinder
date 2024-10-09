
//express and http vars
import express from 'express';
const app = express();
const PORT = 8080;


// middleware to parse data -> needed for post requests
app.use(express.json());


//firebase vars -> connected to dthuita2002@gmail.com firebase account
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { getDatabase, ref, onValue, get, set, child, update, push } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyC80cDMXEqdE85bVzI5u05m6n12rG8xrvY",
    authDomain: "csen174-feastfinder.firebaseapp.com",
    projectId: "csen174-feastfinder",
    storageBucket: "csen174-feastfinder.appspot.com",
    messagingSenderId: "1019273913503",
    appId: "1:1019273913503:web:48fe2e735e6acc69936eaa",
    measurementId: "G-2YG6483MNW"
};
const fb = initializeApp(firebaseConfig);
const auth = getAuth(fb);
const db = getDatabase(fb);

/********************* GET ROUTES *********************/

//get user info
app.get('/users', async(req, res) => { 
    //useful for running when data in db changes
    // onValue(userRef, (snapshot) => {
    //     usersData = snapshot.val();
    //     console.log("Users data: ", usersData);
    // });
    
    const userRef = ref(db, 'Users/');
    const usersData = await get(userRef);

    res
        .status(200)
        .json({"Users: ": usersData});
})

//get specific user
app.get('/profile/:id', async(req, res) => { 
    const specificUserRef = ref(db, 'Users/'+req.params.id);
    const specificUsersData = await get(specificUserRef);

    res
        .status(200)
        .json(specificUsersData);
})

//get all groups
app.get('/groups', async(req, res) => { 
    const groupsRef = ref(db, 'Groups/');
    const groupsData = await get(groupsRef);

    res
        .status(200)
        .json({"Groups:": groupsData});
})

//get specific group
app.get('/group/:id', async(req, res) => { 
    const specificGroupRef = ref(db, 'Groups/'+req.params.id);
    const specificGroupData = await get(specificGroupRef);

    res
        .status(200)
        .json(specificGroupData);
})

/********************* POST ROUTES *********************/

//post new user
app.post('/users', async(req, res) => { //data should be sent as json
    // Get a key for a new user.
    const newUserKey = push(child(ref(db), 'Users')).key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    const updates = {};
    updates['/Users/' + newUserKey] = req.body;
    
    //assume update works? return value is hard to get.
    await update(ref(db), updates);
    res.status(200).send("db users updated");
})

//post new group
app.post('/groups', async(req, res) => {
    // Get a key for a new Group.
    const newGroupKey = push(child(ref(db), 'Groups')).key;

    // Write the new post's data simultaneously in the posts list and the Group's post list.
    const updates = {};
    updates['/Groups/' + newGroupKey] = req.body;
    
    //assume update works? return value is hard to get.
    await update(ref(db), updates);
    res.status(200).send("db groups updated");
})


// //see if user is logged in or not
// onAuthStateChanged(auth, user => {
//     console.log("You are logged in as", user);
// })
// //sign in with popup 
// signInWithPopup(auth, new GoogleAuthProvider())


/********************* TEST ROUTE *********************/

app.get('/test', (req, res) => {
    res.send('Hello World');
})


app.listen(PORT, () => {
    console.log("server available at http://localhost:"+PORT)
})