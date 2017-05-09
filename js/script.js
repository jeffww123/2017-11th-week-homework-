$(document).ready(function(){
  var config = {
    apiKey: "AIzaSyAjMHdsOOMgFKIlgyqOUO5jHvNBenk6_B0",
    authDomain: "test404-b4968.firebaseapp.com",
    databaseURL: "https://test404-b4968.firebaseio.com",
    projectId: "test404-b4968",
    storageBucket: "test404-b4968.appspot.com",
    messagingSenderId: "626156442001"
  };
  firebase.initializeApp(config);


  var dbChatRoom = firebase.database().ref().child('Chat');
  var dbUser = firebase.database().ref().child('Users');
  var $img = $('img');
  var photoURL;
  var currentUser = firebase.auth().currentUser;
  var currentUserName = "";

  const $email =$('#email');
  const $password =$('#password');
  const $btnLogIn = $('#btnSignIn');
  const $btnSignUp =$('#btnSignUp');
  const $btnLogOut = $('#btnSignOut');

  const $signInfo = $('#sign-info');

   const $messageField = $('#messageField');
   const $messageList = $('#messageList');
   const $removeData = $('#remove');
   const $update = $('#update');

   const $save = $('#save');
   const $updateProfile = $('#updateProfile');

   const $profileName = $('#profile-name');
   const $profileEmail = $('#profile-email');
   const $profileOccupation = $('#profile-occupation');
   const $profileAge = $('#profile-age');
   const $profileDescription = $('#profile-description');

   var storageRef = firebase.storage().ref();

  //Sign Up
  $btnSignUp.click(function(e){
    const email = $email.val();
    const password = $password.val();
    const auth = firebase.auth();
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user){
        Materialize.toast('註冊成功', 4000, 'green');
        firebase.database().ref('/users/' + user.uid).set({
            username: '',
            occupation: '',
            age: 0,
            description: '',
            email: ''
        });
        window.location.href = "../Update Information/index.html";
          this.$root.page = 'signin';
      }).catch(function(error) {
          let errorCode = error.code;
          if (errorCode === 'auth/email-already-in-use') {
              Materialize.toast('失敗，E-Mail 已被使用', 4000, 'red');
          } else if (errorCode === 'auth/invalid-email') {
              Materialize.toast('失敗，不合法的 E-Mail', 4000, 'red');
          } else if (errorCode === 'auth/weak-password') {
              Materialize.toast('失敗，密碼太弱，至少需超過 6 個字元', 4000, 'red');
          }
      });
      let user = firebase.auth().currentUser;
      if (user !== null) {
        this.$root.page = 'updateInfo';
      }
  });

  //LogIn
  $btnLogIn.click(function(e){
    const email = $email.val();
    const password = $password.val();
    const auth = firebase.auth();

    const promise = auth.signInWithEmailAndPassword(email, password);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(){
      console.log("Log in success!");
      Materialize.toast('登入成功', 4000, 'green');
      window.location.href = "./User Information/index.html";
    });
  });

  function updateOrSetProfile(choice){
      var userName = $userName.val();
      var occupation = $occupation.val();
      var age = $age.val();
      var description = $description.val();
      var currentUser = firebase.auth().currentUser;

      var promise = currentUser.updateProfile({
        displayName: userName,
        photoURL: photoURL
      });

      promise.then(function() {
        var dbUserid = dbUser.child(currentUser.uid);
        currentUser = firebase.auth().currentUser;
        if (currentUser) {
          dbUserid.update({
            'name': userName,
            'occupation': occupation,
            'age': age,
            'description': description,
            'imageUrl': currentUser.photoURL
          });
          window.location.href = "../User Information/index.html";
          findData(currentUser);
        }
      });
    }

    $updateProfile.click(function(e){
      Materialize.toast('更新成功', 3000, 'green');
      updateOrSetProfile("update");
    });

    function findData(currentUser){
      var dbUserInfo = firebase.database().ref('user/' + currentUser.uid);

      dbUserInfo.on("value", function(snapshot){
        var username = snapshot.val().username;
        var occupation = snapshot.val().occupation;
        var age = snapshot.val().age;
        var description = snapshot.val().description;
        var imageUrl = snapshot.val().imageUrl;

        $profileName.html(username);
        $profileEmail.html(currentUser.email);
        $profileOccupation.html(occupation);
        $profileAge.html(age);
        $profileDescription.html(description);
        $img.attr("src", imageUrl);

      });
    }

    firebase.auth().onAuthStateChanged(function(currentUser){
      if(currentUser){
        findData(currentUser);
        dbChatRoom.limitToLast(10).on('child_added', function (snapshot) {
          //GET DATA

          var data = snapshot.val();
          var username = data.user || "anonymous";
          var message = data.text;
          var imgUrl = data.imageUrl;
          console.log(imgUrl);
          findData(currentUser);


          var $messageElement = $("<li>");
          var $image = $("<img>");
          $image.attr("src", imgUrl);
          $messageElement.text(message).prepend(username + ":  ");
          $messageElement.prepend($image);
          $messageList.append($messageElement);
          $messageList[0].scrollTop = $messageList[0].scrollHeight;
        });
      }
    });



    $messageField.keypress(function (e) {
      var currentUser = firebase.auth().currentUser;
      var dbUserInfo = firebase.database().ref('user/');
      var userName;

      if(currentUser){
        dbUserInfo.on("value",function(snapshot) {
           snapshot.forEach(function(userId){
              if(userId.key === currentUser.uid){
                userId.forEach(function(profile){
                  if(profile.key === 'username'){
                      userName = profile.val();
                  }
                });
              }
           });
        });

        if (e.keyCode == 13) {
          var message = $messageField.val();
          dbChatRoom.push({user:userName, text:message, imageUrl: currentUser.photoURL});
          $messageField.val('');
        }
      }


    });

    $removeData.click(function(){
      $messageList.empty();
      dbChatRoom.remove().then(function() {
        alert("Remove succeeded")
      });
    });

    $logOut.click(function(){
      firebase.auth().signOut();
      console.log('LogOut');
    });

    Vue.component('info', {
        data: function() {
            return {
                username: '',
                email: '',
                occupation: '',
                age: 0,
                description: ''
            }
        },
        methods: {
            gotoUpdateInfo: function() {
                this.$root.page = 'updateInfo';
            },
        },
        beforeMount: function() {
            let user = firebase.auth().currentUser;
            if (user === null) {
                this.$root.page = 'signin';
            }
        },
        created: function(){
            let user = firebase.auth().currentUser;
            let component = this;
            firebase.database().ref('/users/' + user.uid).on('value', function(snapshot) {
                component.username = snapshot.val().username;
                component.occupation = snapshot.val().occupation;
                component.age = snapshot.val().age;
                component.description = snapshot.val().description;
                component.email = user.email;
            });

            firebase.storage().ref('/sticker/' + user.uid).getDownloadURL().then(function(url) {
                $('#sticker-preview').attr('src', url);
            }).catch(function(error) {
                firebase.storage().ref('/sticker/defaultSticker').getDownloadURL().then(function(url) {
                    $('#sticker-preview').attr('src', url);
                }).catch(function(error){});
            });
        },
    });

});
