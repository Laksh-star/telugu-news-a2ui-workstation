import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateTeluguNews } from './news-generator.js';
import { createWorkstationUI } from './a2ui-generator.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store for news data (in-memory for demo)
const newsStore = new Map();

// Generate initial news package
app.post('/api/generate', async (req, res) => {
  const { input, type } = req.body; // type: 'url' | 'transcript' | 'notes'

  try {
    console.log('📨 Generate request:', { inputLength: input?.length, type });

    const newsId = Date.now().toString();
    const newsContent = await generateTeluguNews(input, type);

    console.log('✅ Content generated:', {
      hasHeadlines: !!newsContent.headlines,
      hasScript: !!newsContent.script,
      hasHashtags: !!newsContent.hashtags
    });

    newsStore.set(newsId, newsContent);

    const a2uiPayload = createWorkstationUI(newsId, newsContent);

    console.log('✅ A2UI payload created:', {
      hasSurface: !!a2uiPayload.surface,
      hasDataModel: !!a2uiPayload.dataModel,
      newsId: a2uiPayload.dataModel?.newsId
    });

    res.json(a2uiPayload);
  } catch (error) {
    console.error('❌ Generate endpoint error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Regenerate specific section
app.post('/api/regenerate', async (req, res) => {
  const { newsId, section } = req.body; // section: 'headlines' | 'script' | 'hashtags'

  try {
    const newsContent = newsStore.get(newsId);
    if (!newsContent) {
      return res.status(404).json({ error: 'News not found' });
    }

    const updatedContent = await generateTeluguNews(newsContent.originalInput, newsContent.type, section);
    newsContent[section] = updatedContent[section];
    newsStore.set(newsId, newsContent);

    const a2uiPayload = createWorkstationUI(newsId, newsContent);
    res.json(a2uiPayload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update headlines
app.post('/api/update-headlines', async (req, res) => {
  const { newsId, headlines } = req.body;

  const newsContent = newsStore.get(newsId);
  if (!newsContent) {
    return res.status(404).json({ error: 'News not found' });
  }

  // Update headlines if provided
  if (headlines && Array.isArray(headlines)) {
    newsContent.headlines = headlines.map((text, index) => ({
      id: `headline-${index}`,
      text: text,
      selected: index === 0
    }));
    newsStore.set(newsId, newsContent);
  }

  res.json({
    success: true,
    message: 'హెడ్‌లైన్స్ అప్‌డేట్ చేయబడింది / Headlines updated successfully!',
    updatedAt: new Date().toISOString()
  });
});

// Update script
app.post('/api/update-script', async (req, res) => {
  const { newsId, scriptText } = req.body;

  const newsContent = newsStore.get(newsId);
  if (!newsContent) {
    return res.status(404).json({ error: 'News not found' });
  }

  // Update script if provided
  if (scriptText) {
    const wordCount = scriptText.trim().split(/\s+/).length;
    newsContent.script = {
      text: scriptText,
      duration: '15 seconds',
      wordCount: wordCount
    };
    newsStore.set(newsId, newsContent);
  }

  res.json({
    success: true,
    message: 'స్క్రిప్ట్ అప్‌డేట్ చేయబడింది / Script updated successfully!',
    updatedAt: new Date().toISOString()
  });
});

// Save draft
app.post('/api/save', async (req, res) => {
  const { newsId } = req.body;

  const newsContent = newsStore.get(newsId);
  if (!newsContent) {
    return res.status(404).json({ error: 'News not found' });
  }

  res.json({
    success: true,
    message: 'డ్రాఫ్ట్ సేవ్ చేయబడింది / Draft saved successfully!',
    savedAt: new Date().toISOString()
  });
});

// Approve and export
app.post('/api/approve', async (req, res) => {
  const { newsId, format = 'json' } = req.body;

  const newsContent = newsStore.get(newsId);
  if (!newsContent) {
    return res.status(404).json({ error: 'News not found' });
  }

  // Prepare export data
  const exportData = {
    newsId: newsId,
    generatedAt: new Date().toISOString(),
    selectedHeadline: newsContent.headlines.find(h => h.selected)?.text || newsContent.headlines[0].text,
    allHeadlines: newsContent.headlines.map(h => h.text),
    script: newsContent.script,
    hashtags: newsContent.hashtags,
    originalInput: newsContent.originalInput,
    inputType: newsContent.type
  };

  // Determine file extension based on format
  const fileExtensions = {
    json: '.json',
    text: '.txt',
    pdf: '.pdf'
  };

  const formatMessages = {
    json: 'న్యూస్ ప్యాకేజ్ JSON గా ఎగ్జిట్ చేయబడింది / News package exported as JSON!',
    text: 'న్యూస్ ప్యాకేజ్ టెక్స్ట్ గా ఎగ్జిట్ చేయబడింది / News package exported as Text!',
    pdf: 'న్యూస్ ప్యాకేజ్ PDF గా ఎగ్జిట్ చేయబడింది / News package exported as PDF!'
  };

  res.json({
    success: true,
    exportData: exportData,
    format: format,
    message: formatMessages[format] || formatMessages.json,
    downloadFileName: `telugu-news-${newsId}${fileExtensions[format] || '.json'}`
  });
});

app.listen(PORT, () => {
  console.log(`Telugu News Workstation server running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to start creating Telugu short-news`);
});
