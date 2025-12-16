# Quickstart Guide

Get the Telugu Short-News Workstation running in 60 seconds!

## 🚀 3 Steps to Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Open Browser
Navigate to: **http://localhost:3000**

---

## ✨ First Use

1. **Enter Content**: Paste a news story, transcript, or notes in the text area
   ```
   Example: India wins cricket series in Australia.
   Team showed exceptional performance with both bat and ball.
   ```

2. **Select Type**: Choose URL, Transcript, or Notes

3. **Click Generate**: Press "🚀 Generate News Package"

4. **Wait 1 second**: Watch the loading animation

5. **Explore Tabs**:
   - **Headlines**: See 3 Telugu headline options
   - **Script**: Read the 15-second Telugu script
   - **Hashtags**: View social media hashtags
   - **Thumbnail**: Check the thumbnail checklist

6. **Try Regeneration**: Click any "🔄 Regenerate" button to refresh that section only

7. **Approve**: Click "Approve & Export" when satisfied

---

## 🎯 Sample Inputs to Try

### Technology News
```
Artificial Intelligence breakthrough by Indian researchers.
New algorithm improves efficiency by 40%.
```

### Sports News
```
India wins historic cricket match.
Captain leads team to victory.
```

### Cultural News
```
Sankranti festival celebrations begin across Telugu states.
Traditional events and cultural programs organized.
```

---

## 📚 Documentation

- **[README.md](README.md)** - Complete project overview
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and data flow
- **[DEMO_EXAMPLES.md](DEMO_EXAMPLES.md)** - More sample inputs
- **[LLM_INTEGRATION_GUIDE.md](LLM_INTEGRATION_GUIDE.md)** - Connect real AI APIs
- **[CLAUDE.md](CLAUDE.md)** - Developer guide for Claude Code

---

## 🛠️ Project Structure

```
telugu-news-workstation/
├── server/              # Backend
│   ├── index.js        # Express API
│   ├── news-generator.js    # Content creation
│   └── a2ui-generator.js    # UI JSON builder
├── public/              # Frontend
│   ├── index.html      # Main page
│   ├── a2ui-renderer.js     # A2UI renderer
│   ├── app.js          # App logic
│   └── styles.css      # Styling
└── docs/                # Documentation
```

---

## 🔧 Common Issues

### Port Already in Use
```bash
# Kill existing process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Browser Not Showing UI
1. Check browser console for errors (F12)
2. Verify server is running: `http://localhost:3000/api/generate` should respond
3. Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

---

## 🎨 What Makes This Special?

### A2UI Protocol
This project demonstrates Google's A2UI framework:
- ✅ **Declarative**: UI described as JSON, not code
- ✅ **Safe**: No JavaScript execution from agent
- ✅ **Cross-platform**: Same JSON works on web, mobile, desktop
- ✅ **Agent-driven**: LLMs can generate complete UIs

### Selective Regeneration
Unlike typical LLM apps that regenerate everything:
- ✅ Regenerate only headlines while keeping script intact
- ✅ Refresh hashtags without touching other content
- ✅ Each section independent and controllable

### Telugu Language
- ✅ Native Telugu script support
- ✅ Bilingual UI (Telugu + English)
- ✅ Culturally appropriate content

---

## 📈 Next Steps

### For Developers
1. Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand design
2. Explore [LLM_INTEGRATION_GUIDE.md](LLM_INTEGRATION_GUIDE.md) to add real AI
3. Check [CLAUDE.md](CLAUDE.md) for development patterns

### For Content Creators
1. Try different story types (tech, sports, culture, business)
2. Experiment with regeneration combinations
3. Use checklist to track thumbnail creation workflow

### For A2UI Learners
1. Inspect A2UI JSON in browser Network tab
2. See how components map to DOM in a2ui-renderer.js
3. Modify a2ui-generator.js to change UI layout

---

## 🌟 Features Showcase

| Feature | Location | Try It |
|---------|----------|--------|
| Tabbed Interface | Headlines/Script/Hashtags tabs | Click between tabs |
| Selective Regen | Each tab has Regenerate button | Click to refresh section |
| Bilingual UI | All labels | See Telugu + English |
| A2UI Components | Entire workstation | Inspect JSON in Network tab |
| Responsive Design | Mobile support | Resize browser window |

---

## 💡 Pro Tips

1. **Regenerate Multiple Times**: Each click gives different variations
2. **Mix and Match**: Regenerate headlines 3 times, pick best, then finalize script
3. **Check Console**: Browser console shows A2UI JSON payloads
4. **Network Tab**: See POST requests and A2UI responses
5. **Edit Code Live**: Changes to server files auto-reload with `npm run dev`

---

## 🎓 Learning Path

### Beginner
1. ✅ Run the app
2. ✅ Try sample inputs
3. ✅ Understand UI sections

### Intermediate
1. ✅ Read ARCHITECTURE.md
2. ✅ Modify Telugu templates in news-generator.js
3. ✅ Change UI layout in a2ui-generator.js

### Advanced
1. ✅ Integrate real LLM (see LLM_INTEGRATION_GUIDE.md)
2. ✅ Add new A2UI components
3. ✅ Implement streaming responses
4. ✅ Add database persistence

---

## 📞 Resources

- **A2UI Docs**: https://a2ui.org
- **A2UI GitHub**: https://github.com/google/a2ui
- **Telugu Font**: Noto Sans Telugu (auto-loaded)

---

## ⚡ Speed Run (For Experts)

```bash
git clone <repo>
cd telugu-news-workstation
npm install && npm start
# Browser: localhost:3000
# Input: "India launches new satellite"
# Click: Generate → Explore tabs → Regenerate sections → Done
```

---

**Ready to create Telugu short-news? Start the server and open your browser!**

```bash
npm start
# → http://localhost:3000
```
