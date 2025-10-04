/**
 * Mission Readiness Service
 * 
 * This service provides functionality to analyze publications and compute
 * mission readiness scores for different categories of space mission requirements.
 */

const fs = require('fs');
const path = require('path');

// Load category rules
const categoryRulesPath = path.join(__dirname, '..', 'config', 'category_rules.json');
const categoryRules = JSON.parse(fs.readFileSync(categoryRulesPath, 'utf8'));

/**
 * Maps a publication to one or more mission readiness categories based on keywords
 * @param {Object} publication - Publication object with title, abstract, keywords, etc.
 * @returns {Array} Array of category IDs that the publication matches
 */
function mapPublicationToCategories(publication) {
  const matchedCategories = [];
  const textToSearch = [
    publication.title || '',
    publication.abstract || '',
    publication.sections?.introduction || '',
    publication.sections?.results || '',
    publication.sections?.conclusion || '',
    ...(publication.keywords || [])
  ].join(' ').toLowerCase();

  // Check each category for keyword matches
  Object.entries(categoryRules).forEach(([categoryId, rules]) => {
    const keywordMatches = rules.keywords.filter(keyword => 
      textToSearch.includes(keyword.toLowerCase())
    );
    
    // If at least one keyword matches, include this category
    if (keywordMatches.length > 0) {
      matchedCategories.push(categoryId);
    }
  });

  return matchedCategories;
}

/**
 * Scores a category based on publications and environment
 * @param {Array} publicationsForCategory - Publications that match this category
 * @param {string} env - Environment type (moon, mars, transit)
 * @returns {Object} Score object with numeric score and level
 */
function scoreCategory(publicationsForCategory, env = 'transit') {
  if (!publicationsForCategory || publicationsForCategory.length === 0) {
    return {
      numeric: 0,
      level: 'Red',
      gapConfidence: 'high'
    };
  }

  let baseScore = Math.min(100, 10 * publicationsForCategory.length);
  
  // Check for countermeasure evidence
  const countermeasureKeywords = ['countermeasure', 'trial', 'tested', 'validated', 'protocol', 'system'];
  const hasCountermeasures = publicationsForCategory.some(pub => {
    const textToSearch = [
      pub.title || '',
      pub.abstract || '',
      pub.sections?.results || '',
      pub.sections?.conclusion || ''
    ].join(' ').toLowerCase();
    
    return countermeasureKeywords.some(keyword => textToSearch.includes(keyword));
  });

  if (hasCountermeasures) {
    baseScore += 15;
  }

  // Apply gap penalty for insufficient evidence
  if (publicationsForCategory.length < 3) {
    baseScore -= 20;
  }

  // Clamp score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, baseScore));

  // Determine level based on score
  let level;
  if (finalScore >= 70) {
    level = 'Green';
  } else if (finalScore >= 40) {
    level = 'Yellow';
  } else {
    level = 'Red';
  }

  // Determine gap confidence
  let gapConfidence;
  if (publicationsForCategory.length >= 5) {
    gapConfidence = 'low';
  } else if (publicationsForCategory.length >= 3) {
    gapConfidence = 'medium';
  } else {
    gapConfidence = 'high';
  }

  return {
    numeric: Math.round(finalScore),
    level,
    gapConfidence
  };
}

/**
 * Generates design implications for a category based on publications
 * @param {Array} publicationsForCategory - Publications that match this category
 * @param {string} categoryId - Category identifier
 * @returns {Array} Array of design implication strings
 */
function generateDesignImplications(publicationsForCategory, categoryId) {
  const rules = categoryRules[categoryId];
  if (!rules) {
    return ['Category rules not found'];
  }

  // Start with base implications from rules
  let implications = [...rules.implications];

  // Add dynamic implications based on publication content
  const textToSearch = publicationsForCategory.map(pub => [
    pub.title || '',
    pub.abstract || '',
    pub.sections?.results || '',
    pub.sections?.conclusion || ''
  ].join(' ')).join(' ').toLowerCase();

  // Add specific implications based on findings
  if (textToSearch.includes('exercise') && textToSearch.includes('effective')) {
    implications.push('Prioritize exercise countermeasures in mission design');
  }
  
  if (textToSearch.includes('shielding') && textToSearch.includes('reduced')) {
    implications.push('Implement advanced shielding materials for radiation protection');
  }
  
  if (textToSearch.includes('monitoring') && textToSearch.includes('real-time')) {
    implications.push('Deploy continuous monitoring systems for crew health');
  }

  // Return 2-4 implications (limit to avoid overwhelming the UI)
  return implications.slice(0, 4);
}

/**
 * Extracts top findings from publications for a category
 * @param {Array} publicationsForCategory - Publications that match this category
 * @param {number} limit - Maximum number of findings to return
 * @returns {Array} Array of finding objects
 */
function extractTopFindings(publicationsForCategory, limit = 3) {
  return publicationsForCategory
    .slice(0, limit)
    .map(pub => ({
      pubId: pub.id,
      short: pub.sections?.results || pub.sections?.conclusion || pub.abstract?.substring(0, 150) + '...'
    }));
}

/**
 * Computes mission readiness index for all categories
 * @param {Array} publications - Array of all publications
 * @param {string} env - Environment type (moon, mars, transit)
 * @param {number} minYear - Minimum year filter
 * @returns {Object} Complete mission readiness analysis
 */
function computeMissionReadinessIndex(publications, env = 'transit', minYear = 0) {
  // Filter publications by year
  const filteredPublications = publications.filter(pub => pub.year >= minYear);
  
  if (filteredPublications.length === 0) {
    return {
      categories: [],
      overallIndex: { numeric: 0, level: 'Red' },
      warning: 'No publications found for the specified criteria'
    };
  }

  // Group publications by category
  const categoryGroups = {};
  Object.keys(categoryRules).forEach(categoryId => {
    categoryGroups[categoryId] = [];
  });

  filteredPublications.forEach(pub => {
    const matchedCategories = mapPublicationToCategories(pub);
    matchedCategories.forEach(categoryId => {
      categoryGroups[categoryId].push(pub);
    });
  });

  // Compute scores for each category
  const categories = Object.entries(categoryGroups).map(([categoryId, pubs]) => {
    const score = scoreCategory(pubs, env);
    const implications = generateDesignImplications(pubs, categoryId);
    const topFindings = extractTopFindings(pubs);
    
    // Count publications with positive evidence
    const positiveEvidence = pubs.filter(pub => {
      const textToSearch = [
        pub.title || '',
        pub.abstract || '',
        pub.sections?.results || '',
        pub.sections?.conclusion || ''
      ].join(' ').toLowerCase();
      
      return textToSearch.includes('effective') || 
             textToSearch.includes('successful') || 
             textToSearch.includes('improved') ||
             textToSearch.includes('reduced') ||
             textToSearch.includes('increased');
    }).length;

    // Count publications with countermeasures
    const countermeasurePubs = pubs.filter(pub => {
      const textToSearch = [
        pub.title || '',
        pub.abstract || '',
        pub.sections?.results || '',
        pub.sections?.conclusion || ''
      ].join(' ').toLowerCase();
      
      return ['countermeasure', 'trial', 'tested', 'validated', 'protocol'].some(keyword => 
        textToSearch.includes(keyword)
      );
    }).length;

    return {
      id: categoryId,
      name: categoryRules[categoryId].name,
      score: score.level,
      numeric: score.numeric,
      counts: {
        totalPubs: pubs.length,
        positiveEvidence,
        countermeasurePubs
      },
      topFindings,
      designImplications: implications,
      gapConfidence: score.gapConfidence
    };
  });

  // Compute overall index
  const totalScore = categories.reduce((sum, cat) => sum + cat.numeric, 0);
  const averageScore = Math.round(totalScore / categories.length);
  
  let overallLevel;
  if (averageScore >= 70) {
    overallLevel = 'Green';
  } else if (averageScore >= 40) {
    overallLevel = 'Yellow';
  } else {
    overallLevel = 'Red';
  }

  return {
    categories,
    overallIndex: {
      numeric: averageScore,
      level: overallLevel
    },
    metadata: {
      totalPublications: filteredPublications.length,
      environment: env,
      minYear,
      analysisDate: new Date().toISOString()
    }
  };
}

/**
 * Future NLP Hook: This function would integrate with NLP services
 * to compute evidence strength and generate more sophisticated summaries
 * @param {Array} publications - Publications to analyze
 * @param {string} categoryId - Category to analyze
 * @returns {Object} NLP-enhanced analysis
 */
function computeNLPEnhancedAnalysis(publications, categoryId) {
  // TODO: Integrate with NLP service for:
  // - Evidence strength scoring
  // - Automated summary generation
  // - Sentiment analysis of findings
  // - Confidence scoring based on study quality
  
  return {
    evidenceStrength: 'medium', // Would be computed by NLP
    summary: 'Automated summary would be generated here',
    confidence: 0.75, // Would be computed by NLP
    studyQuality: 'high' // Would be assessed by NLP
  };
}

module.exports = {
  mapPublicationToCategories,
  scoreCategory,
  generateDesignImplications,
  extractTopFindings,
  computeMissionReadinessIndex,
  computeNLPEnhancedAnalysis
};
