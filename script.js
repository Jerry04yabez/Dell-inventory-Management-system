/**
 * Dell Inventory Management System - Client Logic
 * 
 * JavaScript standard: ES5/ES6 normal functions only. NO arrow functions (=>).
 * Primary Data Source: Fetched dynamically from Node.js Express REST API.
 * UI updating via DOM manipulation.
 */

// Tracking variables for UI effects and local cache
var cachedProducts = [];
var newlyAddedProduct = null;
var productToDelete = null;

/**
 * Initializes the application on page load.
 * Configures form actions, button click handlers, and loads initial server data.
 */
function init() {
    // 1. Fetch initial inventory list from backend API
    renderInventory();

    // 2. Bind event listeners using normal functions
    
    // Add Product button listener
    var addBtn = document.getElementById('add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            handleAddProduct();
        });
    }

    // Check Availability button listener
    var checkBtn = document.getElementById('check-btn');
    if (checkBtn) {
        checkBtn.addEventListener('click', function() {
            handleCheckAvailability();
        });
    }

    // Clear Search button listener
    var clearSearchBtn = document.getElementById('clear-search-btn');
    var checkInput = document.getElementById('check-input');
    if (clearSearchBtn && checkInput) {
        checkInput.addEventListener('input', function() {
            if (checkInput.value.trim() !== '') {
                clearSearchBtn.style.display = 'block';
            } else {
                clearSearchBtn.style.display = 'none';
                clearAvailabilityResult();
            }
        });

        clearSearchBtn.addEventListener('click', function() {
            checkInput.value = '';
            clearSearchBtn.style.display = 'none';
            clearAvailabilityResult();
            checkInput.focus();
        });
    }

    // Update Product button listener
    var updateBtn = document.getElementById('update-btn');
    if (updateBtn) {
        updateBtn.addEventListener('click', function() {
            handleUpdateProduct();
        });
    }

    // Remove Product button listener (from Sidebar form)
    var removeBtn = document.getElementById('remove-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            handleRemoveProductFromInput();
        });
    }

    // Custom Modal Deletion Button listeners
    var modalCancelBtn = document.getElementById('modal-cancel-btn');
    if (modalCancelBtn) {
        modalCancelBtn.addEventListener('click', function() {
            closeDeleteModal();
        });
    }

    var modalConfirmBtn = document.getElementById('modal-confirm-btn');
    if (modalConfirmBtn) {
        modalConfirmBtn.addEventListener('click', function() {
            executeConfirmedDeletion();
        });
    }

    // Close modal if user clicks on the overlay itself
    var deleteModal = document.getElementById('delete-modal');
    if (deleteModal) {
        deleteModal.addEventListener('click', function(event) {
            if (event.target === deleteModal) {
                closeDeleteModal();
            }
        });
    }

    // Support keyboard trigger (Enter key) on inputs
    // Support keyboard trigger (Enter key) on inputs
    setupInputKeyboardTriggers();

    // Theme toggle button listener
    var themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            var isDark = document.body.classList.toggle('dark-theme');
            themeToggleBtn.textContent = isDark ? 'Light Theme' : 'Dark Theme';
            try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch(e) {}
        });
    }
    // Apply saved theme on load
    try {
        var savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            if (themeToggleBtn) themeToggleBtn.textContent = 'Light Theme';
        }
    } catch(e) {}
}

/**
 * Binds pressing "Enter" on text inputs to trigger their respective button clicks.
 */
function setupInputKeyboardTriggers() {
    var checkInput = document.getElementById('check-input');
    if (checkInput) {
        checkInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleCheckAvailability();
            }
        });
    }

    var addInput = document.getElementById('add-input');
    if (addInput) {
        addInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleAddProduct();
            }
        });
    }

    var updateNewInput = document.getElementById('update-new-input');
    if (updateNewInput) {
        updateNewInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleUpdateProduct();
            }
        });
    }

    var removeInput = document.getElementById('remove-input');
    if (removeInput) {
        removeInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleRemoveProductFromInput();
            }
        });
    }
}

/**
 * Helper: Find case-insensitive index of a product in our local cache.
 * @param {string} productName 
 * @returns {number} The index in the array, or -1 if not found.
 */
function findCachedProductIndex(productName) {
    if (!productName) return -1;
    var searchStr = productName.trim().toLowerCase();
    
    for (var i = 0; i < cachedProducts.length; i++) {
        if (cachedProducts[i].trim().toLowerCase() === searchStr) {
            return i;
        }
    }
    return -1;
}

/**
 * Fetches products list from API and dynamically renders cards in the grid.
 */
function renderInventory() {
    fetch('/api/products')
        .then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP network error ' + response.status);
            }
            return response.json();
        })
        .then(function(products) {
            // Update local registry cache
            cachedProducts = products;

            var gridContainer = document.getElementById('inventory-grid');
            var emptyState = document.getElementById('empty-state');
            var totalCountBadge = document.getElementById('total-count-badge');
            var totalCountDisplay = document.getElementById('total-count-display');

            // Update product counts
            var count = products.length;
            if (totalCountBadge) totalCountBadge.textContent = count;
            if (totalCountDisplay) totalCountDisplay.textContent = count;

            // Clear previous card outputs
            gridContainer.innerHTML = '';

            if (count === 0) {
                gridContainer.classList.add('hidden');
                if (emptyState) emptyState.classList.remove('hidden');
                return;
            }

            gridContainer.classList.remove('hidden');
            if (emptyState) emptyState.classList.add('hidden');

            // Build product cards dynamically
            for (var i = 0; i < products.length; i++) {
                var productName = products[i];
                
                // Card wrapper
                var card = document.createElement('div');
                card.className = 'product-card';
                
                // Check if this card was recently added to trigger highlight
                if (newlyAddedProduct && newlyAddedProduct.toLowerCase() === productName.toLowerCase()) {
                    card.classList.add('newly-added');
                    
                    // Add a visual 'NEW' badge
                    var badge = document.createElement('span');
                    badge.className = 'product-badge-new';
                    badge.textContent = 'New';
                    card.appendChild(badge);
                }

                // Avatar SVG (Display standard laptop hardware layout icon)
                var avatar = document.createElement('div');
                avatar.className = 'product-avatar-wrapper';
                avatar.innerHTML = 
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
                        '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>' +
                        '<line x1="2" y1="20" x2="22" y2="20"></line>' +
                        '<line x1="12" y1="17" x2="12" y2="20"></line>' +
                    '</svg>';
                card.appendChild(avatar);

                // Product text description container
                var info = document.createElement('div');
                info.className = 'product-info-details';
                
                var brand = document.createElement('span');
                brand.className = 'product-brand';
                brand.textContent = 'Dell Hardware';
                
                var title = document.createElement('h3');
                title.className = 'product-title';
                title.textContent = productName;
                
                info.appendChild(brand);
                info.appendChild(title);
                card.appendChild(info);

                // Action Buttons Row (Edit & Delete buttons)
                var actionRow = document.createElement('div');
                actionRow.className = 'product-actions';

                // Edit button
                var editBtn = document.createElement('button');
                editBtn.className = 'btn btn-outline';
                editBtn.innerHTML = 
                    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">' +
                        '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>' +
                        '<path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>' +
                    '</svg> Edit';
                
                editBtn.setAttribute('data-product', productName);
                editBtn.addEventListener('click', function(event) {
                    var targetProduct = this.getAttribute('data-product');
                    populateUpdateForm(targetProduct);
                });

                // Delete button
                var deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn btn-danger';
                deleteBtn.innerHTML = 
                    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">' +
                        '<polyline points="3 6 5 6 21 6"></polyline>' +
                        '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>' +
                    '</svg> Delete';
                
                deleteBtn.setAttribute('data-product', productName);
                deleteBtn.addEventListener('click', function(event) {
                    var targetProduct = this.getAttribute('data-product');
                    openDeleteModal(targetProduct);
                });

                actionRow.appendChild(editBtn);
                actionRow.appendChild(deleteBtn);
                card.appendChild(actionRow);

                gridContainer.appendChild(card);
            }
        })
        .catch(function(error) {
            console.error('Server sync error:', error);
            showToast('Unable to fetch product listings from server registry.', 'danger');
        });
}

/**
 * Action: Create (Add Product to Inventory backend)
 */
function handleAddProduct() {
    var addInput = document.getElementById('add-input');
    if (!addInput) return;

    var name = addInput.value.trim();

    // 1. Client-Side Validation: Prevent empty input
    if (name === '') {
        showToast('Submission rejected: Product name cannot be blank.', 'warning');
        addInput.focus();
        return;
    }

    // 2. Client-Side Validation: Prevent duplicate products (fast warning check)
    var cacheIndex = findCachedProductIndex(name);
    if (cacheIndex !== -1) {
        showToast('Operation failed: "' + name + '" already exists in stock.', 'danger');
        addInput.focus();
        return;
    }

    // 3. Dispatch POST request to backend API
    fetch('/api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name })
    })
    .then(function(response) {
        return response.json().then(function(data) {
            if (response.ok) {
                // Set highlight pointer for rendering
                newlyAddedProduct = name;

                // Reset input
                addInput.value = '';

                // Render registry updates
                renderInventory();
                showToast(data.message || 'Success: Product logged.', 'success');

                // Remove highlight animation class after 3.6s
                setTimeout(function() {
                    if (newlyAddedProduct === name) {
                        newlyAddedProduct = null;
                        var cards = document.querySelectorAll('.product-card');
                        for (var i = 0; i < cards.length; i++) {
                            var titleElement = cards[i].querySelector('.product-title');
                            if (titleElement && titleElement.textContent === name) {
                                cards[i].classList.remove('newly-added');
                                var badge = cards[i].querySelector('.product-badge-new');
                                if (badge) {
                                    cards[i].removeChild(badge);
                                }
                            }
                        }
                    }
                }, 3600);
            } else {
                showToast(data.error || 'Operation failed.', 'danger');
            }
        });
    })
    .catch(function(error) {
        console.error('Fetch error:', error);
        showToast('Network error: Could not connect to API server.', 'danger');
    });
}

/**
 * Action: Read/Search (Check Availability via backend API)
 */
function handleCheckAvailability() {
    var checkInput = document.getElementById('check-input');
    var resultPanel = document.getElementById('availability-result');
    if (!checkInput || !resultPanel) return;

    var name = checkInput.value.trim();

    // 1. Validation: Prevent empty input
    if (name === '') {
        showToast('Verification error: Please enter a product name to search.', 'warning');
        checkInput.focus();
        return;
    }

    // 2. Query endpoint
    fetch('/api/products/check?name=' + encodeURIComponent(name))
    .then(function(response) {
        if (!response.ok) {
            throw new Error('API server status check failed');
        }
        return response.json();
    })
    .then(function(data) {
        resultPanel.classList.remove('hidden', 'in-stock', 'out-stock');
        
        var iconWrapper = resultPanel.querySelector('.result-icon-wrapper');
        var titleElement = document.getElementById('result-status-title');
        var descElement = document.getElementById('result-status-desc');

        if (data.exists) {
            // Product is in stock
            resultPanel.classList.add('in-stock');
            titleElement.textContent = 'Product is in stock';
            descElement.textContent = 'Registry match: "' + data.product + '" is logged as active.';
            iconWrapper.innerHTML = 
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>' +
                    '<polyline points="22 4 12 14.01 9 11.01"></polyline>' +
                '</svg>';
            
            showToast('Search complete: Product is in stock.', 'success');
        } else {
            // Product is out of stock
            resultPanel.classList.add('out-stock');
            titleElement.textContent = 'Product is out of stock';
            descElement.textContent = 'No registry record matching "' + data.product + '" was found.';
            iconWrapper.innerHTML = 
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                    '<circle cx="12" cy="12" r="10"></circle>' +
                    '<line x1="15" y1="9" x2="9" y2="15"></line>' +
                    '<line x1="9" y1="9" x2="15" y2="15"></line>' +
                '</svg>';
                
            showToast('Search complete: Product is out of stock.', 'danger');
        }
    })
    .catch(function(error) {
        console.error('Fetch error:', error);
        showToast('Network error: Could not reach API stock checker.', 'danger');
    });
}

/**
 * Helper: Reset the Check Availability result state.
 */
function clearAvailabilityResult() {
    var resultPanel = document.getElementById('availability-result');
    if (resultPanel) {
        resultPanel.classList.add('hidden');
        resultPanel.classList.remove('in-stock', 'out-stock');
    }
}

/**
 * Populates the Update form sidebar fields when a card's edit button is clicked.
 * Helper utility to speed up CRUD editing workflows.
 * @param {string} productName 
 */
function populateUpdateForm(productName) {
    var existingInput = document.getElementById('update-existing-input');
    var newInput = document.getElementById('update-new-input');
    
    if (existingInput && newInput) {
        existingInput.value = productName;
        newInput.value = '';
        newInput.focus();
        
        // Scroll smoothly to sidebar controls on mobile
        existingInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('Selected "' + productName + '" for update. Enter new name below.', 'info');
    }
}

/**
 * Action: Update (Modify Existing Product Name via API PUT)
 */
function handleUpdateProduct() {
    var existingInput = document.getElementById('update-existing-input');
    var newInput = document.getElementById('update-new-input');
    
    if (!existingInput || !newInput) return;

    var existingName = existingInput.value.trim();
    var newName = newInput.value.trim();

    // 1. Client-Side Validation: Prevent empty inputs
    if (existingName === '') {
        showToast('Update aborted: Existing product name is required.', 'warning');
        existingInput.focus();
        return;
    }
    if (newName === '') {
        showToast('Update aborted: Please specify the new product name.', 'warning');
        newInput.focus();
        return;
    }

    // 2. Dispatch PUT request to backend
    fetch('/api/products', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            existingName: existingName,
            newName: newName
        })
    })
    .then(function(response) {
        return response.json().then(function(data) {
            if (response.ok) {
                // Reset inputs
                existingInput.value = '';
                newInput.value = '';

                // Reset highlighting to match updated item
                newlyAddedProduct = newName;

                // Render registry updates
                renderInventory();
                showToast(data.message || 'Product updated successfully.', 'success');

                // Remove highlight effect after 3.6s
                setTimeout(function() {
                    if (newlyAddedProduct === newName) {
                        newlyAddedProduct = null;
                        var cards = document.querySelectorAll('.product-card');
                        for (var i = 0; i < cards.length; i++) {
                            var titleElement = cards[i].querySelector('.product-title');
                            if (titleElement && titleElement.textContent === newName) {
                                cards[i].classList.remove('newly-added');
                            }
                        }
                    }
                }, 3600);
            } else {
                showToast(data.error || 'Update failed.', 'danger');
            }
        });
    })
    .catch(function(error) {
        console.error('Fetch error:', error);
        showToast('Network error: Could not connect to API server.', 'danger');
    });
}

/**
 * Action: Delete - Triggered from sidebar form "Remove Product"
 */
function handleRemoveProductFromInput() {
    var removeInput = document.getElementById('remove-input');
    if (!removeInput) return;

    var name = removeInput.value.trim();

    // 1. Validation: Prevent empty input
    if (name === '') {
        showToast('Removal aborted: Please specify a product to delete.', 'warning');
        removeInput.focus();
        return;
    }

    // 2. Client-Side validation: check if in cache
    var index = findCachedProductIndex(name);
    if (index === -1) {
        showToast('Removal failed: Product "' + name + '" does not exist.', 'danger');
        removeInput.focus();
        return;
    }

    // 3. Open custom confirmation modal (using original casing from cache)
    openDeleteModal(cachedProducts[index]);
}

/**
 * Custom Modal: Open confirmation overlay
 * @param {string} productName 
 */
function openDeleteModal(productName) {
    productToDelete = productName;
    
    var deleteModal = document.getElementById('delete-modal');
    var modalText = document.getElementById('modal-product-name');
    
    if (deleteModal && modalText) {
        modalText.textContent = productName;
        deleteModal.classList.remove('hidden');
    }
}

/**
 * Custom Modal: Hide confirmation overlay
 */
function closeDeleteModal() {
    var deleteModal = document.getElementById('delete-modal');
    if (deleteModal) {
        deleteModal.classList.add('hidden');
    }
    productToDelete = null;
}

/**
 * Custom Modal: Action executed upon confirmation approval
 */
function executeConfirmedDeletion() {
    if (!productToDelete) {
        closeDeleteModal();
        return;
    }

    // Send DELETE request to api server
    fetch('/api/products?name=' + encodeURIComponent(productToDelete), {
        method: 'DELETE'
    })
    .then(function(response) {
        return response.json().then(function(data) {
            if (response.ok) {
                var removedName = productToDelete;
                
                // Update Registry view
                renderInventory();
                
                // Clear delete input fields if they held this name
                var removeInput = document.getElementById('remove-input');
                if (removeInput && removeInput.value.trim().toLowerCase() === removedName.toLowerCase()) {
                    removeInput.value = '';
                }

                var updateExistingInput = document.getElementById('update-existing-input');
                if (updateExistingInput && updateExistingInput.value.trim().toLowerCase() === removedName.toLowerCase()) {
                    updateExistingInput.value = '';
                    document.getElementById('update-new-input').value = '';
                }

                // If the availability check input was searching for this product, clear results
                var checkInput = document.getElementById('check-input');
                if (checkInput && checkInput.value.trim().toLowerCase() === removedName.toLowerCase()) {
                    clearAvailabilityResult();
                }

                showToast(data.message || 'Product removed successfully.', 'success');
            } else {
                showToast(data.error || 'Failed to remove product.', 'danger');
            }
        });
    })
    .catch(function(error) {
        console.error('Fetch error:', error);
        showToast('Network error: Could not complete deletion request.', 'danger');
    })
    .finally(function() {
        closeDeleteModal();
    });
}

/**
 * Premium Toast Notification Trigger
 * @param {string} message The text content of the toast message
 * @param {string} type Color theme classifier: 'success', 'danger', 'warning', 'info'
 */
function showToast(message, type) {
    var toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    // Create toast structure
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'info');

    // Icon SVGs depending on message category
    var iconSvg = '';
    if (type === 'success') {
        iconSvg = 
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<polyline points="20 6 9 17 4 12"></polyline>' +
            '</svg>';
    } else if (type === 'danger') {
        iconSvg = 
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="12" cy="12" r="10"></circle>' +
                '<line x1="12" y1="8" x2="12" y2="12"></line>' +
                '<line x1="12" y1="16" x2="12.01" y2="16"></line>' +
            '</svg>';
    } else if (type === 'warning') {
        iconSvg = 
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>' +
                '<line x1="12" y1="9" x2="12" y2="13"></line>' +
                '<line x1="12" y1="17" x2="12.01" y2="17"></line>' +
            '</svg>';
    } else {
        // info
        iconSvg = 
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="12" cy="12" r="10"></circle>' +
                '<line x1="12" y1="16" x2="12" y2="12"></line>' +
                '<line x1="12" y1="8" x2="12.01" y2="8"></line>' +
            '</svg>';
    }

    var iconWrapper = document.createElement('div');
    iconWrapper.className = 'toast-icon-wrapper';
    iconWrapper.innerHTML = iconSvg;
    toast.appendChild(iconWrapper);

    // Text content
    var content = document.createElement('div');
    content.className = 'toast-content';

    var title = document.createElement('div');
    title.className = 'toast-title';
    title.textContent = type.toUpperCase() + ' STATUS';
    
    var msg = document.createElement('div');
    msg.className = 'toast-message';
    msg.textContent = message;

    content.appendChild(title);
    content.appendChild(msg);
    toast.appendChild(content);

    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', function(event) {
        event.stopPropagation(); // prevent toast click handlers
        removeToastElement(toast);
    });
    toast.appendChild(closeBtn);

    // Click toast body to clear it immediately
    toast.addEventListener('click', function() {
        removeToastElement(toast);
    });

    // Append toast to screen container
    toastContainer.appendChild(toast);

    // Autoclose scheduled timer after 4 seconds
    setTimeout(function() {
        removeToastElement(toast);
    }, 4000);
}

/**
 * Transitions and removes a toast element from DOM.
 * @param {HTMLElement} toastElement 
 */
function removeToastElement(toastElement) {
    if (toastElement && toastElement.parentNode) {
        toastElement.classList.add('toast-closing');
        setTimeout(function() {
            if (toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
        }, 250); // matches style.css toast transition durations
    }
}

    // Theme toggle logic moved to init
document.addEventListener('DOMContentLoaded', init);
