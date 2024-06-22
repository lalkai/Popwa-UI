let username = "";
let score = 0;
let updateScoreTimeout;
let ws;

const apiUrl = 'Your API URL';
const delay = 3000;
const count = document.getElementById("score");


function initWebSocket() {
  ws = new WebSocket(`ws://${apiUrl}/wsPopwa`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.action === "updateLeaderboard") {
        updateLeaderboard(data.data.users);
      }
    } catch (error) {
      console.error("Error parsing JSON from WebSocket message:", error);
    }
  };

  ws.onclose = () => {
    console.log("WebSocket closed. Reconnecting...");
    setTimeout(initWebSocket, 2000);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    ws.close();
  };
}


function startGame() {
  username = document.getElementById("username").value.trim();

  if (username === "") {
    username = "Anonymous";
  }

  document.getElementById("display-username").innerText = `#${username}`;
  getUserScore(username, getLeaderboard);

  document.getElementById("welcome-container").style.display = "none";
  document.getElementById("game-container").style.display = "flex";

  const img = document.getElementById("popwa1");

  const audio = new Audio("sound/pop.mp3");
  const isTouchDevice = "ontouchstart" in document.documentElement;

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
  }, { passive: false });

  img.addEventListener("touchend", function () {
    img.src = "image/popwa1.png";
    audio.play();
  }, { passive: true });

  function increaseScore() {
    score++;
    count.innerHTML = score;
    updateScore(username, score); 
  }
}
function updateScore(username, score) {
  try {
    const data = {
      UserName: username,
      Score: score,
    };

    if (updateScoreTimeout) {
      clearTimeout(updateScoreTimeout);
    }

    updateScoreTimeout = setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          action: "updateScore",
          data: data,
        }));
      } else {
        console.error("WebSocket is not open.");
      }
    }, delay);
  } catch (error) {
    console.error("Error in updateScore:", error);
  }
}

function addUser(username) {
  try {
    const data = {
      UserName: username,
    };

    fetch(`http://${apiUrl}/addUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {})
      .catch((error) => {
        console.error("Error adding user:", error);
      });
  } catch (error) {
    console.error("Error in addUser:", error);
  }
}

function getUserScore(username, callback) {
  try {
    fetch(`http://${apiUrl}/getUser/${username}`)
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
  try {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        action: "getLeaderboard",
      }));
    } else {
      console.error("WebSocket is not open.");
    }
  } catch (error) {
    console.error("Error in getLeaderboard:", error);
  }
}

function updateLeaderboard(users) {
  try {
    const leaderboardContainer = document.getElementById("leaderboard");
    if (leaderboardContainer) {
      leaderboardContainer.innerHTML = "";

      if (Array.isArray(users)) {
        users.sort((a, b) => b.Score - a.Score);
        users.forEach((user, index) => {
          const listItem = document.createElement("li");
          listItem.textContent = `${index + 1}. ${user.UserName}: ${user.Score}`;
          leaderboardContainer.appendChild(listItem);
        });
      }
    }
  } catch (error) {
    console.error("Error updating leaderboard:", error);
  }
}

function toggleLeaderboard() {
  const leaderboardContainer = document.getElementById("leaderboard-container");
  if (leaderboardContainer) {
    leaderboardContainer.classList.toggle("visible");
  }
}

initWebSocket();
