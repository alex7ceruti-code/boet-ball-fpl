'use client';

import { useBootstrapData } from '@/hooks/useFplData';
import { getLoadingText } from '@/utils/slang';

export default function TestApiPage() {
  const { data, error, isLoading } = useBootstrapData();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-braai-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">{getLoadingText()}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error.message || 'Failed to load FPL data'}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">No Data</h1>
          <p className="text-gray-600">No FPL data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-premium mb-4">
            Boet Ball - FPL API Test
          </h1>
          <p className="text-lg text-gray-600">
            API connection is working! 🔥
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-premium p-6 text-center">
            <h3 className="text-2xl font-bold text-braai-primary mb-2">
              {data.total_players}
            </h3>
            <p className="text-gray-600">Total Players</p>
          </div>
          
          <div className="card-premium p-6 text-center">
            <h3 className="text-2xl font-bold text-braai-primary mb-2">
              {data.teams.length}
            </h3>
            <p className="text-gray-600">Teams</p>
          </div>
          
          <div className="card-premium p-6 text-center">
            <h3 className="text-2xl font-bold text-braai-primary mb-2">
              {data.events.length}
            </h3>
            <p className="text-gray-600">Gameweeks</p>
          </div>
          
          <div className="card-premium p-6 text-center">
            <h3 className="text-2xl font-bold text-braai-primary mb-2">
              {data.elements.length}
            </h3>
            <p className="text-gray-600">Players in DB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Teams</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.teams.map((team) => (
                <div key={team.id} className="flex justify-between items-center py-1">
                  <span className="font-medium">{team.name}</span>
                  <span className="text-sm text-gray-500">{team.short_name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Current Gameweek</h2>
            {data.events.find(event => event.is_current) ? (
              <div className="space-y-2">
                <p><strong>Name:</strong> {data.events.find(event => event.is_current)?.name}</p>
                <p><strong>Deadline:</strong> {new Date(data.events.find(event => event.is_current)?.deadline_time || '').toLocaleString('en-ZA')}</p>
                <p><strong>Finished:</strong> {data.events.find(event => event.is_current)?.finished ? 'Yes' : 'No'}</p>
                <p><strong>Average Score:</strong> {data.events.find(event => event.is_current)?.average_entry_score || 'N/A'}</p>
              </div>
            ) : (
              <p className="text-gray-500">No current gameweek found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
