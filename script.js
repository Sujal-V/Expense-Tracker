// --- DOM Elements ---
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const userDisplay = document.getElementById('user-display');

const form = document.getElementById('expense-form');
const list = document.getElementById('transaction-list');
const totalDisplay = document.getElementById('total-amount');
const monthFilter = document.getElementById('month-filter');
const adviceText = document.getElementById('advice-text');
const themeBtn = document.getElementById('theme-btn');
const budgetInput = document.getElementById('budget-limit');
const budgetProgress = document.getElementById('budget-progress');
const budgetStatus = document.getElementById('budget-status');
const exportBtn = document.getElementById('export-btn');
const ctx = document.getElementById('expenseChart').getContext('2d');

// --- State Variables ---
let currentUser = localStorage.getItem('currentUser');
let transactions = [];
let budgetLimit = 0;
let chartInstance = null;
// Variable to keep track of the previous total
let previousTotal = 0;

// The Animation Function
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);

        // Easing function makes it slow down right at the end for a smooth finish
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(easeOut * (end - start) + start);

        obj.innerHTML = `₹${currentVal}`;

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = `₹${end}`; // Ensure it lands exactly on the final number
        }
    };
    window.requestAnimationFrame(step);
}
// --- Data Management (The Fix) ---
function loadUserData() {
    if (!currentUser) return;

    // Load transactions specifically for this user
    const storedTxns = localStorage.getItem(`transactions_${currentUser}`);
    transactions = storedTxns ? JSON.parse(storedTxns) : [];

    // Load budget specifically for this user
    const storedBudget = localStorage.getItem(`budget_${currentUser}`);
    budgetLimit = storedBudget ? Number(storedBudget) : 0;

    // Update the budget input box to match
    if (budgetInput) budgetInput.value = budgetLimit;
}

function saveUserData() {
    if (!currentUser) return;
    localStorage.setItem(`transactions_${currentUser}`, JSON.stringify(transactions));
    localStorage.setItem(`budget_${currentUser}`, budgetLimit);
}

// --- Authentication Logic ---
function checkAuth() {
    if (currentUser) {
        // User is logged in: Load their specific data
        loadUserData();

        authScreen.style.display = 'none';
        appScreen.style.display = 'block';
        userDisplay.innerText = `Hello, ${currentUser}`;
        updateUI(); // Render the data we just loaded
    } else {
        // User is logged out: Hide everything
        authScreen.style.display = 'flex';
        appScreen.style.display = 'none';
    }
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        if (email) {
            currentUser = email;
            localStorage.setItem('currentUser', currentUser);
            checkAuth();
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        transactions = []; // Clear data from memory
        checkAuth();
    });
}

// --- Theme Logic ---
const themes = ['light', 'dark'];
let currentThemeIndex = 0;

themeBtn.addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex];
    document.documentElement.setAttribute('data-theme', newTheme);
    themeBtn.textContent = `Theme: ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`;
});

// --- Chart Logic ---
function initChart(currentTransactions) {
    if (chartInstance) chartInstance.destroy();

    const categories = ['food', 'travel', 'utilities', 'entertainment', 'other'];
    const totals = categories.map(cat =>
        currentTransactions.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0)
    );

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Food', 'Travel', 'Utilities', 'Entertainment', 'Other'],
            datasets: [{
                data: totals,
                backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#9966ff', '#4bc0c0'],
                borderWidth: 1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// --- Advice & Budget Logic ---
function generateAdvice(total, currentTransactions) {
    let advice = "<ul>";

    // Budget Checks
    if (budgetLimit > 0) {
        const percentage = (total / budgetLimit) * 100;
        budgetProgress.style.width = `${Math.min(percentage, 100)}%`;

        if (percentage >= 100) {
            advice += "<li>🚨 <b>CRITICAL:</b> You have exceeded your budget!</li>";
            budgetProgress.style.backgroundColor = "var(--danger-color)";
            budgetStatus.innerText = `Over Budget by ₹${total - budgetLimit}`;
            budgetStatus.style.color = "var(--danger-color)";

        } else if (percentage >= 90) {
            // --- NEW: 90% ALERT BOX ---
            advice += "<li>⚠️ <b>Warning:</b> You've used over 90% of your budget.</li>";
            budgetProgress.style.backgroundColor = "var(--warning-color)";
            budgetStatus.innerText = `Remaining: ₹${budgetLimit - total}`;
            budgetStatus.style.color = "var(--warning-color)";

            // Trigger the browser alert (wrapped in setTimeout to let UI render first)
            setTimeout(() => {
                alert(`⚠️ Warning: You have used ${percentage.toFixed(1)}% of your budget! Be careful with your spending.`);
            }, 500);

        } else if (percentage >= 80) {
            advice += "<li>⚠️ <b>Warning:</b> You've used over 80% of your budget.</li>";
            budgetProgress.style.backgroundColor = "var(--warning-color)";
            budgetStatus.innerText = `Remaining: ₹${budgetLimit - total}`;
            budgetStatus.style.color = "var(--warning-color)";
        } else {
            advice += "<li>✅ You are well within your budget.</li>";
            budgetProgress.style.backgroundColor = "var(--accent-color)";
            budgetStatus.innerText = `Remaining: ₹${budgetLimit - total}`;
            budgetStatus.style.color = "var(--text-color)";
        }
    } else {
        budgetStatus.innerText = "Set a limit to track budget";
        budgetProgress.style.width = "0%";
    }

    // Category Advice
    if (total > 0) {
        const foodTotal = currentTransactions.filter(t => t.category === 'food').reduce((sum, t) => sum + t.amount, 0);
        if ((foodTotal / total) > 0.4) {
            advice += "<li>🍕 You are spending >40% on Food. Try cooking?</li>";
        }
    } else {
        advice += "<li>ℹ️ Add expenses to see AI insights.</li>";
    }

    advice += "</ul>";
    adviceText.innerHTML = advice;
}

// --- Export Logic ---
exportBtn.addEventListener('click', () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Description,Category,Amount\n";

    // Export ALL transactions for the current user
    transactions.forEach(t => {
        csvContent += `${t.date},${t.desc},${t.category},${t.amount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// --- Core App Logic ---
function updateUI() {
    const selectedMonth = monthFilter.value;
    list.innerHTML = '';

    // Filter the current user's transactions
    let filteredTransactions = transactions;
    if (selectedMonth) {
        filteredTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
    }

    // Sort by date
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Render List
    filteredTransactions.forEach(t => {
        const item = document.createElement('li');
        item.classList.add('transaction-item');
        item.innerHTML = `
            <div>
                <span class="category-badge cat-${t.category}">${t.category}</span>
                ${t.desc} <small>(${t.date})</small>
            </div>
            <strong>₹${t.amount}</strong>
        `;
        list.appendChild(item);
    });

    const total = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
    // Animate from the old total to the new total over 800 milliseconds
    animateValue(totalDisplay, previousTotal, total, 800);
    previousTotal = total; // Save the new total for the next animation

    initChart(filteredTransactions);
    generateAdvice(total, filteredTransactions);

    // Save data whenever UI updates
    saveUserData();
}

// Add Transaction
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const transaction = {
        id: Date.now(),
        desc: document.getElementById('desc').value,
        amount: Number(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };
    transactions.push(transaction);
    updateUI();
    form.reset();
    document.getElementById('date').valueAsDate = new Date();
});

// Budget Input Listener
if (budgetInput) {
    budgetInput.addEventListener('change', (e) => {
        budgetLimit = Number(e.target.value);
        updateUI(); // updateUI calls saveUserData
    });
}

monthFilter.addEventListener('change', updateUI);

// Init
document.getElementById('date').valueAsDate = new Date();
checkAuth();

// Ambient Mouse Glow Effect
const cursorGlow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
});