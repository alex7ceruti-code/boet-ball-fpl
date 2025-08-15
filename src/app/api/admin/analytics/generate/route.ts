import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    // Path to the analytics engine
    const analyticsScript = path.join(process.cwd(), 'fpl-advanced-analytics.js');
    
    // Check if analytics script exists
    if (!fs.existsSync(analyticsScript)) {
      return NextResponse.json({
        success: false,
        error: 'Analytics engine not found'
      }, { status: 500 });
    }

    // Run the analytics engine
    const analyticsData = await runAnalyticsEngine(analyticsScript);
    
    return NextResponse.json({
      success: true,
      ...analyticsData,
      generated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Analytics generation failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Analytics generation failed'
    }, { status: 500 });
  }
}

function runAnalyticsEngine(scriptPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Analytics engine failed: ${stderr}`));
        return;
      }

      try {
        // The analytics engine should output JSON data to a file
        const outputPath = path.join(process.cwd(), 'fpl-analytics-output', 'fpl-advanced-analytics.json');
        
        if (!fs.existsSync(outputPath)) {
          reject(new Error('Analytics output file not found'));
          return;
        }

        const analyticsData = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
        resolve(analyticsData);
        
      } catch (error) {
        reject(new Error(`Failed to parse analytics output: ${error}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to run analytics engine: ${error.message}`));
    });
  });
}
