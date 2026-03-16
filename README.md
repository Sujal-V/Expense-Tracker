# TrackIt

# 🪙 TrackIt - Smart Expense Tracker

A responsive, minimalist expense tracking web application built to demonstrate fundamental frontend development skills, including complex DOM manipulation, state management, and data visualization.



## 🚀 Features

* **Interactive Data Visualization:** Integrates `Chart.js` to render dynamic doughnut charts that update in real-time as transactions are added or filtered.
* **Persistent State Management:** Utilizes browser `localStorage` to securely save user data, budgets, and preferences across sessions without needing a backend database.
* **Simulated Authentication:** Features a session-based login system that isolates transaction data based on the user's email address.
* **Smart Budget Alerts:** Proactive UI feedback that calculates spending percentages and triggers visual warnings (green/yellow/red) when a user approaches their custom monthly limit.
* **Theme Customization:** A seamless Light/Dark mode toggle built with CSS variables (`:root`) for optimal user accessibility.
* **Data Export:** Includes a custom JavaScript function that parses JSON state data into a downloadable `.csv` file for Excel integration.

## 🛠️ Tech Stack

* **HTML5:** Semantic structuring and accessible form design.
* **CSS3:** Custom variables, responsive Grid/Flexbox layouts, Glassmorphism UI effects, and CSS transitions.
* **Vanilla JavaScript (ES6+):** Array methods (`filter`, `reduce`, `map`), event listeners, and asynchronous UI updates.
* **Libraries:** Chart.js (Data Visualization), FontAwesome (Icons).

## 💡 Key Technical Implementations

### Dynamic Budget Algorithm
The application calculates the total expenses in real-time and dynamically updates a progress bar using inline CSS manipulation, ensuring the user gets immediate visual feedback on their financial health.

### Asynchronous Alert Handling
Implemented `setTimeout()` to manage the browser's render cycle, ensuring the DOM updates visually before triggering any blocking browser alerts.

## ⚙️ Run Locally

Since this is a client-side application, no complex build tools are required.
