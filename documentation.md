# Dell Inventory Management System Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [File Structure](#file-structure)
5. [Setup & Installation](#setup--installation)
6. [Running the Application](#running-the-application)
7. [API Endpoints](#api-endpoints)
8. [Theme Toggle Implementation](#theme-toggle-implementation)
9. [Customization & Extensibility](#customization--extensibility)
10. [Troubleshooting](#troubleshooting)
11. [License](#license)

---

## Project Overview
The **Dell Inventory Management System** is a premium‑styled, single‑page web application that lets users manage a simple product inventory (add, check, update, remove) through a clean, Dell‑inspired UI. The app runs on a lightweight Node.js Express server exposing a REST API and a client‑side UI built with vanilla HTML, CSS, and JavaScript (ES5/ES6 functions – no arrow functions as per user constraints).

---

## Features
- **Product CRUD** – Add, verify availability, update, and delete inventory items.
- **Live inventory statistics** – Total count badge updates automatically.
- **Dark‑mode theme toggle** – Persistent across sessions via `localStorage`.
- **Responsive, premium UI** – Uses Google Fonts (`Outfit`), CSS variables, and a Dell‑styled logo.
- **Modular client code** – All UI logic lives in `script.js`; server logic in `server.js`.
- **No external UI frameworks** – Pure vanilla CSS/JS for maximum compatibility.

---

## Technology Stack
| Layer | Technology |
|------|------------|
| Front‑end | HTML5, CSS3 (variables, custom dark theme), vanilla JavaScript (ES5/ES6 functions) |
| Back‑end  | Node.js (v20+), Express.js |
| Data store | In‑memory array (for demonstration – can be swapped for a DB) |
| Build / Run | `npm install`, `node server.js` |

---

## File Structure
```
afford project/               # Project root
│
├─ index.html                # Main page – UI layout, theme toggle button
├─ style.css                 # Global styles, CSS variables, dark‑theme rules
├─ script.js                 # UI logic, event handling, localStorage theme persistence
├─ server.js                 # Express server exposing /api/products
├─ package.json              # npm meta – dependencies, start script
├─ documentation.md          # **This file** – project documentation
└─ README.md (optional)    # Short project overview for GitHub
```

---

## Setup & Installation
1. **Prerequisites**
   - Node.js (≥ v20) & npm installed.
   - Git (optional, for version control).
2. **Clone / copy the repository**
   ```bash
   # If using git
   git clone <repo‑url>
   cd "c:/Users/ASUS/OneDrive/yabez/afford project"
   ```
3. **Install dependencies**
   ```bash
   npm install   # installs Express (and any other listed deps)
   ```
4. **(Optional) Verify package.json** – It should contain at least:
   ```json
   {
     "name": "dell‑inventory",
     "version": "1.0.0",
     "main": "server.js",
     "scripts": { "start": "node server.js" },
     "dependencies": { "express": "^4.18.2" }
   }
   ```

---

## Running the Application
1. **Start the server**
   ```bash
   npm start   # or: node server.js
   ```
   You should see:
   `Dell Inventory Control Server running on http://localhost:5500`
2. **Open the UI**
   - In a browser (Chrome/Edge/Firefox) navigate to `http://localhost:5500`.
   - If the page does not load, try:
     - Clearing the cache or using an incognito window.
     - Accessing via `http://127.0.0.1:5500`.
3. **Using the UI**
   - Add products via the **Add Product** form.
   - Verify stock with **Check Availability**.
   - Update existing entries using **Update Product**.
   - Remove items with **Remove Product** (modal confirmation).
   - Switch between Light/Dark themes by clicking the **Toggle Theme** button in the header; choice is stored in `localStorage`.

---

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Returns JSON array of all products.
| POST | `/api/products` | Body `{ "name": "Product Name" }` – adds a product.
| PUT | `/api/products/:id` | Body `{ "name": "New Name" }` – updates product.
| DELETE | `/api/products/:id` | Deletes product.
| GET | `/api/products/:id` | Retrieves a single product (used internally).

> **Note:** The server stores data in memory; restarting the server clears the inventory.

---

## Theme Toggle Implementation
- **HTML** – Button added in `index.html` (line 31):
  ```html
  <button id="theme-toggle-btn" class="btn btn-outline">Toggle Theme</button>
  ```
- **CSS** – Dark theme defined in `style.css` using the `.dark-theme` class that overrides CSS variables for background, text, and component colors.
- **JavaScript** – In `script.js`:
  ```js
  function applyTheme(theme) {
      document.body.classList.toggle('dark-theme', theme === 'dark');
      localStorage.setItem('theme', theme);
  }

  // Initialize theme on load
  var savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  // Button handler
  document.getElementById('theme-toggle-btn').addEventListener('click', function () {
      var newTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
      applyTheme(newTheme);
  });
  ```
- The theme persists across page reloads because the chosen value is saved in `localStorage`.

---

## Customization & Extensibility
- **Replace the in‑memory store** – swap the array in `server.js` with a database (e.g., SQLite, MongoDB). Adjust the CRUD routes accordingly.
- **Add more UI components** – follow the existing pattern: create a card in `index.html`, style it in `style.css`, and wire up events in `script.js`.
- **Change the color palette** – edit the CSS variables in `style.css` under the `:root` selector and the `.dark-theme` overrides.
- **Internationalization** – add a simple language selector and store the chosen language in `localStorage`; load language strings from a JSON file.

---

## Troubleshooting
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Page does not load (404) | Server not started or wrong port | Run `npm start` and verify console message `running on http://localhost:5500` |
| Theme toggle does nothing | `script.js` not loaded or DOM element ID mismatch | Ensure `<script src="script.js"></script>` is at the bottom of `index.html` and the button ID is `theme-toggle-btn`. |
| API returns empty list after refresh | Data stored only in memory | Persist data to a file or DB, or accept that a restart clears the list. |
| Styles look broken | CSS file missing or cache issue | Verify `style.css` is linked in `<head>` and clear the browser cache. |

---

## License
This project is provided for educational purposes. You may use, modify, and distribute it under the MIT License.

---

*Generated by Antigravity – your AI coding assistant.*
