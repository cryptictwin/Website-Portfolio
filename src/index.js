import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBerviAfQ6SV5xSv2CqJAENLrbKyp_f7Ws",
    authDomain: "website-portfolio-a1443.firebaseapp.com",
    projectId: "website-portfolio-a1443",
    storageBucket: "website-portfolio-a1443.firebasestorage.app",
    messagingSenderId: "445594781252",
    appId: "1:445594781252:web:915782cc15c17422ea9e11"
};


function initializeFirebase() {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    // Remove .value and assign variables with the values for submit event listeners for form
    const signUpEmailInput = document.getElementById('signup-email').value;
    const signUpPasswordInput = document.getElementById('signup-password').value;
    const logInEmailInput = document.getElementById('login-email').value;
    const logInPasswordInput = document.getElementById('login-password').value;
    const loggedOutNav =-document.querySelector('.logged-out');
    const loggedInNav = document.querySelector('.logged-in');

    function loggedOutView() {
        loggedOutNav.style.display = 'block';
        loggedInNav.style.display = 'none';
    }

    function loggedInView() {
        loggedInNav.style.display = 'block';
        loggedOutNav.style.display = 'none';
    }

    // Now that components are loaded, we can safely query for the form
    const signUpForm = document.getElementById('signup-form');
    const logInForm = document.getElementById('login-form');
    if (signUpForm) {
        signUpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            

            // Clear the prvious error message
            const previousError = document.querySelector('.error-message');
            if (previousError) previousError.remove();
            createUserWithEmailAndPassword(auth, signUpEmailInput, signUpPasswordInput)
                .then((userCredential) => {
                    // User signed up successfully
                    const user = userCredential.user;
                    console.log('User created:', user);
                    // Close the modal
                    const modal = M.Modal.getInstance(document.getElementById('modal-signup'));
                    if (modal) {
                        modal.close();
                        console.log('Modal closed');
                    } else {
                        console.log('Modal instance not found');
                    }
                    loggedInView();
                    // Clear the form
                    signUpForm.reset();

                })
                .catch((error) => {
                    // Handle errors
                    const userErrorMsg = document.createElement('p');
                    userErrorMsg.textContent = error.message;
                    userErrorMsg.classList.add('error-message');
                    if (error.code === 'auth/weak-password' || 
                        error.message.includes('Password') || 
                        error.message.includes('password')) {
                        userErrorMsg.textContent = "Password must contain at least 6 characters, including at least one special character, one uppercase and one lowercase letter.";
                    } else if (error.code === 'auth/email-already-in-use') {
                        userErrorMsg.textContent = "This email is already in use. Please try a different email or log in.";
                    } else if (error.code === 'auth/invalid-email') {
                        userErrorMsg.textContent = "Please enter a valid email address.";
                    } else {
                        userErrorMsg.textContent = "An error occurred during sign up. Please try again.";
                    }
                    signUpForm.appendChild(userErrorMsg);
                    console.error('Signup error:', error);
                });
        });
    } else {
        console.error('Signup form not found');
    }
    if (logInForm) {
        logInForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Clear the prvious error message
            const previousError = document.querySelector('.error-message');
            if (previousError) previousError.remove();
            signInWithEmailAndPassword(auth, logInEmailInput, logInPasswordInput)
                .then((userCredential) => {

                    // User signed up successfully
                    const user = userCredential.user;
                    console.log('User logged in:', user);

                    // Close the modal
                    const modal = M.Modal.getInstance(document.getElementById('modal-login'));
                    if (modal) {
                        modal.close();
                        console.log('Modal closed');
                    } else {
                        console.log('Modal instance not found');
                    }
                    loggedInView();
                    // Clear the form
                    logInForm.reset();
                })
                .catch((error) => {
                    const userErrorMsg = document.createElement('p');
                    userErrorMsg.textContent = error.message;
                    userErrorMsg.classList.add('error-message');
                    userErrorMsg.textContent = "Invalid email or password. Please try again.";
                    logInForm.appendChild(userErrorMsg);
                    console.error('Login error:', error);
                });
        });
    } else {
        console.error('Signup form not found');
    }
}

// Listen for the custom event that signals components have been loaded
document.addEventListener('componentsLoaded', initializeFirebase);