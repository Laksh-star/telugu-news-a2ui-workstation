# LLM Integration Guide

This guide shows how to replace the mock content generator with real LLM APIs.

## Option 1: Google Gemini API

### Installation
```bash
npm install @google/generative-ai
```

### Environment Setup
```bash
# Create .env file
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Install dotenv
npm install dotenv
```

### Update server/news-generator.js

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateTeluguNews(input, type, regenerateSection = null) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = createPrompt(input, type, regenerateSection);

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON response
    const content = JSON.parse(responseText);

    // Add metadata
    content.originalInput = input;
    content.type = type;

    return content;
  } catch (error) {
    console.error('LLM generation failed:', error);
    // Fallback to mock data
    return generateMockContent(input, type);
  }
}

function createPrompt(input, type, section) {
  const basePrompt = `
You are a Telugu news content creator. Generate short-form news content (15-second video format).

Input: ${input}
Input Type: ${type}

Generate JSON with this exact structure:
{
  "headlines": [
    {"id": "h1", "text": "Telugu headline 1", "selected": true},
    {"id": "h2", "text": "Telugu headline 2", "selected": false},
    {"id": "h3", "text": "Telugu headline 3", "selected": false}
  ],
  "script": {
    "text": "15-second Telugu script (40-50 words)",
    "duration": "14 సెకన్లు",
    "wordCount": 45
  },
  "hashtags": [
    "#తెలుగువార్తలు", "#TeluguNews", "#ట్రెండింగ్",
    "#BreakingNews", ... (8 total, mix Telugu and English)
  ],
  "thumbnailChecklist": [
    {"id": "bg", "label": "బ్యాక్‌గ్రౌండ్ ఇమేజ్ ఎంపిక చేయండి", "checked": false},
    {"id": "headline", "label": "హెడ్‌లైన్ టెక్స్ట్ ఓవర్‌లే", "checked": false},
    {"id": "logo", "label": "చానెల్ లోగో పొజిషన్", "checked": false},
    {"id": "colors", "label": "కలర్ స్కీమ్ వర్తింపజేయండి", "checked": false},
    {"id": "preview", "label": "ప్రివ్యూ మరియు రివ్యూ", "checked": false}
  ]
}

Requirements:
- Headlines must be in Telugu script, engaging, 10-15 words
- Script must be conversational, natural Telugu, exactly 15 seconds when spoken
- Include both Telugu and English hashtags
- Make content suitable for social media (Instagram, YouTube Shorts)
${section ? `\n- ONLY regenerate the "${section}" section, keep others creative but different` : ''}

Return ONLY valid JSON, no markdown formatting.
`;

  return basePrompt;
}
```

### Test Command
```bash
export GEMINI_API_KEY="your_key_here"
npm start
```

---

## Option 2: OpenAI GPT-4

### Installation
```bash
npm install openai
```

### Update server/news-generator.js

```javascript
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateTeluguNews(input, type, regenerateSection = null) {
  const prompt = createPrompt(input, type, regenerateSection);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a Telugu news content creator specializing in short-form video content. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const content = JSON.parse(completion.choices[0].message.content);
    content.originalInput = input;
    content.type = type;

    return content;
  } catch (error) {
    console.error('OpenAI generation failed:', error);
    return generateMockContent(input, type);
  }
}
```

---

## Option 3: Anthropic Claude

### Installation
```bash
npm install @anthropic-ai/sdk
```

### Update server/news-generator.js

```javascript
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function generateTeluguNews(input, type, regenerateSection = null) {
  const prompt = createPrompt(input, type, regenerateSection);

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    // Extract JSON from response
    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const content = JSON.parse(jsonMatch[0]);

    content.originalInput = input;
    content.type = type;

    return content;
  } catch (error) {
    console.error('Claude generation failed:', error);
    return generateMockContent(input, type);
  }
}
```

---

## Option 4: Local LLM (Ollama)

### Installation
```bash
# Install Ollama: https://ollama.ai/
ollama pull llama2
```

### Update server/news-generator.js

```javascript
export async function generateTeluguNews(input, type, regenerateSection = null) {
  const prompt = createPrompt(input, type, regenerateSection);

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama2',
        prompt: prompt,
        stream: false
      })
    });

    const result = await response.json();
    const content = JSON.parse(result.response);

    content.originalInput = input;
    content.type = type;

    return content;
  } catch (error) {
    console.error('Ollama generation failed:', error);
    return generateMockContent(input, type);
  }
}
```

---

## Advanced: Streaming Responses

For real-time content generation, implement streaming:

### Server-Side (SSE)

```javascript
// server/index.js
app.post('/api/generate-stream', async (req, res) => {
  const { input, type } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const newsId = Date.now().toString();

  // Stream headlines first
  const headlines = await generateHeadlines(input);
  res.write(`data: ${JSON.stringify({ type: 'headlines', data: headlines })}\n\n`);

  // Then stream script
  const script = await generateScript(input);
  res.write(`data: ${JSON.stringify({ type: 'script', data: script })}\n\n`);

  // Then stream hashtags
  const hashtags = await generateHashtags(input);
  res.write(`data: ${JSON.stringify({ type: 'hashtags', data: hashtags })}\n\n`);

  // Finally send complete A2UI
  const newsContent = { headlines, script, hashtags, thumbnailChecklist };
  const a2uiPayload = createWorkstationUI(newsId, newsContent);
  res.write(`data: ${JSON.stringify({ type: 'complete', data: a2uiPayload })}\n\n`);

  res.end();
});
```

### Client-Side

```javascript
// public/app.js
async function generateWithStreaming(input, type) {
  const response = await fetch('/api/generate-stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, type })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));

        if (data.type === 'complete') {
          renderer.render(data.data, workstation);
          workstation.style.display = 'block';
        } else {
          // Show partial updates
          updatePartialUI(data.type, data.data);
        }
      }
    }
  }
}
```

---

## Content Quality Improvements

### Add Examples to Prompt (Few-Shot Learning)

```javascript
function createPrompt(input, type, section) {
  return `
You are a Telugu news content creator.

EXAMPLE INPUT:
"AI breakthrough at IIT Madras improves medical diagnosis"

EXAMPLE OUTPUT:
{
  "headlines": [
    {"id": "h1", "text": "ఐఐటీ మద్రాస్ ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ విప్లవం", "selected": true},
    {"id": "h2", "text": "వైద్య నిర్ధారణలో కొత్త సాంకేతికత విజయం", "selected": false},
    {"id": "h3", "text": "భారత శాస్త్రవేత్తల అద్భుతమైన ఆవిష్కరణ", "selected": false}
  ],
  "script": {
    "text": "నమస్కారం! ఐఐటీ మద్రాస్ పరిశోధకులు ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ రంగంలో అద్భుతమైన విజయం సాధించారు. వైద్య నిర్ధారణ ఖచ్చితత్వాన్ని 45 శాతం మెరుగుపరిచారు. ఈ ఆవిష్కరణ గ్రామీణ ప్రాంతాల ఆరోగ్య సేవలకు కొత్త శకం తెరుస్తుంది. థాంక్యూ!",
    "duration": "15 సెకన్లు",
    "wordCount": 42
  },
  "hashtags": ["#తెలుగువార్తలు", "#AI", "#IITMadras", "#వైద్యం", "#TeluguNews", "#HealthTech", "#IndiaInnovates", "#ట్రెండింగ్"]
}

NOW GENERATE for this input:
${input}

Requirements: [... same as before ...]
`;
}
```

### Add URL Scraping

```bash
npm install axios cheerio
```

```javascript
import axios from 'axios';
import * as cheerio from 'cheerio';

async function scrapeArticle(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Extract article content (customize selectors)
    const title = $('h1').first().text();
    const content = $('article p').map((i, el) => $(el).text()).get().join('\n');

    return { title, content };
  } catch (error) {
    console.error('Scraping failed:', error);
    return null;
  }
}

export async function generateTeluguNews(input, type, regenerateSection = null) {
  let contentToProcess = input;

  if (type === 'url') {
    const scraped = await scrapeArticle(input);
    if (scraped) {
      contentToProcess = `${scraped.title}\n\n${scraped.content}`;
    }
  }

  // Continue with LLM generation...
}
```

---

## Error Handling Best Practices

```javascript
export async function generateTeluguNews(input, type, regenerateSection = null) {
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await callLLM(input, type, regenerateSection);

      // Validate structure
      if (!validateNewsContent(result)) {
        throw new Error('Invalid content structure');
      }

      return result;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error;

      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // All retries failed, return mock data
  console.error('All generation attempts failed, using fallback');
  return generateMockContent(input, type);
}

function validateNewsContent(content) {
  return (
    content.headlines &&
    Array.isArray(content.headlines) &&
    content.headlines.length === 3 &&
    content.script &&
    content.script.text &&
    content.hashtags &&
    Array.isArray(content.hashtags)
  );
}
```

---

## Cost Optimization

### Cache Regenerations

```javascript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

export async function generateTeluguNews(input, type, regenerateSection) {
  const cacheKey = `${input}-${type}-${regenerateSection}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('Returning cached result');
    return cached;
  }

  // Generate new content
  const result = await callLLM(input, type, regenerateSection);

  // Store in cache
  cache.set(cacheKey, result);

  return result;
}
```

### Use Cheaper Models for Simple Tasks

```javascript
async function callLLM(input, type, section) {
  // Use cheaper model for regeneration
  const model = section
    ? 'gemini-1.5-flash'  // Fast and cheap
    : 'gemini-1.5-pro';   // Better quality

  // ... rest of implementation
}
```

---

## Testing LLM Integration

```javascript
// test/llm-integration.test.js
import { generateTeluguNews } from '../server/news-generator.js';

async function testGeneration() {
  const testInput = "Technology news: AI breakthrough at Indian institute";

  console.log('Testing full generation...');
  const result = await generateTeluguNews(testInput, 'notes');
  console.log('Headlines:', result.headlines);
  console.log('Script:', result.script.text);
  console.log('Hashtags:', result.hashtags);

  console.log('\nTesting headline regeneration...');
  const regenerated = await generateTeluguNews(testInput, 'notes', 'headlines');
  console.log('New headlines:', regenerated.headlines);
}

testGeneration();
```

Run: `node test/llm-integration.test.js`
