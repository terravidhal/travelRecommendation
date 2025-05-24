// Import modules
import { initSearch } from './search.js';

// Initialize components
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize search on the homepage
  initSearch();
  console.log('init');
  /*if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    initSearch();
  }*/
});

