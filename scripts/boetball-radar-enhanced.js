/**
 * Enhanced BoetBall Radar with Source Links and Content Generation
 * Adds direct links to original sources and content generation capabilities
 */

// Enhanced radar data structure with source links
function updateBoetBallRadarWithLinks() {
  const sheet = getOrCreateSheet();
  const today = new Date();
  
  console.log('Starting BoetBall Radar update with source links...');
  
  // Clear existing data (keep headers)
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
  
  const allInsights = [];
  
  // Fetch from all sources with direct links
  try {
    allInsights.push(...fetchFPLOfficialWithLinks());
    allInsights.push(...fetchRedditFPLWithLinks());
    allInsights.push(...fetchFantasyFootballScoutWithLinks());
    allInsights.push(...fetchFPLHarryWithLinks());
    allInsights.push(...fetchFPLStatisticsWithLinks());
    allInsights.push(...fetchPriceChangeWithLinks());
    allInsights.push(...fetchInjuryNewsWithLinks());
    allInsights.push(...fetchFixtureDataWithLinks());
  } catch (error) {
    console.error('Error fetching radar data:', error);
  }
  
  // Sort by priority and recency
  allInsights.sort((a, b) => {
    if (a.priority !== b.priority) {
      const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  // Add to sheet with enhanced structure
  allInsights.forEach((insight, index) => {
    const row = index + 2;
    sheet.getRange(row, 1).setValue(insight.title);
    sheet.getRange(row, 2).setValue(insight.priority);
    sheet.getRange(row, 3).setValue(insight.source);
    sheet.getRange(row, 4).setValue(insight.sourceUrl || 'N/A'); // Direct link
    sheet.getRange(row, 5).setValue(insight.insights);
    sheet.getRange(row, 6).setValue(insight.category);
    sheet.getRange(row, 7).setValue(insight.tags);
    sheet.getRange(row, 8).setValue(insight.saContext);
    sheet.getRange(row, 9).setValue(insight.timestamp);
    sheet.getRange(row, 10).setValue('Ready'); // Content status
    sheet.getRange(row, 11).setValue(''); // Generated content (will be filled)
  });
  
  // Apply formatting
  formatRadarSheet(sheet);
  
  console.log(`Added ${allInsights.length} insights to radar with source links`);
}

// Enhanced fetching functions that include direct links

function fetchFPLOfficialWithLinks() {
  try {
    const response = UrlFetchApp.fetch('https://fantasy.premierleague.com/api/fixtures/');
    const fixtures = JSON.parse(response.getContentText());
    
    const upcomingFixtures = fixtures
      .filter(f => !f.finished && f.kickoff_time)
      .slice(0, 5);
    
    return upcomingFixtures.map(fixture => ({
      title: `GW${fixture.event} Fixture Analysis`,
      priority: 'MEDIUM',
      source: 'FPL Official API',
      sourceUrl: 'https://fantasy.premierleague.com/fixtures',
      insights: `Upcoming fixture analysis for teams and difficulty ratings`,
      category: 'Fixtures',
      tags: 'fixtures, gameweek, analysis',
      saContext: 'Perfect for mini-league planning discussions',
      timestamp: new Date(),
      contentIdeas: [
        'Captain picks based on fixtures',
        'Differential opportunities',
        'Fixture difficulty analysis'
      ]
    }));
  } catch (error) {
    console.error('Error fetching FPL Official:', error);
    return [];
  }
}

function fetchRedditFPLWithLinks() {
  try {
    const response = UrlFetchApp.fetch('https://www.reddit.com/r/FantasyPL/hot.json?limit=20');
    const data = JSON.parse(response.getContentText());
    
    return data.data.children.slice(0, 5).map(post => {
      const postData = post.data;
      return {
        title: postData.title.substring(0, 100),
        priority: postData.score > 100 ? 'HIGH' : 'MEDIUM',
        source: 'r/FantasyPL',
        sourceUrl: `https://www.reddit.com${postData.permalink}`, // Direct Reddit link
        insights: postData.selftext ? postData.selftext.substring(0, 200) : 'Community discussion topic',
        category: 'Community',
        tags: 'reddit, community, discussion',
        saContext: 'Great for understanding global FPL sentiment vs SA perspective',
        timestamp: new Date(postData.created_utc * 1000),
        upvotes: postData.score,
        contentIdeas: [
          'SA take on popular Reddit opinions',
          'Contrarian analysis',
          'Community sentiment review'
        ]
      };
    });
  } catch (error) {
    console.error('Error fetching Reddit:', error);
    return [];
  }
}

function fetchFantasyFootballScoutWithLinks() {
  try {
    // RSS feed parsing for direct article links
    const response = UrlFetchApp.fetch('https://www.fantasyfootballscout.co.uk/feed/');
    const xml = XmlService.parse(response.getContentText());
    const root = xml.getRootElement();
    const namespace = XmlService.getNamespace('http://purl.org/rss/1.0/modules/content/');
    
    const items = root.getChild('channel').getChildren('item').slice(0, 3);
    
    return items.map(item => {
      const title = item.getChild('title').getText();
      const link = item.getChild('link').getText();
      const description = item.getChild('description').getText();
      
      return {
        title: title.substring(0, 100),
        priority: 'HIGH',
        source: 'Fantasy Football Scout',
        sourceUrl: link, // Direct article link
        insights: description.substring(0, 200),
        category: 'Analysis',
        tags: 'scout, analysis, premium',
        saContext: 'Professional analysis with SA braai chat potential',
        timestamp: new Date(),
        contentIdeas: [
          'SA perspective on scout analysis',
          'Value picks for SA managers',
          'Premium vs free insights comparison'
        ]
      };
    });
  } catch (error) {
    console.error('Error fetching Fantasy Football Scout:', error);
    return [];
  }
}

function fetchFPLHarryWithLinks() {
  try {
    // YouTube API would need API key, so we'll simulate with channel link
    return [{
      title: 'FPL Harry Latest Video Analysis',
      priority: 'HIGH',
      source: 'FPL Harry YouTube',
      sourceUrl: 'https://www.youtube.com/@FPLHarry/videos', // Channel videos page
      insights: 'Latest FPL insights and analysis from FPL Harry',
      category: 'Video Content',
      tags: 'youtube, harry, analysis',
      saContext: 'Popular YouTuber analysis with SA commentary potential',
      timestamp: new Date(),
      contentIdeas: [
        'SA reaction to FPL Harry picks',
        'Video summary with local insights',
        'Comparison with SA FPL strategies'
      ]
    }];
  } catch (error) {
    console.error('Error fetching FPL Harry:', error);
    return [];
  }
}

function fetchPriceChangeWithLinks() {
  try {
    // Using FPL price tracker
    return [{
      title: 'Daily Price Change Tracking',
      priority: 'HIGH',
      source: 'Price Change Tracker',
      sourceUrl: 'http://www.fplstatistics.co.uk/', // Price tracking site
      insights: 'Monitor players close to price changes for transfer timing',
      category: 'Price Changes',
      tags: 'prices, transfers, timing',
      saContext: 'Critical for SA mini-league value management',
      timestamp: new Date(),
      contentIdeas: [
        'Price change alerts with SA impact',
        'Value management strategies',
        'Template implications for SA leagues'
      ]
    }];
  } catch (error) {
    console.error('Error fetching price changes:', error);
    return [];
  }
}

function fetchFPLStatisticsWithLinks() {
  try {
    return [{
      title: 'FPL Statistics Analysis',
      priority: 'MEDIUM',
      source: 'FPL Statistics',
      sourceUrl: 'http://www.fplstatistics.co.uk/',
      insights: 'Statistical analysis and player form data',
      category: 'Analysis',
      tags: 'statistics, data, analysis',
      saContext: 'Data-driven insights for SA managers who love numbers',
      timestamp: new Date()
    }];
  } catch (error) {
    console.error('Error fetching FPL Statistics:', error);
    return [];
  }
}

function fetchInjuryNewsWithLinks() {
  try {
    return [{
      title: 'Premier League Injury Updates',
      priority: 'HIGH',
      source: 'Injury News',
      sourceUrl: 'https://www.premierinjuries.com/',
      insights: 'Latest injury updates and fitness news affecting FPL assets',
      category: 'Injuries',
      tags: 'injuries, fitness, team news',
      saContext: 'Critical injury updates for SA FPL managers',
      timestamp: new Date()
    }];
  } catch (error) {
    console.error('Error fetching injury news:', error);
    return [];
  }
}

function fetchFixtureDataWithLinks() {
  try {
    const response = UrlFetchApp.fetch('https://fantasy.premierleague.com/api/fixtures/');
    const fixtures = JSON.parse(response.getContentText());
    
    // Get next 3 gameweeks of fixtures
    const upcomingFixtures = fixtures
      .filter(f => !f.finished)
      .slice(0, 10);
    
    if (upcomingFixtures.length > 0) {
      return [{
        title: 'Upcoming Fixture Difficulty Analysis',
        priority: 'MEDIUM',
        source: 'FPL Fixture Data',
        sourceUrl: 'https://fantasy.premierleague.com/fixtures',
        insights: `Analysis of upcoming fixtures and difficulty ratings for transfer planning`,
        category: 'Fixtures',
        tags: 'fixtures, difficulty, planning',
        saContext: 'Perfect for SA mini-league fixture planning strategies',
        timestamp: new Date()
      }];
    }
    return [];
  } catch (error) {
    console.error('Error fetching fixture data:', error);
    return [];
  }
}

function formatRadarSheet(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  if (lastRow < 2) return; // No data to format
  
  // Alternate row colors
  for (let row = 2; row <= lastRow; row++) {
    const range = sheet.getRange(row, 1, 1, lastCol);
    if (row % 2 === 0) {
      range.setBackground('#f8f9fa');
    } else {
      range.setBackground('#ffffff');
    }
  }
  
  // Format priority column with colors
  for (let row = 2; row <= lastRow; row++) {
    const priorityCell = sheet.getRange(row, 2);
    const priority = priorityCell.getValue();
    
    switch (priority) {
      case 'HIGH':
        priorityCell.setBackground('#ffebee').setFontColor('#c62828');
        break;
      case 'MEDIUM':
        priorityCell.setBackground('#fff3e0').setFontColor('#ef6c00');
        break;
      case 'LOW':
        priorityCell.setBackground('#e8f5e8').setFontColor('#2e7d32');
        break;
    }
  }
  
  // Make source URLs clickable
  const sourceUrlRange = sheet.getRange(2, 4, lastRow - 1, 1);
  sourceUrlRange.setFontColor('#1155cc').setFontStyle('italic');
  
  // Set borders
  sheet.getRange(1, 1, lastRow, lastCol).setBorder(true, true, true, true, false, false);
}

// Content generation integration
function generateContentFromRadarRow(rowNumber) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getRange(rowNumber, 1, 1, 11).getValues()[0];
  
  const radarEntry = {
    title: row[0],
    priority: row[1],
    source: row[2],
    sourceUrl: row[3],
    insights: row[4],
    category: row[5],
    tags: row[6],
    saContext: row[7],
    timestamp: row[8]
  };
  
  // Generate article structure
  const article = generateArticleStructure(radarEntry);
  
  // Update the sheet with generated content outline
  sheet.getRange(rowNumber, 10).setValue('Generated');
  sheet.getRange(rowNumber, 11).setValue(JSON.stringify(article, null, 2));
  
  // Create a separate detailed content sheet
  createContentSheet(article, radarEntry);
  
  return article;
}

function generateArticleStructure(radarEntry) {
  const templates = {
    'Fixtures': 'FIXTURE_ANALYSIS',
    'Community': 'TRANSFER_TRENDS', 
    'Analysis': 'PLAYER_INJURY',
    'Video Content': 'TRANSFER_TRENDS',
    'Price Changes': 'PRICE_CHANGE'
  };
  
  const template = templates[radarEntry.category] || 'TRANSFER_TRENDS';
  
  return {
    title: generateSATitle(radarEntry),
    excerpt: generateSAExcerpt(radarEntry),
    structure: getContentStructure(template),
    sourceUrl: radarEntry.sourceUrl,
    saContext: radarEntry.saContext,
    tags: radarEntry.tags + ', South Africa, FPL',
    priority: radarEntry.priority,
    readyForExpansion: true
  };
}

function generateSATitle(entry) {
  const saHeaders = [
    'The Boet\'s Guide to',
    'Sharp Analysis:',
    'FPL Boets, Listen Up:',
    'From the Braai to FPL:'
  ];
  
  const randomHeader = saHeaders[Math.floor(Math.random() * saHeaders.length)];
  return `${randomHeader} ${entry.title}`;
}

function generateSAExcerpt(entry) {
  const saOpeners = [
    'Howzit FPL boets!',
    'Sharp sharp,',
    'Right, gather \'round the braai,',
    'Eish, what a week!'
  ];
  
  const opener = saOpeners[Math.floor(Math.random() * saOpeners.length)];
  return `${opener} ${entry.insights.substring(0, 150)}...`;
}

// Create detailed content sheet for article expansion
function createContentSheet(article, radarEntry) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = `Content_${Date.now()}`;
  const contentSheet = ss.insertSheet(sheetName);
  
  // Header
  contentSheet.getRange('A1').setValue('BOETBALL ARTICLE CONTENT GENERATOR');
  contentSheet.getRange('A1').setFontSize(16).setFontWeight('bold');
  
  // Article details
  const details = [
    ['Title:', article.title],
    ['Source URL:', radarEntry.sourceUrl],
    ['Priority:', radarEntry.priority],
    ['SA Context:', radarEntry.saContext],
    ['Tags:', article.tags],
    [''],
    ['CONTENT STRUCTURE:'],
    [''],
    ['Introduction:', article.excerpt],
    [''],
    ['Article Sections:']
  ];
  
  details.forEach((detail, index) => {
    if (detail[0]) contentSheet.getRange(index + 3, 1).setValue(detail[0]);
    if (detail[1]) contentSheet.getRange(index + 3, 2).setValue(detail[1]);
  });
  
  // Add structure sections
  let currentRow = details.length + 5;
  article.structure.forEach((section, index) => {
    contentSheet.getRange(currentRow, 1).setValue(`${index + 1}. ${section}`);
    contentSheet.getRange(currentRow + 1, 2).setValue('[EXPAND WITH SA INSIGHTS]');
    contentSheet.getRange(currentRow + 2, 2).setValue('[ADD SOURCE REFERENCES]');
    currentRow += 4;
  });
  
  // Add source link reference
  contentSheet.getRange(currentRow, 1).setValue('Source Reference:');
  contentSheet.getRange(currentRow, 2).setValue(radarEntry.sourceUrl);
  contentSheet.getRange(currentRow, 2).setFontColor('#0000FF').setFontStyle('italic');
  
  console.log(`Created content sheet: ${sheetName}`);
}

// Setup function with enhanced headers
function setupBoetBallRadarEnhanced() {
  const sheet = getOrCreateSheet();
  
  // Enhanced headers with source links
  const headers = [
    'Title', 'Priority', 'Source', 'Source URL', 'Insights', 
    'Category', 'Tags', 'SA Context', 'Timestamp', 'Content Status', 'Generated Content'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#2E8B57')
    .setFontColor('white');
  
  // Set column widths
  sheet.setColumnWidth(1, 200); // Title
  sheet.setColumnWidth(2, 80);  // Priority
  sheet.setColumnWidth(3, 150); // Source
  sheet.setColumnWidth(4, 200); // Source URL
  sheet.setColumnWidth(5, 300); // Insights
  sheet.setColumnWidth(6, 100); // Category
  sheet.setColumnWidth(7, 150); // Tags
  sheet.setColumnWidth(8, 200); // SA Context
  sheet.setColumnWidth(9, 120); // Timestamp
  sheet.setColumnWidth(10, 100); // Status
  sheet.setColumnWidth(11, 250); // Generated Content
  
  console.log('Enhanced BoetBall Radar sheet setup complete with source links!');
}

// Menu creation for easy access
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('BoetBall Radar')
    .addItem('Setup Enhanced Radar', 'setupBoetBallRadarEnhanced')
    .addItem('Update Radar with Links', 'updateBoetBallRadarWithLinks')
    .addSeparator()
    .addItem('Generate Content (Current Row)', 'generateContentFromCurrentRow')
    .addItem('Generate All Content', 'generateAllContent')
    .addToUi();
}

function generateContentFromCurrentRow() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const currentRow = sheet.getActiveRange().getRow();
  
  if (currentRow < 2) {
    SpreadsheetApp.getUi().alert('Please select a data row (not header)');
    return;
  }
  
  generateContentFromRadarRow(currentRow);
  SpreadsheetApp.getUi().alert(`Content generated for row ${currentRow}! Check the new content sheet.`);
}

function generateAllContent() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data found to generate content from');
    return;
  }
  
  for (let row = 2; row <= lastRow; row++) {
    generateContentFromRadarRow(row);
    Utilities.sleep(1000); // Prevent overwhelming
  }
  
  SpreadsheetApp.getUi().alert(`Generated content for ${lastRow - 1} articles! Check the new content sheets.`);
}

// Utility functions
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('BoetBall Radar');
  
  if (!sheet) {
    sheet = ss.insertSheet('BoetBall Radar');
  }
  
  return sheet;
}

function getContentStructure(template) {
  const structures = {
    'FIXTURE_ANALYSIS': [
      'Fixture Overview',
      'Captain Candidates', 
      'Differential Options',
      'Players to Avoid',
      'SA Mini League Impact'
    ],
    'TRANSFER_TRENDS': [
      'Trend Overview',
      'Popular Transfers In',
      'Popular Transfers Out', 
      'Contrarian Picks',
      'SA Community Perspective'
    ],
    'PLAYER_INJURY': [
      'Injury Situation',
      'FPL Impact Analysis',
      'Transfer Recommendations',
      'Differential Opportunities',
      'SA League Implications'
    ],
    'PRICE_CHANGE': [
      'Price Movement Summary',
      'Value Pick Analysis',
      'Transfer Timing Strategy',
      'Template Implications',
      'SA Value Management'
    ]
  };
  
  return structures[template] || structures['TRANSFER_TRENDS'];
}
