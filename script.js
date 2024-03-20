let Username = "";
let score = 0;
var count = document.getElementById("score");

function startGame() {
  let Username = document.getElementById("username").value.trim();

  if (Username === "") {
    Username = "Anonymous";
  }

  document.getElementById("display-username").innerText = `#${Username}`;
  getUserScore(Username, getLeaderboard);

  setInterval(() => {
    if (Username !== "Anonymous") {
      updateScore(Username, score);
    }
  }, 10);

  document.getElementById("welcome-container").style.display = "none";
  document.getElementById("game-container").style.display = "flex";

  var img = document.getElementById("popwa1");

  var audio = new Audio("sound/pop.mp3");
  var isTouchDevice = "ontouchstart" in document.documentElement;

  count.innerHTML = score;

  // mouseclick event
  img.addEventListener("mousedown", function () {
    if (!isTouchDevice) {
      increaseScore();
      img.src = "image/popwa2.png";
      audio.play();
    }
  });

  img.addEventListener("mouseup", function () {
    img.src = "image/popwa1.png";
    audio.play();
  });

  // touch event
  img.addEventListener("touchstart", function (event) {
    event.preventDefault();
    event.stopPropagation();
    increaseScore();
    img.src = "image/popwa2.png";
    audio.play();
  });

  img.addEventListener("touchend", function () {
    img.src = "image/popwa1.png";
    audio.play();
  });

  function increaseScore() {
    score++;
    count.innerHTML = score;
  }
}

function updateScore(username, score) {
  try {
    const data = {
      UserName: username,
      Score: score,
    };

    fetch("Your_API", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {})
      .catch((error) => {
        console.error("Error sending data to API:", error);
      });
  } catch (error) {
    console.error("Error in sendDataToApi:", error);
  }
}

function addUser(username) {
  try {
    const data = {
      UserName: username,
    };

    fetch("Your_API", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {})
      .catch((error) => {
        console.error("Error sending data to API:", error);
      });
  } catch (error) {
    console.error("Error in sendDataToApi:", error);
  }
}

function getUserScore(username, callback) {
  try {
    fetch(`Your_API${username}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.users.Score !== undefined) {
          score = data.users.Score;
          count.innerHTML = score;
        }

        if (typeof callback === "function") {
          callback();
        }
      })
      .catch((error) => {
        addUser(username);
        if (typeof callback === "function") {
          callback();
        }
      });
  } catch (error) {
    addUser(username);
  }
}

function getLeaderboard() {
  const socket = new WebSocket("Your_API");

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      const leaderboardContainer = document.getElementById("leaderboard");
      if (leaderboardContainer) {
        leaderboardContainer.innerHTML = "";

        if (Array.isArray(data.users)) {
          data.users.sort((a, b) => b.Score - a.Score);
          data.users.forEach((user, index) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `${index + 1}. ${user.UserName}: ${user.Score}`;
            leaderboardContainer.appendChild(listItem);
          });
        }
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  socket.onclose = () => {
    setTimeout(getLeaderboard, 2000);
  };

  socket.onerror = (error) => {
    socket.close();
  };
}

function toggleLeaderboard() {
  const leaderboardContainer = document.getElementById("leaderboard-container");
  if (leaderboardContainer) {
    leaderboardContainer.classList.toggle("visible");
  }
}
