/**
 * Telugu News Content Generator
 * Uses Google Gemini API for real content generation
 * Falls back to mock data if API fails
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini API
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Fallback templates for when API is unavailable
const teluguHeadlineTemplates = [
  'టెక్నాలజీలో కొత్త మార్పు',
  'భారతదేశంలో ముఖ్యమైన పరిణామం',
  'అత్యంత ఆసక్తికరమైన వార్త',
  'నేటి ముఖ్య సంఘటన',
  'తాజా అప్డేట్'
];

const teluguScriptTemplates = [
  'నమస్కారం, ఈ రోజు మనం చర్చించబోయే అంశం చాలా ముఖ్యమైనది. ఇటీవల జరిగిన పరిణామాలు ప్రజల దృష్టిని ఆకర్షించాయి. నిపుణుల అభిప్రాయం ప్రకారం, ఈ మార్పు రాబోయే రోజుల్లో గణనీయమైన ప్రభావాన్ని చూపుతుంది.',
  'హలో వ్యూయర్స్, నేడు మనకు ఒక ప్రత్యేకమైన వార్త ఉంది. ఈ అంశం గురించి మేము వివరణాత్మక విశ్లేషణ చేస్తాము. ఇది మీ జీవితంపై ఎలా ప్రభావం చూపుతుందో తెలుసుకుందాం.',
  'ప్రియమైన వ్యూయర్స్, ఈ రోజు మేము మీకు తెలియజేయబోయే విషయం చాలా ముఖ్యమైనది. ఇది ప్రస్తుత పరిస్థితులను గణనీయంగా ప్రభావితం చేయగలదు. దీని గురించి పూర్తి వివరాలు ఇక్కడ ఉన్నాయి.'
];

const teluguHashtagGroups = [
  ['#తెలుగు', '#వార్తలు', '#ట్రెండింగ్', '#ఇండియా'],
  ['#TeluguNews', '#బ్రేకింగ్', '#లేటెస్ట్', '#అప్డేట్'],
  ['#తెలుగువార్తలు', '#హైదరాబాద్', '#తాజావార్త', '#ముఖ్యవార్త']
];

export async function generateTeluguNews(input, type, regenerateSection = null) {
  // Try Gemini API first
  if (genAI) {
    try {
      console.log(`🤖 Using Gemini API to generate ${regenerateSection || 'full content'}...`);
      const content = await generateWithGemini(input, type, regenerateSection);
      console.log('✅ Gemini generation successful!');
      return content;
    } catch (error) {
      console.error('❌ Gemini API failed:', error.message);
      console.log('🔄 Falling back to mock data...');
    }
  } else {
    console.log('⚠️  No GEMINI_API_KEY found, using mock data');
  }

  // Fallback to mock data
  return generateMockContent(input, type, regenerateSection);
}

async function generateWithGemini(input, type, regenerateSection) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,  // Reduced for more consistent JSON formatting
      topP: 0.95,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",  // Request JSON response
    }
  });

  const prompt = createPrompt(input, type, regenerateSection);

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Extract JSON from response (handle markdown code blocks)
  let jsonText = text;
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1];
  }

  // Clean up common JSON issues
  jsonText = jsonText
    .trim()
    // Remove any trailing commas before closing braces/brackets
    .replace(/,(\s*[}\]])/g, '$1')
    // Fix common quote issues
    .replace(/[\u2018\u2019]/g, "'")  // Smart single quotes
    .replace(/[\u201C\u201D]/g, '"'); // Smart double quotes

  // Parse JSON with better error handling
  let generatedContent;
  try {
    generatedContent = JSON.parse(jsonText);
  } catch (parseError) {
    console.error('❌ JSON Parse Error:', parseError.message);
    console.error('Problematic JSON:', jsonText.substring(0, 500));
    throw new Error(`Failed to parse Gemini response: ${parseError.message}`);
  }

  // Validate structure
  if (!validateContent(generatedContent, regenerateSection)) {
    throw new Error('Invalid content structure from Gemini');
  }

  // Add metadata
  generatedContent.originalInput = input;
  generatedContent.type = type;

  return generatedContent;
}

function createPrompt(input, type, section) {
  const baseInstructions = `You are an expert Telugu news content creator specializing in short-form video content for social media (YouTube Shorts, Instagram Reels).

INPUT STORY:
${input}

INPUT TYPE: ${type}

TASK: Generate Telugu short-form news content optimized for 15-second videos.`;

  const fullPrompt = section
    ? `${baseInstructions}

REGENERATE ONLY: ${section}

Generate ONLY the "${section}" section with fresh, different content. Keep the same JSON structure.

${getStructureGuide(section)}

IMPORTANT:
- Return ONLY valid JSON
- Use Telugu script (తెలుగు) for all content
- Make content engaging and suitable for social media
- ${section === 'script' ? 'Script must be exactly 40-50 words for 15 seconds' : ''}
- ${section === 'headlines' ? 'Headlines must be catchy, 10-15 words each' : ''}
- ${section === 'hashtags' ? 'Mix Telugu and English hashtags, 8 total' : ''}`
    : `${baseInstructions}

Generate complete Telugu news content with this EXACT structure:

{
  "headlines": [
    {"id": "h1", "text": "Engaging Telugu headline 1 (10-15 words)", "selected": true},
    {"id": "h2", "text": "Engaging Telugu headline 2 (10-15 words)", "selected": false},
    {"id": "h3", "text": "Engaging Telugu headline 3 (10-15 words)", "selected": false}
  ],
  "script": {
    "text": "Complete 15-second Telugu script (40-50 words, conversational, engaging)",
    "duration": "14 సెకన్లు",
    "wordCount": 45
  },
  "hashtags": [
    "#తెలుగువార్తలు", "#TeluguNews", "#ట్రెండింగ్", "#BreakingNews",
    "4 more relevant hashtags (mix Telugu and English)"
  ],
  "thumbnailChecklist": [
    {"id": "bg", "label": "బ్యాక్‌గ్రౌండ్ ఇమేజ్ ఎంపిక చేయండి", "checked": false},
    {"id": "headline", "label": "హెడ్‌లైన్ టెక్స్ట్ ఓవర్‌లే", "checked": false},
    {"id": "logo", "label": "చానెల్ లోగో పొజిషన్", "checked": false},
    {"id": "colors", "label": "కలర్ స్కీమ్ వర్తింపజేయండి", "checked": false},
    {"id": "preview", "label": "ప్రివ్యూ మరియు రివ్యూ", "checked": false}
  ]
}

REQUIREMENTS:
- Headlines: Telugu script, engaging, 10-15 words, suitable for video thumbnails
- Script: Conversational Telugu, exactly 40-50 words (15 seconds when spoken), start with greeting like "నమస్కారం" or "హలో వ్యూయర్స్", end with "థాంక్యూ!"
- Hashtags: 8 total, mix Telugu (#తెలుగువార్తలు) and English (#TeluguNews), relevant to story
- Duration: Always "14 సెకన్లు" or "15 సెకన్లు"
- Make content viral-worthy and shareable

CRITICAL FORMATTING RULES:
1. Return ONLY valid JSON - no markdown code blocks, no explanations
2. Ensure all strings are properly quoted with double quotes "
3. No trailing commas in arrays or objects
4. All Telugu text must use proper Unicode characters
5. Verify JSON is valid before returning

Return the JSON object directly:`;

  return fullPrompt;
}

function getStructureGuide(section) {
  const structures = {
    headlines: `Return JSON with this structure:
{
  "headlines": [
    {"id": "h1", "text": "Telugu headline 1", "selected": true},
    {"id": "h2", "text": "Telugu headline 2", "selected": false},
    {"id": "h3", "text": "Telugu headline 3", "selected": false}
  ]
}`,
    script: `Return JSON with this structure:
{
  "script": {
    "text": "Complete Telugu script (40-50 words)",
    "duration": "14 సెకన్లు",
    "wordCount": 45
  }
}`,
    hashtags: `Return JSON with this structure:
{
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8"]
}`
  };

  return structures[section] || '';
}

function validateContent(content, section) {
  if (section === 'headlines') {
    return content.headlines && Array.isArray(content.headlines) && content.headlines.length === 3;
  } else if (section === 'script') {
    return content.script && content.script.text && content.script.duration;
  } else if (section === 'hashtags') {
    return content.hashtags && Array.isArray(content.hashtags);
  } else {
    // Full content validation
    return (
      content.headlines && Array.isArray(content.headlines) && content.headlines.length === 3 &&
      content.script && content.script.text &&
      content.hashtags && Array.isArray(content.hashtags) &&
      content.thumbnailChecklist && Array.isArray(content.thumbnailChecklist)
    );
  }
}

// Fallback mock data generator
function generateMockContent(input, type, regenerateSection) {
  const newsContent = {
    originalInput: input,
    type: type,
    headlines: regenerateSection === 'headlines' ? generateMockHeadlines() : [
      {
        id: 'h1',
        text: 'టెక్నాలజీ రంగంలో భారత్ కొత్త విజయం సాధించింది',
        selected: true
      },
      {
        id: 'h2',
        text: 'ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ రంగంలో భారత్ ముందుకు',
        selected: false
      },
      {
        id: 'h3',
        text: 'టెక్ పరిశ్రమలో భారతీయ కంపెనీల పురోగతి',
        selected: false
      }
    ],
    script: regenerateSection === 'script' ? generateMockScript() : {
      text: 'నమస్కారం వ్యూయర్స్! ఈ రోజు మనం మాట్లాడుకోబోయేది టెక్నాలజీ రంగంలో భారత్ సాధించిన అద్భుతమైన విజయం గురించి. ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ మరియు మెషిన్ లెర్నింగ్ రంగాలలో భారతీయ పరిశోధకులు కొత్త మైలురాయి సాధించారు. ఈ విజయం ప్రపంచవ్యాప్తంగా ప్రశంసలు అందుకుంటోంది. థాంక్యూ!',
      duration: '14 సెకన్లు',
      wordCount: 45
    },
    hashtags: regenerateSection === 'hashtags' ? generateMockHashtags() : [
      '#తెలుగువార్తలు',
      '#టెక్నాలజీ',
      '#ఇండియా',
      '#AI',
      '#ఆర్టిఫిషియల్ఇంటెలిజెన్స్',
      '#TeluguNews',
      '#TechIndia',
      '#BreakingNews'
    ],
    thumbnailChecklist: [
      { id: 'bg', label: 'బ్యాక్‌గ్రౌండ్ ఇమేజ్ ఎంపిక చేయండి', checked: false },
      { id: 'headline', label: 'హెడ్‌లైన్ టెక్స్ట్ ఓవర్‌లే', checked: false },
      { id: 'logo', label: 'చానెల్ లోగో పొజిషన్', checked: false },
      { id: 'colors', label: 'కలర్ స్కీమ్ వర్తింపజేయండి', checked: false },
      { id: 'preview', label: 'ప్రివ్యూ మరియు రివ్యూ', checked: false }
    ]
  };

  return newsContent;
}

function generateMockHeadlines() {
  return [
    {
      id: 'h1',
      text: teluguHeadlineTemplates[Math.floor(Math.random() * teluguHeadlineTemplates.length)],
      selected: true
    },
    {
      id: 'h2',
      text: teluguHeadlineTemplates[Math.floor(Math.random() * teluguHeadlineTemplates.length)],
      selected: false
    },
    {
      id: 'h3',
      text: teluguHeadlineTemplates[Math.floor(Math.random() * teluguHeadlineTemplates.length)],
      selected: false
    }
  ];
}

function generateMockScript() {
  return {
    text: teluguScriptTemplates[Math.floor(Math.random() * teluguScriptTemplates.length)],
    duration: Math.floor(Math.random() * 3) + 13 + ' సెకన్లు',
    wordCount: Math.floor(Math.random() * 10) + 40
  };
}

function generateMockHashtags() {
  const group = teluguHashtagGroups[Math.floor(Math.random() * teluguHashtagGroups.length)];
  return [...group, '#ట్रెండింగ్', '#వైరల్', '#ShortNews', '#Viral'];
}
