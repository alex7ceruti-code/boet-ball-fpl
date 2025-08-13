/**
 * BoetBall Radar System - Enhanced Content Tracker
 * Automatically fetches FPL content from multiple sources with South African flair
 * 
 * Sources included:
 * 1. Official FPL API
 * 2. Reddit r/FantasyPL
 * 3. Fantasy Football Scout RSS
 * 4. FPL Harry YouTube
 * 5. FPL Statistics API
 * 6. Mr Midas Reddit posts
 */

// Configuration
const CONFIG = {
  // Sheet configuration
  SHEET_NAME: 'BoetBall Radar',
  HEADERS: ['Date', 'Source', 'Content Type', 'Key Topic', 'Summary', 'Player Mentions', 'FPL Relevance', 'South African Angle', 'Suggested Actions'],
  
  // API endpoints and sources
  FPL_API_BASE: 'https://fantasy.premierleague.com/api/',
  REDDIT_RSS: 'https://www.reddit.com/r/FantasyPL/.rss',
  FFS_RSS: 'https://www.fantasyfootballscout.co.uk/feed/',
  FPL_STATS_API: 'https://fplstatistics.co.uk/Home/AjaxDataForAllPlayersTable',
  
  // YouTube RSS feeds (using RSS format)
  FPL_HARRY_RSS: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCAPwhbIDMSNtQ78QSlo9f7w', // FPL Harry official channel
  
  // Reddit user RSS
  MR_MIDAS_RSS: 'https://www.reddit.com/user/MrMidas/submitted/.rss',
  
  // South African context
  SA_TIMEZONE: 'Africa/Johannesburg',
  BRAAI_HOURS: [17, 18, 19, 20], // 5-8 PM SAST prime braai time
};

// South African contextual phrases and angles
const SA_CONTEXT = {
  timeGreetings: ['Howzit', 'Boet', 'Sharp', 'Eish', 'Lekker'],
  actions: [
    'Perfect braai-time content',
    'Share with the bokkies',
    'Weekend rugby halftime discussion',
    'Biltong and FPL analysis',
    'SAST deadline reminder needed',
    'Load-shedding friendly content',
    'School holidays FPL prep',
    'Rand value comparison'
  ],
  relevanceContexts: [
    'Great for SA FPL managers',
    'Timing perfect for SAST',
    'Matches SA weekend schedule',
    'Ideal for our supporters',
    'Braai-friendly discussion',
    'Perfect for the bokke'
  ]
};

/**
 * Main function to update all content sources
 */
function updateBoetBallRadar() {
  console.log('🏉 Starting BoetBall Radar update...');
  
  const sheet = getOrCreateSheet();
  const startTime = new Date();
  
  try {
    // Fetch from all sources
    const updates = [];
    
    updates.push(...fetchFPLAPI());
    updates.push(...fetchRedditFPL());
    updates.push(...fetchFantasyFootballScout());
    updates.push(...fetchFPLHarry());
    updates.push(...fetchFPLStatistics());
    updates.push(...fetchMrMidas());
    
    // Add updates to sheet
    addUpdatesToSheet(sheet, updates);
    
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`✅ BoetBall Radar updated successfully! Added ${updates.length} entries in ${duration}s`);
    
    // Send summary notification (optional)
    sendUpdateSummary(updates.length, duration);
    
  } catch (error) {
    console.error('❌ Error updating BoetBall Radar:', error);
    // Log error to sheet
    logError(sheet, error);
  }
}

/**
 * 1. Official FPL API Integration
 */
function fetchFPLAPI() {
  const updates = [];
  
  try {
    // Get current gameweek info
    const bootstrapResponse = UrlFetchApp.fetch(CONFIG.FPL_API_BASE + 'bootstrap-static/');
    const bootstrap = JSON.parse(bootstrapResponse.getContentText());
    
    const currentGW = bootstrap.events.find(gw => gw.is_current) || bootstrap.events.find(gw => gw.is_next);
    
    if (currentGW) {
      const saAngle = getSATimeContext() + " Perfect timing for SA FPL managers to prep!";
      
      updates.push({
        date: new Date(),
        source: 'FPL API',
        contentType: 'Gameweek Data',
        keyTopic: `GW${currentGW.id} - ${currentGW.name}`,
        summary: `Current gameweek analysis: ${currentGW.deadline_time}`,
        playerMentions: 'Various',
        fplRelevance: 'High - Current GW data',
        southAfricanAngle: saAngle,
        suggestedActions: `Create GW${currentGW.id} braai-time preview content`
      });
    }
    
    // Get top performers
    const elementsResponse = UrlFetchApp.fetch(CONFIG.FPL_API_BASE + 'bootstrap-static/');
    const elements = JSON.parse(elementsResponse.getContentText());
    
    const topScorers = elements.elements
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, 3);
    
    if (topScorers.length > 0) {
      const playerNames = topScorers.map(p => p.web_name).join(', ');
      updates.push({
        date: new Date(),
        source: 'FPL API',
        contentType: 'Player Stats',
        keyTopic: 'Top Performers',
        summary: `Current season top scorers: ${playerNames}`,
        playerMentions: playerNames,
        fplRelevance: 'High - Essential players',
        southAfricanAngle: 'These bokkies are dominating the FPL scene!',
        suggestedActions: 'Create "Bokkie Burners" analysis content'
      });
    }
    
  } catch (error) {
    console.error('Error fetching FPL API:', error);
  }
  
  return updates;
}

/**
 * 2. Reddit r/FantasyPL Integration
 */
function fetchRedditFPL() {
  const updates = [];
  
  try {
    const response = UrlFetchApp.fetch(CONFIG.REDDIT_RSS);
    const xmlDoc = XmlService.parse(response.getContentText());
    const root = xmlDoc.getRootElement();
    
    const items = root.getChildren('item', XmlService.getNamespace(''));
    
    items.slice(0, 5).forEach(item => {
      const title = item.getChild('title').getText();
      const link = item.getChild('link').getText();
      const pubDate = new Date(item.getChild('pubDate').getText());
      
      // Only process recent posts (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      if (pubDate > weekAgo) {
        updates.push({
          date: pubDate,
          source: 'Reddit FPL',
          contentType: 'Community Discussion',
          keyTopic: title.substring(0, 50) + '...',
          summary: `Reddit discussion: ${title}`,
          playerMentions: extractPlayerMentions(title),
          fplRelevance: 'Medium - Community insights',
          southAfricanAngle: getSARedditAngle(title),
          suggestedActions: 'Consider SA perspective on this topic'
        });
      }
    });
    
  } catch (error) {
    console.error('Error fetching Reddit FPL:', error);
  }
  
  return updates;
}

/**
 * 3. Fantasy Football Scout RSS Integration
 */
function fetchFantasyFootballScout() {
  const updates = [];
  
  try {
    const response = UrlFetchApp.fetch(CONFIG.FFS_RSS);
    const xmlDoc = XmlService.parse(response.getContentText());
    const root = xmlDoc.getRootElement();
    
    const items = root.getChildren('item');
    
    items.slice(0, 5).forEach(item => {
      const title = item.getChild('title').getText();
      const link = item.getChild('link').getText();
      const pubDate = new Date(item.getChild('pubDate').getText());
      const description = item.getChild('description') ? item.getChild('description').getText() : '';
      
      // Only process recent articles (last 3 days)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      if (pubDate > threeDaysAgo) {
        updates.push({
          date: pubDate,
          source: 'Fantasy Football Scout',
          contentType: 'Expert Analysis',
          keyTopic: title.substring(0, 50) + '...',
          summary: `FFS Analysis: ${description.substring(0, 100)}...`,
          playerMentions: extractPlayerMentions(title + ' ' + description),
          fplRelevance: 'High - Expert insights',
          southAfricanAngle: 'Premium analysis - perfect for serious SA FPL managers',
          suggestedActions: 'Create bokkies-friendly summary of key points'
        });
      }
    });
    
  } catch (error) {
    console.error('Error fetching Fantasy Football Scout:', error);
  }
  
  return updates;
}

/**
 * 4. FPL Harry YouTube Integration
 */
function fetchFPLHarry() {
  const updates = [];
  
  try {
    // Note: You'll need to replace with actual FPL Harry channel ID
    const response = UrlFetchApp.fetch(CONFIG.FPL_HARRY_RSS);
    const xmlDoc = XmlService.parse(response.getContentText());
    const root = xmlDoc.getRootElement();
    const atomNS = XmlService.getNamespace('http://www.w3.org/2005/Atom');
    
    const entries = root.getChildren('entry', atomNS);
    
    entries.slice(0, 3).forEach(entry => {
      const title = entry.getChild('title', atomNS).getText();
      const published = new Date(entry.getChild('published', atomNS).getText());
      const videoId = entry.getChild('videoId', XmlService.getNamespace('http://www.youtube.com/xml/schemas/2015')).getText();
      const link = `https://www.youtube.com/watch?v=${videoId}`;
      
      // Only process recent videos (last 5 days)
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      
      if (published > fiveDaysAgo) {
        updates.push({
          date: published,
          source: 'FPL Harry (YouTube)',
          contentType: 'Video Analysis',
          keyTopic: title.substring(0, 50) + '...',
          summary: `FPL Harry video: ${title}`,
          playerMentions: extractPlayerMentions(title),
          fplRelevance: 'High - Popular FPL content',
          southAfricanAngle: 'Perfect weekend braai viewing for SA FPL managers',
          suggestedActions: 'Create SA-specific response or summary content'
        });
      }
    });
    
  } catch (error) {
    console.error('Error fetching FPL Harry:', error);
  }
  
  return updates;
}

/**
 * 5. FPL Statistics Integration
 */
function fetchFPLStatistics() {
  const updates = [];
  
  try {
    // Note: FPL Statistics might require specific headers or rate limiting
    const response = UrlFetchApp.fetch(CONFIG.FPL_STATS_API, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BoetBall/1.0)'
      }
    });
    
    const data = JSON.parse(response.getContentText());
    
    // Process price change predictions
    if (data && data.length > 0) {
      const risers = data.filter(player => player.chance_of_rise_next_round > 80).slice(0, 3);
      const fallers = data.filter(player => player.chance_of_fall_next_round > 80).slice(0, 3);
      
      if (risers.length > 0) {
        const riserNames = risers.map(p => p.name).join(', ');
        updates.push({
          date: new Date(),
          source: 'FPL Statistics',
          contentType: 'Price Predictions',
          keyTopic: 'Expected Price Rises',
          summary: `Players likely to rise: ${riserNames}`,
          playerMentions: riserNames,
          fplRelevance: 'High - Price change intel',
          southAfricanAngle: 'Beat the price rises - get ahead of the bokkies!',
          suggestedActions: 'Create urgent transfer alert content for SA managers'
        });
      }
      
      if (fallers.length > 0) {
        const fallerNames = fallers.map(p => p.name).join(', ');
        updates.push({
          date: new Date(),
          source: 'FPL Statistics',
          contentType: 'Price Predictions',
          keyTopic: 'Expected Price Falls',
          summary: `Players likely to fall: ${fallerNames}`,
          playerMentions: fallerNames,
          fplRelevance: 'Medium - Price drop warnings',
          southAfricanAngle: 'Avoid the price drops - time to transfer out!',
          suggestedActions: 'Create transfer advice for affected SA managers'
        });
      }
    }
    
  } catch (error) {
    console.error('Error fetching FPL Statistics:', error);
  }
  
  return updates;
}

/**
 * 6. Mr Midas Reddit Integration
 */
function fetchMrMidas() {
  const updates = [];
  
  try {
    const response = UrlFetchApp.fetch(CONFIG.MR_MIDAS_RSS);
    const xmlDoc = XmlService.parse(response.getContentText());
    const root = xmlDoc.getRootElement();
    
    const items = root.getChildren('item', XmlService.getNamespace(''));
    
    items.slice(0, 3).forEach(item => {
      const title = item.getChild('title').getText();
      const link = item.getChild('link').getText();
      const pubDate = new Date(item.getChild('pubDate').getText());
      const description = item.getChild('description') ? item.getChild('description').getText() : '';
      
      // Only process recent posts (last 5 days)
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      
      if (pubDate > fiveDaysAgo) {
        updates.push({
          date: pubDate,
          source: 'Mr Midas (Reddit)',
          contentType: 'Expert Tips',
          keyTopic: title.substring(0, 50) + '...',
          summary: `Mr Midas insight: ${description.substring(0, 100)}...`,
          playerMentions: extractPlayerMentions(title + ' ' + description),
          fplRelevance: 'High - Proven expert analysis',
          southAfricanAngle: 'Golden insights from a proven FPL legend - perfect for SA managers',
          suggestedActions: 'Create BoetBall analysis based on these golden tips'
        });
      }
    });
    
  } catch (error) {
    console.error('Error fetching Mr Midas:', error);
  }
  
  return updates;
}

/**
 * Helper Functions
 */

function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
    sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).setValues([CONFIG.HEADERS]);
    sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).setFontWeight('bold');
  }
  
  return sheet;
}

function addUpdatesToSheet(sheet, updates) {
  if (updates.length === 0) return;
  
  const lastRow = sheet.getLastRow();
  const values = updates.map(update => [
    update.date,
    update.source,
    update.contentType,
    update.keyTopic,
    update.summary,
    update.playerMentions,
    update.fplRelevance,
    update.southAfricanAngle,
    update.suggestedActions
  ]);
  
  sheet.getRange(lastRow + 1, 1, values.length, CONFIG.HEADERS.length).setValues(values);
}

function extractPlayerMentions(text) {
  // Common FPL player surnames/names to look for
  const commonNames = [
    'Salah', 'Haaland', 'Son', 'Kane', 'Bruno', 'KDB', 'De Bruyne',
    'Alexander-Arnold', 'TAA', 'Robertson', 'Cancelo', 'Walker',
    'Mitrovic', 'Jesus', 'Wilson', 'Toney', 'Rashford', 'Sterling',
    'Foden', 'Mahrez', 'Saka', 'Martinelli', 'Bowen', 'Rice'
  ];
  
  const mentions = commonNames.filter(name => 
    text.toLowerCase().includes(name.toLowerCase())
  );
  
  return mentions.length > 0 ? mentions.join(', ') : 'None specific';
}

function getSATimeContext() {
  const now = new Date();
  const hour = now.getHours();
  
  if (CONFIG.BRAAI_HOURS.includes(hour)) {
    return "Perfect braai time! ";
  } else if (hour >= 6 && hour <= 11) {
    return "Good morning bokkies! ";
  } else if (hour >= 12 && hour <= 17) {
    return "Afternoon sharp! ";
  } else {
    return "Evening howzit! ";
  }
}

function getSARedditAngle(title) {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('captain') || lowerTitle.includes('(c)')) {
    return 'Captain choices - crucial for SA FPL success!';
  } else if (lowerTitle.includes('transfer') || lowerTitle.includes('wildcard')) {
    return 'Transfer strategy - help your fellow bokkies decide!';
  } else if (lowerTitle.includes('differential')) {
    return 'Differential picks - perfect for climbing SA mini-leagues!';
  } else {
    return 'Community wisdom - always valuable for SA FPL managers!';
  }
}

function logError(sheet, error) {
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, 1, CONFIG.HEADERS.length).setValues([[
    new Date(),
    'System Error',
    'Error Log',
    'Fetch Error',
    error.toString(),
    'N/A',
    'System',
    'Technical issue needs attention',
    'Check logs and fix data source'
  ]]);
}

function sendUpdateSummary(updateCount, duration) {
  // Optional: Send email or notification summary
  // You can implement this if you want email notifications
  console.log(`📊 Summary: ${updateCount} updates processed in ${duration} seconds`);
}

/**
 * Individual source test functions (for debugging)
 */
function testFPLAPI() {
  console.log('Testing FPL API...');
  const updates = fetchFPLAPI();
  console.log(`Found ${updates.length} FPL API updates:`, updates);
}

function testRedditFPL() {
  console.log('Testing Reddit FPL...');
  const updates = fetchRedditFPL();
  console.log(`Found ${updates.length} Reddit updates:`, updates);
}

function testFantasyFootballScout() {
  console.log('Testing Fantasy Football Scout...');
  const updates = fetchFantasyFootballScout();
  console.log(`Found ${updates.length} FFS updates:`, updates);
}

function testFPLHarry() {
  console.log('Testing FPL Harry...');
  const updates = fetchFPLHarry();
  console.log(`Found ${updates.length} FPL Harry updates:`, updates);
}

function testFPLStatistics() {
  console.log('Testing FPL Statistics...');
  const updates = fetchFPLStatistics();
  console.log(`Found ${updates.length} FPL Statistics updates:`, updates);
}

function testMrMidas() {
  console.log('Testing Mr Midas...');
  const updates = fetchMrMidas();
  console.log(`Found ${updates.length} Mr Midas updates:`, updates);
}

/**
 * Setup function - run this once to initialize
 */
function setupBoetBallRadar() {
  console.log('🏉 Setting up BoetBall Radar System...');
  
  const sheet = getOrCreateSheet();
  
  // Add some initial example data
  const exampleData = [
    [
      new Date(),
      'System Setup',
      'Initialization',
      'BoetBall Radar Active',
      'Content tracking system initialized with 6 data sources',
      'System',
      'High - System operational',
      'Perfect timing for SA FPL content creation!',
      'Start creating authentic SA FPL content'
    ]
  ];
  
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, CONFIG.HEADERS.length).setValues(exampleData);
  
  console.log('✅ BoetBall Radar System setup complete!');
}

/**
 * Weekly comprehensive update (recommended trigger)
 */
function weeklyBoetBallUpdate() {
  console.log('📅 Running weekly BoetBall Radar update...');
  updateBoetBallRadar();
}

/**
 * Daily quick update (optional trigger)
 */
function dailyBoetBallUpdate() {
  console.log('📅 Running daily BoetBall Radar update...');
  // Run with fewer sources for daily updates
  const sheet = getOrCreateSheet();
  const updates = [];
  
  updates.push(...fetchFPLAPI());
  updates.push(...fetchFPLStatistics());
  
  addUpdatesToSheet(sheet, updates);
  console.log(`✅ Daily update complete! Added ${updates.length} entries.`);
}
