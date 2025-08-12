'use client';

import { HelpCircle, ExternalLink, Flame, Heart } from 'lucide-react';

export default function About() {
  const saGlossary = [
    { term: "Boet", definition: "Brother, friend, mate - used for fellow FPL managers" },
    { term: "Bru", definition: "Short for 'brother' - another friendly term" },
    { term: "China", definition: "Friend, buddy - common South African term" },
    { term: "Lekker", definition: "Nice, good, awesome - when your captain hauls!" },
    { term: "Sharp", definition: "Cool, sorted, all good - everything's under control" },
    { term: "Jol", definition: "Good time, fun - having a jol with FPL" },
    { term: "Boerie", definition: "Short for boerewors (sausage) - also means great/excellent" },
    { term: "Eish", definition: "Expression of dismay - when your captain blanks" },
    { term: "Braai", definition: "BBQ - where all the best FPL discussions happen" },
    { term: "Howzit", definition: "How's it going? - standard greeting" },
    { term: "Just now", definition: "Later, in a bit - South African time concept" },
    { term: "Ag man", definition: "Oh man - expression of frustration or sympathy" },
    { term: "Skelmpie", definition: "Naughty, cheeky - when the servers are playing up" },
    { term: "Sho", definition: "Expression of surprise or acknowledgment" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Flame className="h-12 w-12 text-braai-primary mr-3" />
          <h1 className="text-4xl font-black text-premium">
            About Boet Ball
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Premium Fantasy Premier League companion app built for South African fans, with lekker local flavour.
        </p>
      </div>

      {/* About Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="card-premium p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            To create the most comprehensive, user-friendly, and locally-relevant Fantasy Premier League 
            experience for South African fans. We combine professional-grade analytics with the warmth 
            and humor of Mzansi culture.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Whether you're having a braai with your mates or checking your team during load-shedding, 
            Boet Ball gives you the edge you need to dominate your mini-leagues.
          </p>
        </div>

        <div className="card-premium p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Why Boet Ball?
          </h2>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-braai-primary mr-2">•</span>
              <span><strong>Local Time:</strong> All fixtures in SAST - no more time zone confusion</span>
            </li>
            <li className="flex items-start">
              <span className="text-braai-primary mr-2">•</span>
              <span><strong>SA Flavor:</strong> Local slang and cultural references that feel like home</span>
            </li>
            <li className="flex items-start">
              <span className="text-braai-primary mr-2">•</span>
              <span><strong>Premium Data:</strong> Advanced stats and insights to boost your rank</span>
            </li>
            <li className="flex items-start">
              <span className="text-braai-primary mr-2">•</span>
              <span><strong>Mobile First:</strong> Perfect for checking on your phone anywhere</span>
            </li>
          </ul>
        </div>
      </div>

      {/* SA Glossary */}
      <div className="card p-8 mb-8">
        <div className="flex items-center mb-6">
          <HelpCircle className="h-6 w-6 text-braai-primary mr-2" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            South African Slang Glossary
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          New to South African slang? Here's your guide to understanding the lekker language we use throughout Boet Ball:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {saGlossary.map((item, index) => (
            <div key={index} className="border-l-4 border-braai-primary bg-braai-50 dark:bg-braai-900/10 p-4 rounded-r-lg">
              <dt className="font-semibold text-braai-700 dark:text-braai-300 mb-1">
                {item.term}
              </dt>
              <dd className="text-sm text-gray-600 dark:text-gray-400">
                {item.definition}
              </dd>
            </div>
          ))}
        </div>
      </div>

      {/* Official FPL Link */}
      <div className="card p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Official Fantasy Premier League
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Boet Ball is an unofficial companion app. To play Fantasy Premier League, create your team, 
          and manage your transfers, visit the official FPL website:
        </p>
        <a 
          href="https://fantasy.premierleague.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center btn-primary text-white px-6 py-3 rounded-lg hover:bg-braai-600 transition-colors"
        >
          Visit Official FPL Website
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </div>

      {/* Development Info */}
      <div className="bg-braai-50 dark:bg-braai-900/20 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Heart className="h-6 w-6 text-red-500 mr-2" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Built with Love for Mzansi
          </h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Boet Ball is built by FPL enthusiasts, for FPL enthusiasts. We understand the passion, 
          the heartbreak, and the joy that comes with Fantasy Premier League.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Made in 🇿🇦 • Powered by Next.js • Data from Official FPL API
        </p>
      </div>
    </div>
  );
}
