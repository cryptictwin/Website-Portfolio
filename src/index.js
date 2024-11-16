import { initializeApp } from 'firebase/app';
import { getAuth, 
         createUserWithEmailAndPassword, 
         signInWithEmailAndPassword, 
         signOut, 
         onAuthStateChanged, 
         updateProfile,
         signInWithPopup, 
         GoogleAuthProvider,
         currentUser } from 'firebase/auth';
import { getFirestore,
         collection,
         addDoc,
         doc,
         updateDoc,
         serverTimestamp,
         onSnapshot,
         query,
         orderBy,
         limit,
         deleteDoc } from 'firebase/firestore';

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
    const postSectionEl = document.querySelector('post-section');
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
        if (textAreaEl && postButtonEl) {
            textAreaEl.disabled = true;
            textAreaEl.placeholder = 'You must be logged in to post';
            postButtonEl.disabled = true;
            postButtonEl.style.cursor = "not-allowed";
            postButtonEl.classList.add('no-hover'); 
        }
    }

    function loggedInView() {
        loggedInNav.forEach(element => {
            element.style.display = 'block';
        })
        loggedOutNav.forEach(element => {
            element.style.display = 'none';
        })
        if (textAreaEl && postButtonEl) {
            textAreaEl.disabled = false;
            textAreaEl.placeholder = 'Write a post...';
            postButtonEl.disabled = false;
            postButtonEl.style.cursor = "pointer";
            postButtonEl.classList.remove('no-hover');
        }
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
        if (!user.photoURL) {
            // Set the default photo URL
            user.photoURL = '/Website-Portfolio/assets/images/default-profile-picture.jpg';
            // If you're using Firebase Auth, you might want to update the user profile
            // updateProfile(user, { photoURL: user.photoURL }).catch(console.error);
        }
    
        // Set the image source
        imgEl.src = user.photoURL;
    
        // Add error handling in case the image fails to load
        imgEl.onerror = function() {
            this.src = '/Website-Portfolio/assets/images/default-profile-picture.jpg';
            this.onerror = null; // Prevents infinite loop if default image also fails to load
        };
    
        imgEl.style.objectFit = 'cover';
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
          updateAccountModal(user);
          loggedInView();
          showProfilePicture(userProfilePicEl, user);
          fetchInRTAndRenderPosts();
        } else {
          loggedOutView()
          fetchInRTAndRenderPosts();
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
                    const modalContent = document.getElementById('signup-modal-content');
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
                    modalContent.appendChild(userErrorMsg);
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
                    const modalContent = document.getElementById('login-modal-content');
                    userErrorMsg.textContent = error.message;
                    userErrorMsg.classList.add('error-message');
                    userErrorMsg.textContent = "Invalid email or password. Please try again.";
                    modalContent.appendChild(userErrorMsg);
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
              timestamp: serverTimestamp(),
              profilePicture: currentUser.photoURL
            });
            console.log("Document written with ID: ", docRef.id);
          } catch (e) {
            console.error("Error adding document: ", e);
          }
    }

    function clearInputField(field) {
        field.value = ""
    }

    if (postButtonEl) {
        postButtonEl.addEventListener('click', postButtonPressed);
    }

    function postButtonPressed() {
        const user = auth.currentUser;
        const postText = textAreaEl.value;
        if (postText) {
            addPostToDB(postText, user);
            clearInputField(textAreaEl);
        }
    }

    function fetchInRTAndRenderPosts() {
        const postRef = collection(db, collectionName);
        const q = query(postRef, orderBy("timestamp", "desc"), limit(5));
        onSnapshot(q, (snapshot) => {
            clearAll(postsEl);
            snapshot.forEach((doc) => {
                const postData = doc.data();
                renderPost(postsEl, postData, doc.id);
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
    
        return `${day} ${month} ${year}  AT  ${hours}:${minutes}`
    }


    function renderPost(postsEl, postData, docId) {
        const postDiv = document.createElement('div');
        const postHeaderDiv = document.createElement('div');
        const postHeaderUserCommentProfileDiv = document.createElement('div');
        const postDateH3 = document.createElement('h3');
        const postUserDisplayNameH2 = document.createElement('h2');
        const postUserImg = document.createElement('img');
        const postBodyP = document.createElement('p');
        postBodyP.id = `post-body-${docId}`;
        postDiv.className = 'post';
        postHeaderDiv.className = 'header';
        postHeaderUserCommentProfileDiv.className = 'user-comment-profile';
        postUserDisplayNameH2.textContent = postData.displayName;
        postDateH3.textContent = displayDate(postData.timestamp);
        postUserImg.src = postData.profilePicture;
        postBodyP.textContent = replaceNewlinesWithBrTags(postData.body);
        postDiv.appendChild(postHeaderDiv);
        postDiv.appendChild(postBodyP);
        postHeaderDiv.appendChild(postUserImg);
        postHeaderDiv.appendChild(postHeaderUserCommentProfileDiv);
        postHeaderUserCommentProfileDiv.appendChild(postUserDisplayNameH2);
        postHeaderUserCommentProfileDiv.appendChild(postDateH3);

        if (auth.currentUser && auth.currentUser.uid === postData.uid) {
            const editButton = document.createElement('i');
            const deleteButton = document.createElement('i');
            deleteButton.className = 'fa-solid fa-trash delete';
            editButton.className = 'fa-solid fa-pen edit';
            editButton.title = 'Edit post';
            deleteButton.title = 'Delete post';
            editButton.addEventListener('click', () => {
                const postBodyEl = document.getElementById(`post-body-${docId}`);
                if (postBodyEl.tagName.toLowerCase() === 'p') {
                    const textarea = document.createElement('textarea');
                    textarea.id = `post-body-${docId}`;
                    textarea.value = postData.body;
                    textarea.rows = 3; // Adjust as needed
                    textarea.style.width = '100%';
                    
                    postBodyEl.parentNode.replaceChild(textarea, postBodyEl);
                    
                    // Focus on the textarea
                    textarea.focus();
                    
                    // Add a save button
                    const saveButton = document.createElement('button');
                    saveButton.textContent = 'Save';
                    saveButton.style.width = '30%';
                    saveButton.style.margin = '10px auto';
                    saveButton.style.backgroundColor = '#7ebbd7';
                    saveButton.addEventListener('click', () => {
                        const newBody = textarea.value;
                        if (newBody !== postData.body) {
                            updatePost(docId, newBody);
                        }
                        // Change back to p element
                        const newP = document.createElement('p');
                        newP.id = `post-body-${docId}`;
                        newP.textContent = replaceNewlinesWithBrTags(newBody);
                        textarea.parentNode.replaceChild(newP, textarea);
                        saveButton.remove();
                    });
                    
                    textarea.parentNode.insertBefore(saveButton, textarea.nextSibling);
                }
            });
            deleteButton.addEventListener('click', () => {
              if (confirm('Are you sure you want to delete this post?')) {
                deletePost(docId, postDiv);
              }
            });
            postHeaderDiv.appendChild(editButton);
            postHeaderDiv.appendChild(deleteButton);
        }


        postsEl.appendChild(postDiv);
    }
    
    function replaceNewlinesWithBrTags(inputString) {
        return inputString.replace(/\n/g, "<br>")
    }

    async function updatePost(postId, newBody) {
        const user = auth.currentUser;
        if (!user) {
          console.error('User must be signed in to update a post');
          return;
        }
      
        const postRef = doc(db, collectionName, postId);
        
        try {
          await updateDoc(postRef, {
            body: newBody,
            lastUpdated: serverTimestamp()
          });
          console.log('Post updated successfully');
        } catch (error) {
          if (error.code === 'permission-denied') {
            console.error('You do not have permission to update this post');
          } else {
            console.error('Error updating post:', error);
          }
        }
      }

      async function deletePost(postId, postElement) {
        const user = auth.currentUser;
        if (!user) {
          console.error('User must be signed in to update a post');
          return;
        }
      
        const postRef = doc(db, collectionName, postId);
        
        try {
          // Start the fade-out animation
          postElement.classList.add('fade-out');

          // Wait for the animation to complete
          await new Promise(resolve => setTimeout(resolve, 500));

          await deleteDoc(postRef);
          console.log('Post deleted successfully');

          // Remove the post element from the DOM
          postElement.remove();
        } catch (error) {
          if (error.code === 'permission-denied') {
            console.error('You do not have permission to delete this post');
          } else {
            console.error('Error deleting post:', error);
          }
        }
      }
}







window.onload = function() {
    Particles.init({
        selector: '.background',
        connectParticles: true,
        color: '#89c8fe',
        sizeVariations: 3,
        maxParticles: 30,
        minDistance: 100,
    });
};
// Listen for the custom event that signals components have been loaded
document.addEventListener('componentsLoaded', initializeFirebase);