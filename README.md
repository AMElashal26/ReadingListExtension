# Reading List Manager Chrome Extension

A modern, feature-rich Chrome extension that helps you manage your reading list with ease. Save articles, web pages, and organize your reading materials all in one place.

![Chrome Web Store](https://img.shields.io/badge/Platform-Chrome-blue)
![Version](https://img.shields.io/badge/Version-1.0-green)

## Features

- 📑 Save web pages to your reading list
- 🔍 Search through your saved items
- 🔄 Import from Chrome's built-in reading list
- ⚡ One-click saving of current page
- 📱 Sync across devices (using Chrome sync)
- 🔍 Search and filter functionality
- ⚙️ Sort by date or title
- ✅ Mark items as read/unread
- 🗑️ Easy deletion of items
- ✏️ Edit saved items

## Installation

### From Source
1. Clone this repository or download the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

### Required Permissions
The extension requires the following permissions:
- `storage`: To save your reading list
- `tabs`: To access current tab information
- `readingList`: To import from Chrome's reading list
- `bookmarks`: For future bookmark integration

## Usage

### Adding Items
- Click the extension icon in your toolbar
- Enter a title and URL manually, or
- Use "Add Current Page" to save the active tab
- Click "Add to List" to save

### Importing from Chrome
1. Click "Import from Chrome" to import items from Chrome's built-in reading list
2. The extension will automatically skip duplicates
3. Imported items maintain their original read/unread status

### Managing Items
- **Search**: Use the search box to filter items by title or URL
- **Sort**: Choose between sorting by date added or title
- **Edit**: Click the edit button to modify an item's title or URL
- **Mark as Read/Unread**: Toggle the read status of any item
- **Open**: Click the open button to view the page in a new tab
- **Delete**: Remove items you no longer need

## Known Issues

- RangeError when importing items with invalid time values from Chrome's reading list
- Storage quota limitations for users with very large reading lists

## Development

### Project Structure
```
├── manifest.json           # Extension configuration
├── popup.html             # Main UI
├── styles.css            # Styling
├── chrome-readingList-management.js  # Core functionality
└── icons/                # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Building from Source
No build step required. The extension can be loaded directly into Chrome in developer mode.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons and design inspired by Google's Material Design
- Built with Chrome Extension Manifest V3 
