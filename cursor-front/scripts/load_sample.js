#!/usr/bin/env node

/**
 * Load Sample Publications Data
 * 
 * This script loads the sample publications data and provides utility functions
 * for accessing the data in the application.
 */

const fs = require('fs');
const path = require('path');

/**
 * Load publications data from the sample file
 * @returns {Array} Array of publication objects
 */
function loadPublications() {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'publications_sample.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading publications data:', error.message);
    return [];
  }
}

/**
 * Get publications filtered by year
 * @param {number} minYear - Minimum year filter
 * @returns {Array} Filtered publications
 */
function getPublicationsByYear(minYear = 0) {
  const publications = loadPublications();
  return publications.filter(pub => pub.year >= minYear);
}

/**
 * Get publications by keyword search
 * @param {string} keyword - Keyword to search for
 * @returns {Array} Matching publications
 */
function getPublicationsByKeyword(keyword) {
  const publications = loadPublications();
  const lowerKeyword = keyword.toLowerCase();
  
  return publications.filter(pub => 
    pub.title.toLowerCase().includes(lowerKeyword) ||
    pub.abstract.toLowerCase().includes(lowerKeyword) ||
    pub.keywords.some(k => k.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * Get publication by ID
 * @param {string} id - Publication ID
 * @returns {Object|null} Publication object or null if not found
 */
function getPublicationById(id) {
  const publications = loadPublications();
  return publications.find(pub => pub.id === id) || null;
}

/**
 * Get statistics about the publications dataset
 * @returns {Object} Statistics object
 */
function getPublicationsStats() {
  const publications = loadPublications();
  
  const yearRange = publications.reduce((acc, pub) => {
    acc.min = Math.min(acc.min, pub.year);
    acc.max = Math.max(acc.max, pub.year);
    return acc;
  }, { min: Infinity, max: -Infinity });
  
  const keywordCounts = {};
  publications.forEach(pub => {
    pub.keywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
  });
  
  return {
    totalPublications: publications.length,
    yearRange,
    topKeywords: Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }))
  };
}

// Export functions for use in other modules
module.exports = {
  loadPublications,
  getPublicationsByYear,
  getPublicationsByKeyword,
  getPublicationById,
  getPublicationsStats
};

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'load':
      console.log('Loading publications...');
      const publications = loadPublications();
      console.log(`Loaded ${publications.length} publications`);
      break;
      
    case 'stats':
      console.log('Publication Statistics:');
      console.log(JSON.stringify(getPublicationsStats(), null, 2));
      break;
      
    case 'search':
      const keyword = process.argv[3];
      if (!keyword) {
        console.log('Usage: node load_sample.js search <keyword>');
        process.exit(1);
      }
      const results = getPublicationsByKeyword(keyword);
      console.log(`Found ${results.length} publications matching "${keyword}"`);
      results.forEach(pub => {
        console.log(`- ${pub.title} (${pub.year})`);
      });
      break;
      
    default:
      console.log('Usage:');
      console.log('  node load_sample.js load          - Load all publications');
      console.log('  node load_sample.js stats         - Show statistics');
      console.log('  node load_sample.js search <term>  - Search publications');
  }
}
