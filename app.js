myDatabase = firebase.database()
// var user = ''

const mediaQuery = window.matchMedia('(max-width: 550px)')
if(mediaQuery.matches){
  document.getElementById('contacts').style.width = '100%'
  document.getElementById('chat').style.display = 'none'
  document.getElementById('sendUserInfo').style.justifyContent = 'center'
}

loaderrem = ()=>{
  document.getElementById('loader-wrapper').remove();
}
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        document.getElementById('container').style.display = 'flex'
        document.getElementById('loginForm').style.display = 'none'
        readChats() 
        setTimeout(function(){ loaderrem(); }, 3000);
               
    } else {
      loaderrem()
        // document.getElementById('chat').style.display = 'none'
        document.getElementById('loginForm').style.display = 'flex'
        // document.getElementById('container').style.display = 'none'
        fbLogin = () =>{
            var provider = new firebase.auth.FacebookAuthProvider();
            firebase.auth().signInWithPopup(provider).then(function(result) {
                user = result.user;
                userData = {
                  name : user.displayName,
                  email : user.email,
                  phoneNumber : user.phoneNumber,
                  photo: user.photoURL
                }
                firebase.database().ref('/users').child(user.uid).set(userData)
                var ref = firebase.database().ref(`/chats/${user.uid}`);
                ref.once("value")
                .then(function(snapshot) {
                    var hasHeadArr = snapshot.hasChild("totalChatHeads"); // true
                    if(hasHeadArr){
                        console.log('totalChatHeads exists')
                    }else{
                    console.log('totalChatHeads not')
                    totalChatHeads = ['']
                    // totalChatHeads.push(user.uid)
                    ref.child('totalChatHeads').set(totalChatHeads)
                    }
                })
              }).catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                var email = error.email;
                var credential = error.credential;
                alert('error',errorMessage)
              });
        }
    }

    userAvatar = document.getElementById('userAvatar')
    userName = document.getElementById('userName')
    userName.innerHTML = user.displayName
    userAvatar.src = user.photoURL
  });



  readChats =()=>{
    currentUser =  firebase.auth().currentUser;
    // console.log(currentUser)
    currentKey = currentUser.uid
    database = firebase.database().ref(`/chats/${currentKey}`).once('value',(snapshot)=>{
    //   console.log(data.val())
      childSnapshot = snapshot.val()
      // console.log(childSnapshot)
      chatHeadArr = childSnapshot[Object.keys(childSnapshot)[Object.keys(childSnapshot).length - 1]]
      // console.log(chatHeadArr)
      chatsFromFb = firebase.database().ref(`/chats/${currentKey}`).once('value',(snap)=>{
        chatHeads = snap.val()

        for(i=0; i<chatHeadArr.length;i++){
                // chatHeadArr.forEach(()=>{
                //   console.log(chatHeadArr)
                // })
                if(Object.keys(chatHeads)[i] != 'totalChatHeads'){
                  
                  chatHeadKey = Object.keys(chatHeads)[i]
                  // console.log(chatHeadKey)
                  firebase.database().ref(`/chats/${currentKey}/${chatHeadKey}`).once('value',(head)=>{
                    headValue = head.val()
                    // console.log(headValue)

                    chatHead = document.getElementById('chat-head')
                    chatBtn = document.createElement('button')
                    chatBtn.setAttribute('class','chatBtn')
                    chatBtn.setAttribute('id','chatBtn')
                    chatBtn.setAttribute('title',`Continue Chat With ${headValue.name}`)  
                    userAvatar = document.createElement('img')
                    userName = document.createElement('h3')
                    userName.innerHTML = headValue.name
                    userAvatar.src = headValue.photo
                    chatBtn.setAttribute('data-photo',headValue.photo)
                    chatBtn.setAttribute('data-name',headValue.name)
                    chatBtn.setAttribute('onclick','goToChat(this)')
                    // line = document.createElement('hr')
                    // line.setAttribute('class','line')
                    chatBtn.appendChild(userAvatar)
                    chatBtn.appendChild(userName)
                    chatHead.appendChild(chatBtn)
                    // chatHead.appendChild(line)
                  })
                }
              }
      })      
    })    
  }

  getUsers = ()=>{
    chatIcon = document.getElementById('chatIcon')
    userBtnDiv = document.createElement('div')
    userBtnDiv.setAttribute('class','userBtnDiv')
    userBtnDiv.setAttribute('id','userBtnDiv')
    userBtnDiv.setAttribute('title','')
    chatIcon.appendChild(userBtnDiv)
    chatIcon.setAttribute('onclick','disableChatPop()')
    disableChatPop= ()=>{
      userBtnDiv.remove()
      chatIcon.setAttribute('onclick','getUsers()')
    }
    firebase.database().ref('users').once('value',(data)=>{
        data.forEach((childSnapshot)=> {
          var childKey = childSnapshot.key;
          var childData = childSnapshot.val();
          // console.log(childKey)
          // alert('bef childdata')
          // console.log(childData.photo)
          currentUser =  firebase.auth().currentUser;
          if(currentUser.uid != childKey){
          userBtn = document.createElement('button')
          userBtn.setAttribute('class','userBtn')
          userBtn.setAttribute('id','userBtn')
          userBtn.setAttribute('title',`Start Chat With ${childData.name}`)
          userBtn.setAttribute('data-uid',childKey)
          userBtn.setAttribute('data-photo',childData.photo)
          userBtn.setAttribute('onclick','startChat(this)')
          userAvatar = document.createElement('img')
          userName = document.createElement('h3')
          userName.innerHTML = childData.name
          userAvatar.src = childData.photo
          userBtn.appendChild(userAvatar)
          userBtn.appendChild(userName)
          userBtnDiv.appendChild(userBtn)
    
          }
        })
      })

}

startChat = (a)=>{
    // userChatheads++
    currentUser =  firebase.auth().currentUser;
    currentKey = currentUser.uid
    chat =firebase.database().ref(`/chats/${currentKey}`)
    toChatUserKey = a.dataset.uid
    toChatUserPhoto = a.dataset.photo

    

    chatheads = firebase.database().ref(`/chats/${currentKey}/totalChatHeads`).once("value").then(function(snapshot) {

      chatHeadArr =snapshot.val()
        var searchUserChat = chatHeadArr.indexOf(toChatUserKey)
  
              if(searchUserChat == -1){
                chatHeadArr.push(toChatUserKey)
                firebase.database().ref(`/chats/${currentKey}/totalChatHeads`).update(chatHeadArr)
                // lolam = ()=>{
                //   // firebase.database().ref(`/chats`).child(currentKey).orderByChild("totalChatHeads").equalTo("B2wuca2gywOlIl51eTpdZHFlaXy2").remove();
                //   newChatArr = chatHeadArr.filter((item)=>{item == ""})
                // }

                message = []
                messages= message.push()
                msgObj = {
                  key: toChatUserKey,
                  name: a.lastChild.innerHTML,
                  photo:toChatUserPhoto,
                  message:messages
                }
                chat.child(`${a.dataset.uid}`).set(msgObj)

                chatHead = document.getElementById('chat-head')
                chatBtn = document.createElement('button')
                chatBtn.setAttribute('class','chatBtn')
                chatBtn.setAttribute('id','chatBtn')
                chatBtn.setAttribute('title',`Continue Chat With ${a.lastChild.innerHTML}`)  
                userAvatar = document.createElement('img')
                userName = document.createElement('h3')
                userName.innerHTML = a.lastChild.innerHTML
                userAvatar.src = a.dataset.photo
                // userBtn.setAttribute('data-uid',childKey)
                // chatBtn.setAttribute('onclick','startChat(this)')
                chatBtn.appendChild(userAvatar)
                chatBtn.appendChild(userName)
                chatHead.appendChild(chatBtn)
              }
            })
  
  }


goToChat = (a)=>{
  if(mediaQuery.matches){
    document.getElementById('contacts').style.display = 'none'
    document.getElementById('chat').style.width = '100%'
    document.getElementById('chat').style.display = 'initial'
  }
  sendMsgInput = document.getElementById('sendMsgInput')
  sendMsgInput.focus()
  sendUserAvatar = document.getElementById('sendUserAvatar')
  sendUserAvatar.src = a.dataset.photo
  sendUserAvatar.style.display = 'inherit'
  userName = document.getElementById('sendUserName')
  userName.innerHTML = a.dataset.name
  userName.style.display = 'inherit'
  dotmenu = document.getElementById('dot-menu2')
  dotmenu.style.display = 'inherit'
  
}
goBack = ()=>{
  document.getElementById('contacts').style.width = '100%'
  document.getElementById('chat').style.display = 'none'
  document.getElementById('contacts').style.display = 'initial'
}

sendIcon = ()=>{
  document.getElementById('paper-clip').setAttribute('class','far fa-paper-plane')
  document.getElementById('paper-clip').setAttribute('onclick','sendMsg()')
  document.getElementById('paper-clip').style.transform = 'rotate(15deg)';
}

paperIcon = ()=>{
  document.getElementById('paper-clip').setAttribute('class','fas fa-paperclip')
  // document.getElementById('paper-clip').setAttribute('onclick','sendMsg()')
  // document.getElementById('paper-clip').style.transform = 'rotate(15deg)';
}

sendMsg = ()=>{
  currentUser =  firebase.auth().currentUser;
    console.log(currentUser)
    currentKey = currentUser.uid
    // database = firebase.database().ref(`/chats/${currentKey}`)
}



















































































  menuPop = () => {
    dotMenu = document.getElementById('dot-menu')
    menu = document.createElement('div')
    menu.setAttribute('class','menu')
    menu.setAttribute('id','menu')
    logoutBtn = document.createElement('button')
    logoutBtn.setAttribute('class','logoutBtn')
    logoutBtn.setAttribute('id','logoutBtn')
    logoutBtn.setAttribute('onclick','logOut()')
    logoutBtn.innerHTML = 'Log Out'
    menu.appendChild(logoutBtn)
    dotMenu.appendChild(menu)
    dotMenu.setAttribute('onclick','menuHide()')
  }
  menuHide = ()=>{
    dotMenu = document.getElementById('dot-menu')
    dotMenu.lastChild.remove()
    dotMenu.setAttribute('onclick','menuPop()')
  }
  logOut = ()=>{
    firebase.auth().signOut().then(function() {
      // Sign-out successful.
      document.getElementById('container').style.display = 'none'
      document.getElementById('loginForm').style.display = 'flex'
      alert('Log Out Successful!')
    }).catch(function(error) {
      // An error happened.
      alert(error)
    });
  }