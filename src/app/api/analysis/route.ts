import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { playerIds, playerNames } = await request.json();

    if (!playerIds && !playerNames) {
      return NextResponse.json(
        { error: 'Either playerIds or playerNames must be provided' },
        { status: 400 }
      );
    }

    // Prepare the analysis command
    const analysisScript = path.join(process.cwd(), 'fpl-player-analysis.js');
    const args = [];
    
    if (playerIds && Array.isArray(playerIds)) {
      args.push(...playerIds.map(id => id.toString()));
    }
    
    if (playerNames && Array.isArray(playerNames)) {
      args.push(...playerNames);
    }

    // Add export flag to get structured output
    args.push('--export');

    return new Promise((resolve) => {
      const child = spawn('node', [analysisScript, ...args], {
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
          resolve(NextResponse.json(
            { error: 'Analysis failed', details: stderr },
            { status: 500 }
          ));
          return;
        }

        try {
          // Extract JSON output from the analysis tool
          // The tool should export a JSON file that we can read
          const fs = require('fs');
          const today = new Date().toISOString().split('T')[0];
          const jsonPath = path.join(process.cwd(), `fpl-player-analysis-${today}.json`);
          
          if (fs.existsSync(jsonPath)) {
            const analysisData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
            
            // Clean up the temporary file
            fs.unlinkSync(jsonPath);
            
            resolve(NextResponse.json({
              success: true,
              analysis: analysisData,
              stdout: stdout
            }));
          } else {
            // If no file was created, parse the stdout for basic info
            resolve(NextResponse.json({
              success: true,
              stdout: stdout,
              message: 'Analysis completed but structured output not available'
            }));
          }
        } catch (parseError) {
          resolve(NextResponse.json(
            { error: 'Failed to parse analysis results', details: parseError },
            { status: 500 }
          ));
        }
      });

      child.on('error', (error) => {
        resolve(NextResponse.json(
          { error: 'Failed to start analysis', details: error.message },
          { status: 500 }
        ));
      });
    });

  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'FPL Advanced Player Analysis API',
    usage: 'POST with playerIds or playerNames array',
    example: {
      playerIds: [233, 302, 428],
      playerNames: ['Haaland', 'Salah', 'Palmer']
    }
  });
}
