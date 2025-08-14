/**
 * BoetBall Radar System - Enhanced Content Tracker (Improved Version)
 * Automatically fetches FPL content from multiple sources with South African flair
 * 
 * Key Improvements:
 * - Fixed FPL Statistics API endpoint
 * - Better error handling and fallbacks
 * - Additional data sources
 * - Enhanced SA context
 * - Rate limiting protection
 */

// Configuration
const CONFIG = {
  // Sheet configuration
  SHEET_NAME: 'BoetBall Radar',
  HEADERS: ['Date', 'Source', 'Content Type', 'Key Topic', 'Summary', 'Player Mentions', 'FPL Relevance', 'South African Angle', 'Suggested Actions', 'Priority'],
  
  // API endpoints and sources
  FPL_API_BASE: 'https://fantasy.premierleague.com/api/',
  REDDIT_RSS: 'https://www.reddit.com/r/FantasyPL/.rss',
  FFS_RSS: 'https://www.fantasyfootballscout.co.uk/feed/',
  
  // Fixed FPL Statistics endpoints
  FPL_STATS_TRANSFERS: 'https://fplstatistics.co.uk/Home/AjaxDataForTransferDataTable',
  FPL_STATS_OWNERSHIP: 'https://fplstatistics.co.uk/Home/AjaxDataForAllPlayersTable',
  
  // YouTube RSS feeds
  FPL_HARRY_RSS: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCAPwhbIDMSNtQ78QSlo9f7w',
  FPL_FOCAL_RSS: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC11NFAmm-2WjRBB9SqDbdgQ', // FPL Focal
  
  // Additional sources
  PLANET_FPL_RSS: 'https://www.planetfpl.com/feed/',
  
  // Reddit users
  MR_MIDAS_RSS: 'https://www.reddit.com/user/MrMidas/submitted/.rss',
  
  // South African context
  SA_TIMEZONE: 'Africa/Johannesburg',
  BRAAI_HOURS: [17, 18, 19, 20],
  
  // Rate limiting
  REQUEST_DELAY: 1000, // 1 second between requests
  MAX_RETRIES: 3
};

// Enhanced South African context
const SA_CONTEXT = {
  timeGreetings: ['Howzit boet', 'Sharp sharp', 'Eish man', 'Lekker bru', 'Ag shame'],
  actions: [
    'Perfect braai-time content creation',
    'Share with the bokkies in your mini-league',
    'Weekend rugby halftime FPL discussion',
    'Biltong and FPL analysis session',
    'SAST deadline reminder - crucial timing',
    'Load-shedding friendly quick content',
    'School holidays prep content',
    'Rand value comparison for transfers',
    'Create WhatsApp group discussion starter',
    'Prep for Monday office FPL banter'
  ],
  priorities: ['High', 'Medium', 'Low', 'Urgent'],
  relevanceBoost: {
    'deadline': 'Urgent',
    'captain': 'High',
    'transfer': 'High',
    'wildcard': 'Medium',
    'bench boost': 'Medium',
    'free hit': 'Medium',
    'triple captain': 'High'
  }
};

/**
 * Main function to update all content sources
 */
function updateBoetBallRadar() {
  console.log('🏉 Starting BoetBall Radar update...');
  
  const sheet = getOrCreateSheet();
  const startTime = new Date();
  let totalUpdates = 0;
  
  try {
    const updates = [];
    
    // Fetch from all sources with delays to avoid rate limiting
    const sources = [
      { name: 'FPL API', func: fetchFPLAPI },
      { name: 'Reddit FPL', func: fetchRedditFPL },
      { name: 'Fantasy Football Scout', func: fetchFantasyFootballScout },
      { name: 'FPL Harry', func: fetchFPLHarry },
      { name: 'FPL Statistics', func: fetchFPLStatisticsImproved },
      { name: 'Mr Midas', func: fetchMrMidas },
      { name: 'Planet FPL', func: fetchPlanetFPL },
      { name: 'FPL Focal', func: fetchFPLFocal }
    ];
    
    for (const source of sources) {
      try {
        console.log(`Fetching from ${source.name}...`);
        const sourceUpdates = source.func();
        updates.push(...sourceUpdates);
        console.log(`✅ ${source.name}: ${sourceUpdates.length} updates`);
        
        // Rate limiting delay
        Utilities.sleep(CONFIG.REQUEST_DELAY);
        
      } catch (error) {
        console.error(`❌ Error with ${source.name}:`, error);
        logSourceError(sheet, source.name, error);
      }
    }
    
    // Process and prioritize updates
    const processedUpdates = prioritizeUpdates(updates);
    
    // Add updates to sheet
    addUpdatesToSheet(sheet, processedUpdates);
    totalUpdates = processedUpdates.length;
    
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`✅ BoetBall Radar updated successfully! Added ${totalUpdates} entries in ${duration}s`);
    
    // Send summary notification
    sendUpdateSummary(totalUpdates, duration, processedUpdates);
    
  } catch (error) {
    console.error('❌ Critical error in BoetBall Radar:', error);
    logError(sheet, error);
  }
  
  return totalUpdates;
}

/**
 * Improved FPL Statistics Integration
 */
function fetchFPLStatisticsImproved() {
  const updates = [];
  
  try {
    // Try multiple endpoints with fallbacks
    const endpoints = [
      { url: 'https://fplstatistics.co.uk/api/player_stats', type: 'API' },
      { url: CONFIG.FPL_STATS_TRANSFERS, type: 'Transfers' },
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = UrlFetchApp.fetch(endpoint.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; BoetBall/1.0)',
            'Accept': 'application/json, text/html, */*'
          },
          muteHttpExceptions: true
        });
        
        if (response.getResponseCode() === 200) {
          const contentType = response.getHeaders()['Content-Type'] || '';
          let data;
          
          if (contentType.includes('json')) {
            data = JSON.parse(response.getContentText());
          } else {
            // Parse HTML response for transfer data
            const htmlContent = response.getContentText();
            data = parseTransferDataFromHTML(htmlContent);
          }
          
          if (data && data.length > 0) {
            // Process price change predictions
            const risers = data.filter(player => 
              (player.chance_of_rise_next_round > 80 || player.net_transfers_in > 50000)
            ).slice(0, 3);
            
            const fallers = data.filter(player => 
              (player.chance_of_fall_next_round > 80 || player.net_transfers_out > 50000)
            ).slice(0, 3);
            
            if (risers.length > 0) {
              const riserNames = risers.map(p => p.name || p.web_name).join(', ');
              updates.push({
                date: new Date(),
                source: 'FPL Statistics',
                contentType: 'Price Predictions',
                keyTopic: 'Expected Price Rises',
                summary: `Players likely to rise tonight: ${riserNames}`,
                playerMentions: riserNames,
                fplRelevance: 'High - Critical transfer timing',
                southAfricanAngle: 'Beat the price rises! Get these bokkies before the deadline!',
                suggestedActions: 'Create urgent WhatsApp message for SA mini-leagues',
                priority: 'Urgent'
              });
            }
            
            if (fallers.length > 0) {
              const fallerNames = fallers.map(p => p.name || p.web_name).join(', ');
              updates.push({
                date: new Date(),
                source: 'FPL Statistics',
                contentType: 'Price Predictions',
                keyTopic: 'Expected Price Falls',
                summary: `Players likely to fall tonight: ${fallerNames}`,
                playerMentions: fallerNames,
                fplRelevance: 'Medium - Transfer out consideration',
                southAfricanAngle: 'Avoid the drops - time to ship these players out, boet!',
                suggestedActions: 'Create transfer advice for affected SA managers',
                priority: 'High'
              });
            }
            
            break; // Success, no need to try other endpoints
          }
        }
      } catch (endpointError) {
        console.log(`Failed ${endpoint.type} endpoint, trying next...`);
        continue;
      }
    }
    
  } catch (error) {
    console.error('Error fetching FPL Statistics:', error);
    
    // Fallback: Create a manual reminder to check FPL Statistics
    updates.push({
      date: new Date(),
      source: 'FPL Statistics (Manual Check)',
      contentType: 'Manual Task',
      keyTopic: 'Price Change Check Required',
      summary: 'Manual check of FPL Statistics needed - API unavailable',
      playerMentions: 'Various',
      fplRelevance: 'High - Price monitoring essential',
      southAfricanAngle: 'Boet, manually check fplstatistics.co.uk for tonight\'s changes!',
      suggestedActions: 'Visit site manually and create price change content',
      priority: 'Medium'
    });
  }
  
  return updates;
}

/**
 * Enhanced FPL API Integration with more data points
 */
function fetchFPLAPI() {
  const updates = [];
  
  try {
    // Get bootstrap data
    const bootstrapResponse = UrlFetchApp.fetch(CONFIG.FPL_API_BASE + 'bootstrap-static/');
    const bootstrap = JSON.parse(bootstrapResponse.getContentText());
    
    // Current gameweek analysis
    const currentGW = bootstrap.events.find(gw => gw.is_current) || bootstrap.events.find(gw => gw.is_next);
    
    if (currentGW) {
      const deadlineDate = new Date(currentGW.deadline_time);
      const now = new Date();
      const hoursToDeadline = Math.ceil((deadlineDate - now) / (1000 * 60 * 60));
      
      let priority = 'Medium';
      let saAngle = getSATimeContext();
      let suggestedAction = `Create GW${currentGW.id} preview content`;
      
      if (hoursToDeadline <= 24) {
        priority = 'Urgent';
        saAngle += " DEADLINE ALERT! Less than 24 hours to go!";
        suggestedAction = `URGENT: Create last-minute GW${currentGW.id} transfer advice`;
      } else if (hoursToDeadline <= 48) {
        priority = 'High';
        saAngle += " Deadline approaching - time to finalize those transfers!";
        suggestedAction = `Create final GW${currentGW.id} team selection guide`;
      }
      
      updates.push({
        date: new Date(),
        source: 'FPL API',
        contentType: 'Gameweek Data',
        keyTopic: `GW${currentGW.id} - ${currentGW.name} (${hoursToDeadline}h to deadline)`,
        summary: `Gameweek ${currentGW.id}: ${currentGW.deadline_time} | ${hoursToDeadline} hours remaining`,
        playerMentions: 'Various',
        fplRelevance: 'High - Current GW crucial info',
        southAfricanAngle: saAngle,
        suggestedActions: suggestedAction,
        priority: priority
      });
    }
    
    // Top performers analysis
    const topScorers = bootstrap.elements
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, 5);
    
    const topValuePlayers = bootstrap.elements
      .filter(p => p.total_points > 50)
      .sort((a, b) => (b.total_points / b.now_cost) - (a.total_points / a.now_cost))
      .slice(0, 5);
    
    if (topScorers.length > 0) {
      const playerNames = topScorers.map(p => p.web_name).join(', ');
      updates.push({
        date: new Date(),
        source: 'FPL API',
        contentType: 'Player Analysis',
        keyTopic: 'Season Top Performers',
        summary: `Current season leaders: ${playerNames}`,
        playerMentions: playerNames,
        fplRelevance: 'High - Essential players for success',
        southAfricanAngle: 'These legends are carrying FPL teams across SA!',
        suggestedActions: 'Create "Bokkie Burners" top performer analysis',
        priority: 'Medium'
      });
    }
    
    if (topValuePlayers.length > 0) {
      const valueNames = topValuePlayers.map(p => `${p.web_name} (${(p.total_points/p.now_cost*10).toFixed(1)} pts/£m)`).join(', ');
      updates.push({
        date: new Date(),
        source: 'FPL API',
        contentType: 'Value Analysis',
        keyTopic: 'Best Value Players',
        summary: `Top value picks: ${valueNames}`,
        playerMentions: topValuePlayers.map(p => p.web_name).join(', '),
        fplRelevance: 'High - Budget optimization',
        southAfricanAngle: 'Stretch those Rands! Best value players for SA managers!',
        suggestedActions: 'Create budget-friendly team selection guide',
        priority: 'Medium'
      });
    }
    
  } catch (error) {
    console.error('Error fetching FPL API:', error);
  }
  
  return updates;
}

/**
 * New source: Planet FPL
 */
function fetchPlanetFPL() {
  const updates = [];
  
  try {
    const response = UrlFetchApp.fetch(CONFIG.PLANET_FPL_RSS);
    const xmlDoc = XmlService.parse(response.getContentText());
    const root = xmlDoc.getRootElement();
    
    const items = root.getChildren('item');
    
    items.slice(0, 3).forEach(item => {
      const title = item.getChild('title').getText();
      const pubDate = new Date(item.getChild('pubDate').getText());
      const description = item.getChild('description') ? item.getChild('description').getText().replace(/<[^>]*>/g, '') : '';
      
      // Only process recent articles (last 2 days)
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      if (pubDate > twoDaysAgo) {
        updates.push({
          date: pubDate,
          source: 'Planet FPL',
          contentType: 'Analysis Article',
          keyTopic: title.substring(0, 50) + '...',
          summary: `Planet FPL: ${description.substring(0, 100)}...`,
          playerMentions: extractPlayerMentions(title + ' ' + description),
          fplRelevance: 'High - Quality analysis',
          southAfricanAngle: 'Top-quality analysis perfect for serious SA FPL managers',
          suggestedActions: 'Create SA-focused summary of key insights',
          priority: determinePriority(title + ' ' + description)
        });
      }
    });
    
  } catch (error) {
    console.error('Error fetching Planet FPL:', error);
  }
  
  return updates;
}

/**
 * New source: FPL Focal YouTube
 */
function fetchFPLFocal() {
  const updates = [];
  
  try {
    const response = UrlFetchApp.fetch(CONFIG.FPL_FOCAL_RSS);
    const xmlDoc = XmlService.parse(response.getContentText());
    const root = xmlDoc.getRootElement();
    const atomNS = XmlService.getNamespace('http://www.w3.org/2005/Atom');
    
    const entries = root.getChildren('entry', atomNS);
    
    entries.slice(0, 2).forEach(entry => {
      const title = entry.getChild('title', atomNS).getText();
      const published = new Date(entry.getChild('published', atomNS).getText());
      
      // Only process recent videos (last 3 days)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      if (published > threeDaysAgo) {
        updates.push({
          date: published,
          source: 'FPL Focal (YouTube)',
          contentType: 'Video Analysis',
          keyTopic: title.substring(0, 50) + '...',
          summary: `FPL Focal video: ${title}`,
          playerMentions: extractPlayerMentions(title),
          fplRelevance: 'Medium - Community content',
          southAfricanAngle: 'Good supplementary viewing for SA FPL enthusiasts',
          suggestedActions: 'Consider creating written summary for SA audience',
          priority: determinePriority(title)
        });
      }
    });
    
  } catch (error) {
    console.error('Error fetching FPL Focal:', error);
  }
  
  return updates;
}

/**
 * Enhanced helper functions
 */

function determinePriority(text) {
  const lowerText = text.toLowerCase();
  
  for (const [keyword, priority] of Object.entries(SA_CONTEXT.relevanceBoost)) {
    if (lowerText.includes(keyword)) {
      return priority;
    }
  }
  
  // Default priority based on content type
  if (lowerText.includes('urgent') || lowerText.includes('last minute')) return 'Urgent';
  if (lowerText.includes('analysis') || lowerText.includes('guide')) return 'High';
  return 'Medium';
}

function prioritizeUpdates(updates) {
  // Sort by priority: Urgent > High > Medium > Low
  const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
  
  return updates.sort((a, b) => {
    const aPriority = priorityOrder[a.priority] || 1;
    const bPriority = priorityOrder[b.priority] || 1;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher priority first
    }
    
    // If same priority, sort by date (newer first)
    return new Date(b.date) - new Date(a.date);
  });
}

function parseTransferDataFromHTML(htmlContent) {
  // Basic HTML parsing for transfer data (fallback)
  const data = [];
  
  try {
    // Look for common patterns in FPL Statistics HTML
    const playerMatches = htmlContent.match(/class="player-name"[^>]*>([^<]+)</g);
    const transferMatches = htmlContent.match(/data-transfers-in="([^"]+)"/g);
    
    if (playerMatches && transferMatches) {
      for (let i = 0; i < Math.min(playerMatches.length, transferMatches.length, 10); i++) {
        const name = playerMatches[i].replace(/.*>([^<]+)/, '$1');
        const transfers = parseInt(transferMatches[i].replace(/.*="([^"]+)"/, '$1') || 0);
        
        data.push({
          name: name,
          net_transfers_in: transfers,
          chance_of_rise_next_round: transfers > 50000 ? 85 : 0
        });
      }
    }
  } catch (error) {
    console.log('HTML parsing failed, using fallback data structure');
  }
  
  return data;
}

function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
    sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).setValues([CONFIG.HEADERS]);
    
    // Enhanced formatting
    const headerRange = sheet.getRange(1, 1, 1, CONFIG.HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4CAF50');
    headerRange.setFontColor('#FFFFFF');
    
    // Set column widths
    sheet.setColumnWidth(1, 120); // Date
    sheet.setColumnWidth(2, 150); // Source
    sheet.setColumnWidth(3, 120); // Content Type
    sheet.setColumnWidth(4, 200); // Key Topic
    sheet.setColumnWidth(5, 300); // Summary
    sheet.setColumnWidth(6, 150); // Player Mentions
    sheet.setColumnWidth(7, 120); // FPL Relevance
    sheet.setColumnWidth(8, 200); // SA Angle
    sheet.setColumnWidth(9, 200); // Actions
    sheet.setColumnWidth(10, 100); // Priority
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
    update.suggestedActions,
    update.priority || 'Medium'
  ]);
  
  const newRange = sheet.getRange(lastRow + 1, 1, values.length, CONFIG.HEADERS.length);
  newRange.setValues(values);
  
  // Apply conditional formatting for priorities
  applyPriorityFormatting(sheet, lastRow + 1, values.length);
}

function applyPriorityFormatting(sheet, startRow, numRows) {
  const priorityRange = sheet.getRange(startRow, 10, numRows, 1); // Priority column
  
  // Create conditional formatting rules
  const rules = sheet.getConditionalFormatRules();
  
  // Urgent - Red background
  const urgentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Urgent')
    .setBackground('#FF5252')
    .setFontColor('#FFFFFF')
    .setRanges([priorityRange])
    .build();
  
  // High - Orange background
  const highRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('High')
    .setBackground('#FF9800')
    .setFontColor('#FFFFFF')
    .setRanges([priorityRange])
    .build();
  
  // Medium - Yellow background
  const mediumRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Medium')
    .setBackground('#FFC107')
    .setFontColor('#000000')
    .setRanges([priorityRange])
    .build();
  
  rules.push(urgentRule, highRule, mediumRule);
  sheet.setConditionalFormatRules(rules);
}

function extractPlayerMentions(text) {
  // Expanded player name detection
  const commonNames = [
    'Salah', 'Haaland', 'Son', 'Kane', 'Bruno', 'KDB', 'De Bruyne',
    'Alexander-Arnold', 'TAA', 'Robertson', 'Cancelo', 'Walker', 'Trippier',
    'Mitrovic', 'Jesus', 'Wilson', 'Toney', 'Rashford', 'Sterling', 'Darwin',
    'Foden', 'Mahrez', 'Saka', 'Martinelli', 'Bowen', 'Rice', 'Ward-Prowse',
    'Alisson', 'Ederson', 'Pickford', 'Pope', 'Ramsdale',
    'Dias', 'Van Dijk', 'Rudiger', 'White', 'Dunk', 'Botman',
    'Odegaard', 'Mount', 'Maddison', 'Gross', 'Eze', 'Paqueta',
    'Nunez', 'Isak', 'Watkins', 'Solanke', 'Bamford', 'Antonio'
  ];
  
  const mentions = commonNames.filter(name => 
    text.toLowerCase().includes(name.toLowerCase())
  );
  
  return mentions.length > 0 ? mentions.join(', ') : 'None specific';
}

function getSATimeContext() {
  const now = new Date();
  const saTime = new Date(now.toLocaleString("en-US", {timeZone: CONFIG.SA_TIMEZONE}));
  const hour = saTime.getHours();
  const day = saTime.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Weekend context
  if (day === 0 || day === 6) {
    if (CONFIG.BRAAI_HOURS.includes(hour)) {
      return "Weekend braai time! Perfect for FPL discussions! ";
    } else if (hour >= 9 && hour <= 16) {
      return "Weekend afternoon - great time for FPL analysis! ";
    } else if (hour >= 19 && hour <= 22) {
      return "Weekend evening - bokkies are online! ";
    }
  }
  
  // Weekday context
  if (CONFIG.BRAAI_HOURS.includes(hour)) {
    return "Perfect braai time after work! ";
  } else if (hour >= 6 && hour <= 9) {
    return "Good morning bokkies! Coffee and FPL time! ";
  } else if (hour >= 12 && hour <= 14) {
    return "Lunch break FPL check! ";
  } else if (hour >= 21 && hour <= 23) {
    return "Late evening FPL planning session! ";
  } else {
    return "Howzit boet! ";
  }
}

function logSourceError(sheet, sourceName, error) {
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, 1, CONFIG.HEADERS.length).setValues([[
    new Date(),
    `${sourceName} (Error)`,
    'Error Log',
    'Source Fetch Failed',
    `${sourceName} temporarily unavailable: ${error.toString().substring(0, 100)}`,
    'N/A',
    'System',
    'Technical issue - source needs attention',
    `Check ${sourceName} availability and fix endpoint`,
    'Low'
  ]]);
}

function logError(sheet, error) {
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, 1, CONFIG.HEADERS.length).setValues([[
    new Date(),
    'System Error',
    'Critical Error',
    'Radar System Failure',
    error.toString(),
    'N/A',
    'System',
    'Critical system issue needs immediate attention',
    'Debug and fix radar system immediately',
    'Urgent'
  ]]);
}

function sendUpdateSummary(updateCount, duration, updates) {
  const urgentCount = updates.filter(u => u.priority === 'Urgent').length;
  const highCount = updates.filter(u => u.priority === 'High').length;
  
  console.log(`📊 BoetBall Radar Summary:`);
  console.log(`   Total updates: ${updateCount}`);
  console.log(`   Duration: ${duration} seconds`);
  console.log(`   Urgent items: ${urgentCount}`);
  console.log(`   High priority: ${highCount}`);
  
  if (urgentCount > 0) {
    console.log(`🚨 URGENT ITEMS DETECTED - Review immediately!`);
  }
}

// Test functions for individual sources
function testImprovedFPLStats() {
  console.log('Testing improved FPL Statistics...');
  const updates = fetchFPLStatisticsImproved();
  console.log(`Found ${updates.length} FPL Statistics updates:`, updates);
}

function testAllSources() {
  console.log('Testing all sources...');
  
  const sources = [
    { name: 'FPL API', func: fetchFPLAPI },
    { name: 'Planet FPL', func: fetchPlanetFPL },
    { name: 'FPL Focal', func: fetchFPLFocal },
    { name: 'FPL Statistics', func: fetchFPLStatisticsImproved }
  ];
  
  sources.forEach(source => {
    try {
      console.log(`\n--- Testing ${source.name} ---`);
      const updates = source.func();
      console.log(`✅ ${source.name}: ${updates.length} updates`);
      if (updates.length > 0) {
        console.log('Sample:', updates[0]);
      }
    } catch (error) {
      console.error(`❌ ${source.name} failed:`, error);
    }
  });
}

/**
 * Enhanced setup function
 */
function setupBoetBallRadarImproved() {
  console.log('🏉 Setting up Enhanced BoetBall Radar System...');
  
  const sheet = getOrCreateSheet();
  
  // Add initial example data with new structure
  const exampleData = [
    [
      new Date(),
      'System Setup',
      'Initialization',
      'Enhanced BoetBall Radar Active',
      'Advanced content tracking system initialized with 8 data sources and priority system',
      'System',
      'High - System operational',
      'Eish! This system is going to make SA FPL content creation lekker easy!',
      'Start creating prioritized SA FPL content based on radar intel',
      'High'
    ]
  ];
  
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, CONFIG.HEADERS.length).setValues(exampleData);
  
  console.log('✅ Enhanced BoetBall Radar System setup complete!');
  console.log('📋 Features included:');
  console.log('   - 8 content sources');
  console.log('   - Priority system (Urgent/High/Medium/Low)');
  console.log('   - Enhanced SA context');
  console.log('   - Improved error handling');
  console.log('   - Rate limiting protection');
}
