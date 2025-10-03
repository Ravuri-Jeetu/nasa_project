import { NextRequest, NextResponse } from 'next/server';
import { computeMissionReadinessIndex } from '../../../../services/missionReadinessService';
import { loadPublications } from '../../../../scripts/load_sample';

/**
 * Mission Readiness API Endpoint
 * 
 * GET /api/mission-readiness
 * 
 * Query Parameters:
 * - env: Environment type (moon, mars, transit) - defaults to 'transit'
 * - minYear: Minimum publication year filter - defaults to 0
 * 
 * Returns mission readiness analysis for all categories
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const env = searchParams.get('env') || 'transit';
    const minYear = parseInt(searchParams.get('minYear') || '0');

    // Validate environment parameter
    const validEnvs = ['moon', 'mars', 'transit'];
    if (!validEnvs.includes(env)) {
      return NextResponse.json(
        { error: 'Invalid environment. Must be one of: moon, mars, transit' },
        { status: 400 }
      );
    }

    // Validate year parameter
    if (isNaN(minYear) || minYear < 0) {
      return NextResponse.json(
        { error: 'Invalid minYear parameter. Must be a non-negative number.' },
        { status: 400 }
      );
    }

    // Load publications data
    const publications = loadPublications();
    
    if (!publications || publications.length === 0) {
      return NextResponse.json(
        { error: 'No publications data available' },
        { status: 500 }
      );
    }

    // Compute mission readiness index
    const analysis = computeMissionReadinessIndex(publications, env, minYear);

    // Add warning if dataset is small
    if (publications.length < 10) {
      analysis.warning = 'Dataset small — results indicative only.';
    }

    return NextResponse.json(analysis, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });

  } catch (error) {
    console.error('Error in mission-readiness API:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
