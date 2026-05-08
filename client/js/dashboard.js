

const groupForm = document.querySelector("#groupForm");
const groupNameInput = document.querySelector("#groupName");
const groupsList = document.querySelector("#groupsList");
const message = document.querySelector("#message");
const welcomeMessage = document.querySelector("#welcomeMessage");
const logoutBtn = document.querySelector("#logoutBtn");

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token) {
  window.location.href = "/pages/login.html";
}

if (welcomeMessage && user) {
  welcomeMessage.innerText = `Welcome, ${user.name}`;
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/pages/login.html";
  });
}

async function loadGroups() {
  try {
    const response = await fetch("/api/groups", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const groups = await response.json();


    groupsList.innerHTML = "";

    if (!Array.isArray(groups) || groups.length === 0) {
      groupsList.innerHTML = "<p>No groups yet. Create one above.</p>";
      return;
    }

    groups.forEach(group => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <h3>${group.name}</h3>
        <p>Created: ${new Date(group.created_at).toLocaleDateString()}</p>
        <a href="/pages/group.html?id=${group.id}">Open Group</a>
      `;

      groupsList.appendChild(div);
    });
  } catch (error) {
    // console.error("Load groups error:", error);
    groupsList.innerHTML = "<p>Could not load groups.</p>";
  }
}

if (groupForm) {
  groupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = groupNameInput.value;

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      const data = await response.json();

      if (response.ok) {
        message.innerText = "Group created successfully.";
        groupNameInput.value = "";
        await loadGroups();
      } else {
        message.innerText = data.message;
      }
    } catch (error) {
      console.error("Create group error:", error);
      message.innerText = "Something went wrong.";
    }
  });
}

loadGroups();