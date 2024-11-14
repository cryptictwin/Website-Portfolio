import { initializeApp } from 'firebase/app';
import { getAuth, 
         createUserWithEmailAndPassword, 
         signInWithEmailAndPassword, 
         signOut, 
         onAuthStateChanged, 
         updateProfile } from 'firebase/auth';

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
    const currUser = auth.currentUser;
    const accountNameEl = document.getElementById('account-name');
    const accountEmailEl = document.getElementById('account-email');
    const signUpNameEl = document.getElementById('signup-name');
    const signUpEmailEl = document.getElementById('signup-email');
    const signUpPasswordEl = document.getElementById('signup-password');
    const logInEmailInputEl = document.getElementById('login-email');
    const logInPasswordInputEl = document.getElementById('login-password');
    const loggedOutNav = document.querySelectorAll('.logged-out');
    const loggedInNav = document.querySelectorAll('.logged-in');
    const logOutButtonEl = document.getElementById('logout');
    if (logOutButtonEl) {
        logOutButtonEl.addEventListener('click', authSignOut);
    }
    function loggedOutView() {
        loggedOutNav.forEach(element => {
            element.style.display = 'block';
        })
        loggedInNav.forEach(element => {
            element.style.display = 'none';
        })
    }

    function loggedInView() {
        loggedInNav.forEach(element => {
            element.style.display = 'block';
        })
        loggedOutNav.forEach(element => {
            element.style.display = 'none';
        })
    }

    function authSignOut () {
        signOut(auth).then(() => {
            window.location.reload();
          }).catch((error) => {
            console.error(error.message);
          });
    }

    function updateAccountModal(user) {
        if (accountNameEl && accountEmailEl) {
            accountNameEl.textContent = user.displayName;
            accountEmailEl.textContent = user.email;
    
        }
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
          updateAccountModal(user);
          loggedInView();
        } else {
          loggedOutView()
        }
    });
    // Now that components are loaded, we can safely query for the form
    const signUpForm = document.getElementById('signup-form');
    const logInForm = document.getElementById('login-form');
    if (signUpForm) {
        signUpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const signUpEmailInput = signUpEmailEl.value;
            const signUpPasswordInput = signUpPasswordEl.value;
            const signUpNameInput = signUpNameEl.value;

            // Clear the prvious error message
            const previousError = document.querySelector('.error-message');
            if (previousError) previousError.remove();
            createUserWithEmailAndPassword(auth, signUpEmailInput, signUpPasswordInput)
                .then((userCredential) => {
                    // User signed up successfully
                    const user = userCredential.user;
                    return updateProfile(user, {
                        displayName: signUpNameInput
                    });
                })
                .then (() => {
                    // Close the modal
                    const modal = M.Modal.getInstance(document.getElementById('modal-signup'));
                    if (modal) {
                        modal.close();
                        console.log('Modal closed');
                    } else {
                        console.log('Modal instance not found');
                    }
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
            const logInEmailInput = logInEmailInputEl.value;
            const logInPasswordInput = logInPasswordInputEl.value;
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