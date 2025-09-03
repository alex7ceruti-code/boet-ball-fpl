const fs = require('fs');
const path = require('path');

// Create a simple HTML generator for the Instagram slides
const generateSlideHTML = (slideContent, slideId) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .slide { 
      width: 1080px; 
      height: 1080px; 
      position: relative; 
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
  </style>
</head>
<body>
  ${slideContent}
</body>
</html>
  `;
};

// Slide 1: Welcome to Boet Ball
const welcomeSlide = `
<div class="slide" style="background: linear-gradient(135deg, #16a34a 0%, #15803d 50%, #065f46 100%); color: white; position: relative;">
  <!-- South African Flag Pattern Background -->
  <div style="position: absolute; inset: 0; opacity: 0.1;">
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 16.67%; background: #dc2626;"></div>
    <div style="position: absolute; top: 16.67%; left: 0; width: 100%; height: 16.67%; background: #2563eb;"></div>
    <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 16.67%; background: #ea580c;"></div>
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 128px; height: 128px; border: 4px solid rgba(255,255,255,0.2); border-radius: 50%;"></div>
  </div>

  <!-- Header -->
  <div style="position: relative; z-index: 10; text-align: center; padding-top: 120px; padding-left: 60px; padding-right: 60px;">
    <div style="margin-bottom: 48px;">
      <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #16a34a, #ea580c); border-radius: 24px; margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
        <div style="color: white; font-size: 48px; font-weight: 900;">BB</div>
      </div>
      <h1 style="font-size: 72px; font-weight: 900; margin-bottom: 16px; letter-spacing: 4px;">BOET BALL</h1>
      <div style="width: 160px; height: 8px; background: #fbbf24; margin: 0 auto; border-radius: 4px;"></div>
    </div>
    
    <div style="margin-bottom: 64px;">
      <h2 style="font-size: 48px; font-weight: 700; margin-bottom: 32px; line-height: 1.2;">
        🇿🇦 South African<br/>FPL Companion
      </h2>
      <p style="font-size: 36px; opacity: 0.9; line-height: 1.4;">
        Your lekker guide to<br/>
        Fantasy Premier League<br/>
        success, boet! 🏆
      </p>
    </div>
  </div>

  <!-- Bottom CTA -->
  <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.3); padding: 48px; text-align: center;">
    <p style="font-size: 36px; font-weight: 700; margin-bottom: 16px;">Ready to dominate your mini-league?</p>
    <p style="font-size: 24px; opacity: 0.9;">#BoetBall #FPL #SouthAfrica</p>
  </div>
</div>
`;

// Slide 2: Key Features
const featuresSlide = `
<div class="slide" style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%); color: white; position: relative; overflow: hidden;">
  <!-- Background Pattern -->
  <div style="position: absolute; inset: 0; opacity: 0.1;">
    <div style="position: absolute; top: 64px; right: 64px; width: 160px; height: 160px; border: 8px solid white; border-radius: 50%;"></div>
    <div style="position: absolute; bottom: 64px; left: 64px; width: 128px; height: 128px; border: 8px solid white; transform: rotate(45deg);"></div>
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 320px; height: 320px; border: 4px solid rgba(255,255,255,0.2); border-radius: 50%;"></div>
  </div>

  <!-- Header -->
  <div style="position: relative; z-index: 10; text-align: center; padding-top: 64px; padding-left: 48px; padding-right: 48px;">
    <h1 style="font-size: 48px; font-weight: 900; margin-bottom: 16px;">WHAT WE OFFER</h1>
    <div style="width: 128px; height: 4px; background: #fbbf24; margin: 0 auto 64px;"></div>
  </div>

  <!-- Features Grid -->
  <div style="position: relative; z-index: 10; padding: 0 48px; display: flex; flex-direction: column; gap: 32px;">
    <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 24px; padding: 32px; border: 2px solid rgba(255,255,255,0.2);">
      <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 16px;">
        <div style="width: 80px; height: 80px; background: #fbbf24; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <div style="width: 40px; height: 40px; background: #000; border-radius: 4px;"></div>
        </div>
        <h3 style="font-weight: 700; font-size: 36px;">Advanced Analytics</h3>
      </div>
      <p style="font-size: 24px; opacity: 0.9;">Deep player insights, xG, xA, form trends & more</p>
    </div>

    <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 24px; padding: 32px; border: 2px solid rgba(255,255,255,0.2);">
      <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 16px;">
        <div style="width: 80px; height: 80px; background: #4ade80; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <div style="width: 32px; height: 32px; border: 4px solid #000; border-radius: 50%;"></div>
        </div>
        <h3 style="font-weight: 700; font-size: 36px;">Player Comparison</h3>
      </div>
      <p style="font-size: 24px; opacity: 0.9;">Compare up to 4 players side-by-side</p>
    </div>

    <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 24px; padding: 32px; border: 2px solid rgba(255,255,255,0.2);">
      <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 16px;">
        <div style="width: 80px; height: 80px; background: #fb923c; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <div style="color: #000; font-size: 32px;">★</div>
        </div>
        <h3 style="font-weight: 700; font-size: 36px;">FUT-Style Cards</h3>
      </div>
      <p style="font-size: 24px; opacity: 0.9;">Create stunning player cards for social media</p>
    </div>

    <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 24px; padding: 32px; border: 2px solid rgba(255,255,255,0.2);">
      <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 16px;">
        <div style="width: 80px; height: 80px; background: #f472b6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <div style="color: #000; font-size: 24px;">👥</div>
        </div>
        <h3 style="font-weight: 700; font-size: 36px;">South African Flair</h3>
      </div>
      <p style="font-size: 24px; opacity: 0.9;">Local slang, culture & community vibes</p>
    </div>
  </div>

  <!-- Bottom -->
  <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.3); padding: 32px; text-align: center;">
    <p style="font-size: 24px; font-weight: 600;">#BoetBall • Your FPL Advantage</p>
  </div>
</div>
`;

// Slide 3: Advanced Analytics
const analyticsSlide = `
<div class="slide" style="background: linear-gradient(135deg, #581c87 0%, #3730a3 50%, #1e40af 100%); color: white; position: relative; overflow: hidden;">
  <!-- Tech Background Pattern -->
  <div style="position: absolute; inset: 0; opacity: 0.05;">
    <div style="display: grid; grid-template-columns: repeat(8, 1fr); grid-template-rows: repeat(8, 1fr); height: 100%;">
      ${Array.from({length: 64}, (_, i) => '<div style="border: 1px solid rgba(255,255,255,0.1);"></div>').join('')}
    </div>
  </div>

  <!-- Header -->
  <div style="position: relative; z-index: 10; text-align: center; padding-top: 64px; padding-left: 48px; padding-right: 48px;">
    <div style="margin-bottom: 32px;">
      <div style="font-size: 96px; margin-bottom: 16px;">⚡</div>
      <h1 style="font-size: 48px; font-weight: 900;">ADVANCED ANALYTICS</h1>
      <div style="width: 128px; height: 4px; background: #fbbf24; margin: 16px auto 0;"></div>
    </div>
  </div>

  <!-- Analytics Preview -->
  <div style="position: relative; z-index: 10; padding: 0 48px 48px;">
    <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 32px; padding: 48px; border: 2px solid rgba(255,255,255,0.2); margin-bottom: 48px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h3 style="font-size: 40px; font-weight: 700; margin-bottom: 8px;">Erling Haaland</h3>
        <p style="font-size: 24px; opacity: 0.8;">Manchester City • Forward</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px;">
        <div style="text-align: center;">
          <div style="font-size: 36px; font-weight: 900; color: #fbbf24;">156</div>
          <div style="font-size: 20px; opacity: 0.8;">Total Points</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 36px; font-weight: 900; color: #4ade80;">8.2</div>
          <div style="font-size: 20px; opacity: 0.8;">Form</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 36px; font-weight: 900; color: #60a5fa;">94</div>
          <div style="font-size: 20px; opacity: 0.8;">Overall</div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; font-size: 24px;">
          <span>xG (Expected Goals)</span>
          <span style="font-weight: 600; color: #4ade80;">18.4</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 24px;">
          <span>Value Rating</span>
          <span style="font-weight: 600; color: #fb923c;">11.2</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 24px;">
          <span>ICT Index</span>
          <span style="font-weight: 600; color: #f472b6;">245.8</span>
        </div>
      </div>
    </div>

    <div style="text-align: center;">
      <p style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">🔍 Deep Insights Include:</p>
      <div style="font-size: 20px; opacity: 0.9; display: flex; flex-direction: column; gap: 8px;">
        <p>• Form Trends & Consistency Ratings</p>
        <p>• Fixture Difficulty Analysis</p>
        <p>• Value Efficiency Scoring</p>
        <p>• Rotation Risk Assessment</p>
      </div>
    </div>
  </div>

  <!-- Bottom -->
  <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.4); padding: 32px; text-align: center;">
    <p style="font-size: 24px; font-weight: 600;">Make data-driven FPL decisions 📊</p>
  </div>
</div>
`;

// Slide 4: Community
const communitySlide = `
<div class="slide" style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 50%, #db2777 100%); color: white; position: relative; overflow: hidden;">
  <!-- Community Background -->
  <div style="position: absolute; inset: 0; opacity: 0.1;">
    <div style="position: absolute; top: 96px; left: 96px; width: 128px; height: 128px; background: white; border-radius: 50%;"></div>
    <div style="position: absolute; top: 160px; right: 128px; width: 96px; height: 96px; background: white; border-radius: 50%;"></div>
    <div style="position: absolute; bottom: 128px; left: 128px; width: 112px; height: 112px; background: white; border-radius: 50%;"></div>
    <div style="position: absolute; bottom: 96px; right: 96px; width: 80px; height: 80px; background: white; border-radius: 50%;"></div>
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 64px; height: 64px; background: white; border-radius: 50%;"></div>
  </div>

  <!-- Header -->
  <div style="position: relative; z-index: 10; text-align: center; padding-top: 96px; padding-left: 48px; padding-right: 48px;">
    <div style="margin-bottom: 48px;">
      <div style="font-size: 112px; margin-bottom: 24px; color: #fde047;">👥</div>
      <h1 style="font-size: 48px; font-weight: 900;">JOIN THE COMMUNITY</h1>
      <div style="width: 160px; height: 8px; background: #fde047; margin: 16px auto; border-radius: 4px;"></div>
    </div>
  </div>

  <!-- Community Stats/Features -->
  <div style="position: relative; z-index: 10; padding: 0 64px 64px;">
    <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 32px; padding: 48px; border: 2px solid rgba(255,255,255,0.2); margin-bottom: 48px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h3 style="font-size: 40px; font-weight: 700; margin-bottom: 16px;">🇿🇦 South African FPL Hub</h3>
        <p style="font-size: 24px; opacity: 0.9; line-height: 1.5;">
          Connect with fellow South African FPL managers, share strategies, and celebrate victories together!
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; margin-bottom: 32px;">
        <div style="text-align: center; background: rgba(255,255,255,0.1); border-radius: 16px; padding: 24px;">
          <div style="font-size: 36px; font-weight: 900; color: #fde047;">🏆</div>
          <div style="font-size: 24px; font-weight: 600;">Mini-League</div>
          <div style="font-size: 20px; opacity: 0.8;">Competitions</div>
        </div>
        <div style="text-align: center; background: rgba(255,255,255,0.1); border-radius: 16px; padding: 24px;">
          <div style="font-size: 36px; font-weight: 900; color: #4ade80;">💬</div>
          <div style="font-size: 24px; font-weight: 600;">Local Insights</div>
          <div style="font-size: 20px; opacity: 0.8;">& Banter</div>
        </div>
      </div>

      <div style="text-align: center;">
        <div style="display: flex; justify-content: center; gap: 32px; font-size: 48px; margin-bottom: 24px;">
          <span>🍖</span><span>⚽</span><span>🏆</span><span>🇿🇦</span>
        </div>
        <p style="font-size: 24px; font-weight: 600;">
          "Braai, banter, and brilliant FPL decisions!" 
        </p>
      </div>
    </div>
  </div>

  <!-- Bottom CTA -->
  <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.4); padding: 48px; text-align: center;">
    <p style="font-size: 36px; font-weight: 700; margin-bottom: 8px;">Ready to join the community?</p>
    <p style="font-size: 24px; opacity: 0.9;">#BoetBall #FPLCommunity #Mzansi</p>
  </div>
</div>
`;

// Slide 5: Call to Action
const ctaSlide = `
<div class="slide" style="background: linear-gradient(135deg, #16a34a 0%, #059669 50%, #0f766e 100%); color: white; position: relative; overflow: hidden;">
  <!-- Success Pattern Background -->
  <div style="position: absolute; inset: 0; opacity: 0.1;">
    <div style="position: absolute; top: 64px; left: 64px; font-size: 128px;">🏆</div>
    <div style="position: absolute; top: 96px; right: 96px; font-size: 96px;">⭐</div>
    <div style="position: absolute; bottom: 128px; left: 96px; font-size: 112px;">📈</div>
    <div style="position: absolute; bottom: 96px; right: 128px; font-size: 80px;">❤️</div>
    
    <!-- Celebration elements -->
    <div style="position: absolute; top: 25%; left: 25%; width: 16px; height: 16px; background: #fbbf24; border-radius: 50%; animation: pulse 2s infinite;"></div>
    <div style="position: absolute; top: 33%; right: 33%; width: 24px; height: 24px; background: #fb923c; border-radius: 50%; animation: pulse 2s infinite;"></div>
    <div style="position: absolute; bottom: 33%; left: 50%; width: 16px; height: 16px; background: #f472b6; border-radius: 50%; animation: pulse 2s infinite;"></div>
  </div>

  <!-- Main Content -->
  <div style="position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 0 64px; text-align: center;">
    <div style="margin-bottom: 64px;">
      <div style="width: 128px; height: 128px; background: linear-gradient(135deg, #16a34a, #ea580c); border-radius: 32px; margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
        <div style="color: white; font-size: 56px; font-weight: 900;">BB</div>
      </div>
      <h1 style="font-size: 60px; font-weight: 900; margin-bottom: 24px;">GET STARTED TODAY!</h1>
      <div style="width: 192px; height: 8px; background: #fbbf24; margin: 0 auto; border-radius: 4px; margin-bottom: 48px;"></div>
    </div>

    <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 32px; padding: 48px; border: 4px solid rgba(255,255,255,0.3); margin-bottom: 64px; max-width: 800px;">
      <h2 style="font-size: 40px; font-weight: 700; margin-bottom: 32px;">🚀 Launch Special</h2>
      <div style="display: flex; flex-direction: column; gap: 24px; margin-bottom: 32px; text-align: left;">
        <p style="font-size: 24px;">✅ Free advanced analytics access</p>
        <p style="font-size: 24px;">✅ Premium FUT card generation</p>
        <p style="font-size: 24px;">✅ Exclusive South African features</p>
        <p style="font-size: 24px;">✅ Community access & insights</p>
      </div>
      
      <div style="background: #fbbf24; color: #000; border-radius: 24px; padding: 32px; font-weight: 700;">
        <p style="font-size: 36px;">Visit: boetball.com</p>
        <p style="font-size: 24px;">Your FPL success starts here! 🏆</p>
      </div>
    </div>

    <div style="text-align: center;">
      <p style="font-size: 36px; font-weight: 700; margin-bottom: 16px;">Follow us for daily FPL content!</p>
      <div style="display: flex; align-items: center; justify-content: center; gap: 16px; font-size: 24px;">
        <span style="background: rgba(255,255,255,0.2); padding: 8px 24px; border-radius: 24px;">#BoetBall</span>
        <span style="background: rgba(255,255,255,0.2); padding: 8px 24px; border-radius: 24px;">#FPL</span>
        <span style="background: rgba(255,255,255,0.2); padding: 8px 24px; border-radius: 24px;">#SouthAfrica</span>
      </div>
    </div>
  </div>

  <!-- Bottom accent -->
  <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 16px; background: linear-gradient(90deg, #fbbf24 0%, #fb923c 50%, #dc2626 100%);"></div>
</div>
`;

// Generate all slides
const slides = [
  { id: 'welcome', content: welcomeSlide, title: 'Welcome to Boet Ball' },
  { id: 'features', content: featuresSlide, title: 'Key Features' },
  { id: 'analytics', content: analyticsSlide, title: 'Advanced Analytics' },
  { id: 'community', content: communitySlide, title: 'Join the Community' },
  { id: 'cta', content: ctaSlide, title: 'Get Started' }
];

// Create output directory
const outputDir = path.join(__dirname, 'instagram-slides');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate HTML files for each slide
slides.forEach((slide, index) => {
  const html = generateSlideHTML(slide.content, slide.id);
  const filename = `slide-${index + 1}-${slide.id}.html`;
  fs.writeFileSync(path.join(outputDir, filename), html);
  console.log(`✅ Generated: ${filename} - ${slide.title}`);
});

console.log(`\n🎉 All 5 Instagram slides generated in: ${outputDir}`);
console.log(`\n📱 To convert to images:`);
console.log(`1. Open each HTML file in Chrome`);
console.log(`2. Set browser window to 1080x1080 pixels`);
console.log(`3. Take screenshot or use browser dev tools`);
console.log(`4. Save as PNG files for Instagram`);
console.log(`\n🚀 Ready for your Instagram launch!`);
