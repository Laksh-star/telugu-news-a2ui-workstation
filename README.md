# Telugu Short-News Creation Workstation

An A2UI-based workstation for creating Telugu short-form news content. This application demonstrates how to use Google's A2UI framework to build agent-driven interfaces.

## Features

### Core Functionality
- **Input Flexibility**: Accept story URLs, transcripts, or notes
- **Input Validation**: Real-time validation with character count and bilingual error messages
- **Multi-Section Interface**: Organized tabs for Headlines, Script, Hashtags, and Thumbnails
- **Selective Regeneration**: Regenerate only specific sections without affecting others
- **Direct Content Editing**: Edit headlines and scripts with live character counters
- **Telugu Language Support**: Full support for Telugu script and content
- **A2UI Protocol**: Built using declarative JSON-based UI generation

### New Features
- ✅ **Input Validation**: Minimum length rules (URL: 10, Transcript: 50, Notes: 30), max 5000 characters
- ✅ **Real-time Character Counter**: Visual feedback with warning/error/valid states
- ✅ **Loading Progress**: 5-stage progress bar with bilingual status messages
- ✅ **Export Formats**: JSON, Text, and PDF export options with format selector
- ✅ **Content Editing**: Edit headlines and scripts directly with auto-save
- ✅ **Thumbnail Generation**: Client-side canvas-based thumbnail creator with customization
  - Background color picker
  - Headline text editor
  - Text color picker
  - Word-wrapping algorithm
  - PNG download functionality

## What Gets Generated

1. **Headlines (హెడ్‌లైన్స్)**: 3 editable Telugu headline options with character counters
2. **15-Second Script (స్క్రిప్ట్)**: Editable Telugu script optimized for 15-second videos
3. **Hashtags (హ్యాష్‌ట్యాగ్స్)**: Social media hashtags in Telugu and English
4. **Thumbnail Generator (థంబ్‌నెయిల్)**: Interactive canvas-based thumbnail creator with real-time preview

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript with custom A2UI renderer
- **Protocol**: A2UI v0.8 specification
- **Language**: Telugu (తెలుగు) + English

## Setup & Installation

```bash
# Install dependencies
npm install

# Start the server
npm start

# For development with auto-reload
npm run dev
```

The application will be available at `http://localhost:3000`

## How It Works

### 1. A2UI Architecture

```
User Input → News Generator → A2UI JSON → Renderer → Interactive UI
```

### 2. Component Structure

The workstation uses these A2UI components:
- **Card**: Container for grouping content
- **Tabs**: Organize different sections
- **Text**: Display headlines, scripts, and labels
- **Button**: Action triggers (Generate, Regenerate, Approve)
- **Checkbox**: Thumbnail checklist items
- **List**: Display hashtags
- **Row/Column**: Layout management

### 3. Selective Regeneration

Each section has its own "Regenerate" button that:
1. Sends a POST request to `/api/regenerate` with section name
2. Agent regenerates only that specific section
3. Returns updated A2UI payload
4. Renderer updates only the changed section

## Sample Input

Try these examples:

**Example 1 (Notes):**
```
Technology breakthrough in AI research by Indian scientists.
New algorithm improves efficiency by 40%.
Developed at IIT Madras.
```

**Example 2 (Transcript):**
```
Breaking news from the tech sector. Indian researchers have developed
a revolutionary AI model that promises to transform healthcare diagnostics.
The team from IISC Bangalore published their findings today.
```

## API Endpoints

### `POST /api/generate`
Generate initial news package
```json
{
  "input": "story content here",
  "type": "url|transcript|notes"
}
```

### `POST /api/regenerate`
Regenerate specific section
```json
{
  "newsId": "1234567890",
  "section": "headlines|script|hashtags"
}
```

### `POST /api/update-headlines`
Update headlines with edited content
```json
{
  "newsId": "1234567890",
  "headlines": ["Headline 1", "Headline 2", "Headline 3"]
}
```

### `POST /api/update-script`
Update script with edited content
```json
{
  "newsId": "1234567890",
  "scriptText": "Updated Telugu script text"
}
```

### `POST /api/save`
Save current draft
```json
{
  "newsId": "1234567890"
}
```

### `POST /api/approve`
Approve and export news package with format selection
```json
{
  "newsId": "1234567890",
  "format": "json|text|pdf"
}
```

## Project Structure

```
telugu-news-workstation/
├── server/
│   ├── index.js              # Express server
│   ├── news-generator.js     # Telugu content generator
│   └── a2ui-generator.js     # A2UI JSON payload builder
├── public/
│   ├── index.html            # Main page
│   ├── styles.css            # UI styling
│   ├── a2ui-renderer.js      # A2UI renderer implementation
│   └── app.js                # Application logic
├── package.json
└── README.md
```

## A2UI Components Used

This demo showcases the following A2UI components:

- ✅ **Card** - Container with elevation and padding
- ✅ **Text** - With hints: h1, h3, h4, body, caption
- ✅ **TextField** - Editable text inputs with multiline support
- ✅ **Button** - With action support (POST, custom handlers) and primary styling
- ✅ **Tabs** - Tabbed interface for organization
- ✅ **Row** - Horizontal layout with distribution options
- ✅ **Column** - Vertical layout
- ✅ **Divider** - Visual separators
- ✅ **Checkbox** - For thumbnail checklist
- ✅ **RadioGroup** - Format selector with Radio components
- ✅ **Radio** - Individual radio button options
- ✅ **Badge** - Status indicators
- ✅ **Icon** - Material Icons support
- ✅ **List** - Scrollable item collection

## Future Enhancements

- [x] ~~Input validation with character limits~~ ✅ **COMPLETED**
- [x] ~~Loading progress indicators~~ ✅ **COMPLETED**
- [x] ~~Export formats (JSON, Text, PDF)~~ ✅ **COMPLETED**
- [x] ~~Direct content editing~~ ✅ **COMPLETED**
- [x] ~~Thumbnail generation~~ ✅ **COMPLETED**
- [ ] Integrate real LLM API (Gemini API ready - see LLM_INTEGRATION_GUIDE.md)
- [ ] Add actual URL scraping capability
- [ ] Add background image upload for thumbnails
- [ ] Add channel logo positioning for thumbnails
- [ ] Add voice-over script timing analysis
- [ ] Export to video editing formats
- [ ] Save drafts to database (MongoDB, PostgreSQL)
- [ ] Multi-language support beyond Telugu (Hindi, Tamil, etc.)
- [ ] User authentication and session management
- [ ] Analytics dashboard for content performance

## Contributing to A2UI

This project uses the A2UI protocol (v0.8). Learn more:
- [A2UI Documentation](https://a2ui.org)
- [GitHub Repository](https://github.com/google/a2ui)
- [Google Developers Blog](https://developers.googleblog.com/en/introducing-a2ui-an-open-project-for-agent-driven-interfaces/)

## License

MIT License - Feel free to use this as a reference for building A2UI applications!

---

**Note**: This is a demonstration project showing how to build an A2UI-based workstation. In production, you would integrate real LLM APIs for content generation and add proper error handling, authentication, and data persistence.
