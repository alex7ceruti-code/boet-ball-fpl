/**
 * BoetBall Content Generator
 * Converts radar insights into publishable articles with South African flair
 */

// Content generation templates based on radar data
const CONTENT_TEMPLATES = {
  PLAYER_INJURY: {
    title: (player, team) => `${player} Injury Update: What This Means for Your FPL Squad, Boet`,
    structure: [
      "injury_overview",
      "fpl_impact_analysis", 
      "transfer_recommendations",
      "differential_picks",
      "sa_community_reaction"
    ]
  },
  
  PRICE_CHANGE: {
    title: (players) => `Price Changes Alert: ${players.length} Players on the Move This Week`,
    structure: [
      "price_summary",
      "value_picks_analysis",
      "template_implications", 
      "transfer_timing_advice",
      "sa_perspective"
    ]
  },
  
  FIXTURE_ANALYSIS: {
    title: (gw) => `GameWeek ${gw} Fixture Analysis: The Boet's Guide to Captain Picks`,
    structure: [
      "fixture_overview",
      "captain_candidates",
      "differential_options",
      "avoid_list",
      "sa_betting_odds"
    ]
  },
  
  TRANSFER_TRENDS: {
    title: () => `Community Transfer Trends: What 6 Million FPL Managers Are Doing`,
    structure: [
      "trend_overview",
      "popular_transfers_in",
      "popular_transfers_out",
      "contrarian_picks",
      "sa_mini_league_impact"
    ]
  }
};

// South African content snippets for authentic flavor
const SA_SNIPPETS = {
  openings: [
    "Howzit FPL boets! Let's dive into this week's drama...",
    "Right, gather 'round the braai - we need to chat about FPL...",
    "Sharp sharp, let's get straight to the FPL goss that's got everyone talking...",
    "Eish, what a week it's been in FPL land! Here's what you need to know..."
  ],
  
  transitions: [
    "Now here's where it gets lekker interesting...",
    "Ag man, but wait - there's more to consider...",
    "Hold onto your biltong, because...",
    "This is where us South African FPL managers get clever..."
  ],
  
  conclusions: [
    "There you have it, boets - that's the lowdown from the FPL trenches.",
    "Sharp! Now go make those transfers and show your mini-league who's boss.",
    "Remember, in FPL like in rugby - it's about the long game. Stay sharp!",
    "That's all from me - now braai responsibly and FPL even more responsibly!"
  ]
};

// Content generation functions
function generateArticleFromRadarData(radarEntry) {
  const { title, priority, source, insights, category, tags } = radarEntry;
  
  const template = determineTemplate(category, tags);
  const articleStructure = CONTENT_TEMPLATES[template];
  
  return {
    title: generateTitle(template, insights),
    excerpt: generateExcerpt(insights),
    content: generateContent(template, insights, source),
    tags: generateTags(category, tags),
    category: category,
    priority: priority,
    sources: [source],
    saFlavor: "HIGH",
    publishReady: true
  };
}

function determineTemplate(category, tags) {
  const tagStr = Array.isArray(tags) ? tags.join(' ').toLowerCase() : tags.toLowerCase();
  
  if (tagStr.includes('injury') || tagStr.includes('fitness')) return 'PLAYER_INJURY';
  if (tagStr.includes('price') || tagStr.includes('value')) return 'PRICE_CHANGE';
  if (tagStr.includes('fixture') || tagStr.includes('captain')) return 'FIXTURE_ANALYSIS';
  if (tagStr.includes('transfer') || tagStr.includes('trend')) return 'TRANSFER_TRENDS';
  
  return 'TRANSFER_TRENDS'; // Default fallback
}

function generateTitle(template, insights) {
  // Extract key players/info from insights
  const players = extractPlayersFromText(insights);
  const gameweek = extractGameweekFromText(insights);
  
  const templateData = CONTENT_TEMPLATES[template];
  
  switch(template) {
    case 'PLAYER_INJURY':
      return templateData.title(players[0] || 'Key Player', 'Premier League');
    case 'FIXTURE_ANALYSIS':
      return templateData.title(gameweek || 'Next');
    default:
      return templateData.title(players);
  }
}

function generateExcerpt(insights) {
  // Create compelling excerpt from insights
  const sentences = insights.split('.').filter(s => s.trim().length > 20);
  const excerpt = sentences.slice(0, 2).join('. ') + '.';
  
  // Add SA flavor
  const saOpening = SA_SNIPPETS.openings[Math.floor(Math.random() * SA_SNIPPETS.openings.length)];
  return `${saOpening} ${excerpt}`;
}

function generateContent(template, insights, source) {
  const structure = CONTENT_TEMPLATES[template].structure;
  let content = '';
  
  // Opening with SA flair
  content += `${SA_SNIPPETS.openings[Math.floor(Math.random() * SA_SNIPPETS.openings.length)]}\n\n`;
  
  // Main content sections
  structure.forEach((section, index) => {
    content += generateContentSection(section, insights, index);
    
    // Add transitions between sections
    if (index < structure.length - 1) {
      content += `\n\n${SA_SNIPPETS.transitions[Math.floor(Math.random() * SA_SNIPPETS.transitions.length)]}\n\n`;
    }
  });
  
  // Conclusion with SA flair
  content += `\n\n${SA_SNIPPETS.conclusions[Math.floor(Math.random() * SA_SNIPPETS.conclusions.length)]}`;
  
  // Source attribution
  content += `\n\n*Based on insights from ${source} and FPL community analysis.*`;
  
  return content;
}

function generateContentSection(sectionType, insights, index) {
  const headers = {
    injury_overview: "## The Injury Situation",
    fpl_impact_analysis: "## FPL Impact Analysis", 
    transfer_recommendations: "## Transfer Recommendations",
    differential_picks: "## Differential Picks for the Brave",
    sa_community_reaction: "## What the SA FPL Community is Saying",
    price_summary: "## This Week's Price Movements",
    value_picks_analysis: "## Value Picks Analysis",
    template_implications: "## Template Implications",
    transfer_timing_advice: "## Transfer Timing Strategy",
    fixture_overview: "## Fixture Breakdown",
    captain_candidates: "## Captain Candidates",
    avoid_list: "## Players to Avoid",
    trend_overview: "## What's Trending",
    popular_transfers_in: "## Most Transferred In",
    popular_transfers_out: "## Most Transferred Out",
    contrarian_picks: "## Contrarian Picks",
    sa_betting_odds: "## Betting Odds Perspective",
    sa_mini_league_impact: "## Mini League Implications"
  };
  
  let section = `${headers[sectionType] || '## Analysis'}\n\n`;
  
  // Generate relevant content based on insights and section type
  section += expandInsights(insights, sectionType);
  
  return section;
}

function expandInsights(insights, sectionType) {
  // This would use AI/templates to expand the basic insights into full content
  // For now, return structured placeholder that can be easily filled
  
  const templates = {
    injury_overview: `The latest reports suggest ${insights}. This development has significant implications for FPL managers who've invested heavily in this asset.`,
    
    fpl_impact_analysis: `From an FPL perspective, ${insights}. Managers need to consider both the immediate and long-term implications for their squads.`,
    
    transfer_recommendations: `Based on this analysis, here are our top transfer suggestions:\n\n• **Immediate action**: ${insights}\n• **Wait and see**: Monitor the situation closely\n• **Long-term planning**: Consider these factors for future gameweeks`,
    
    sa_community_reaction: `The South African FPL community has been buzzing about this development. From the Cape Town mini-leagues to the Joburg WhatsApp groups, managers are split on the best approach.`
  };
  
  return templates[sectionType] || `Key insight: ${insights}\n\nThis requires careful consideration from FPL managers, especially those in competitive mini-leagues.`;
}

// Utility functions
function extractPlayersFromText(text) {
  // Simple player name extraction (can be enhanced with NLP)
  const commonNames = ['Salah', 'Kane', 'Son', 'Haaland', 'De Bruyne', 'Palmer', 'Watkins', 'Isak'];
  return commonNames.filter(name => text.includes(name));
}

function extractGameweekFromText(text) {
  const gwMatch = text.match(/gameweek\s*(\d+)|gw\s*(\d+)/i);
  return gwMatch ? (gwMatch[1] || gwMatch[2]) : null;
}

function generateTags(category, originalTags) {
  const baseTags = Array.isArray(originalTags) ? originalTags : [originalTags];
  const saTags = ['FPL', 'South Africa', 'Fantasy Football', 'Premier League'];
  
  return [...new Set([...baseTags, ...saTags])];
}

// Export functions for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateArticleFromRadarData,
    CONTENT_TEMPLATES,
    SA_SNIPPETS
  };
}

// Example usage
console.log('BoetBall Content Generator loaded. Use generateArticleFromRadarData(radarEntry) to create articles.');
