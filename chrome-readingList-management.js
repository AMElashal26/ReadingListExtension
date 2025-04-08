// popup.js
document.addEventListener('DOMContentLoaded', function() {
  const titleInput = document.getElementById('title');
  const urlInput = document.getElementById('url');
  const addBtn = document.getElementById('add-btn');
  const addCurrentBtn = document.getElementById('add-current-btn');
  const searchInput = document.getElementById('search');
  const sortSelect = document.getElementById('sort');
  const readingList = document.getElementById('reading-list');
  const importBtn = document.getElementById('import-btn');
  
  // Feedback message element
  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'feedback';
  document.querySelector('.container').insertBefore(feedbackDiv, readingList);
  
  // Loading state
  let isLoading = false;
  
  // Show feedback message
  function showFeedback(message, type = 'info') {
    feedbackDiv.textContent = message;
    feedbackDiv.className = `feedback ${type}`;
    setTimeout(() => {
      feedbackDiv.textContent = '';
      feedbackDiv.className = 'feedback';
    }, 3000);
  }
  
  // Validate URL
  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  // Validate input
  function validateInput(title, url) {
    if (!title.trim()) {
      showFeedback('Please enter a title', 'error');
      return false;
    }
    if (!url.trim()) {
      showFeedback('Please enter a URL', 'error');
      return false;
    }
    if (!isValidUrl(url)) {
      showFeedback('Please enter a valid URL', 'error');
      return false;
    }
    return true;
  }
  
  // Load reading list from storage
  async function loadReadingList() {
    if (isLoading) return;
    isLoading = true;
    readingList.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
      const data = await chrome.storage.sync.get({readingList: []});
      let list = data.readingList;
      const searchTerm = searchInput.value.toLowerCase();
      
      // Filter by search term
      if (searchTerm) {
        list = list.filter(item => 
          item.title.toLowerCase().includes(searchTerm) || 
          item.url.toLowerCase().includes(searchTerm)
        );
      }
      
      // Sort list
      const sortBy = sortSelect.value;
      if (sortBy === 'title') {
        list.sort((a, b) => a.title.localeCompare(b.title));
      } else {
        list.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      }
      
      // Render list
      renderReadingList(list);
    } catch (error) {
      showFeedback('Error loading reading list', 'error');
      console.error('Error loading reading list:', error);
    } finally {
      isLoading = false;
    }
  }
  
  // Add item to reading list
  async function addItem(title, url) {
    if (!validateInput(title, url)) return;
    
    const item = {
      id: Date.now(),
      title: title.trim(),
      url: url.trim(),
      dateAdded: new Date().toISOString(),
      read: false
    };
    
    try {
      const data = await chrome.storage.sync.get({readingList: []});
      const list = data.readingList;
      
      // Check for duplicates
      if (list.some(existing => existing.url === item.url)) {
        showFeedback('This URL is already in your reading list', 'warning');
        return;
      }
      
      list.push(item);
      await chrome.storage.sync.set({readingList: list});
      
      titleInput.value = '';
      urlInput.value = '';
      showFeedback('Item added successfully', 'success');
      loadReadingList();
    } catch (error) {
      if (error.message.includes('QUOTA_BYTES_PER_ITEM')) {
        showFeedback('Storage limit reached. Please delete some items.', 'error');
      } else {
        showFeedback('Error adding item', 'error');
      }
      console.error('Error adding item:', error);
    }
  }
  
  function renderReadingList(list) {
    readingList.innerHTML = '';
    
    if (list.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-state';
      emptyMessage.innerHTML = `
        <p>Your reading list is empty</p>
        <p>Add items using the form above or the "Add Current Page" button</p>
      `;
      readingList.appendChild(emptyMessage);
      return;
    }
    
    list.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="item-info ${item.read ? 'read' : ''}">
          <div class="item-title">${item.title}</div>
          <div class="item-url">${item.url}</div>
          <div class="item-date">Added: ${new Date(item.dateAdded).toLocaleDateString()}</div>
        </div>
        <div class="item-actions">
          <button class="edit-btn" data-id="${item.id}">Edit</button>
          <button class="open-btn" data-url="${item.url}">Open</button>
          <button class="toggle-btn" data-id="${item.id}">${item.read ? 'Unread' : 'Read'}</button>
          <button class="delete-btn" data-id="${item.id}">Delete</button>
        </div>
      `;
      
      readingList.appendChild(li);
    });
    
    // Add event listeners
    addEventListeners();
  }
  
  function addEventListeners() {
    document.querySelectorAll('.open-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        chrome.tabs.create({url: this.dataset.url});
      });
    });
    
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        toggleReadStatus(parseInt(this.dataset.id));
      });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        if (confirm('Are you sure you want to delete this item?')) {
          await deleteItem(parseInt(this.dataset.id));
        }
      });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        editItem(parseInt(this.dataset.id));
      });
    });
  }
  
  function toggleReadStatus(id) {
    chrome.storage.sync.get({readingList: []}, function(data) {
      const list = data.readingList;
      const itemIndex = list.findIndex(item => item.id === id);
      
      if (itemIndex !== -1) {
        list[itemIndex].read = !list[itemIndex].read;
        chrome.storage.sync.set({readingList: list}, function() {
          loadReadingList();
        });
      }
    });
  }
  
  function deleteItem(id) {
    chrome.storage.sync.get({readingList: []}, function(data) {
      const list = data.readingList.filter(item => item.id !== id);
      chrome.storage.sync.set({readingList: list}, function() {
        loadReadingList();
      });
    });
  }
  
  async function editItem(id) {
    const data = await chrome.storage.sync.get({readingList: []});
    const item = data.readingList.find(item => item.id === id);
    
    if (item) {
      titleInput.value = item.title;
      urlInput.value = item.url;
      
      // Change add button to update button
      const updateBtn = document.createElement('button');
      updateBtn.id = 'update-btn';
      updateBtn.textContent = 'Update';
      updateBtn.addEventListener('click', async () => {
        if (validateInput(titleInput.value, urlInput.value)) {
          const updatedItem = {
            ...item,
            title: titleInput.value.trim(),
            url: urlInput.value.trim()
          };
          
          try {
            const list = data.readingList.map(i => 
              i.id === id ? updatedItem : i
            );
            await chrome.storage.sync.set({readingList: list});
            showFeedback('Item updated successfully', 'success');
            loadReadingList();
            // Restore add button
            addBtn.style.display = 'inline-block';
            updateBtn.remove();
          } catch (error) {
            showFeedback('Error updating item', 'error');
          }
        }
      });
      
      addBtn.style.display = 'none';
      addBtn.parentNode.insertBefore(updateBtn, addBtn.nextSibling);
    }
  }
  
  // Import from Chrome's reading list
  async function importFromChrome() {
    try {
      const chromeItems = await chrome.readingList.query({});
      const data = await chrome.storage.sync.get({readingList: []});
      const existingList = data.readingList;
      const existingUrls = new Set(existingList.map(item => item.url));
      
      let importedCount = 0;
      let skippedCount = 0;
      
      for (const item of chromeItems) {
        if (!existingUrls.has(item.url)) {
          existingList.push({
            id: Date.now() + Math.random(),
            title: item.title,
            url: item.url,
            dateAdded: new Date(item.addedTime).toISOString(),
            read: item.hasBeenRead
          });
          importedCount++;
        } else {
          skippedCount++;
        }
      }
      
      if (importedCount > 0) {
        await chrome.storage.sync.set({readingList: existingList});
        showFeedback(`Imported ${importedCount} items${skippedCount > 0 ? `, skipped ${skippedCount} duplicates` : ''}`, 'success');
        loadReadingList();
      } else if (skippedCount > 0) {
        showFeedback('All items already exist in your list', 'info');
      } else {
        showFeedback('No items found in Chrome reading list', 'info');
      }
    } catch (error) {
      console.error('Error importing from Chrome reading list:', error);
      showFeedback('Error importing from Chrome reading list', 'error');
    }
  }
  
  // Initialize
  loadReadingList();
  
  // Event listeners
  addBtn.addEventListener('click', () => addItem(titleInput.value, urlInput.value));
  
  addCurrentBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      if (tab) {
        addItem(tab.title, tab.url);
      }
    } catch (error) {
      showFeedback('Error getting current page', 'error');
    }
  });
  
  importBtn.addEventListener('click', importFromChrome);
  
  searchInput.addEventListener('input', loadReadingList);
  sortSelect.addEventListener('change', loadReadingList);
});