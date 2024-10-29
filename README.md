App.js
The main component that manages user authentication state and renders child components based on user progress:

Login: Displays a login button for Google authentication.

Login.js
Handles user authentication with Google using Firebase. It contains a button for users to log in.

Preferences.js
Allows users to input their food preferences, which are then saved to Firestore. Users can add multiple preferences and save them all at once.

Group.js
Enables users to create or join groups. It fetches existing group preferences and is supposed to allow users to vote on food categories. Votes are stored in Firestore and are supposed to be submitted in real time.

firebaseConfig.js
Contains the Firebase configuration details and initializes Firebase services. It exports the authentication and Firestore instances for use in other components.
