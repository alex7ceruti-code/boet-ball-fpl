'use client';

import React, { useRef, useState } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import { Download, Share2, Image as ImageIcon, Flame } from 'lucide-react';

interface ShareableExportProps {
  children: React.ReactNode;
  filename?: string;
  leagueName?: string;
  currentGameweek?: number;
  className?: string;
}

export default function ShareableExport({ 
  children, 
  filename = 'boet-ball-export', 
  leagueName,
  currentGameweek,
  className = ''
}: ShareableExportProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportAsImage = async (format: 'png' | 'jpeg' = 'png') => {
    if (!exportRef.current) return;

    setIsExporting(true);
    
    try {
      const options = {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: 1200,
        height: exportRef.current.offsetHeight * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: '600px'
        }
      };

      let dataUrl: string;
      if (format === 'png') {
        dataUrl = await toPng(exportRef.current, options);
      } else {
        dataUrl = await toJpeg(exportRef.current, options);
      }

      // Create download link
      const link = document.createElement('a');
      link.download = `${filename}-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Eish! Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = async () => {
    if (!exportRef.current) return;

    setIsExporting(true);
    
    try {
      const dataUrl = await toPng(exportRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: 1200,
        height: exportRef.current.offsetHeight * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: '600px'
        }
      });

      // Convert dataUrl to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);

      alert('Image copied to clipboard! Ready to share, boet! 🔥');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Eish! Could not copy to clipboard. Try downloading instead.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={className}>
      {/* Export Controls */}
      <div className="mb-4 flex gap-2 justify-end">
        <button
          onClick={() => exportAsImage('png')}
          disabled={isExporting}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export PNG
            </>
          )}
        </button>
        
        <button
          onClick={copyToClipboard}
          disabled={isExporting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
        >
          <Share2 className="w-4 h-4" />
          Copy to Share
        </button>
      </div>

      {/* Exportable Content */}
      <div
        ref={exportRef}
        className="bg-white"
        style={{ minWidth: '600px' }}
      >
        {/* Branded Header for Export */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Flame className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black">BOET BALL</h1>
                <p className="text-green-100 text-sm">Premium FPL for Mzansi</p>
              </div>
            </div>
            {leagueName && (
              <div className="text-right">
                <div className="text-lg font-bold">{leagueName}</div>
                {currentGameweek && (
                  <div className="text-green-100 text-sm">Gameweek {currentGameweek}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Branded Footer for Export */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Flame className="w-4 h-4 text-green-600" />
            <span>Generated by Boet Ball - Premium FPL for Mzansi</span>
            <span className="text-green-600 font-medium">boetball.co.za</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Exported on {new Date().toLocaleDateString('en-ZA', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric',
              timeZone: 'Africa/Johannesburg'
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Specialized component for Position Tracker export
export function ExportablePositionTracker({ 
  children, 
  leagueName, 
  currentGameweek 
}: { 
  children: React.ReactNode; 
  leagueName?: string; 
  currentGameweek?: number; 
}) {
  return (
    <ShareableExport
      filename="position-tracker"
      leagueName={leagueName}
      currentGameweek={currentGameweek}
      className="mb-6"
    >
      {children}
    </ShareableExport>
  );
}

// Specialized component for League Standings export
export function ExportableStandings({ 
  children, 
  leagueName, 
  currentGameweek 
}: { 
  children: React.ReactNode; 
  leagueName?: string; 
  currentGameweek?: number; 
}) {
  return (
    <ShareableExport
      filename="league-standings"
      leagueName={leagueName}
      currentGameweek={currentGameweek}
      className="mb-6"
    >
      {children}
    </ShareableExport>
  );
}

// Combined export component
export function ExportableMiniLeague({ 
  standings, 
  positionTracker, 
  leagueName, 
  currentGameweek 
}: { 
  standings: React.ReactNode; 
  positionTracker?: React.ReactNode; 
  leagueName?: string; 
  currentGameweek?: number; 
}) {
  return (
    <ShareableExport
      filename="mini-league-complete"
      leagueName={leagueName}
      currentGameweek={currentGameweek}
      className="mb-6"
    >
      <div className="space-y-6">
        {standings}
        {positionTracker && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Position Tracker
            </h2>
            {positionTracker}
          </div>
        )}
      </div>
    </ShareableExport>
  );
}
