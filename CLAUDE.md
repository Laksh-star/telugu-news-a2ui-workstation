# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Telugu Short-News Creation Workstation** built using Google's A2UI framework (v0.8). It demonstrates an agent-driven interface where LLMs generate declarative JSON UI payloads that are safely rendered in the browser.

**Core Concept**: Input a story (URL/transcript/notes) → LLM generates Telugu news content → A2UI JSON describes the workstation UI → Custom renderer displays interactive interface → User can selectively regenerate sections.

## Commands

### Development
```bash
# Start server (production mode)
npm start

# Start server with auto-reload (development)
npm run dev

# Install dependencies
npm install
```

### Testing the Application
1. Start server: `npm start`
2. Open browser: `http://localhost:3000`
3. Enter sample input in the text area
4. Click "Generate News Package"
5. Use "Regenerate" buttons to refresh individual sections

## Architecture

### High-Level Flow
```
Client Browser ←→ Express Server ←→ News Generator ←→ A2UI Generator
     ↓                                      ↓                ↓
A2UI Renderer                    Telugu Content       JSON Payload
```

### Key Architecture Patterns

**1. Declarative UI Generation (A2UI Protocol)**
- Server generates JSON describing UI structure, not HTML
- Client-side renderer maps A2UI components to DOM elements
- Security: No code execution, only data interpretation
- Benefits: Agent can modify UI without security risks

**2. Selective Regeneration Pattern**
```javascript
// Each section has independent regenerate endpoint
POST /api/regenerate { newsId, section: 'headlines'|'script'|'hashtags' }

// Server regenerates only that section
// Returns full A2UI payload with updated content
// Renderer re-renders entire UI (could be optimized to partial updates)
```

**3. Component-Based A2UI Structure**
All UI is described using A2UI component types:
- Layout: Card, Row, Column, Tabs
- Display: Text (with hints: h1-h5, body, caption)
- Interactive: Button (with actions), Checkbox
- Organizational: Divider, List

### File Structure & Responsibilities

**Server Side** (`/server/`)
- `index.js`: Express server, API endpoints, session management
- `news-generator.js`: Simulates LLM content generation (replace with real API)
- `a2ui-generator.js`: Builds A2UI JSON payloads from content

**Client Side** (`/public/`)
- `index.html`: Basic page structure, input form
- `a2ui-renderer.js`: A2UI → DOM renderer (core rendering logic)
- `app.js`: Application logic, API communication
- `styles.css`: All styling for both static and A2UI components

### Data Flow Details

**Initial Generation:**
1. User submits input → `POST /api/generate`
2. `news-generator.js` creates content object with headlines, script, hashtags, checklist
3. `a2ui-generator.js` transforms content into A2UI JSON structure
4. Response includes both `surface` (UI components) and `dataModel` (content data)
5. Client's `A2UIRenderer.render()` converts JSON to DOM

**Regeneration:**
1. User clicks "Regenerate Headlines" button
2. Button's `action: { type: 'post', url: '/api/regenerate', body: {...} }`
3. Server regenerates only headlines section
4. Returns updated A2UI payload
5. Renderer rebuilds entire UI (preserves other sections from dataModel)

### A2UI Component Mapping

The renderer implements these A2UI components:

```javascript
// Layout Components
Card    → <div class="a2ui-card"> with shadow/padding
Row     → <div class="a2ui-row"> with flexbox
Column  → <div class="a2ui-column"> with flex-direction: column

// Display Components
Text    → <div class="a2ui-text-{hint}"> where hint = h1|h3|h4|body|caption
Divider → <hr class="a2ui-divider">

// Interactive Components
Button  → <button class="a2ui-button"> with click handler
Checkbox → <label><input type="checkbox"></label>

// Container Components
Tabs → Custom implementation with .a2ui-tabs-header + .a2ui-tab-content
List → <div class="a2ui-list"> with children
```

**Important**: The renderer in `a2ui-renderer.js` is a simplified custom implementation, not the official A2UI Lit renderer. For production, consider using official renderers from [google/a2ui](https://github.com/google/a2ui).

## Adding New Features

### To Add a New Section (e.g., "Video Preview")

1. **Update `news-generator.js`**:
   ```javascript
   videoPreview: {
     duration: '15s',
     aspectRatio: '9:16',
     thumbnailUrl: '...'
   }
   ```

2. **Update `a2ui-generator.js`**:
   ```javascript
   // Add new tab in createWorkstationUI()
   {
     id: getId(),
     type: 'Tab',
     label: 'వీడియో / Video',
     children: createVideoSection(newsId, newsContent.videoPreview)
   }

   // Create new section function
   function createVideoSection(newsId, videoData) { ... }
   ```

3. **No changes needed** to renderer (unless using new component types)

### To Add a New A2UI Component Type

1. **Add renderer** in `a2ui-renderer.js`:
   ```javascript
   this.componentRenderers = {
     ...existing,
     NewComponent: this.renderNewComponent.bind(this)
   };

   renderNewComponent(component) {
     const element = document.createElement('div');
     // Build DOM element
     return element;
   }
   ```

2. **Add styles** in `styles.css`:
   ```css
   .a2ui-newcomponent { ... }
   ```

### To Integrate Real LLM API

Replace mock generation in `news-generator.js`:

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateTeluguNews(input, type, section) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Generate Telugu short news content from: ${input}
    Output JSON with: headlines (3 options), script (15sec), hashtags (8 tags)`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
```

## Telugu Language Support

- All UI labels are bilingual: Telugu / English
- Content generation produces native Telugu script
- Font stack includes 'Noto Sans Telugu' for proper rendering
- Example Telugu text in codebase uses proper Unicode encoding

## A2UI Protocol Notes

**Version**: This project targets A2UI v0.8 (Public Preview)

**Message Types** (not all implemented here):
1. Surface Updates - UI component descriptions (✅ implemented)
2. Data Model Updates - Separate data from UI (✅ via dataModel)
3. Rendering Signals - beginRendering messages (❌ not needed for simple case)

**Component Properties**:
- All components require unique `id`
- Layout children support `weight` for flex-grow
- Text supports `hint` for semantic styling
- Buttons support `action` objects with `type`, `url`, `body`

**Security Model**:
- No JavaScript code in JSON
- Client controls component catalog
- Agent can only request pre-approved components

## Common Development Patterns

**Pattern 1: Adding Content to Existing Section**
- Modify the content object in `news-generator.js`
- Update the corresponding `create*Section()` in `a2ui-generator.js`
- A2UI component structure auto-renders via existing renderer

**Pattern 2: Changing UI Layout**
- Only modify `a2ui-generator.js` component structure
- Use Row/Column for layout, Card for grouping
- distribution: 'spaceBetween'|'end'|'center' for Row alignment

**Pattern 3: Interactive Actions**
- Add `action` property to Button components
- Handler in `a2ui-renderer.js` → `handleAction()` method
- POST to API endpoint, receive new A2UI payload, re-render

## Known Limitations

1. **In-Memory Storage**: News data stored in Map (lost on server restart)
   - For production: Use database (MongoDB, PostgreSQL, etc.)

2. **Mock Content Generation**: Currently uses templates
   - Replace with real LLM API calls

3. **Full UI Re-render**: Regenerating one section re-renders all tabs
   - Could optimize to update only changed components

4. **No Authentication**: Anyone can access/generate
   - Add auth middleware for production

5. **No URL Scraping**: Input type 'url' not actually scraped
   - Implement web scraping or use LLM vision capabilities

## References

- [A2UI Official Docs](https://a2ui.org)
- [A2UI GitHub](https://github.com/google/a2ui)
- [A2UI Component Reference](https://a2ui.org/reference/components/)
