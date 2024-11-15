import { initializeApp } from 'firebase/app';
import { getAuth, 
         createUserWithEmailAndPassword, 
         signInWithEmailAndPassword, 
         signOut, 
         onAuthStateChanged, 
         updateProfile,
         signInWithPopup, 
         GoogleAuthProvider } from 'firebase/auth';
import { getFirestore,
         collection,
         addDoc,
         updateDoc,
         serverTimestamp,
         onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBerviAfQ6SV5xSv2CqJAENLrbKyp_f7Ws",
    authDomain: "website-portfolio-a1443.firebaseapp.com",
    projectId: "website-portfolio-a1443",
    storageBucket: "website-portfolio-a1443.firebasestorage.app",
    messagingSenderId: "445594781252",
    appId: "1:445594781252:web:915782cc15c17422ea9e11"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

function initializeFirebase() {
    const googlesignInUpButtonEl = document.querySelectorAll(".google-btn")
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
    const userProfilePicEl = document.querySelector('.profile-picture');
    const textAreaEl = document.getElementById('post-input');
    const postButtonEl = document.getElementById('post-btn');
    const postsEl = document.getElementById('posts');
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

    function clearAll(element) {
        element.innerHTML = ""
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

    function showProfilePicture(imgEl, user) {
        const photoURL = user.photoURL;
        if (photoURL) {
            imgEl.src = photoURL;
        } else {
            imgEl.style.background = `url('/Website-Portfolio/assets/images/default-profile-picture.jpg')`;
            imgEl.style.backgroundSize = 'cover';
        }
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
          updateAccountModal(user);
          loggedInView();
          showProfilePicture(userProfilePicEl, user);
          fetchInRTAndRenderPosts();
        } else {
          loggedOutView()
        }
        // Close all modals
        const modals = document.querySelectorAll('.modal');
        modals.forEach((modalElement) => {
            const modalInstance = M.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.close();
                console.log('Modal closed');
            } else {
                console.log('Modal instance not found for', modalElement);
            }
        });
    });
    function authSignInWithGoogle() {
        signInWithPopup(auth, provider)
          .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // IdP data available using getAdditionalUserInfo(result)
            // ...
          }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
            });
    }
    googlesignInUpButtonEl.forEach(button => {
        button.addEventListener('click', authSignInWithGoogle);
    })
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



    const collectionName = "posts";


    async function addPostToDB(postBody, currentUser) {
        try {
            const docRef = await addDoc(collection(db, collectionName), {
              uid: currentUser.uid,
              body: postBody,
              displayName: currentUser.displayName,
              timestamp: serverTimestamp()
            });
            console.log("Document written with ID: ", docRef.id);
          } catch (e) {
            console.error("Error adding document: ", e);
          }
    }

    function clearInputField(field) {
        field.value = ""
    }

    postButtonEl.addEventListener('click', postButtonPressed);
    
    
    function postButtonPressed() {
        const user = auth.currentUser;
        const postText = textAreaEl.value;
        if (postText) {
            addPostToDB(postText, user);
            clearInputField(textAreaEl);
        }
    }

    function fetchInRTAndRenderPosts() {
        onSnapshot(collection(db, collectionName), (snapshot) => {
            clearAll(postsEl);
            snapshot.forEach((doc) => {
                const postData = doc.data();
                renderPost(postsEl, postData);
            })
        });
    }

    function displayDate(firebaseDate) {
        if (!firebaseDate) return "Loading..."
        const date = firebaseDate.toDate()
        const day = date.getDate()
        const year = date.getFullYear()
        
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const month = monthNames[date.getMonth()]
    
        let hours = date.getHours()
        let minutes = date.getMinutes()
        hours = hours < 10 ? "0" + hours : hours
        minutes = minutes < 10 ? "0" + minutes : minutes
    
        return `${day} ${month} ${year} - ${hours}:${minutes}`
    }

    function renderPost(postsEl, postData) {
        postsEl.innerHTML += `
            <div class="post">
                <div class="header">
                    <div class="user-comment-profile">
                        <h2>${postData.displayName}</h2>
                        <img src="assets/emojis/${postData.mood}.png">
                    </div>
                    <h3>Posted: ${displayDate(postData.timestamp)}</h3>
                </div>
                <p>
                    ${replaceNewlinesWithBrTags(postData.body)}
                </p>
            </div>
        `
    }
    
    function replaceNewlinesWithBrTags(inputString) {
        return inputString.replace(/\n/g, "<br>")
    }
}







window.onload = function() {
    Particles.init({
        selector: '.background',
        connectParticles: true,
        color: '#89c8fe',
        sizeVariations: 3,
        maxParticles: 50,
        minDistance: 150,
    });
};
// Listen for the custom event that signals components have been loaded
document.addEventListener('componentsLoaded', initializeFirebase);