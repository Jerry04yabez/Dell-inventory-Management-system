/**
 * Dell Inventory Management System - Node.js Express Backend
 * 
 * JavaScript standard: ES5/ES6 normal functions only. NO arrow functions (=>).
 */

var express = require('express');
var cors = require('cors');
var path = require('path');

var app = express();
var port = process.env.PORT || 5500;

// Enable CORS and parsing of request bodies
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (index.html, style.css, script.js)
app.use(express.static(path.join(__dirname)));

// Internal database array preloaded with initial Dell product entries
var inventory = [
    'Dell Inspiron 15',
    'Dell XPS 13',
    'Dell Latitude 5420',
    'Dell Alienware M18'
];

/**
 * Helper: Find case-insensitive index of a product in our database array.
 * @param {string} name 
 * @returns {number} The index in the array, or -1 if not found.
 */
function findProductIndex(name) {
    if (!name) return -1;
    var searchStr = name.trim().toLowerCase();
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].trim().toLowerCase() === searchStr) {
            return i;
        }
    }
    return -1;
}

/**
 * API: Get entire inventory list
 * Endpoint: GET /api/products
 */
app.get('/api/products', function(req, res) {
    res.json(inventory);
});

/**
 * API: Add a new product
 * Endpoint: POST /api/products
 */
app.post('/api/products', function(req, res) {
    var name = req.body.name;
    
    // 1. Validation: Prevent empty input
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Product name cannot be empty.' });
    }
    
    var trimmedName = name.trim();

    // 2. Validation: Prevent duplicate products
    if (findProductIndex(trimmedName) !== -1) {
        return res.status(400).json({ error: 'Product "' + trimmedName + '" already exists in stock.' });
    }

    // 3. Perform addition
    inventory.push(trimmedName);
    res.status(201).json({ message: 'Product added successfully.', product: trimmedName });
});

/**
 * API: Update an existing product
 * Endpoint: PUT /api/products
 */
app.put('/api/products', function(req, res) {
    var existingName = req.body.existingName;
    var newName = req.body.newName;

    // 1. Validation: Prevent empty inputs
    if (!existingName || existingName.trim() === '') {
        return res.status(400).json({ error: 'Existing product name is required.' });
    }
    if (!newName || newName.trim() === '') {
        return res.status(400).json({ error: 'New product name cannot be empty.' });
    }

    var trimmedExisting = existingName.trim();
    var trimmedNew = newName.trim();

    // 2. Validation: Check if existing product exists in database
    var existingIndex = findProductIndex(trimmedExisting);
    if (existingIndex === -1) {
        return res.status(404).json({ error: 'Existing product "' + trimmedExisting + '" not found.' });
    }

    // 3. Validation: Prevent duplicate products (unless updating name to itself)
    var duplicateIndex = findProductIndex(trimmedNew);
    if (duplicateIndex !== -1 && duplicateIndex !== existingIndex) {
        return res.status(400).json({ error: 'Product "' + trimmedNew + '" already exists in stock.' });
    }

    // 4. Perform update
    var oldName = inventory[existingIndex];
    inventory[existingIndex] = trimmedNew;
    res.json({ message: 'Product updated successfully.', oldProduct: oldName, product: trimmedNew });
});

/**
 * API: Remove a product
 * Endpoint: DELETE /api/products
 */
app.delete('/api/products', function(req, res) {
    // Check either query parameter or request body
    var name = req.query.name || req.body.name;

    // 1. Validation: Prevent empty input
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Product name is required for deletion.' });
    }

    var trimmedName = name.trim();

    // 2. Validation: Check if product exists in database
    var index = findProductIndex(trimmedName);
    if (index === -1) {
        return res.status(404).json({ error: 'Product "' + trimmedName + '" does not exist.' });
    }

    // 3. Perform removal
    var removedName = inventory[index];
    inventory.splice(index, 1);
    res.json({ message: 'Product removed successfully.', product: removedName });
});

/**
 * API: Check availability of a product
 * Endpoint: GET /api/products/check
 */
app.get('/api/products/check', function(req, res) {
    var name = req.query.name;

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Product name is required to check availability.' });
    }

    var trimmedName = name.trim();
    var index = findProductIndex(trimmedName);

    if (index !== -1) {
        res.json({ exists: true, product: inventory[index] });
    } else {
        res.json({ exists: false, product: trimmedName });
    }
});

// Wildcard fallback: serve index.html for undefined browser routes
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Launch server listener
app.listen(port, function() {
    console.log('Dell Inventory Control Server running on http://localhost:' + port);
});
