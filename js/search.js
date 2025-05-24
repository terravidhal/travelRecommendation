/**
 * Initialize the search functionality
 */
export function initSearch() {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const resetBtn = document.getElementById('reset-btn');
  const resultsContainer = document.getElementById('results-container');
  
  if (searchInput && searchBtn && resetBtn && resultsContainer) {
    // Load all recommendations on page load
    loadAllRecommendations();
    
    // Search button click event
    searchBtn.addEventListener('click', () => {
      performSearch(searchInput.value);
    });
    
    // Enter key press event
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch(searchInput.value);
      }
    });
    
    // Reset button click event
    resetBtn.addEventListener('click', () => {
      // Clear the search input
      searchInput.value = '';
      // Clear the results container
      resultsContainer.innerHTML = '';
      // Load all recommendations again
      loadAllRecommendations();
    });
  }

  /**
   * Load all recommendations without filtering
   */
  async function loadAllRecommendations() {
    try {
      const response = await fetch('data/travel_recommendation_api.json');
      const data = await response.json();
      
      // Combine all destinations
      const results = [
        ...data.countries.flatMap(country => country.cities),
        ...data.temples,
        ...data.beaches
      ];
      
      // Display all results
      displayResults(results);
    } catch (error) {
      console.error('Error fetching data:', error);
      resultsContainer.innerHTML = '<p class="error">Error loading results. Please try again later.</p>';
    }
  }
  
  /**
   * Normalize search terms for consistent matching
   * @param {string} term - The term to normalize
   * @returns {string} - Normalized term
   */
  function normalizeSearchTerm(term) {
    return term.toLowerCase()
      .replace(/s$/, '') // Remove trailing 's' for plurals
      .trim();
  }

  /**
   * Check if a destination matches the search term
   * @param {Object} destination - The destination to check
   * @param {string} searchTerm - The normalized search term
   * @returns {boolean} - Whether the destination matches
   */
  function matchesSearchTerm(destination, searchTerm) {
    const normalizedName = normalizeSearchTerm(destination.name);
    const normalizedDesc = normalizeSearchTerm(destination.description);
    
    // Check if the search term is a type of destination
    const isTypeMatch = 
      (searchTerm === 'beach' && destination.name.toLowerCase().includes('beach')) ||
      (searchTerm === 'temple' && destination.name.toLowerCase().includes('temple')) ||
      (searchTerm === 'city' && destination.name.toLowerCase().includes('city'));

    return normalizedName.includes(searchTerm) || 
           normalizedDesc.includes(searchTerm) ||
           isTypeMatch;
  }
  
  /**
   * Perform search based on keyword
   * @param {string} keyword - The search keyword
   */
  async function performSearch(keyword) {
    if (!keyword.trim()) {
      loadAllRecommendations();
      return;
    }
    
    try {
      // Fetch data from the API
      const response = await fetch('data/travel_recommendation_api.json');
      const data = await response.json();
      
      // Normalize the search term
      const searchTerm = normalizeSearchTerm(keyword);
      
      // Initialize results array
      let results = [];
      
      // Search in countries and cities
      data.countries.forEach(country => {
        if (normalizeSearchTerm(country.name).includes(searchTerm)) {
          results.push(...country.cities);
        }
        country.cities.forEach(city => {
          if (matchesSearchTerm(city, searchTerm)) {
            results.push(city);
          }
        });
      });
      
      // Search in temples
      data.temples.forEach(temple => {
        if (matchesSearchTerm(temple, searchTerm)) {
          results.push(temple);
        }
      });
      
      // Search in beaches
      data.beaches.forEach(beach => {
        if (matchesSearchTerm(beach, searchTerm)) {
          results.push(beach);
        }
      });
      
      // Remove duplicates
      results = Array.from(new Set(results.map(JSON.stringify))).map(JSON.parse);
      
      // Display results
      displayResults(results);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      resultsContainer.innerHTML = '<p class="error">Error loading results. Please try again later.</p>';
    }
  }
  
  /**
   * Display search results
   * @param {Array} results - The filtered search results
   */
  function displayResults(results) {
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
      resultsContainer.innerHTML = '<p class="no-results">No results found. Try a different search term.</p>';
      resultsContainer.style.color ='black';
      resultsContainer.style.fontWeight ='bold';
      resultsContainer.style.fontSize = '1rem';
      return;
    }
    
    // Create and append result cards
    results.forEach(result => {
      const resultCard = document.createElement('div');
      resultCard.className = 'result-card';
      resultCard.innerHTML = `
        <div class="result-image">
          <img src="${result.imageUrl}" alt="${result.name}" loading="lazy">
        </div>
        <div class="result-content">
          <h3>${result.name}</h3>
          <p>${result.description}</p>
        </div>
        <div class="result-footer">
          <span>${result.name.split(',')[1]?.trim() || ''}</span>
          <a href="#" class="visit-btn">Visit</a>
        </div>
      `;
      
      resultsContainer.appendChild(resultCard);
      
      // Add fade-in animation
      setTimeout(() => {
        resultCard.style.opacity = '1';
      }, 100 * results.indexOf(result));
    });
    
    // Scroll to results
    //resultsContainer.scrollIntoView({ behavior: 'smooth' });
  }
}