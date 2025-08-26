'use client';

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ExportablePositionTracker } from './ShareableExport';

interface Manager {
  entry: number;
  player_name: string;
  entry_name: string;
  rank: number;
  total: number;
  event_total: number;
}

interface GameweekData {
  gameweek: number;
  data: {
    standings: {
      results: Manager[];
    };
  } | null;
  error: any;
  isLoading: boolean;
}

interface PositionTrackerProps {
  historicalData: GameweekData[];
  currentGameweek: number;
  leagueName?: string;
  exportable?: boolean;
}

// Generate distinct, readable colors for different managers
const generateColors = (count: number) => {
  const colors = [
    '#1f77b4', // blue
    '#ff7f0e', // orange  
    '#2ca02c', // green
    '#d62728', // red
    '#9467bd', // purple
    '#8c564b', // brown
    '#e377c2', // pink
    '#7f7f7f', // gray
    '#bcbd22', // olive
    '#17becf', // cyan
    '#aec7e8', // light blue
    '#ffbb78', // light orange
    '#98df8a', // light green
    '#ff9896', // light red
    '#c5b0d5', // light purple
    '#c49c94', // light brown
    '#f7b6d3', // light pink
    '#c7c7c7', // light gray
    '#dbdb8d', // light olive
    '#9edae5'  // light cyan
  ];
  
  // If we need more colors than available, generate more using HSL
  while (colors.length < count) {
    const hue = (colors.length * 137.508) % 360; // Golden angle approximation for better distribution
    colors.push(`hsl(${hue}, 65%, 55%)`);
  }
  
  return colors.slice(0, count);
};

export default function PositionTracker({ 
  historicalData, 
  currentGameweek, 
  leagueName = '', 
  exportable = true 
}: PositionTrackerProps) {
  const chartData = useMemo(() => {
    if (!historicalData.length) return [];

    // Get all managers from the first available dataset
    const firstValidData = historicalData.find(gw => gw.data?.standings?.results);
    if (!firstValidData || !firstValidData.data) return [];

    const allManagers = firstValidData.data.standings.results;
    
    // Create a map of gameweek data for efficient lookup
    const gameweekMap = new Map();
    historicalData.forEach(gw => {
      if (gw.data?.standings?.results) {
        const standings = new Map();
        gw.data.standings.results.forEach((manager: Manager) => {
          standings.set(manager.entry, manager.rank);
        });
        gameweekMap.set(gw.gameweek, standings);
      }
    });

    // Build chart data
    const validGameweeks = Array.from(gameweekMap.keys()).sort((a, b) => a - b);
    
    return validGameweeks.map(gw => {
      const dataPoint: any = { gameweek: gw };
      const standings = gameweekMap.get(gw);
      
      allManagers.forEach((manager: Manager) => {
        const rank = standings?.get(manager.entry) || null;
        if (rank !== null) {
          dataPoint[`manager_${manager.entry}`] = rank;
        }
      });
      
      return dataPoint;
    });
  }, [historicalData]);

  const managers = useMemo(() => {
    const firstValidData = historicalData.find(gw => gw.data?.standings?.results);
    if (!firstValidData || !firstValidData.data) return [];
    return firstValidData.data.standings.results || [];
  }, [historicalData]);

  const colors = useMemo(() => generateColors(managers.length), [managers.length]);

  // Debug logging
  console.log('Position Tracker Debug:', {
    historicalDataLength: historicalData.length,
    chartDataLength: chartData.length,
    managersLength: managers.length,
    chartData: chartData.slice(0, 2), // First 2 entries for debugging
    historicalData: historicalData.map(d => ({ gw: d.gameweek, hasData: !!d.data, isLoading: d.isLoading }))
  });

  if (!chartData.length || !managers.length) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Position Tracker</h3>
            <p className="text-sm text-gray-500">Historical league positions</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <TrendingUp className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500">
            {historicalData.some(d => d.isLoading) 
              ? 'Loading historical data...' 
              : 'Position tracking will appear after more gameweek data is available.'
            }
          </p>
          {historicalData.length > 0 && (
            <div className="mt-4 text-xs text-gray-400">
              Debug: {historicalData.length} gameweeks requested, {historicalData.filter(d => d.data).length} with data
            </div>
          )}
        </div>
      </div>
    );
  }

  const getPositionChange = (manager: Manager) => {
    if (chartData.length < 2) return null;
    
    const managerKey = `manager_${manager.entry}`;
    const currentRank = chartData[chartData.length - 1]?.[managerKey];
    const previousRank = chartData[chartData.length - 2]?.[managerKey];
    
    if (!currentRank || !previousRank) return null;
    
    const change = previousRank - currentRank; // Positive means improved (lower rank number)
    
    if (change > 0) {
      return { type: 'up', value: change };
    } else if (change < 0) {
      return { type: 'down', value: Math.abs(change) };
    } else {
      return { type: 'same', value: 0 };
    }
  };

  // Main chart component content
  const chartContent = (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Position Tracker</h3>
              <p className="text-sm text-gray-500">
                League position changes over {chartData.length} gameweek{chartData.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Historical Analysis
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="h-96 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="gameweek" 
                stroke="#6b7280"
                fontSize={13}
                tickFormatter={(value) => `GW${value}`}
                axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                tick={{ fill: '#6b7280', fontSize: 13 }}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={13}
                reversed={true} // Reverse so position 1 is at top
                domain={[1, 'dataMax']}
                tickFormatter={(value) => `#${value}`}
                axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                tickLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                tick={{ fill: '#6b7280', fontSize: 13 }}
                label={{ value: 'Position', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 } }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: any, name: string) => {
                  const managerEntry = name.replace('manager_', '');
                  const manager = managers.find((m: Manager) => m.entry.toString() === managerEntry);
                  return [`#${value}`, manager?.player_name || 'Unknown'];
                }}
                labelFormatter={(label) => `Gameweek ${label}`}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value: string) => {
                  const managerEntry = value.replace('manager_', '');
                  const manager = managers.find((m: Manager) => m.entry.toString() === managerEntry);
                  return manager?.player_name || 'Unknown';
                }}
              />
              {managers.map((manager: Manager, index: number) => (
                <Line
                  key={manager.entry}
                  type="monotone"
                  dataKey={`manager_${manager.entry}`}
                  stroke={colors[index]}
                  strokeWidth={3}
                  dot={{ fill: colors[index], strokeWidth: 2, r: 5, fillOpacity: 0.8 }}
                  activeDot={{ 
                    r: 8, 
                    stroke: colors[index], 
                    strokeWidth: 3, 
                    fill: colors[index],
                    fillOpacity: 1
                  }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Position Changes Summary */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Position Changes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managers.slice(0, 6).map((manager: Manager) => {
              const change = getPositionChange(manager);
              return (
                <div key={manager.entry} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {manager.player_name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {manager.entry_name}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {change?.type === 'up' && (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">
                          +{change.value}
                        </span>
                      </>
                    )}
                    {change?.type === 'down' && (
                      <>
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">
                          -{change.value}
                        </span>
                      </>
                    )}
                    {change?.type === 'same' && (
                      <>
                        <Minus className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">-</span>
                      </>
                    )}
                    {!change && (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {managers.length > 6 && (
            <div className="mt-4 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Show all {managers.length} managers
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Return either exportable version or plain version
  return exportable ? (
    <ExportablePositionTracker
      leagueName={leagueName}
      currentGameweek={currentGameweek}
    >
      {chartContent}
    </ExportablePositionTracker>
  ) : (
    chartContent
  );
}
