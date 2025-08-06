// SingaKopi Order Management

// Get drink emoji based on name
function getDrinkEmoji(drinkName) {
  if (drinkName.includes('kopi')) return '☕';
  if (drinkName.includes('teh')) return '🍃';
  if (drinkName.includes('milo')) return '🍫';
  if (['coca-cola', 'pepsi', 'sprite'].includes(drinkName)) return '🥤';
  if (drinkName.includes('juice')) return '🧃';
  if (drinkName.includes('barley')) return '🌾';
  if (drinkName.includes('soybean')) return '🥛';
  if (drinkName.includes('bandung')) return '🌸';
  if (drinkName === 'custom-order') return '📝';
  return '🥤';
}

// Format display name
function formatDisplayName(name, opts = {}) {
  if (name === 'custom-order') {
    // Capitalize as 'Siao Onz' if requested (for summary)
    return opts.capital ? 'Siao Onz' : 'siao onz';
  }
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/Peng/g, '(Iced)')
    .replace(/Juice/g, 'Juice');
}

// Organized categories of Singapore beverages
const drinkCategories = {
  'Coffee': [
    'kopi-o', 'kopi-c', 'kopi-kosong', 'kopi-siew-dai', 'kopi-gao', 'kopi-po',
    'kopi-peng', 'kopi-c-peng', 'kopi-o-peng'
  ],
  'Tea': [
    'teh-o', 'teh-c', 'teh-kosong', 'teh-siew-dai', 'teh-gao', 'teh-po',
    'teh-peng', 'teh-c-peng', 'teh-o-peng', 'teh-tarik', 'teh-tarik-peng',
    'ice-lemon-tea'
  ],
  'Specialty': [
    'milo', 'milo-peng', 'milo-dinosaur', 'milo-godzilla',
    'horlicks', 'horlicks-peng', 'ovaltine', 'ovaltine-peng',
    'barley', 'barley-peng', 'soybean', 'soybean-peng',
    'bandung', 'bandung-peng', 'lime-juice', 'sugarcane-juice',
    'orange-juice', 'apple-juice'
  ],
  'Soft Drinks': [
    'coca-cola', 'pepsi', 'sprite'
  ],
  'Other': [
    'custom-order'
  ]
};

// Create flat list for backward compatibility
const variants = Object.values(drinkCategories).flat();

// Get DOM elements
const listEl = document.getElementById('coffee-list');
const summaryEl = document.getElementById('summary-list');

// Initialize the application
function init() {
  buildMenu();
  createFloatingButton();
  updateSummary();
}

// Build the categorized menu with collapsible sections
function buildMenu() {
  // Clear existing content
  listEl.innerHTML = '';
  
  Object.entries(drinkCategories).forEach(([categoryName, drinks]) => {
    // Create category section
    const categorySection = document.createElement('div');
    categorySection.className = 'category-section';
    
    // Get category identifier for styling
    const categoryId = categoryName.toLowerCase().replace(' ', '-');
    
    // Create category header (collapsible button)
    const categoryHeader = document.createElement('button');
    const isCoffee = categoryName === 'Coffee';
    categoryHeader.className = 'category-header' + (isCoffee ? ' expanded' : '');
    categoryHeader.type = 'button';
    categoryHeader.setAttribute('aria-expanded', isCoffee ? 'true' : 'false');
    categoryHeader.setAttribute('data-category', categoryId);
    categoryHeader.innerHTML = `
      <span>${getCategoryEmoji(categoryName)} ${categoryName}</span>
      <span class="category-toggle">${isCoffee ? '▼' : '▶'}</span>
    `;

    // Create category content container
    const categoryContent = document.createElement('div');
    categoryContent.className = 'category-content' + (isCoffee ? ' expanded' : '');
    categoryContent.setAttribute('data-category', categoryId);
    
    // Create list for this category's drinks
    const categoryList = document.createElement('ul');
    categoryList.className = 'category-list';
    categoryList.role = 'list';
    
    // Add drinks to this category
    drinks.forEach(name => {
      const li = createDrinkItem(name);
      categoryList.appendChild(li);
    });
    
    // Add click handler for collapsing/expanding
    categoryHeader.addEventListener('click', () => {
      toggleCategory(categoryHeader, categoryContent);
    });
    
    // Assemble category
    categoryContent.appendChild(categoryList);
    categorySection.appendChild(categoryHeader);
    categorySection.appendChild(categoryContent);
    listEl.appendChild(categorySection);
  });
}

// Get category emoji
function getCategoryEmoji(categoryName) {
  const emojiMap = {
    'Coffee': '☕',
    'Tea': '🍃', 
    'Specialty': '🥤',
    'Soft Drinks': '🥤',
    'Other': '📝'
  };
  return emojiMap[categoryName] || '🥤';
}

// Create individual drink item
function createDrinkItem(name) {
  const li = document.createElement('li');
  li.className = 'coffee-item';
  li.setAttribute('data-variant', name);

  // Special handling for custom orders
  if (name === 'custom-order') {
    li.classList.add('siao-onz-row');
    li.innerHTML = `
      <div class="siao-onz-top-row">
        <span class="coffee-name" aria-label="${formatDisplayName(name)}">
          ${getDrinkEmoji(name)} ${formatDisplayName(name)}
        </span>
        <div class="quantity-controls">
          <button type="button" class="btn-remove" disabled aria-label="Remove ${formatDisplayName(name)}" data-variant="${name}">−</button>
          <span class="quantity" role="status" aria-live="polite">0</span>
          <button type="button" class="btn-add" aria-label="Add ${formatDisplayName(name)}" data-variant="${name}">+</button>
        </div>
      </div>
      <div class="siao-onz-textarea-row">
        <textarea 
          class="custom-order-input siao-onz-fullwidth" 
          placeholder="Describe your siao onz order (e.g., kopi with 3x condensed milk, teh with durian)"
          aria-label="Custom order notes"
          maxlength="200"
        ></textarea>
      </div>
    `;
  } else {
    li.innerHTML = `
      <div class="coffee-info">
        <span class="coffee-name" aria-label="${formatDisplayName(name)}">
          ${getDrinkEmoji(name)} ${formatDisplayName(name)}
        </span>
      </div>
      <div class="quantity-controls">
        <button type="button" class="btn-remove" disabled aria-label="Remove ${formatDisplayName(name)}" data-variant="${name}">−</button>
        <span class="quantity" role="status" aria-live="polite">0</span>
        <button type="button" class="btn-add" aria-label="Add ${formatDisplayName(name)}" data-variant="${name}">+</button>
      </div>
    `;
  }

  // Add event listeners for quantity controls
  const addBtn = li.querySelector('.btn-add');
  const removeBtn = li.querySelector('.btn-remove');

  addBtn.addEventListener('click', () => handleAdd(name));
  removeBtn.addEventListener('click', () => handleRemove(name));

  return li;
}

// Toggle category visibility
function toggleCategory(headerBtn, contentDiv) {
  const isExpanded = headerBtn.classList.contains('expanded');
  const toggle = headerBtn.querySelector('.category-toggle');
  
  if (isExpanded) {
    // Collapse
    headerBtn.classList.remove('expanded');
    contentDiv.classList.remove('expanded');
    headerBtn.setAttribute('aria-expanded', 'false');
    toggle.textContent = '▶';
  } else {
    // Expand
    headerBtn.classList.add('expanded');
    contentDiv.classList.add('expanded');
    headerBtn.setAttribute('aria-expanded', 'true');
    toggle.textContent = '▼';
  }
}

// Order tracking
let orderCount = {};

// Handle adding items
function handleAdd(variant) {
  if (!orderCount[variant]) {
    orderCount[variant] = { count: 0, notes: '' };
  }
  
  orderCount[variant].count += 1;
  
  // Handle custom order notes
  if (variant === 'custom-order') {
    const customInput = document.querySelector(`[data-variant="${variant}"] .custom-order-input`);
    if (customInput) {
      orderCount[variant].notes = customInput.value.trim();
    }
  }
  
  updateUI(variant);
  updateSummary();
}

// Handle removing items
function handleRemove(variant) {
  if (orderCount[variant] && orderCount[variant].count > 0) {
    orderCount[variant].count -= 1;
    
    if (orderCount[variant].count === 0) {
      orderCount[variant].notes = '';
      // Clear custom order textarea when count reaches 0
      if (variant === 'custom-order') {
        const customInput = document.querySelector(`[data-variant="${variant}"] .custom-order-input`);
        if (customInput) {
          customInput.value = '';
        }
      }
    }
    
    updateUI(variant);
    updateSummary();
  }
}

// Update UI for specific variant
function updateUI(variant) {
  const item = document.querySelector(`[data-variant="${variant}"]`);
  if (!item) return;

  const qtySpan = item.querySelector('.quantity');
  const removeBtn = item.querySelector('.btn-remove');
  const count = orderCount[variant]?.count || 0;

  qtySpan.textContent = count;
  removeBtn.disabled = count === 0;

  // Add visual feedback for selected items
  if (count > 0) {
    item.classList.add('selected');
  } else {
    item.classList.remove('selected');
  }
}

// Update order summary
function updateSummary() {
  summaryEl.innerHTML = '';
  let totalItems = 0;

  // Sort items in menu order: Coffee, Tea, Specialty, Soft Drinks, Siao Onz last
  const menuOrder = [
    ...drinkCategories['Coffee'],
    ...drinkCategories['Tea'],
    ...drinkCategories['Specialty'],
    ...drinkCategories['Soft Drinks'],
    ...drinkCategories['Other']
  ];
  const sortedItems = menuOrder
    .map(variant => [variant, orderCount[variant]])
    .filter(([_, data]) => data && data.count > 0);

  sortedItems.forEach(([variant, data]) => {
    const li = document.createElement('li');
    li.className = 'summary-item';

    let displayText = `${getDrinkEmoji(variant)} ${formatDisplayName(variant, {capital: variant === 'custom-order'})} × ${data.count}`;

    // Add notes for custom orders
    if (variant === 'custom-order' && data.notes) {
      displayText += `<br><small class="custom-notes">Notes: ${data.notes}</small>`;
    }

    li.innerHTML = displayText;
    summaryEl.appendChild(li);
    totalItems += data.count;
  });

  // Update floating button count
  updateFloatingButtonCount(totalItems);

  // Show/hide summary section based on items
  const summarySection = document.getElementById('order-summary');
  if (summarySection) {
    if (totalItems > 0) {
      summarySection.style.display = 'block';
    } else {
      summarySection.style.display = 'none';
    }
  }
}

// Handle order submission
function handleOrderSubmission() {
  const totalItems = Object.values(orderCount).reduce((sum, data) => sum + data.count, 0);
  
  if (totalItems === 0) {
    alert('Please add items to your order first!');
    return;
  }

  // Create order summary text
  let orderSummary = 'Your SingaKopi Order:\n\n';
  
  Object.entries(orderCount)
    .filter(([_, data]) => data.count > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([variant, data]) => {
      orderSummary += `• ${formatDisplayName(variant)} × ${data.count}\n`;
      if (variant === 'custom-order' && data.notes) {
        orderSummary += `  Notes: ${data.notes}\n`;
      }
    });
  
  orderSummary += `\nTotal Items: ${totalItems}`;
  orderSummary += '\n\nThank you for choosing SingaKopi! 🇸🇬';

  // Show confirmation
  const confirmed = confirm(orderSummary + '\n\nConfirm your order?');
  
  if (confirmed) {
    alert('Order confirmed! Your delicious Singapore drinks will be prepared shortly. 😊');
    // Reset the order
    clearOrder();
  }
}

// Attach FAB scroll handler after DOM loads
document.addEventListener('DOMContentLoaded', function() {
  var fab = document.getElementById('fab-goto-order');
  if (fab) {
    fab.addEventListener('click', function() {
      var summary = document.getElementById('order-summary');
      if (summary) {
        summary.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
});

// Update floating button count and animation/fade, and handle LED chaser
function updateFloatingButtonCount(count) {
  const floatingBtn = document.querySelector('.fab-basic, .floating-action-button');
  if (!floatingBtn) return;


  // Remove any LED chaser if present
  const oldLeds = floatingBtn.querySelector('.fab-leds');
  if (oldLeds) oldLeds.remove();

  if (count > 0) {
    floatingBtn.classList.remove('fab-inactive');
    // Trigger the cool beans bounce animation
    floatingBtn.classList.remove('fab-animate');
    // Force reflow to restart animation
    void floatingBtn.offsetWidth;
    floatingBtn.classList.add('fab-animate');
  } else {
    floatingBtn.classList.add('fab-inactive');
    floatingBtn.classList.remove('fab-animate');
  }

  // Add pressed effect for touch/click
  floatingBtn.onmousedown = floatingBtn.ontouchstart = function() {
    floatingBtn.classList.add('fab-pressed');
  };
  floatingBtn.onmouseup = floatingBtn.onmouseleave = floatingBtn.ontouchend = function() {
    floatingBtn.classList.remove('fab-pressed');
  };

  const countSpan = floatingBtn.querySelector('.fab-count');
  if (countSpan) {
    countSpan.textContent = count;
  }
}

// Clear all orders
function clearOrder() {
  orderCount = {};
  
  // Reset all UI elements
  document.querySelectorAll('.coffee-item').forEach(item => {
    const variant = item.getAttribute('data-variant');
    const qtyDisplay = item.querySelector('.quantity');
    const removeBtn = item.querySelector('.btn-remove');
    const coffeeItem = item;
    
    // Clear custom order textarea
    if (variant === 'custom-order') {
      const customInput = item.querySelector('.custom-order-input');
      if (customInput) {
        customInput.value = '';
      }
    }
    
    if (coffeeItem) {
      coffeeItem.classList.remove('selected');
    }
    
    if (qtyDisplay) {
      qtyDisplay.textContent = '0';
    }
    
    if (removeBtn) {
      removeBtn.disabled = true;
    }
  });
  
  updateSummary();
}



// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
