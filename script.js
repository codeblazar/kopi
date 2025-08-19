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
  
  // Handle modifier combinations for kopi/teh
  if (name.startsWith('kopi-') || name.startsWith('teh-')) {
    const parts = name.split('-');
    const base = parts[0]; // 'kopi' or 'teh'
    const modifiers = parts.slice(1);
    
    // Format each modifier
    const formattedModifiers = modifiers.map(mod => {
      switch (mod) {
        case 'c': return 'C';
        case 'si': return 'Si';
        case 'o': return 'O';
        case 'kosong': return 'Kosong';
        case 'siew-dai': return 'Siew dai';
        case 'ga-dai': return 'Ga dai';
        case 'di-lo': return 'Di lo';
        case 'gah-dai': return 'Gah dai';
        case 'poh-peng': return 'Poh peng';
        case 'ka-dai-peng': return 'Ka dai peng';
        case 'siu-siu': return 'Siu siu';
        case 'siu-gah-dai': return 'Siu gah dai';
        case 'tarik': return 'Tarik';
        case 'tarik-siew-dai': return 'Tarik siew dai';
        case 'kosong-peng': return 'Kosong peng';
        case 'gao': return 'Gao';
        case 'po': return 'Po';
        case 'siu': return 'Siu';
        case 'peng': return 'Peng';
        default: return mod.charAt(0).toUpperCase() + mod.slice(1);
      }
    });
    
    // Capitalize the base drink name (Kopi/Teh)
    const capitalizedBase = base.charAt(0).toUpperCase() + base.slice(1);
    return capitalizedBase + (formattedModifiers.length > 0 ? ' ' + formattedModifiers.join(' ') : '');
  }
  
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/Peng/g, '(Iced)')
    .replace(/Juice/g, 'Juice');
}

// Modifier definitions for kopi and teh
const modifierGroups = {
  'milk': {
    name: 'Milk Variations',
    options: ['c', 'si', 'o', 'gah-dai', 'tarik']
  },
  'sweetness': {
    name: 'Sweetness & Sugar',
    options: ['kosong', 'siew-dai', 'ga-dai', 'di-lo']
  },
  'strength': {
    name: 'Strength & Dilution',
    options: ['gao', 'po', 'siu']
  },
  'temperature': {
    name: 'Temperature & Ice',
    options: ['peng', 'poh-peng', 'ka-dai-peng']
  },
  'regional': {
    name: 'Less Common / Regional',
    options: ['siu-siu', 'siu-gah-dai', 'tarik-siew-dai', 'kosong-peng']
  }
};

// Organized categories of Singapore beverages
const drinkCategories = {
  'Coffee': [
    'kopi'
  ],
  'Tea': [
    'teh'
  ],
  'Specialty': [
    'milo', 'milo-peng', 'milo-dinosaur', 'milo-godzilla',
    'horlicks', 'horlicks-peng', 'ovaltine', 'ovaltine-peng',
    'barley', 'barley-peng', 'soybean', 'soybean-peng',
    'bandung', 'bandung-peng', 'lime-juice', 'sugarcane-juice',
    'orange-juice', 'apple-juice', 'ice-lemon-tea'
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
  updateSummary();
  setupSummaryEventDelegation();
}

// Setup event delegation for summary buttons
function setupSummaryEventDelegation() {
  const summaryEl = document.getElementById('summary-list');
  if (summaryEl) {
    summaryEl.addEventListener('click', (e) => {
      const target = e.target;
      
      if (target.classList.contains('summary-btn-add')) {
        const variant = target.getAttribute('data-variant');
        handleAddFromSummary(variant);
      } else if (target.classList.contains('summary-btn-remove')) {
        const variant = target.getAttribute('data-variant');
        handleRemoveFromSummary(variant);
      }
    });
  }
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
    const isExpandedByDefault = categoryName === 'Coffee' || categoryName === 'Tea';
    categoryHeader.className = 'category-header' + (isExpandedByDefault ? ' expanded' : '');
    categoryHeader.type = 'button';
    categoryHeader.setAttribute('aria-expanded', isExpandedByDefault ? 'true' : 'false');
    categoryHeader.setAttribute('data-category', categoryId);
    categoryHeader.innerHTML = `
      <span>${getCategoryEmoji(categoryName)} ${categoryName}</span>
      <span class="category-toggle">${isExpandedByDefault ? '▼' : '▶'}</span>
    `;

    // Create category content container
    const categoryContent = document.createElement('div');
    categoryContent.className = 'category-content' + (isExpandedByDefault ? ' expanded' : '');
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
    'Coffee': '<img src="images/kopigear-thickened-black.svg" alt="☕" class="category-icon">',
    'Tea': '<img src="images/kopigear-thickened-black.svg" alt="🍃" class="category-icon">', 
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
  } else if (name === 'kopi' || name === 'teh') {
    // Special handling for modifiable drinks
    li.innerHTML = `
      <div class="coffee-info">
        <span class="coffee-name" aria-label="${formatDisplayName(name)}">
          ${getDrinkEmoji(name)} ${formatDisplayName(name)}
        </span>
      </div>
      <div class="quantity-controls">
        <button type="button" class="btn-add" aria-label="Add ${formatDisplayName(name)}" data-variant="${name}">+</button>
        <button type="button" class="btn-modify" aria-label="Modify ${formatDisplayName(name)}" data-variant="${name}">
          <img src="images/kopigear-white.svg" alt="⚙️" class="modify-icon">
        </button>
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
        <button type="button" class="btn-add" aria-label="Add ${formatDisplayName(name)}" data-variant="${name}">+</button>
      </div>
    `;
  }

  // Add event listeners for quantity controls
  const addBtn = li.querySelector('.btn-add');
  const removeBtn = li.querySelector('.btn-remove');
  const modifyBtn = li.querySelector('.btn-modify');

  addBtn.addEventListener('click', () => handleAdd(name));
  if (removeBtn) {
    removeBtn.addEventListener('click', () => handleRemove(name));
  }
  
  if (modifyBtn) {
    modifyBtn.addEventListener('click', () => showModifierModal(name));
  }

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
let orderSequence = []; // Track the order in which items were added
let currentModifiers = {};

// Show modifier modal
function showModifierModal(baseDrink) {
  const modal = createModifierModal(baseDrink);
  document.body.appendChild(modal);
  
  // Trigger show animation
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
  
  // Add keyboard support
  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      closeModifierModal(modal);
      document.removeEventListener('keydown', handleKeyPress);
    }
  };
  document.addEventListener('keydown', handleKeyPress);
  
  // Store the handler so we can remove it later
  modal._keyHandler = handleKeyPress;
}

// Create modifier modal
function createModifierModal(baseDrink) {
  const modal = document.createElement('div');
  modal.className = 'modifier-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-labelledby', 'modifier-title');
  modal.setAttribute('aria-modal', 'true');
  
  modal.innerHTML = `
    <div class="modifier-backdrop"></div>
    <div class="modifier-content">
      <div class="modifier-header">
        <h3 id="modifier-title">Customize ${formatDisplayName(baseDrink)}</h3>
        <button type="button" class="modifier-close" aria-label="Close">&times;</button>
      </div>
      <div class="modifier-body">
        ${Object.entries(modifierGroups).map(([groupKey, group]) => `
          <div class="modifier-group" data-group="${groupKey}">
            <h4 class="modifier-group-title">${group.name}</h4>
            <div class="modifier-options">
              ${group.options.map(option => `
                <button type="button" class="modifier-option" data-modifier="${option}">
                  ${formatDisplayName(option)}
                </button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="modifier-footer">
        <div class="modifier-preview">
          <span class="preview-text">${formatDisplayName(baseDrink)}</span>
        </div>
        <button type="button" class="modifier-done">Add to Order</button>
      </div>
    </div>
  `;
  
  // Add event listeners
  const closeBtn = modal.querySelector('.modifier-close');
  const backdrop = modal.querySelector('.modifier-backdrop');
  const doneBtn = modal.querySelector('.modifier-done');
  const preview = modal.querySelector('.preview-text');
  
  closeBtn.addEventListener('click', () => closeModifierModal(modal));
  backdrop.addEventListener('click', () => closeModifierModal(modal));
  doneBtn.addEventListener('click', () => {
    const selectedModifiers = getSelectedModifiers(modal);
    const finalDrink = baseDrink + (selectedModifiers.length > 0 ? '-' + selectedModifiers.join('-') : '');
    handleAdd(finalDrink);
    closeModifierModal(modal);
  });
  
  // Handle modifier selection
  modal.querySelectorAll('.modifier-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.modifier-group');
      const groupKey = group.dataset.group;
      
      // Deselect other options in the same group
      group.querySelectorAll('.modifier-option').forEach(otherBtn => {
        otherBtn.classList.remove('selected');
      });
      
      // Toggle this option
      btn.classList.toggle('selected');
      
      // Update preview
      updateModifierPreview(modal, baseDrink, preview);
    });
  });
  
  return modal;
}

// Close modifier modal
function closeModifierModal(modal) {
  modal.classList.remove('show');
  
  // Remove keyboard handler if it exists
  if (modal._keyHandler) {
    document.removeEventListener('keydown', modal._keyHandler);
  }
  
  setTimeout(() => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }, 300);
}

// Get selected modifiers from modal
function getSelectedModifiers(modal) {
  const selected = [];
  modal.querySelectorAll('.modifier-option.selected').forEach(btn => {
    selected.push(btn.dataset.modifier);
  });
  return selected;
}

// Update modifier preview
function updateModifierPreview(modal, baseDrink, previewEl) {
  const selectedModifiers = getSelectedModifiers(modal);
  const finalName = baseDrink + (selectedModifiers.length > 0 ? '-' + selectedModifiers.join('-') : '');
  previewEl.textContent = formatDisplayName(finalName);
}

// Handle adding items from order summary
function handleAddFromSummary(variant) {
  
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
  
  // Only update summary
  updateSummary();
}

// Handle removing items from order summary
function handleRemoveFromSummary(variant) {
  
  if (orderCount[variant] && orderCount[variant].count > 0) {
    orderCount[variant].count -= 1;
    
    if (orderCount[variant].count === 0) {
      orderCount[variant].notes = '';
      // Remove from order sequence when count reaches 0
      const index = orderSequence.indexOf(variant);
      if (index > -1) {
        orderSequence.splice(index, 1);
      }
      // Clear custom order textarea when count reaches 0
      if (variant === 'custom-order') {
        const customInput = document.querySelector(`[data-variant="${variant}"] .custom-order-input`);
        if (customInput) {
          customInput.value = '';
        }
      }
    }
    
    // Only update summary
    updateSummary();
  }
}

// Handle adding items
function handleAdd(variant) {
  
  if (!orderCount[variant]) {
    orderCount[variant] = { count: 0, notes: '' };
    // Add to order sequence if it's a new item
    if (!orderSequence.includes(variant)) {
      orderSequence.push(variant);
    }
  }
  
  orderCount[variant].count += 1;
  
  // Handle custom order notes
  if (variant === 'custom-order') {
    const customInput = document.querySelector(`[data-variant="${variant}"] .custom-order-input`);
    if (customInput) {
      orderCount[variant].notes = customInput.value.trim();
    }
  }
  
  // Only update summary - no main menu quantities
  updateSummary();
}

// Handle removing items
function handleRemove(variant) {
  
  if (orderCount[variant] && orderCount[variant].count > 0) {
    orderCount[variant].count -= 1;
    
    if (orderCount[variant].count === 0) {
      orderCount[variant].notes = '';
      // Remove from order sequence when count reaches 0
      const index = orderSequence.indexOf(variant);
      if (index > -1) {
        orderSequence.splice(index, 1);
      }
      // Clear custom order textarea when count reaches 0
      if (variant === 'custom-order') {
        const customInput = document.querySelector(`[data-variant="${variant}"] .custom-order-input`);
        if (customInput) {
          customInput.value = '';
        }
      }
    }
    
    // Only update summary - no main menu quantities
    updateSummary();
  }
}

// Update order summary
function updateSummary() {
  summaryEl.innerHTML = '';
  let totalItems = 0;

  // Get all items that have been ordered (including modified drinks) in the order they were added
  const sortedItems = orderSequence
    .filter(variant => orderCount[variant] && orderCount[variant].count > 0)
    .map(variant => [variant, orderCount[variant]]);

  sortedItems.forEach(([variant, data]) => {
    const li = document.createElement('li');
    li.className = 'summary-item';

    // Create the summary item with quantity controls
    li.innerHTML = `
      <div class="summary-drink-info">
        <span class="summary-drink-name">${getDrinkEmoji(variant)} ${formatDisplayName(variant, {capital: variant === 'custom-order'})}</span>
        ${variant === 'custom-order' && data.notes ? `<div class="summary-notes">Notes: ${data.notes}</div>` : ''}
      </div>
      <div class="summary-quantity-controls">
        <button type="button" class="summary-btn-remove" aria-label="Remove ${formatDisplayName(variant)}" data-variant="${variant}">−</button>
        <span class="summary-quantity">${data.count}</span>
        <button type="button" class="summary-btn-add" aria-label="Add ${formatDisplayName(variant)}" data-variant="${variant}">+</button>
      </div>
    `;

    summaryEl.appendChild(li);
    totalItems += data.count;
  });

  // Update footer button count
  updateFooterButtonCount(totalItems);

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

// Attach FAB scroll handler and Clear Order handler after DOM loads
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
  var clearBtn = document.getElementById('clear-order-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (confirm('Do you want to clear the current order?')) {
        clearOrder();
      }
    });
  }
  
  // Initialize feedback modal
  initializeFeedbackModal();
});

// Update footer button functionality
function updateFooterButtonCount(count) {
  // Currently we don't show counts in the footer, but this function
  // exists for future enhancements if needed
}

// Feedback Modal Functionality
function initializeFeedbackModal() {
  const feedbackBtn = document.getElementById('feedback-btn');
  const modal = document.getElementById('feedback-modal');
  const closeBtn = document.getElementById('close-feedback');
  const cancelBtn = document.getElementById('cancel-feedback');
  const form = document.getElementById('feedback-form');
  
  // Open modal
  feedbackBtn.addEventListener('click', () => {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  });
  
  // Close modal function
  function closeModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore scroll
    form.reset(); // Clear form
  }
  
  // Close modal events
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  
  // Close modal on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });
  
  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userEmail = document.getElementById('user-email').value.trim();
    const changeRequest = document.getElementById('change-request').value.trim();
    
    if (!changeRequest) {
      alert('Please enter your change request.');
      return;
    }
    
    // Create mailto link
    const subject = encodeURIComponent('SingaKopi Change Request');
    const body = encodeURIComponent(
      `Change Request:\n${changeRequest}\n\n` + 
      (userEmail ? `From: ${userEmail}\n\n` : 'From: Anonymous user\n\n') +
      `Sent via SingaKopi V2.0\nTimestamp: ${new Date().toLocaleString()}`
    );
    
    const mailtoLink = `mailto:peter_kenny@rp.edu.sg?subject=${subject}&body=${body}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Close modal and show success message
    closeModal();
    alert('Thank you for your feedback! Your email client should open with the change request ready to send.');
  });
}

// Clear all orders
function clearOrder() {
  orderCount = {};
  orderSequence = []; // Clear the order sequence as well
  
  // Clear custom order textareas
  document.querySelectorAll('.custom-order-input').forEach(input => {
    input.value = '';
  });
  
  updateSummary();
}



// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
