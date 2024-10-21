import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const auth = getAuth();
const provider = new GoogleAuthProvider();

document.getElementById('google-login-btn').addEventListener('click', async () => {
    try {
        // sign-in popup
        const result = await signInWithPopup(auth, provider);

        // Get ID token from signed-in user
        const idToken = await result.user.getIdToken();

        // Send the ID token to backend for verification
        const response = await fetch('/login/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('User signed in successfully:', data.user);

            // update the UI?
            document.getElementById('status').innerText = 
                `Welcome, ${data.user.displayName}!`;
        } else {
            console.error('Login failed:', response.statusText);
        }
    } catch (error) {
        console.error('Error during Google login:', error);
    }
});