const socket = io();

// ################################################################
//                        ELEMENTS
// ################################################################

// access input field by id
// const message = document.querySelector('#message-input').value;

// access imput filed by its order in form
// const message = event.target[0].value;

// access input field by its name
// const message = event.target.elements.message.value;

// old ver
const $welcome = document.querySelector("#welcome");
const $form = document.querySelector("#message-form");
const $formInput = $form.querySelector("input");
const $formButton = $form.querySelector("button");
const $messages = document.querySelector("#messages");
const $clear = document.querySelector("#clear");
const $geo = document.querySelector("#geo");
const $users = document.querySelector("#show-users");
const $exit = document.querySelector("#exit");
const $usersContainer = document.querySelector("#users-container");
const $closeListButton = document.querySelector(".close-list-btn");
const $backdrop = document.querySelector("#backdrop");
const $chatRoom = document.querySelector("#chat-room");
const $usersList = document.querySelector("#users-list");

// mustache ver
const $messagesContainer = document.querySelector("#messages-container");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const myMessageTemplate = document.querySelector("#my-message-template")
  .innerHTML;
const geoMessageTemplate = document.querySelector("#geo-message-template")
  .innerHTML;
const myGeoMessageTemplate = document.querySelector("#my-geo-message-template")
  .innerHTML;

// const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// ################################################################
//            AUTO SCROLLING IF AT VISIBLE BOTTOM 
// ################################################################

// 1 WAY use css settings
// #messages-container {
//   overflow-y: scroll;
//   display: flex;
//   flex-direction: column-reverse;
//   ...
// }

// 2 WAY use helper function
const autoscroll = () => {
  // select new message element
  const newMess = $messagesContainer.lastElementChild
  // get totla height of the message
  const newMessStyles = getComputedStyle(newMess);
  const newMessMargin = parseInt(newMessStyles.marginBottom);
  const newMessHeight = newMess.offsetHeight + newMessMargin;
  // chat box visible height
  const chatBoxVisibleHeight = $messagesContainer.offsetHeight
  // chat box full height
  const chatBoxScrollHeight = $messagesContainer.scrollHeight;  
  // logic behavior
  if(chatBoxScrollHeight - newMessHeight <= chatBoxVisibleHeight) {
    // set distance from the top equal to total height
    $messagesContainer.scrollTop = $messagesContainer.scrollHeight
  }  
}

// ################################################################
//      JOIN CHAT           QUERY STRING OPTIONS
// ################################################################

// location - global object that contains search query string
// Qs - queary string library that parse string to object
const options = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

socket.emit("userEntered", options, ({ error, notify }) => {
  if (error) {
    // render notification
    alert(error);
    // redirect to home page
    location.href = "/";
  }

  if (notify) {
    // render notification
    // alert(notify);
  }
});

// ################################################################
//                        UPDATE USERS LIST
// ################################################################

socket.on("updateUsersList", ({ room, users }) => {
  $chatRoom.textContent = `Room #${room}`;
  $usersList.querySelectorAll("*").forEach(node => node.remove());

  users.forEach(user => {
    const username = document.createElement("LI");
    username.classList.add("user");
    username.textContent = user.username;
    $usersList.appendChild(username);
  });

  // mustache ver
  // const html = Mustache.render(sidebarTemplate, {room , users});
  // document.querySelector("#sidebar").insertAdjacentHTML("afterbegin", html);

});

// ################################################################
//                        SHARE LOCATION
// ################################################################

$geo.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  // disable button prevent duplications
  $geo.textContent = "Shared";
  $geo.classList.add("shared");
  $geo.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(position => {
    if (position) {
      socket.emit(
        "shareLocation",
        {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude
        },
        () => {
          // enable button
          $geo.textContent = "Share Loc.";
          $geo.classList.remove("shared");
          $geo.removeAttribute("disabled");
          console.log("Location was shared!");
        }
      );
    }
  });
});

socket.on("sharedLocation", ({ coords, createdAt, username }) => {
  // URL
  // https://google.com/maps?q=<latitude>,<logitude>

  // mustache ver
  const url = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`;
  const html = Mustache.render(geoMessageTemplate, {
    url,
    createdAt: moment(createdAt).format("YY MMM Do ddd HH:mm"),
    username
  });
  $messagesContainer.insertAdjacentHTML("afterbegin", html);

  // auto scroll
  autoscroll();
  // old ver
  // const node = document.createElement("DIV"); // Create a <li> node
  // const mess = document.createElement("A");
  // mess.classList.add("newMessage");
  // mess.classList.add("show");
  // mess.setAttribute(
  //   "href",
  //   `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
  // );

  // mess.setAttribute("target", "_blank");

  // mess.textContent = "location";
  // node.appendChild(mess);
  // $messages.append(node);
});

socket.on("mySharedLocation", ({ coords, createdAt, username }) => {
  const url = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`;
  const html = Mustache.render(myGeoMessageTemplate, {
    url,
    createdAt: moment(createdAt).format("YY MMM Do ddd HH:mm"),
    username
  });

  $messagesContainer.insertAdjacentHTML("afterbegin", html);

  autoscroll();
});

// ################################################################
//                        SEND MESSAGE
// ################################################################

$form.addEventListener("submit", event => {
  event.preventDefault();
  // disable form button prevent duplicate msg
  $formButton.setAttribute("disabled", "disabled");
  const message = $formInput.value;

  if (!message.length) {
    $formButton.removeAttribute("disabled");
    $form.reset();
    return;
  }

  socket.emit("newMessage", message, acknldgmnt => {
    // enable form
    $formButton.removeAttribute("disabled");
    $formInput.value = "";
    $formInput.focus();

    console.log(acknldgmnt);
  });
});

socket.on("newMessage", ({ msg, createdAt, username }) => {
  // mustache ver
  const html = Mustache.render(messageTemplate, {
    message: msg,
    createdAt: moment(createdAt).format("YY MMM Do ddd HH:mm"),
    username
  });
  $messagesContainer.insertAdjacentHTML("afterbegin", html);

  autoscroll();
  // old ver
  // const node = document.createElement("DIV");
  // const mess = document.createElement("P");
  // mess.classList.add("newMessage");
  // mess.classList.add("show");
  // mess.textContent = msg;
  // node.appendChild(mess);
  // $messages.append(node);
});

socket.on("myMessage", ({ msg, createdAt, username }) => {
  // mustache ver
  const html = Mustache.render(myMessageTemplate, {
    message: msg,
    createdAt: moment(createdAt).format("YY MMM Do ddd HH:mm"),
    username
  });
  $messagesContainer.insertAdjacentHTML("afterbegin", html);
  autoscroll();
});

// ################################################################
//                        NOTIFICATIONS
// ################################################################

socket.on("notification", data => {
  $welcome.textContent = data;
  $welcome.classList.remove("show");
  setTimeout(() => {
    $welcome.classList.add("show");
  }, 1000);
});

socket.on("joinEvent", data => {
  $welcome.textContent = data;
  $welcome.classList.remove("show");
  setTimeout(() => {
    $welcome.classList.add("show");
  }, 1000);
});

socket.on("leaveEvent", data => {
  $welcome.textContent = data;
  $welcome.classList.remove("show");
  setTimeout(() => {
    $welcome.classList.add("show");
  }, 1000);
});

// ################################################################
//                        CLEAR CHAT
// ################################################################

$clear.addEventListener("click", () => {
  // mustache ver
  $messagesContainer.querySelectorAll("*").forEach(node => node.remove());
  // old ver
  // $messages.querySelectorAll("*").forEach(node => node.remove());
});

// ################################################################
//                        SHOW USERS LIST
// ################################################################

$users.addEventListener("click", () => {
  $usersContainer.classList.remove("hide");
  $usersContainer.classList.add("show");
  $backdrop.classList.remove("hide");
  $backdrop.classList.add("show");
});

$closeListButton.addEventListener("click", () => {
  $usersContainer.classList.remove("show");
  $usersContainer.classList.add("hide");
  $backdrop.classList.remove("show");
  $backdrop.classList.add("hide");
});

$backdrop.addEventListener('click', () => {
  $usersContainer.classList.remove("show");
  $usersContainer.classList.add("hide");
  $backdrop.classList.remove("show");
  $backdrop.classList.add("hide");
})

// ################################################################
//                        EXIT
// ################################################################

$exit.addEventListener("click", () => {
  location.href = "/";
});
