/**
 * Boet Ball - South African Theme System
 * Balancing premium professionalism with authentic SA cultural flavor
 */

// Enhanced SA Slang & Phrases Bank
export const saSlang = {
  // FPL Strategy & Analysis
  strategy: {
    'insider-tips': 'Hulle weet nie wat ons weet nie',
    'differential-picks': 'Chommie Differential',
    'captain-choice': "Braai Master's Choice",
    'fixture-warning': "This is like playing the All Blacks at Eden Park, bru",
    'trust-process': "Lekker, boys! We stick to the plan, trust the process",
    'good-fixture': 'Kiff Kick-off',
    'tough-fixture': "Proper skelmpie fixture, hey",
  },

  // Player Performance
  performance: {
    'top-performer': 'Honourable Member',
    'big-haul': 'Boerie Burner',
    'disappointing': 'Shot Left',
    'injured-off': 'Moer and Gone',
    'benched': 'Bench Warmer Special',
    'consistent': 'Reliable Boetie',
    'differential-star': 'Slegs vir ons mense',
  },

  // Match Results & Reactions
  reactions: {
    'surprising-result': 'Met eish, ja!',
    'boring-match': 'Slaapstad Snoozer',
    'big-win': 'Klapper of the Week',
    'disaster': 'Proper train smash, that',
    'lucky-break': 'Ag man, pure fluke!',
    'expected': 'Saw that one coming from Cape Town',
  },

  // User Interactions & Nudges
  interactions: {
    'forgot-team': "Don't be a ballie, boet",
    'good-choice': 'Lekker move, china!',
    'risky-move': 'Bit of a gamble there, hey',
    'safe-choice': 'Playing it safe like a Prius driver',
    'bold-move': 'Going full toekie on this one!',
    'patience': 'Patience, my bru - Rome wasn\'t built in a day',
  },

  // Loading & System Messages
  system: {
    'loading': ['Fetching the goods...', 'Getting the inside scoop...', 'Checking with the boetie network...'],
    'error': 'Eish, something went sideways',
    'success': 'Lekker! All sorted',
    'empty-state': 'Nothing to see here, move along boet',
    'refreshing': 'Getting the latest gen...',
  },

  // Time & Context
  context: {
    'gameweek-live': 'We are cooking now!',
    'gameweek-finished': 'That\'s a wrap, boetjies',
    'deadline-soon': 'Deadline approaching like loadshedding',
    'international-break': 'Boring international break vibes',
    'festive-fixtures': 'Festive season madness incoming',
  }
};

// Rassie Erasmus Coach-Style Advice System
export const rassieAdvice = {
  // Captain Selection
  captaincy: [
    "Listen here, boet - your captain choice is like your flyhalf. You need someone who can handle the pressure when the big moments come.",
    "Don't overthink the armband, china. Sometimes the obvious choice is obvious for a reason. Trust your gut.",
    "Captain against the bottom teams? That's like playing Georgia - you expect results, but rugby is rugby, hey.",
    "Your captain is your general on the field. Choose someone who shows up when it matters most.",
  ],

  // Transfer Strategy
  transfers: [
    "One thing I learned from the Springboks - you don't change a winning team unless you absolutely have to.",
    "These knee-jerk transfers are like changing your game plan at halftime when you're 10 points up. Stick to the plan.",
    "Look at the fixtures like you're planning a rugby tour - who's got the easier run? That's where you invest.",
    "Patience wins you World Cups and mini-leagues. Don't panic after one bad gameweek.",
  ],

  // Chip Usage
  chips: [
    "Your chips are like your bench - save them for when you really need them. Don't waste your bomb squad on a warm-up match.",
    "Triple Captain is your ace card. Play it against the weakest defense, not because you're desperate.",
    "Free Hit is like bringing fresh legs off the bench - perfect timing can change everything.",
    "Bench Boost when your subs are strong. It's like having a world-class bench in the World Cup final.",
  ],

  // Fixture Analysis
  fixtures: [
    "Away fixtures are always tougher - ask any Springbok. Factor in the travel, the crowd, the pressure.",
    "Double gameweeks are like playing Saturday-Tuesday - great opportunity, but watch for rotation.",
    "Blank gameweeks catch amateurs off guard. Professionals plan three weeks ahead.",
    "Fixture difficulty is like the World Cup draw - on paper means nothing when the whistle blows.",
  ],

  // Mini-League Psychology
  psychology: [
    "Mini-leagues are won in the mind. Stay calm, stick to your process, let others make the mistakes.",
    "Don't copy the leader - that's how you stay second. Be brave, make your own calls.",
    "Pressure is privilege. If you're at the top of your mini-league, embrace it like wearing the green jersey.",
    "Every setback is a comeback waiting to happen. Ask me about 2019.",
  ]
};

// Visual Theme Configuration
export const saThemeConfig = {
  colors: {
    // Primary Brand Colors (Springbok-inspired)
    primary: {
      springbok: '#007A3D',      // Official Springbok green
      gold: '#FFD700',           // Springbok gold accent
      forest: '#004225',         // Deeper green for text
      mint: '#E8F5E8',          // Light green backgrounds
    },
    
    // Supporting SA Colors
    secondary: {
      sunset: '#FF6B35',         // Cape Town sunset orange
      ocean: '#0077BE',          // SA ocean blue
      sand: '#F4E4BC',          // Beach sand
      wine: '#722F37',          // Cape wine red
    },

    // Emotional/Performance Colors
    performance: {
      boerieBurner: '#FF4444',   // Hot red for big haulers
      reliable: '#28A745',       // Steady green
      differential: '#6F42C1',   // Purple for unique picks
      warning: '#FFA500',        // Orange for cautions
    }
  },

  // Typography System
  typography: {
    // Font families with local character
    primary: {
      heading: 'Poppins',        // Clean, modern for headings
      body: 'Inter',             // Readable for body text
      accent: 'Roboto Slab',     // Sturdy for stats/numbers
      mono: 'JetBrains Mono',    // Code/data display
    },
    
    // Font weights with meaning
    weights: {
      light: 300,       // Subtle information
      regular: 400,     // Body text
      medium: 500,      // Emphasis
      semibold: 600,    // Section headers
      bold: 700,        // Main headings
      black: 900,       // Brand/hero text
    }
  },

  // Iconography & Visual Elements
  iconography: {
    // Custom SA-themed icons
    braaiGrill: '🔥',           // For "Boerie Burners"
    springbok: '🦌',           // Performance excellence
    rugby: '🏉',               // Sports/competition
    mountain: '🏔️',            // Table Mountain reference
    flag: '🇿🇦',              // National pride moments
    trophy: '🏆',             // Achievements
    lightning: '⚡',           // Quick actions/alerts
    shield: '🛡️',             // Defensive stats
    target: '🎯',             // Accuracy/precision
  },

  // Spacing & Layout (maintaining premium feel)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },

  // Border radius for SA-friendly curves
  borderRadius: {
    sm: '6px',         // Subtle curves
    md: '12px',        // Standard cards
    lg: '18px',        // Feature cards
    xl: '24px',        // Hero elements
    full: '50%',       // Circular elements
  },

  // Shadows for depth without heaviness
  shadows: {
    subtle: '0 1px 3px rgba(0, 122, 61, 0.12)',
    card: '0 4px 12px rgba(0, 122, 61, 0.15)',
    floating: '0 8px 24px rgba(0, 122, 61, 0.18)',
    dramatic: '0 16px 48px rgba(0, 122, 61, 0.2)',
  }
};

// Context-aware messaging system (SSR-safe)
export const getContextualMessage = (context: string, data?: any) => {
  // Use first item during SSR to prevent hydration mismatch
  const getRandomOrFirst = (arr: string[]) => {
    if (typeof window === 'undefined') {
      return arr[0];
    }
    return arr[Math.floor(Math.random() * arr.length)];
  };

  switch (context) {
    case 'captain-selection':
      return getRandomOrFirst(rassieAdvice.captaincy);
    
    case 'transfer-suggestion':
      return getRandomOrFirst(rassieAdvice.transfers);
    
    case 'chip-usage':
      return getRandomOrFirst(rassieAdvice.chips);
    
    case 'fixture-difficulty':
      return getRandomOrFirst(rassieAdvice.fixtures);
    
    case 'mini-league-advice':
      return getRandomOrFirst(rassieAdvice.psychology);
    
    default:
      return "Trust the process, boet. Good things come to those who plan properly.";
  }
};

// Helper function to get appropriate slang based on context (SSR-safe)
export const getSASlang = (category: keyof typeof saSlang, key: string) => {
  const categorySlang = saSlang[category] as Record<string, string | string[]>;
  const phrase = categorySlang[key];
  
  if (Array.isArray(phrase)) {
    // Use first phrase during SSR to prevent hydration mismatch
    if (typeof window === 'undefined') {
      return phrase[0];
    }
    return phrase[Math.floor(Math.random() * phrase.length)];
  }
  
  return phrase || "Lekker, boet!";
};

// Time-based greeting system (SSR-safe)
export const getSATimeGreeting = (): string => {
  // Use default greeting during SSR to prevent hydration mismatch
  if (typeof window === 'undefined') {
    return "Howzit, boet! 🇿🇦";
  }
  
  const hour = new Date().getHours();
  const saTime = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });
  const currentHour = new Date(saTime).getHours();
  
  if (currentHour >= 5 && currentHour < 12) {
    return "Goeie môre, boet! ☀️";
  } else if (currentHour >= 12 && currentHour < 17) {
    return "Middag, china! 🌤️";
  } else if (currentHour >= 17 && currentHour < 21) {
    return "Evening, my bru! 🌅";
  } else {
    return "Late night FPL session, hey! 🌙";
  }
};

// Performance-based messaging
export const getPerformanceMessage = (points: number) => {
  if (points >= 15) return saSlang.performance['big-haul'];
  if (points >= 8) return saSlang.performance['consistent'];
  if (points >= 4) return "Doing the basics right";
  if (points >= 1) return "At least he showed up";
  return saSlang.performance['disappointing'];
};

export default {
  saSlang,
  rassieAdvice,
  saThemeConfig,
  getContextualMessage,
  getSASlang,
  getSATimeGreeting,
  getPerformanceMessage,
};
