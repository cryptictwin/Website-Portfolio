import { initializeApp } from 'firebase/app';
import { getAuth, 
         createUserWithEmailAndPassword, 
         signInWithEmailAndPassword, 
         signOut, 
         sendEmailVerification,
         onAuthStateChanged, 
         updateProfile,
         signInWithPopup, 
         GoogleAuthProvider, } from 'firebase/auth';
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

    // Function to update UI for logged out users
    function loggedOutView() {
        // Show login and  sign up elements for logged out users
        loggedOutNav.forEach(element => {
            element.style.display = 'block';
        })
        // Hide logout and account elements for logged out users
        loggedInNav.forEach(element => {
            element.style.display = 'none';
        })
        // Disable posting functionality for logged out users
        if (textAreaEl && postButtonEl) {
            textAreaEl.disabled = true;
            textAreaEl.placeholder = 'You must be logged in to post';
            postButtonEl.disabled = true;
            postButtonEl.style.cursor = "not-allowed";
            postButtonEl.classList.add('no-hover'); 
        }
    }

    // Function to update UI for logged in users
    function loggedInView() {
        // Show logout and account elements for logged in users
        loggedInNav.forEach(element => {
            element.style.display = 'block';
        })
        // Hide login and sign up elements for logged out users
        loggedOutNav.forEach(element => {
            element.style.display = 'none';
        })
        // Enable posting functionality for logged in users
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
            if (user.emailVerified) {
                // If user is signed in and email is verified, show the logged in view and render posts
                updateAccountModal(user);
                loggedInView();
                showProfilePicture(userProfilePicEl, user);
                fetchInRTAndRenderPosts();
            } else {
                // If email is not verified, sign out the user
                signOut(auth).then(() => {
                    loggedOutView();
                    fetchInRTAndRenderPosts();
                });
            }
        } else {
          // If user is signed out, show the logged out view and render posts
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
        signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get user input values
            const signUpEmailInput = signUpEmailEl.value;
            const signUpPasswordInput = signUpPasswordEl.value;
            const signUpNameInput = signUpNameEl.value;

            // Clear the prvious error message
            const previousError = document.querySelector('.error-message');
            if (previousError) previousError.remove();
            try {
                // Create the user
                const userCredential = await createUserWithEmailAndPassword(auth, signUpEmailInput, signUpPasswordInput);
                const user = userCredential.user;
    
                // Update the user's profile with their display name
                await updateProfile(user, {
                    displayName: signUpNameInput
                });
                
                // Sign out the user immmediately after creation
                await signOut(auth);

                // Send verification email to the user
                await sendEmailVerification(user);
                
                // Reset the form and notify the user
                signUpForm.reset();
                alert("A verification email has been sent. Please verify your email to log in.");
                } 
                catch(error)  {
                    // Error handling for sign-up process
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
                    // Display the error message in the sign-up modal content
                    modalContent.appendChild(userErrorMsg);
                    console.error('Signup error:', error);
                };
        });
    } else {
        console.error('Signup form not found');
    }
    if (logInForm) {
        // Add a submit event listener to the login form
        logInForm.addEventListener('submit', (e) => {
            // Prevent the default form submission behavior
            e.preventDefault();

            // Get the email and password input values
            const logInEmailInput = logInEmailInputEl.value;
            const logInPasswordInput = logInPasswordInputEl.value;

            // Clear the prvious error message
            const previousError = document.querySelector('.error-message');
            if (previousError) previousError.remove();

            // Attempt to sign in the user with the provided email and password
            signInWithEmailAndPassword(auth, logInEmailInput, logInPasswordInput)
                .then((userCredential) => {
                    // User signed up successfully
                    const user = userCredential.user;
                    console.log('User logged in:', user);

                    // Check if the user's email is verified
                    if (!user.emailVerified) {
                        // If email is not verified, sign out the user
                        signOut(auth).then(() => {
                            alert("You must verify your email to log in.");
                            loggedOutView();
                            fetchInRTAndRenderPosts();
                        });
                    }

                    // Clear the login form
                    logInForm.reset();
                })
                .catch((error) => {
                    // Error handling for login process
                    const userErrorMsg = document.createElement('p');
                    const modalContent = document.getElementById('login-modal-content');
                    userErrorMsg.textContent = error.message;
                    userErrorMsg.classList.add('error-message');
                    userErrorMsg.textContent = "Invalid email or password. Please try again.";
                    
                    // Display the error message in the login modal content
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
            // Adds a new document to the "posts" collection with a generated id.
            // If there is no collection with the given name, it will be created along with the document.
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

    // When post button is clicked, add the post to firestore database
    if (postButtonEl) {
        postButtonEl.addEventListener('click', postButtonPressed);
    }

    function postButtonPressed() {
        // Sets user to the currently signed in user
        const user = auth.currentUser;
        const postText = textAreaEl.value;
        // If the textArea is not empty, add the post to the database and clear the textarea field.
        if (postText && postText.trim()!=='') {                   
            addPostToDB(postText, user);
            clearInputField(textAreaEl);
        } else {
            console.error("Post text is empty");
            // Remove previous error message if it exists
            if (document.getElementById('post-error-message')) {
                document.getElementById('post-error-message').remove();
            }
            // Create and display error message
            const errorMessage = document.createElement('p');
            errorMessage.id = 'post-error-message';
            errorMessage.textContent = 'Please enter some text before posting.';
            errorMessage.style.color = 'red';
            errorMessage.style.fontSize = '0.8em';
            errorMessage.style.marginTop = '5px';
            textAreaEl.style.borderColor = 'red';
            
            // Insert the error message after the textarea
            textAreaEl.parentNode.insertBefore(errorMessage, textAreaEl.nextSibling);
            
            // Remove the red border and error message when the user starts typing
            textAreaEl.addEventListener('input', function() {
                this.style.borderColor = '';
                const errorMsg = document.getElementById('post-error-message');
                if (errorMsg) errorMsg.remove();
            });
        } 
    }

    // Fetches and renders posts from Firestore in real-time
    function fetchInRTAndRenderPosts() {
        // Fetch all documents from the "posts" collection and orders the timestamp in descending order
        const postRef = collection(db, collectionName);
        const q = query(postRef, orderBy("timestamp", "desc"), limit(5));
        onSnapshot(q, (snapshot) => {
            // Clear all existing posts on the interface before rendering the posts from the Firestore snapshot
            // The clearAll function prevents appending duplicate posts
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
        // Create DOM elements for the post
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

        // Populate elements with post data
        postUserDisplayNameH2.textContent = postData.displayName;
        postDateH3.textContent = displayDate(postData.timestamp);
        postUserImg.src = postData.profilePicture;
        postBodyP.textContent = replaceNewlinesWithBrTags(postData.body);

        // Construct the post structure
        postDiv.appendChild(postHeaderDiv);
        postDiv.appendChild(postBodyP);
        postHeaderDiv.appendChild(postUserImg);
        postHeaderDiv.appendChild(postHeaderUserCommentProfileDiv);
        postHeaderUserCommentProfileDiv.appendChild(postUserDisplayNameH2);
        postHeaderUserCommentProfileDiv.appendChild(postDateH3);

        // Check if the current user is the author of the post
        if (auth.currentUser && auth.currentUser.uid === postData.uid) {
            // Create edit and delete buttons for posts related to the current user
            const editButton = document.createElement('i');
            const deleteButton = document.createElement('i');
            deleteButton.className = 'fa-solid fa-trash delete';
            editButton.className = 'fa-solid fa-pen edit';
            editButton.title = 'Edit post';
            deleteButton.title = 'Delete post';
            editButton.addEventListener('click', () => {
                const postBodyEl = document.getElementById(`post-body-${docId}`);
                if (postBodyEl.tagName.toLowerCase() === 'p') {
                    // Create a textarea element for editing
                    const textarea = document.createElement('textarea');
                    textarea.id = `post-body-${docId}`;
                    textarea.value = postData.body;
                    textarea.rows = 3; // Adjust as needed
                    textarea.style.width = '100%';
                    
                    // Replace the paragraph element with the textarea element
                    postBodyEl.parentNode.replaceChild(textarea, postBodyEl);
                    
                    // Focus on the textarea after the user clicks the edit button
                    textarea.focus();
                    
                    // Add a save button
                    const saveButton = document.createElement('button');
                    saveButton.textContent = 'Save';
                    saveButton.style.width = '30%';
                    saveButton.style.margin = '10px auto';
                    saveButton.style.backgroundColor = '#7ebbd7';
                    // Add an event listener for the save button
                    saveButton.addEventListener('click', () => {
                        const newBody = textarea.value;
                        // Update the post in the database if the new body text is different from the old body text
                        if (newBody.trim() !== "") {
                            updatePost(docId, newBody);
                            // Change back to p element
                            const newP = document.createElement('p');
                            newP.id = `post-body-${docId}`;
                            // Replace the text content of the p element with the new body text
                            newP.textContent = replaceNewlinesWithBrTags(newBody);
                            textarea.parentNode.replaceChild(newP, textarea);
                            saveButton.remove();
                        } else {
                            console.error("Post text is empty");
                            // Remove previous error message if it exists
                            if (document.getElementById('edit-error-message')) {
                                document.getElementById('edit-error-message').remove();
                            }
                            // Create and display error message
                            const errorMessage = document.createElement('p');
                            errorMessage.id = 'edit-error-message';
                            errorMessage.textContent = 'Please enter some text before posting.';
                            errorMessage.style.color = 'red';
                            errorMessage.style.fontSize = '0.8em';
                            errorMessage.style.marginTop = '5px';
                            errorMessage.style.fontWeight = '500';
                            
                            // Insert the error message after the textarea
                            textarea.parentNode.insertBefore(errorMessage, textarea.nextSibling);
                            
                            // Optionally, you can make the textarea border red to highlight the error
                            textarea.style.borderColor = 'red';
                            
                            // Remove the red border and error message when the user starts typing
                            textarea.addEventListener('input', function() {
                                this.style.borderColor = '';
                                const errorMsg = document.getElementById('edit-error-message');
                                if (errorMsg) errorMsg.remove();
                            });
                        } 
                    });
                    // Insert the save button after the textarea element
                    textarea.parentNode.insertBefore(saveButton, textarea.nextSibling);
                }
            });
            // Add an event listener for the delete button
            deleteButton.addEventListener('click', () => {
                // If the user confirms the deletion, delete the post from the database
              if (confirm('Are you sure you want to delete this post?')) {
                deletePost(docId, postDiv);
              }
            });
            // Add edit and delete buttons to the post header
            postHeaderDiv.appendChild(editButton);
            postHeaderDiv.appendChild(deleteButton);
        }

        // Append the complete post to the posts container
        postsEl.appendChild(postDiv);
    }
    
    function replaceNewlinesWithBrTags(inputString) {
        return inputString.replace(/\n/g, "<br>")
    }

    async function updatePost(postId, newBody) {
        // Get the currently authenticated user
        const user = auth.currentUser;

        // Check if user is signed in
        if (!user) {
          console.error('User must be signed in to update a post');
          return;
        }
        // Create a reference to a specific post document in Firestore by 
        // passing the id of the document as an argument for the postID parameter
        const postRef = doc(db, collectionName, postId);
        
        try {
          // Attempt to update the post in Firestore  
          await updateDoc(postRef, {
            body: newBody,   // Update the body of the post with the new content
            lastUpdated: serverTimestamp()   // Add a timestamp for when the post was last updated
          });
          console.log('Post updated successfully');
        } catch (error) {
          // Handle any errors that occur during the update process  
          if (error.code === 'permission-denied') {
            // Specific error for handling permission issues. 
            console.error('You do not have permission to update this post');
          } else {
            // Generic error handling
            console.error('Error updating post:', error);
          }
        }
      }

      async function deletePost(postId, postElement) {
        // Get the currently authenticated user
        const user = auth.currentUser;

        // Check if user is signed in
        if (!user) {
          console.error('User must be signed in to update a post');
          return;
        }
        
        // Create a reference to a specific post document in Firestore by
        // passing the id of the document as an argument for the postID parameter
        const postRef = doc(db, collectionName, postId);
        
        try {
          // Start the fade-out animation
          postElement.classList.add('fade-out');

          // Wait for the animation to complete
          await new Promise(resolve => setTimeout(resolve, 500));
        
          // Delete the post document from Firestore
          await deleteDoc(postRef);
          console.log('Post deleted successfully');

          // Remove the post element from the DOM after successful deletion
          postElement.remove();
        } catch (error) {
          // Handle any errors that occur during the deletion process    
          if (error.code === 'permission-denied') {
            // Specific error for handling permission issues. 
            console.error('You do not have permission to delete this post');
          } else {
            // Generic error handling
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