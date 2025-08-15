# FPL Advanced Analytics Engine - Usage Guide 🚀

## 🎯 **What This Engine Provides**

This analytics engine extracts **maximum value** from the official FPL API to provide insights unavailable elsewhere:

### **🔬 Advanced Metrics:**
- **xG/xA Efficiency Analysis** - Who's overperforming or due regression?
- **Bonus Point Prediction** - BPS-based probability modeling
- **Multi-dimensional Form** - Beyond simple 4-game averages
- **Ownership Value Analysis** - Find differentials vs template players
- **Price Change Prediction** - Transfer momentum modeling
- **Position-specific Analytics** - Tailored metrics for GK, DEF, MID, FWD
- **Advanced Fixture Analysis** - Team strength vs opponent analysis

### **🏆 Smart Recommendations:**
- **Differential Picks** - Low ownership, high performance
- **Value Plays** - Best points per million
- **Hot Form Players** - Momentum indicators
- **Bonus Magnets** - High BPS players
- **Fixture Stars** - Easy upcoming schedules

---

## 📋 **Quick Start**

### **1. Run the Analytics Engine**

```bash
# Make the script executable
chmod +x fpl-advanced-analytics.js

# Generate full analytics report
./fpl-advanced-analytics.js

# Get top recommendations only
./fpl-advanced-analytics.js --recommendations

# Analyze specific player (e.g., player ID 302 = Salah)
./fpl-advanced-analytics.js --player 302
```

### **2. Output Files Generated**
```
fpl-analytics-output/
├── fpl-advanced-analytics.json    # Complete detailed analysis
├── fpl-player-analytics.csv       # Spreadsheet format
└── fpl-recommendations.json       # Top picks by category
```

---

## 🎮 **Integration Examples**

### **1. Web App Integration**

```javascript
// In your React/Next.js app
import FPLAdvancedAnalytics from './fpl-advanced-analytics.js';

export async function getStaticProps() {
  const analytics = new FPLAdvancedAnalytics();
  await analytics.initialize();
  
  // Get recommendations for homepage
  const recommendations = analytics.generateRecommendations();
  
  return {
    props: { recommendations },
    revalidate: 3600 // Update hourly
  };
}

function HomePage({ recommendations }) {
  return (
    <div>
      <h2>🔥 Hot Picks This Week</h2>
      {recommendations.hotForm.slice(0, 3).map(player => (
        <div key={player.id}>
          <h3>{player.name} ({player.position})</h3>
          <p>{player.reason}</p>
        </div>
      ))}
      
      <h2>💎 Hidden Gems (Differentials)</h2>
      {recommendations.differentials.slice(0, 5).map(player => (
        <div key={player.id}>
          <h3>{player.name} - £{player.price}m</h3>
          <p>{player.reason}</p>
        </div>
      ))}
    </div>
  );
}
```

### **2. Enhanced Player Analysis**

```javascript
// Add to your player comparison component
export async function enhancePlayerData(players) {
  const analytics = new FPLAdvancedAnalytics();
  await analytics.initialize();
  
  return players.map(player => {
    const analysis = analytics.analyzePlayer(player.id);
    return {
      ...player,
      advanced: analysis?.advanced,
      positionSpecific: analysis?.positionSpecific,
      
      // Quick indicators
      isDifferential: analysis?.advanced.ownershipAnalysis.category === 'underowned',
      isHotForm: analysis?.advanced.formAnalysis.formTrend === 'hot',
      priceRisk: analysis?.advanced.priceChange.riskLevel,
      
      // Enhanced ratings
      finishingEfficiency: analysis?.advanced.finishingEfficiency.combinedEfficiency,
      bonusChance: analysis?.advanced.bonusPotential.probability.anyBonus,
      fixtureRating: analysis?.advanced.fixtures?.avgRating
    };
  });
}

// Usage in component
function PlayerCard({ player }) {
  return (
    <div className={`player-card ${player.isHotForm ? 'hot-form' : ''}`}>
      <h3>{player.name}</h3>
      <div className="advanced-stats">
        {player.isDifferential && <span className="badge">🎯 Differential</span>}
        {player.isHotForm && <span className="badge">🔥 Hot Form</span>}
        
        <p>Finishing Efficiency: {player.finishingEfficiency}%</p>
        <p>Bonus Chance: {player.bonusChance}%</p>
        <p>Fixture Rating: {player.fixtureRating}/100</p>
        
        {player.priceRisk === 'high' && (
          <div className="alert">⚠️ Price change likely!</div>
        )}
      </div>
    </div>
  );
}
```

### **3. Transfer Suggestions API**

```javascript
// API route: /api/transfer-suggestions
import FPLAdvancedAnalytics from '../../lib/fpl-advanced-analytics.js';

export default async function handler(req, res) {
  const analytics = new FPLAdvancedAnalytics();
  await analytics.initialize();
  
  const { budget = 100, position, maxOwnership = 15 } = req.query;
  
  // Get players within budget and ownership constraints
  const players = analytics.data.bootstrap.elements.filter(player => {
    const price = player.now_cost / 10;
    const ownership = parseFloat(player.selected_by_percent || '0');
    const playerPosition = analytics.data.bootstrap.element_types
      .find(pos => pos.id === player.element_type)?.singular_name_short;
    
    return price <= budget && 
           ownership <= maxOwnership &&
           (!position || playerPosition === position);
  });
  
  // Analyze and rank players
  const analyzed = players.map(player => analytics.analyzePlayer(player.id))
    .filter(analysis => analysis !== null)
    .sort((a, b) => {
      // Custom ranking algorithm combining form, value, fixtures
      const scoreA = (a.performance.form * 0.4) + 
                    (a.performance.pointsPerGame * 0.3) +
                    ((a.advanced.fixtures?.avgRating || 100) * 0.3 / 100);
      const scoreB = (b.performance.form * 0.4) + 
                    (b.performance.pointsPerGame * 0.3) +
                    ((b.advanced.fixtures?.avgRating || 100) * 0.3 / 100);
      return scoreB - scoreA;
    })
    .slice(0, 10);
  
  res.json({
    suggestions: analyzed,
    criteria: { budget, position, maxOwnership },
    generated: new Date().toISOString()
  });
}
```

---

## 📊 **Advanced Use Cases**

### **1. Captain Choice Algorithm**

```javascript
function selectCaptain(teamPlayers, analytics) {
  return teamPlayers.map(player => {
    const analysis = analytics.analyzePlayer(player.id);
    if (!analysis) return null;
    
    // Captain scoring algorithm
    const captainScore = 
      analysis.performance.form * 0.3 +
      analysis.performance.pointsPerGame * 0.25 +
      (analysis.advanced.fixtures?.avgRating || 100) * 0.2 / 100 +
      analysis.advanced.bonusPotential.probability.anyBonus * 0.15 +
      (analysis.advanced.finishingEfficiency.combinedEfficiency || 100) * 0.1 / 100;
    
    return {
      ...player,
      captainScore: Math.round(captainScore * 100) / 100,
      reasoning: [
        `Form: ${analysis.performance.form}/10`,
        `PPG: ${analysis.performance.pointsPerGame}`,
        `Fixture: ${analysis.advanced.fixtures?.avgRating || 'N/A'}/100`,
        `Bonus: ${analysis.advanced.bonusPotential.probability.anyBonus}%`
      ]
    };
  })
  .filter(p => p !== null)
  .sort((a, b) => b.captainScore - a.captainScore);
}
```

### **2. Wildcard Team Builder**

```javascript
async function buildWildcardTeam(budget = 100) {
  const analytics = new FPLAdvancedAnalytics();
  await analytics.initialize();
  
  const recommendations = analytics.generateRecommendations();
  
  // Smart team building algorithm
  const team = {
    goalkeepers: [],
    defenders: [],
    midfielders: [],
    forwards: []
  };
  
  // Get best value players by position
  const gkps = getTopPlayersByPosition(analytics, 'GKP', 2, budget * 0.1);
  const defs = getTopPlayersByPosition(analytics, 'DEF', 5, budget * 0.35);
  const mids = getTopPlayersByPosition(analytics, 'MID', 5, budget * 0.4);
  const fwds = getTopPlayersByPosition(analytics, 'FWD', 3, budget * 0.25);
  
  return {
    team: { gkps, defs, mids, fwds },
    totalCost: calculateTotalCost(gkps, defs, mids, fwds),
    expectedPoints: calculateExpectedPoints(gkps, defs, mids, fwds),
    differentialCount: countDifferentials([...gkps, ...defs, ...mids, ...fwds]),
    riskLevel: assessRiskLevel([...gkps, ...defs, ...mids, ...fwds])
  };
}
```

### **3. League Analysis Dashboard**

```javascript
async function analyzeLeague(leagueId) {
  const analytics = new FPLAdvancedAnalytics();
  await analytics.initialize();
  
  // Fetch league data (implementation depends on your data source)
  const leagueData = await fetchLeagueData(leagueId);
  
  const insights = {
    mostPopularPicks: findMostPopularPicks(leagueData),
    hiddenGems: findUnderusedPlayers(leagueData, analytics),
    riskiestPicks: findRiskiestPicks(leagueData, analytics),
    formPlayers: findBestFormInLeague(leagueData, analytics),
    
    differentialOpportunities: analytics.generateRecommendations().differentials
      .filter(player => !isPopularInLeague(player, leagueData))
      .slice(0, 5)
  };
  
  return insights;
}
```

---

## 🔧 **Customization Options**

### **1. Custom Scoring Algorithms**

```javascript
// Override the default recommendation scoring
class CustomFPLAnalytics extends FPLAdvancedAnalytics {
  generateRecommendations() {
    const recommendations = super.generateRecommendations();
    
    // Add custom categories
    recommendations.captainPicks = this.data.bootstrap.elements
      .map(player => this.analyzePlayer(player.id))
      .filter(analysis => analysis?.performance.form > 6)
      .sort((a, b) => this.calculateCaptainScore(b) - this.calculateCaptainScore(a))
      .slice(0, 10);
    
    return recommendations;
  }
  
  calculateCaptainScore(analysis) {
    // Your custom captain scoring logic
    return analysis.performance.form * 
           analysis.advanced.bonusPotential.probability.anyBonus * 
           (analysis.advanced.fixtures?.avgRating || 100) / 1000;
  }
}
```

### **2. Position-Specific Enhancements**

```javascript
// Add midfielder-specific analysis
analyzeMiddlefielder(player) {
  const assists = player.assists || 0;
  const goals = player.goals_scored || 0;
  const xA = parseFloat(player.expected_assists || '0');
  const creativity = parseFloat(player.creativity || '0');
  
  return {
    playmakerRating: (assists * 3 + xA * 2 + creativity * 0.1) / 3,
    goalThreat: goals > 3 && player.element_type === 3, // Midfielders with goals
    setPlaceRole: player.corners_and_indirect_freekicks_order || 0,
    
    type: assists >= goals * 2 ? 'Playmaker' :
          goals >= 5 ? 'Goal threat' :
          creativity >= 50 ? 'Creative' : 'Box-to-box',
          
    recommendation: this.getMidfielderRecommendation(player, assists, goals, creativity)
  };
}
```

---

## 🚀 **Performance & Scaling**

### **Caching Strategy**
```javascript
// Add Redis caching for production
const redis = require('redis');
const client = redis.createClient();

class CachedFPLAnalytics extends FPLAdvancedAnalytics {
  async fetchJson(url) {
    const cacheKey = `fpl:${url}`;
    const cached = await client.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const data = await super.fetchJson(url);
    await client.setex(cacheKey, 3600, JSON.stringify(data)); // 1 hour cache
    
    return data;
  }
}
```

### **Batch Processing**
```javascript
// For processing large datasets
async function batchAnalyzeTeams(teamIds, batchSize = 50) {
  const analytics = new FPLAdvancedAnalytics();
  await analytics.initialize();
  
  const results = [];
  
  for (let i = 0; i < teamIds.length; i += batchSize) {
    const batch = teamIds.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(teamId => analytics.analyzeTeam(teamId))
    );
    results.push(...batchResults);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}
```

---

## 📈 **Example Outputs**

### **Player Analysis Sample:**
```json
{
  "player": {
    "name": "Mohamed Salah",
    "position": "MID",
    "team": "LIV",
    "price": 13.0,
    "ownership": 42.3
  },
  "advanced": {
    "finishingEfficiency": {
      "goalEfficiency": 115,
      "verdict": "Slightly overperforming"
    },
    "bonusPotential": {
      "probability": { "anyBonus": 65 },
      "category": "Bonus threat"
    },
    "formAnalysis": {
      "formTrend": "hot",
      "recommendation": "Buy"
    },
    "ownershipAnalysis": {
      "category": "template player",
      "templateRisk": "high"
    }
  }
}
```

### **Recommendations Sample:**
```json
{
  "differentials": [
    {
      "name": "Diogo Jota",
      "position": "FWD", 
      "price": 7.5,
      "ownership": 8.2,
      "reason": "6.8 form, 5.2 PPG, only 8.2% owned"
    }
  ]
}
```

---

This engine provides **professional-level FPL analytics** using only free, official data. Perfect for building comprehensive FPL tools, apps, and gaining competitive advantages! 🏆
