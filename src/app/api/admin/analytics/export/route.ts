import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    
    const outputDir = path.join(process.cwd(), 'fpl-analytics-output');
    
    if (format === 'json') {
      const jsonPath = path.join(outputDir, 'fpl-advanced-analytics.json');
      
      if (!fs.existsSync(jsonPath)) {
        return NextResponse.json({
          success: false,
          error: 'Analytics data not found. Please generate analytics first.'
        }, { status: 404 });
      }
      
      const jsonData = fs.readFileSync(jsonPath, 'utf-8');
      
      return new NextResponse(jsonData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="fpl-analytics-${new Date().toISOString().split('T')[0]}.json"`
        }
      });
      
    } else if (format === 'csv') {
      const csvPath = path.join(outputDir, 'fpl-player-analytics.csv');
      
      if (!fs.existsSync(csvPath)) {
        return NextResponse.json({
          success: false,
          error: 'CSV data not found. Please generate analytics first.'
        }, { status: 404 });
      }
      
      const csvData = fs.readFileSync(csvPath, 'utf-8');
      
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="fpl-analytics-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
      
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid format. Supported formats: json, csv'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Export failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Export failed'
    }, { status: 500 });
  }
}
