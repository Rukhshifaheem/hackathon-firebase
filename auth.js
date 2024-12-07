// Import Firebase modules
// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoKXRdQA1AkI1kUvthhIUQlgO5eq1UW-M",
  authDomain: "hack-47aaf.firebaseapp.com",
  projectId: "hack-47aaf",
  storageBucket: "hack-47aaf.firebasestorage.app",
  messagingSenderId: "198405218492",
  appId: "1:198405218492:web:2bc37cd69160508e5d30b9",
  measurementId: "G-734SCT0SX5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Google provider for OAuth
const provider = new GoogleAuthProvider();

// Function to show alerts via console
function showAlert(title, message, type = "success") {
  console.log(`${type.toUpperCase()}: ${title} - ${message}`);
}

// Signup Function
async function signup(event) {
  event.preventDefault();

  const emailField = document.getElementById('signupEmail');
  const passwordField = document.getElementById('signupPassword');
  const usernameField = document.getElementById('username');
  const roleField = document.getElementById('role');
  
  const email = emailField.value.trim();
  const password = passwordField.value;
  const username = usernameField.value.trim();
  const role = roleField.value.trim();

  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user details to Firestore with `uid` as the document ID
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      username: username,
      role: role,
      createdAt: new Date()
    });

    // Show success message
    showAlert('Welcome!', `Welcome ${username || user.email}!`, 'success');

    // Clear the input fields
    emailField.value = "";
    passwordField.value = "";
    usernameField.value = "";
    roleField.value = "";

    // Redirect to signin.html
    setTimeout(() => {
      window.location.href = "signin.html";
    }, 1000);
  } catch (error) {
    showAlert('Error!', error.message, 'error');
  }
}

document.getElementById('signupForm')?.addEventListener('submit', signup);

// Login Function (Email and Password)
document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    // Sign in user with email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    showAlert("Success", "Logged in successfully!", "success");
    setTimeout(() => {
      window.location.href = 'blog.html';
    }, 1000);
  } catch (error) {
    showAlert("Error", error.message, "error");
  }
});

// Google Login Function
document.getElementById('googleLoginButton')?.addEventListener('click', async (event) => {
  const button = event.target;
  button.disabled = true;

  try {
    // Sign in user with Google
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    let userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // If user data doesn't exist, create a new user record in Firestore
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        createdAt: new Date()
      });
    }

    showAlert("Welcome!", "Logged in successfully with Google!", "success");
    setTimeout(() => {
      window.location.href = 'blog.html';
    }, 1000);
  } catch (error) {
    showAlert("Error!", error.message, "error");
  } finally {
    button.disabled = false;
  }
});

// Logout Function
async function logout() {
  try {
    await signOut(auth);
    showAlert("Success", "Sign-out successful.", "success");

    setTimeout(() => {
      window.location.pathname = './index.html';
    }, 1000);
  } catch (error) {
    showAlert("Error", error.message, "error");
  }
}
document.getElementById('logoutButton')?.addEventListener('click', logout);

// Function to add a blog post to Firestore
async function addBlogPost(event) {
  event.preventDefault();

  const titleField = document.getElementById('postTitle');
  const categoryField = document.getElementById('postCategory');
  const contentField = document.getElementById('postContent');

  const title = titleField.value.trim();
  const category = categoryField.value.trim();
  const content = contentField.value.trim();

  try {
    // Add post to Firestore
    const docRef = await addDoc(collection(db, "posts"), {
      title: title,
      category: category,
      content: content,
      timestamp: new Date()
    });

    showAlert('Success!', 'Blog post added successfully.', 'success');

    // Clear form fields
    titleField.value = '';
    categoryField.value = '';
    contentField.value = '';

    // Redirect to index.html after a short delay
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);

  } catch (error) {
    showAlert('Error!', error.message, 'error');
  }
}

// Listen for the form submission
document.getElementById('postForm')?.addEventListener('submit', addBlogPost);

// Function to fetch and display blog posts from Firestore
async function displayBlogPosts() {
  const postsContainer = document.getElementById('myPosts');

  try {
    const querySnapshot = await getDocs(collection(db, "posts"));

    querySnapshot.forEach((doc) => {
      const postData = doc.data();
      const timestamp = postData.timestamp ? postData.timestamp.toDate() : new Date();

      const postElement = document.createElement('div');
      postElement.classList.add('row', 'mb-5');
      postElement.innerHTML = `
        <div class="col-md-8">
          <h5 class="fw-bold">${postData.title}</h5>
          <p class="text-muted">${postData.content}</p>
          <div class="small text-muted">
            <span>${postData.category}</span> | <span>By Author</span> | <span>${timestamp.toLocaleString()}</span>
          </div>
        </div>
        <div class="col-md-4 mb-5">
          <div class="bg-primary text-white d-flex align-items-center justify-content-center rounded" style="height: 150px;">
            <img src="./image/blog-img.jpg" alt="" class="img-thumbnail">
          </div>
        </div>
      `;

      postsContainer.appendChild(postElement);
    });
  } catch (error) {
    showAlert('Error!', 'There was an issue fetching the blog posts.', 'error');
  }
}

// Call displayBlogPosts when the page loads
window.onload = displayBlogPosts;
