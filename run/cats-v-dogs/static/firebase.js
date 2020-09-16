firebase.initializeApp(config);

// Watch for state change from sign in
function initApp() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      document.getElementById('signInButton').innerText = 'Sign Out';
      document.getElementById('form').style.display = '';
    } else {
      // No user is signed in.
      document.getElementById('signInButton').innerText = 'Sign In with Google';
      document.getElementById('form').style.display = 'none';
    }
  });
}
window.onload = function() {
  initApp();
}

// [START run_end_user_firebase_sign_in]
function signIn() {
  var provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/userinfo.email');
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // Returns the signed in user along with the provider's credential
    console.log(`${result.user.displayName} logged in.`);
    window.alert(`Welcome ${result.user.displayName}!`)
  }).catch((error) => {
    console.log(`error: during sign in: ${error.message}`)
  });
}
// [END run_end_user_firebase_sign_in]

function signOut() {
  firebase.auth().signOut().then(function(result) {
  }).catch((error) => {
    console.log(`error: during sign out: ${error.message}`)
  })
}

// Toggle Sign in/out button
function toggle() {
  if (!firebase.auth().currentUser) {
    signIn();
  } else {
    signOut();
  }
}

// [START run_end_user_token]
async function vote(team) {
  if (firebase.auth().currentUser) {
    // Retrieve JWT to identify the user to the Identity Platform service.
    // Returns the current token if it has not expired. Otherwise, this will
    // refresh the token and return a new one.
    try {
      const token = await firebase.auth().currentUser.getIdToken();
      const response = await fetch('/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`
        },
        body: 'team=' + team,
      });
      if (response.ok) {
        const text = await response.text();
        window.alert(text);
        window.location.reload();
      }
    } catch (err) {
      console.log('Error when voting: ' + err);
      window.alert('Somthing went wrong... Please try again!');
    }
  } else {
    window.alert('User not signed in.');
  }
}
// [END run_end_user_token]
