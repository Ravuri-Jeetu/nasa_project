/**
 * Mission Readiness Service Tests
 * 
 * Unit tests for the mission readiness service functions
 */

const {
  mapPublicationToCategories,
  scoreCategory,
  generateDesignImplications,
  extractTopFindings,
  computeMissionReadinessIndex
} = require('../services/missionReadinessService');

describe('Mission Readiness Service', () => {
  const mockPublication = {
    id: 'test_001',
    title: 'Bone Loss Prevention in Microgravity',
    abstract: 'This study examines bone density loss in astronauts during long-duration space missions and evaluates the effectiveness of resistive exercise countermeasures.',
    sections: {
      introduction: 'Spaceflight-induced bone loss is a critical concern.',
      results: 'Resistive exercise protocols showed 85% effectiveness in preventing bone loss.',
      conclusion: 'Implementing comprehensive exercise programs is essential for crew health.'
    },
    keywords: ['bone loss', 'microgravity', 'exercise', 'countermeasure', 'crew health'],
    year: 2023
  };

  const mockPublications = [
    mockPublication,
    {
      id: 'test_002',
      title: 'Radiation Shielding for Mars Missions',
      abstract: 'Analysis of cosmic radiation exposure during Mars transit with focus on shielding technologies.',
      sections: {
        results: 'Water-based shielding reduced radiation exposure by 40%.',
        conclusion: 'Multi-layered shielding approaches are necessary.'
      },
      keywords: ['radiation', 'shielding', 'mars', 'protection'],
      year: 2023
    },
    {
      id: 'test_003',
      title: 'Life Support Systems Review',
      abstract: 'Review of closed-loop life support technologies for long-duration space missions.',
      sections: {
        results: 'Current systems achieve 95% water recycling efficiency.',
        conclusion: 'Further development needed for complete closure.'
      },
      keywords: ['life support', 'closed loop', 'water recycling'],
      year: 2022
    }
  ];

  describe('mapPublicationToCategories', () => {
    test('should map publication to correct categories based on keywords', () => {
      const categories = mapPublicationToCategories(mockPublication);
      
      expect(categories).toContain('crew-health');
      expect(categories.length).toBeGreaterThan(0);
    });

    test('should return empty array for publication with no matching keywords', () => {
      const emptyPub = {
        title: 'Unrelated Study',
        abstract: 'This study has nothing to do with space missions.',
        keywords: ['unrelated', 'topic'],
        sections: {}
      };
      
      const categories = mapPublicationToCategories(emptyPub);
      expect(categories).toEqual([]);
    });

    test('should search in multiple text fields', () => {
      const pubWithKeywordsInAbstract = {
        title: 'Space Study',
        abstract: 'This study examines bone loss in microgravity environments.',
        keywords: ['space'],
        sections: {}
      };
      
      const categories = mapPublicationToCategories(pubWithKeywordsInAbstract);
      expect(categories).toContain('crew-health');
    });
  });

  describe('scoreCategory', () => {
    test('should return Red level for empty publications array', () => {
      const score = scoreCategory([], 'transit');
      
      expect(score.level).toBe('Red');
      expect(score.numeric).toBe(0);
      expect(score.gapConfidence).toBe('high');
    });

    test('should return Green level for sufficient publications with countermeasures', () => {
      const pubsWithCountermeasures = [
        { ...mockPublication, sections: { results: 'Tested countermeasure showed effectiveness' } },
        { ...mockPublication, sections: { results: 'Validated protocol reduced risk' } },
        { ...mockPublication, sections: { results: 'Trial results were positive' } },
        { ...mockPublication, sections: { results: 'Another tested solution' } },
        { ...mockPublication, sections: { results: 'More evidence of countermeasures' } }
      ];
      
      const score = scoreCategory(pubsWithCountermeasures, 'transit');
      
      expect(score.level).toBe('Yellow');
      expect(score.numeric).toBeGreaterThanOrEqual(50);
    });

    test('should return Yellow level for moderate evidence', () => {
      const moderatePubs = [
        { ...mockPublication, sections: { results: 'Some evidence found' } },
        { ...mockPublication, sections: { results: 'Limited effectiveness' } },
        { ...mockPublication, sections: { results: 'Additional research needed' } }
      ];
      
      const score = scoreCategory(moderatePubs, 'transit');
      
      expect(score.level).toBe('Yellow');
      expect(score.numeric).toBeGreaterThanOrEqual(40);
      expect(score.numeric).toBeLessThan(70);
    });

    test('should apply gap penalty for insufficient publications', () => {
      const fewPubs = [mockPublication];
      
      const score = scoreCategory(fewPubs, 'transit');
      
      expect(score.gapConfidence).toBe('high');
      expect(score.numeric).toBeLessThan(30); // Should be penalized
    });
  });

  describe('generateDesignImplications', () => {
    test('should return base implications from category rules', () => {
      const implications = generateDesignImplications([mockPublication], 'crew-health');
      
      expect(implications).toContain('Include resistive exercise system with magnetic resistance');
      expect(implications.length).toBeGreaterThan(0);
      expect(implications.length).toBeLessThanOrEqual(4);
    });

    test('should add dynamic implications based on content', () => {
      const pubWithExercise = {
        ...mockPublication,
        sections: { results: 'Exercise was highly effective in preventing muscle loss' }
      };
      
      const implications = generateDesignImplications([pubWithExercise], 'crew-health');
      
      expect(implications.some(imp => imp.includes('exercise'))).toBe(true);
    });

    test('should limit implications to maximum of 4', () => {
      const manyPubs = Array(10).fill(mockPublication);
      const implications = generateDesignImplications(manyPubs, 'crew-health');
      
      expect(implications.length).toBeLessThanOrEqual(4);
    });
  });

  describe('extractTopFindings', () => {
    test('should extract findings from publications', () => {
      const findings = extractTopFindings(mockPublications, 2);
      
      expect(findings).toHaveLength(2);
      expect(findings[0]).toHaveProperty('pubId');
      expect(findings[0]).toHaveProperty('short');
    });

    test('should limit findings to specified limit', () => {
      const findings = extractTopFindings(mockPublications, 1);
      
      expect(findings).toHaveLength(1);
    });

    test('should handle publications without results or conclusion', () => {
      const pubWithoutResults = {
        id: 'test_004',
        title: 'Test Study',
        abstract: 'This is a test abstract for a study without detailed results.',
        sections: {},
        keywords: ['test']
      };
      
      const findings = extractTopFindings([pubWithoutResults], 1);
      
      expect(findings[0].short).toContain('test abstract');
    });
  });

  describe('computeMissionReadinessIndex', () => {
    test('should compute complete mission readiness analysis', () => {
      const analysis = computeMissionReadinessIndex(mockPublications, 'transit', 2020);
      
      expect(analysis).toHaveProperty('categories');
      expect(analysis).toHaveProperty('overallIndex');
      expect(analysis.categories).toHaveLength(5); // All 5 categories
      
      // Check that each category has required properties
      analysis.categories.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('score');
        expect(category).toHaveProperty('numeric');
        expect(category).toHaveProperty('counts');
        expect(category).toHaveProperty('topFindings');
        expect(category).toHaveProperty('designImplications');
        expect(category).toHaveProperty('gapConfidence');
      });
    });

    test('should filter publications by year', () => {
      const oldPublications = [
        { ...mockPublication, year: 2015 },
        { ...mockPublication, year: 2023 }
      ];
      
      const analysis = computeMissionReadinessIndex(oldPublications, 'transit', 2020);
      
      // Should only include publications from 2020+
      expect(analysis.metadata.totalPublications).toBe(1);
    });

    test('should return warning for empty dataset', () => {
      const analysis = computeMissionReadinessIndex([], 'transit', 2020);
      
      expect(analysis.warning).toBeDefined();
      expect(analysis.overallIndex.level).toBe('Red');
    });

    test('should compute overall index correctly', () => {
      const analysis = computeMissionReadinessIndex(mockPublications, 'transit', 2020);
      
      expect(analysis.overallIndex).toHaveProperty('numeric');
      expect(analysis.overallIndex).toHaveProperty('level');
      expect(['Green', 'Yellow', 'Red']).toContain(analysis.overallIndex.level);
    });
  });
});
