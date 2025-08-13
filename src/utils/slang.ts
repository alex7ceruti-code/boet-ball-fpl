// South African slang and localized text mappings
export const slang = {
  // General expressions
  greeting: {
    casual: ["Howzit", "Sawubona", "Sharp", "Heyyy", "Hoe gaan dit?", "What's the story?"],
    excited: ["Eish!", "Lekker!", "Jirre!", "Boet!", "Ag man!", "Sho!", "Too much!"],
    farewell: ["Cheers boet", "Sharp sharp", "Catch you later", "Stay lekker", "Go well"],
  },
  
  // Loading states
  loading: {
    general: ["Hold on boet...", "Loading the lekker data...", "Just now hey..."],
    fixtures: ["Checking the fixtures, sharp sharp...", "Getting the match info..."],
    players: ["Finding the ballers...", "Scouting the talent..."],
    stats: ["Crunching the numbers, china...", "Working out the stats..."],
  },
  
  // Success states  
  success: {
    general: ["Lekker!", "Sharp!", "Sorted!", "Too much!"],
    dataLoaded: ["Data loaded, boet!", "All sorted now!", "Looking sharp!"],
  },
  
  // Error states
  error: {
    general: ["Eish, something's not lekker...", "Ag man, that's not working...", "Sho, we've got a problem..."],
    network: ["Check your connection, bru", "The network is being skelmpie", "Internet playing up hey"],
    dataNotFound: ["Nothing here, my china", "Sho, no data found", "Empty as a braai without boerewors"],
  },
  
  // Empty states
  empty: {
    general: ["Nothing here, boet", "Empty like a dry biltong packet", "Ag, no luck here"],
    noPlayers: ["No players found, china", "The team sheet is empty"],
    noFixtures: ["No matches to show", "Quiet as a Sunday braai"],
    noStats: ["No stats available, bru", "Numbers are playing hide and seek"],
  },
  
  // Action buttons
  actions: {
    view: ["Check it out", "Have a look", "Peep this"],
    compare: ["Stack them up", "See who's boss", "Compare the okes"],
    select: ["Pick this one", "Choose your boet", "This one's lekker"],
    refresh: ["Fresh up the data", "Get the latest", "Update the goods"],
  },
  
  // Player descriptions
  players: {
    hot: ["On fire!", "Cooking with gas!", "Red hot, china!", "Absolute weapon!"],
    cold: ["Ice cold", "Needs to wake up", "Having a mare", "Off the pace"],
    differential: ["Under the radar", "Secret weapon", "Hidden gem", "Sleeper pick"],
    expensive: ["Premium player", "Big money move", "Top shelf", "Worth every penny"],
    bargain: ["Absolute steal!", "Budget beauty", "Cheap as chips", "Value for days"],
    risky: ["Roll the dice", "Bit of a gamble", "High risk, high reward", "Could go either way"],
  },
  
  // Team performance
  teams: {
    goodForm: ["Flying high", "On a roll", "Looking sharp", "Red hot form"],
    badForm: ["Struggling", "In the doldrums", "Having a shocker", "Need to get it together"],
    inconsistent: ["Up and down", "Can't make up their minds", "Hit and miss", "Unpredictable"],
  },
  
  // Fixture difficulty
  fixtures: {
    easy: ["Walk in the park", "Should be lekker", "Easy pickings", "Green light special"],
    moderate: ["Could go either way", "Decent shout", "Not too shabby", "Worth a punt"],
    difficult: ["Tough ask", "Hard yards", "Challenge accepted", "Going to be lekker tough"],
    veryDifficult: ["Ag man, that's rough", "Nightmare fixture", "Good luck with that", "Tough as biltong"],
  },
  
  // Gameweek specific
  gameweek: {
    current: ["This week's action", "Current round of fixtures", "What's cooking this GW"],
    upcoming: ["Next week's menu", "Coming up next", "On the horizon"],
    finished: ["Done and dusted", "In the books", "History now"],
  },
  
  // Player comparison
  comparison: {
    intro: ["Let's see who's the real deal", "Time to separate the men from the boys", "Stack 'em up and see who wins"],
    noPlayers: ["Pick some ballers to compare", "Choose your fighters", "Select the contenders"],
    tips: ["Check the form, boet", "Don't just look at points", "Value is everything"],
  },
  
  // Points and scores
  points: {
    high: ["Massive haul!", "Proper points!", "Absolute scenes!", "That's how you do it!", "Lekker boet!", "Sharp as a tack!"],
    average: ["Decent return", "Not bad at all", "Solid effort", "Fair points", "Not bad china", "Could be worse hey"],
    low: ["Ag shame", "Rough week", "Better luck next time", "Happens to the best of us", "Eish man", "Tough luck boet"],
    zero: ["Blanked completely", "Goose egg", "Nothing to show", "Eish, that hurts", "Ag no man", "Skelmpie week"],
  },
  
  // SA Food & Culture references
  culture: {
    braai: ["Hot as a braai fire", "Sizzling like boerewors", "Cooking on gas", "Fire it up!"],
    biltong: ["Tough as biltong", "Dry as yesterday's biltong", "Chewing on it", "Leathery stuff"],
    rugby: ["Solid as a Bok scrum", "Running it straight", "Going for the try line", "Putting in a big hit"],
    weather: ["Hot as Joburg summer", "Dry as the Karoo", "Stormy as Cape Town winter", "Bright as a highveld morning"],
    general: ["Sharp as a tjommie", "Lekker as anything", "Proper boet move", "China special", "Bru classic"],
  },
  
  // Time expressions
  time: {
    now: ["Just now", "Right now now", "Sharp sharp", "Pronto"],
    later: ["Just now just now", "Later hey", "In a bit", "When I get a chance"],
    never: ["Ja right", "When pigs fly", "Not in this lifetime", "Maybe next century"],
    urgent: ["Chop chop!", "Make it snappy!", "Sharp sharp!", "Move it boet!"],
    hurry: ["Sharp sharp!", "Chop chop!", "Move it boet!", "Make it snappy!"],
  },
  
  // Additional categories for the app
  greetings: {
    hello: ["Howzit", "Sawubona", "Sharp", "Heyyy", "Hoe gaan dit?"],
    hey: ["Hey boet", "Eish hey", "Sharp hey", "Howzit china"],
    howzit: ["Howzit boet!", "Howzit my china!", "Sharp, howzit!"],
    welcome: ["Welcome boet!", "Sharp, welcome!", "Lekker to have you!"],
  },
  
  success: {
    general: ["Lekker!", "Sharp!", "Sorted!", "Too much!"],
    celebration: ["Lekker boet!", "Sharp!", "Eish!", "Too much!"],
    dataLoaded: ["Data loaded, boet!", "All sorted now!", "Looking sharp!"],
  },
  
  strategy: {
    general: ["Sharp strategy", "Lekker plan", "Solid thinking", "Good call boet"],
    bold: ["Bold move china", "Risky but lekker", "Going for broke"],
    safe: ["Playing it safe", "Solid choice", "Can't go wrong there"],
  },
};

// Get random slang phrase (deterministic during SSR to prevent hydration mismatch)
export function getSlangPhrase(category: keyof typeof slang, subcategory?: string): string {
  const categoryData = slang[category];
  
  if (typeof categoryData === 'object' && subcategory && subcategory in categoryData) {
    const phrases = (categoryData as any)[subcategory];
    if (Array.isArray(phrases)) {
      // Use first phrase during SSR to prevent hydration mismatch
      if (typeof window === 'undefined') {
        return phrases[0];
      }
      return phrases[Math.floor(Math.random() * phrases.length)];
    }
    return phrases;
  }
  
  if (Array.isArray(categoryData)) {
    // Use first phrase during SSR to prevent hydration mismatch
    if (typeof window === 'undefined') {
      return categoryData[0];
    }
    return categoryData[Math.floor(Math.random() * categoryData.length)];
  }
  
  return "Lekker!"; // fallback
}

// Contextual slang helpers
export function getLoadingText(context?: 'fixtures' | 'players' | 'stats'): string {
  return getSlangPhrase('loading', context || 'general');
}

export function getEmptyStateText(context?: 'players' | 'fixtures' | 'stats'): string {
  return getSlangPhrase('empty', context ? `no${context.charAt(0).toUpperCase()}${context.slice(1)}` : 'general');
}

export function getPlayerDescriptionText(type: 'hot' | 'cold' | 'differential' | 'expensive' | 'bargain' | 'risky'): string {
  return getSlangPhrase('players', type);
}

export function getFixtureDifficultyText(fdr: number): string {
  if (fdr <= 2) return getSlangPhrase('fixtures', 'easy');
  if (fdr <= 3) return getSlangPhrase('fixtures', 'moderate'); 
  if (fdr <= 4) return getSlangPhrase('fixtures', 'difficult');
  return getSlangPhrase('fixtures', 'veryDifficult');
}

export function getPointsDescriptionText(points: number): string {
  if (points >= 10) return getSlangPhrase('points', 'high');
  if (points >= 5) return getSlangPhrase('points', 'average');
  if (points > 0) return getSlangPhrase('points', 'low');
  return getSlangPhrase('points', 'zero');
}

// Format currency to South African Rand (just for fun, FPL uses £)
export function formatPrice(price: number, currency = '£'): string {
  return `${currency}${(price / 10).toFixed(1)}m`;
}

// Format South African time
export function formatSATime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get South African region-appropriate greeting based on time (SSR-safe)
export function getTimeBasedGreeting(): string {
  // Use a default greeting during SSR to prevent hydration mismatch
  if (typeof window === 'undefined') {
    return "Howzit, boet!";
  }
  
  const hour = new Date().getHours();
  
  if (hour < 12) return "Morning, boet!";
  if (hour < 17) return "Afternoon, china!";
  return "Evening, my bru!";
}

// FPL-specific slang
export const fplSlang = {
  positions: {
    1: "Between the sticks", // Goalkeeper
    2: "At the back", // Defender  
    3: "In the middle", // Midfielder
    4: "Up front", // Forward
  },
  
  chips: {
    'wildcard': "Going wild!",
    'freehit': "Free shot special",
    'bboost': "Bench boost magic", 
    '3xc': "Triple captain power",
  },
  
  captaincy: {
    safe: "Playing it safe",
    risky: "Rolling the dice", 
    popular: "Following the crowd",
    differential: "Going against the grain",
  },
  
  transfers: {
    good: "Lekker move!",
    bad: "Ag, that was a mistake",
    sideways: "Shuffling the deck",
    kneejerk: "Panic stations!",
  }
};

export function getFPLSlang(category: keyof typeof fplSlang, key?: string): string {
  const data = fplSlang[category];
  if (key && typeof data === 'object' && key in data) {
    return (data as any)[key];
  }
  return "Sorted!";
}

// Alias for getSASlang - same as getSlangPhrase but more descriptive
export function getSASlang(category: keyof typeof slang, subcategory?: string): string {
  return getSlangPhrase(category, subcategory);
}
