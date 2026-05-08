const token = localStorage.getItem("token");
const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");

const groupName = document.querySelector("#groupName");
const membersList = document.querySelector("#membersList");
const memberForm = document.querySelector("#memberForm");
const memberEmail = document.querySelector("#memberEmail");
const expenseForm = document.querySelector("#expenseForm");
const expenseTitle = document.querySelector("#expenseTitle");
const expenseAmount = document.querySelector("#expenseAmount");
const expensesList = document.querySelector("#expensesList");
const balancesList = document.querySelector("#balancesList");
const memberMessage = document.querySelector("#memberMessage");
const expenseMessage = document.querySelector("#expenseMessage");
const logoutBtn = document.querySelector("#logoutBtn");

if (!groupId) {
  window.location.href = "/pages/dashboard.html";
}

logoutBtn.addEventListener("click", function () {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/pages/login.html";
});

async function loadGroupDetails() {
  try {
    const response = await fetch(`/api/groups/${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      memberMessage.innerText = data.message;
      return;
    }

    groupName.innerText = data.group.name;
    membersList.innerHTML = "";

    data.members.forEach(member => {
      const p = document.createElement("p");
      p.innerText = "• " + member.name;
      membersList.appendChild(p);
    });
  } catch (error) {
    console.error("Load group details error:", error);
    memberMessage.innerText = "Could not load group details.";
  }
}

async function loadExpenses() {
  try {
    const response = await fetch(`/api/groups/${groupId}/expenses`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const expenses = await response.json();
    expensesList.innerHTML = "";

    if (!expenses.length) {
      expensesList.innerHTML = "<p>No expenses yet.</p>";
      return;
    }

    expenses.forEach(expense => {
      const div = document.createElement("div");
      div.className = "card expense-card";

      div.innerHTML = `
        <h3>${expense.title}</h3>
        <p>Amount: $${Number(expense.amount).toFixed(2)}</p>
        <p>Paid by: ${expense.paid_by_name}</p>

        <div class="expense-actions">
          <button onclick='editExpense(${expense.id}, ${JSON.stringify(expense.title)}, ${expense.amount})'>
            Edit
          </button>

          <button class="danger-btn" onclick="deleteExpense(${expense.id})">
            Delete
          </button>
        </div>
      `;

      expensesList.appendChild(div);
    });
  } catch (error) {
    console.error("Load expenses error:", error);
    expensesList.innerHTML = "<p>Could not load expenses.</p>";
  }
}

async function loadBalances() {
  try {
    const response = await fetch(`/api/groups/${groupId}/balances`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    balancesList.innerHTML = "";

    if (!response.ok) {
      balancesList.innerHTML = `<p>${data.message}</p>`;
      return;
    }

    if (!data.settlements.length) {
      balancesList.innerHTML = "<p>No balances yet.</p>";
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("user"));

    data.settlements.forEach(item => {
      const div = document.createElement("div");

      let balanceText = "";
      let balanceClass = "";

      if (item.from === currentUser.name) {
        balanceText = `You owe ${item.to} $${Number(item.amount).toFixed(2)}`;
        balanceClass = "balance-negative";
      } else if (item.to === currentUser.name) {
        balanceText = `${item.from} owes you $${Number(item.amount).toFixed(2)}`;
        balanceClass = "balance-positive";
      } else {
        balanceText = `${item.from} owes ${item.to} $${Number(item.amount).toFixed(2)}`;
      }

      div.className = `card balance-card ${balanceClass}`;
      div.innerHTML = `<span>${balanceText}</span>`;

      balancesList.appendChild(div);
    });
  } catch (error) {
    console.error("Load balances error:", error);
    balancesList.innerHTML = "<p>Could not load balances.</p>";
  }
}

memberForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = memberEmail.value;

  try {
    const response = await fetch(`/api/groups/${groupId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (response.ok) {
      memberMessage.innerText = "Member added successfully.";
      memberEmail.value = "";
      await loadGroupDetails();
      await loadBalances();
    } else {
      memberMessage.innerText = data.message;
    }
  } catch (error) {
    console.error("Add member error:", error);
    memberMessage.innerText = "Something went wrong while adding member.";
  }
});

expenseForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const title = expenseTitle.value;
  const amount = expenseAmount.value;

  try {
    const response = await fetch(`/api/groups/${groupId}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, amount })
    });

    const data = await response.json();

    if (response.ok) {
      expenseMessage.innerText = "Expense added successfully.";
      expenseTitle.value = "";
      expenseAmount.value = "";
      await loadExpenses();
      await loadBalances();
    } else {
      expenseMessage.innerText = data.message;
    }
  } catch (error) {
    console.error("Add expense error:", error);
    expenseMessage.innerText = "Something went wrong.";
  }
});

async function editExpense(expenseId, oldTitle, oldAmount) {
  const newTitle = prompt("Enter new title:", oldTitle);
  const newAmount = prompt("Enter new amount:", oldAmount);

  if (!newTitle || !newAmount) {
    return;
  }

  try {
    const response = await fetch(`/api/expenses/${expenseId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: newTitle,
        amount: newAmount
      })
    });

    const data = await response.json();

    if (response.ok) {
      expenseMessage.innerText = "Expense updated!";
      await loadExpenses();
      await loadBalances();
    } else {
      expenseMessage.innerText = data.message;
    }
  } catch (error) {
    console.error("Edit expense error:", error);
    expenseMessage.innerText = "Something went wrong! Try again.";
  }
}

async function deleteExpense(expenseId) {
  const confirmDelete = confirm("Delete this expense?");

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`/api/expenses/${expenseId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      expenseMessage.innerText = "Expense deleted!";
      await loadExpenses();
      await loadBalances();
    } else {
      expenseMessage.innerText = data.message;
    }
  } catch (error) {
    console.error("Delete expense error:", error);
    expenseMessage.innerText = "Something went wrong! Try again.";
  }
}

loadGroupDetails();
loadExpenses();
loadBalances();