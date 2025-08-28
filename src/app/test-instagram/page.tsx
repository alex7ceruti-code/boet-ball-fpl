'use client';

import React, { useState } from 'react';
import SocialMediaImageGenerator from '@/components/SocialMediaImageGenerator';
import { Camera, Users, Trophy, Star } from 'lucide-react';

const TestInstagramPage = () => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'player-comparison' | 'player-spotlight' | 'captain-picks' | 'squad-analysis'>('player-comparison');
  const [selectedData, setSelectedData] = useState<any>(null);

  // Sample player data for testing
  const samplePlayers = [
    {
      id: 1,
      web_name: "Haaland",
      first_name: "Erling",
      second_name: "Haaland",
      team_info: { short_name: "MCI" },
      position_info: { singular_name: "Forward" },
      total_points: 90,
      form: "8.5",
      now_cost: 141,
      selected_by_percent: "45.2",
      goals_scored: 12,
      assists: 3,
      expected_goals: "10.5",
      expected_assists: "2.1",
      ict_index: "180.5",
      value_season: "6.4"
    },
    {
      id: 2,
      web_name: "Saka",
      first_name: "Bukayo",
      second_name: "Saka",
      team_info: { short_name: "ARS" },
      position_info: { singular_name: "Midfielder" },
      total_points: 85,
      form: "7.8",
      now_cost: 100,
      selected_by_percent: "38.9",
      goals_scored: 8,
      assists: 9,
      expected_goals: "7.2",
      expected_assists: "8.3",
      ict_index: "165.2",
      value_season: "8.5"
    },
    {
      id: 3,
      web_name: "Saliba",
      first_name: "William",
      second_name: "Saliba",
      team_info: { short_name: "ARS" },
      position_info: { singular_name: "Defender" },
      total_points: 78,
      form: "7.2",
      now_cost: 61,
      selected_by_percent: "25.4",
      goals_scored: 2,
      assists: 4,
      expected_goals: "1.8",
      expected_assists: "3.1",
      ict_index: "145.8",
      value_season: "12.8"
    },
    {
      id: 4,
      web_name: "Vicario",
      first_name: "Guglielmo",
      second_name: "Vicario",
      team_info: { short_name: "TOT" },
      position_info: { singular_name: "Goalkeeper" },
      total_points: 65,
      form: "6.9",
      now_cost: 50,
      selected_by_percent: "18.7",
      goals_scored: 0,
      assists: 1,
      expected_goals: "0.0",
      expected_assists: "0.2",
      ict_index: "95.3",
      value_season: "13.0"
    }
  ];

  const sampleSquadData = {
    totalCost: 98.7,
    totalPoints: 267,
    avgForm: 8.9,
    squadSize: 15,
    topPlayers: [
      { web_name: "Haaland", team_info: { short_name: "MCI" }, total_points: 90 },
      { web_name: "Saka", team_info: { short_name: "ARS" }, total_points: 85 },
      { web_name: "Saliba", team_info: { short_name: "ARS" }, total_points: 78 },
      { web_name: "Vicario", team_info: { short_name: "TOT" }, total_points: 65 }
    ]
  };

  const handleTemplateTest = (template: 'player-comparison' | 'player-spotlight' | 'captain-picks' | 'squad-analysis') => {
    setSelectedTemplate(template);
    
    let data;
    switch (template) {
      case 'player-comparison':
        data = samplePlayers.slice(0, 4);
        break;
      case 'player-spotlight':
        data = samplePlayers[0]; // Single player for spotlight
        break;
      case 'captain-picks':
        data = samplePlayers.slice(0, 3); // Top 3 for captain picks
        break;
      case 'squad-analysis':
        data = sampleSquadData;
        break;
      default:
        data = samplePlayers;
    }
    
    setSelectedData(data);
    setShowGenerator(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Instagram Image Generator Test
          </h1>
          <p className="text-xl text-gray-600">
            Test the social media image generation functionality with sample FPL data
          </p>
        </div>

        {/* Template Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Player Comparison */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Player Comparison</h3>
                <p className="text-sm text-gray-600">Compare up to 4 players</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Generate Instagram posts comparing multiple players with their stats, form, and pricing.
            </p>
            <button
              onClick={() => handleTemplateTest('player-comparison')}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Test Player Comparison
            </button>
          </div>

          {/* Player Spotlight */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Player Spotlight</h3>
                <p className="text-sm text-gray-600">Feature a single player</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Create eye-catching Instagram posts highlighting individual player performance.
            </p>
            <button
              onClick={() => handleTemplateTest('player-spotlight')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Test Player Spotlight
            </button>
          </div>

          {/* Captain Picks */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Captain Picks</h3>
                <p className="text-sm text-gray-600">Top 3 captain options</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Share your gameweek captain recommendations with South African flair.
            </p>
            <button
              onClick={() => handleTemplateTest('captain-picks')}
              className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
            >
              Test Captain Picks
            </button>
          </div>

          {/* Squad Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Camera className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Squad Analysis</h3>
                <p className="text-sm text-gray-600">Full team breakdown</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Generate comprehensive squad analysis posts with key statistics.
            </p>
            <button
              onClick={() => handleTemplateTest('squad-analysis')}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Test Squad Analysis
            </button>
          </div>

        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-3">How to Test:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Click on any template button above to open the image generator</li>
            <li>Choose your preferred format (Instagram Post, Story, or Twitter)</li>
            <li>Preview the generated image with sample FPL data</li>
            <li>Click "Download Image" to save the high-resolution PNG</li>
            <li>Test different formats and templates to see all variations</li>
          </ol>
          
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">✅ Features Included:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• High-quality 1080x1080 Instagram Post format</li>
              <li>• 1080x1920 Instagram Story format</li>
              <li>• 1200x675 Twitter Post format</li>
              <li>• South African themed branding with Boet Ball logo</li>
              <li>• Multiple template variations for different content types</li>
              <li>• Real FPL data integration ready</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Social Media Generator Modal */}
      {showGenerator && selectedData && (
        <SocialMediaImageGenerator
          data={selectedData}
          template={selectedTemplate}
          title="Boet Ball FPL Analysis"
          onClose={() => setShowGenerator(false)}
        />
      )}
    </div>
  );
};

export default TestInstagramPage;
