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
  const { newsId } = req.body;

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
    thumbnailChecklist: newsContent.thumbnailChecklist,
    originalInput: newsContent.originalInput,
    inputType: newsContent.type
  };

  res.json({
    success: true,
    exportData: exportData,
    message: 'న్యూస్ ప్యాకేజ్ ఆమోదించబడింది / News package approved and ready for export!',
    downloadFileName: `telugu-news-${newsId}.json`
  });
});

app.listen(PORT, () => {
  console.log(`Telugu News Workstation server running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to start creating Telugu short-news`);
});
