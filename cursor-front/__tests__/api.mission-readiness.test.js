/**
 * Mission Readiness API Integration Tests
 * 
 * Integration tests for the /api/mission-readiness endpoint
 */

const { GET } = require('../src/app/api/mission-readiness/route');

// Mock the service functions
jest.mock('../../services/missionReadinessService', () => ({
  computeMissionReadinessIndex: jest.fn()
}));

jest.mock('../../scripts/load_sample', () => ({
  loadPublications: jest.fn()
}));

const { computeMissionReadinessIndex } = require('../../services/missionReadinessService');
const { loadPublications } = require('../../scripts/load_sample');

describe('/api/mission-readiness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return mission readiness data for valid request', async () => {
    const mockPublications = [
      {
        id: 'test_001',
        title: 'Test Study',
        abstract: 'Test abstract',
        keywords: ['crew health'],
        year: 2023
      }
    ];

    const mockAnalysis = {
      categories: [
        {
          id: 'crew-health',
          name: 'Crew Health',
          score: 'Green',
          numeric: 75,
          counts: { totalPubs: 1, positiveEvidence: 1, countermeasurePubs: 1 },
          topFindings: [{ pubId: 'test_001', short: 'Test finding' }],
          designImplications: ['Test implication'],
          gapConfidence: 'low'
        }
      ],
      overallIndex: { numeric: 75, level: 'Green' },
      metadata: {
        totalPublications: 1,
        environment: 'transit',
        minYear: 2020,
        analysisDate: '2023-01-01T00:00:00.000Z'
      }
    };

    loadPublications.mockReturnValue(mockPublications);
    computeMissionReadinessIndex.mockReturnValue(mockAnalysis);

    const request = new Request('http://localhost:3000/api/mission-readiness?env=transit&minYear=2020');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockAnalysis);
    expect(computeMissionReadinessIndex).toHaveBeenCalledWith(mockPublications, 'transit', 2020);
  });

  test('should handle invalid environment parameter', async () => {
    const request = new Request('http://localhost:3000/api/mission-readiness?env=invalid');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid environment');
  });

  test('should handle invalid minYear parameter', async () => {
    const request = new Request('http://localhost:3000/api/mission-readiness?minYear=invalid');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid minYear');
  });

  test('should handle negative minYear parameter', async () => {
    const request = new Request('http://localhost:3000/api/mission-readiness?minYear=-1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid minYear');
  });

  test('should use default parameters when not provided', async () => {
    const mockPublications = [];
    const mockAnalysis = {
      categories: [],
      overallIndex: { numeric: 0, level: 'Red' },
      warning: 'No publications found for the specified criteria'
    };

    loadPublications.mockReturnValue(mockPublications);
    computeMissionReadinessIndex.mockReturnValue(mockAnalysis);

    const request = new Request('http://localhost:3000/api/mission-readiness');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(computeMissionReadinessIndex).toHaveBeenCalledWith(mockPublications, 'transit', 0);
  });

  test('should handle empty publications data', async () => {
    loadPublications.mockReturnValue(null);

    const request = new Request('http://localhost:3000/api/mission-readiness');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('No publications data available');
  });

  test('should handle service errors', async () => {
    loadPublications.mockReturnValue([]);
    computeMissionReadinessIndex.mockImplementation(() => {
      throw new Error('Service error');
    });

    const request = new Request('http://localhost:3000/api/mission-readiness');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Internal server error');
  });

  test('should add warning for small dataset', async () => {
    const mockPublications = Array(5).fill({ id: 'test', title: 'Test' });
    const mockAnalysis = {
      categories: [],
      overallIndex: { numeric: 0, level: 'Red' }
    };

    loadPublications.mockReturnValue(mockPublications);
    computeMissionReadinessIndex.mockReturnValue(mockAnalysis);

    const request = new Request('http://localhost:3000/api/mission-readiness');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.warning).toContain('Dataset small');
  });

  test('should set correct response headers', async () => {
    const mockPublications = [];
    const mockAnalysis = {
      categories: [],
      overallIndex: { numeric: 0, level: 'Red' }
    };

    loadPublications.mockReturnValue(mockPublications);
    computeMissionReadinessIndex.mockReturnValue(mockAnalysis);

    const request = new Request('http://localhost:3000/api/mission-readiness');
    const response = await GET(request);

    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300');
  });
});
