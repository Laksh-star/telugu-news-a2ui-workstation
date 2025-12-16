# Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│                                                                  │
│  ┌──────────────┐         ┌─────────────────────────────────┐  │
│  │ Input Form   │────────▶│   A2UI Renderer                 │  │
│  │ - URL        │         │   (a2ui-renderer.js)            │  │
│  │ - Transcript │         │                                 │  │
│  │ - Notes      │         │   Converts A2UI JSON to DOM     │  │
│  └──────────────┘         └─────────────────────────────────┘  │
│         │                              ▲                        │
│         │ POST /api/generate           │ A2UI JSON Payload      │
│         ▼                              │                        │
└─────────────────────────────────────────────────────────────────┘
          │                              │
          │                              │
┌─────────────────────────────────────────────────────────────────┐
│                     EXPRESS SERVER (Node.js)                     │
│                                                                  │
│  ┌──────────────────────┐                                       │
│  │  API Endpoints       │                                       │
│  │  (server/index.js)   │                                       │
│  │                      │                                       │
│  │  POST /api/generate  │──────┐                                │
│  │  POST /api/regenerate│      │                                │
│  │  POST /api/approve   │      │                                │
│  └──────────────────────┘      │                                │
│           │                    │                                │
│           ▼                    ▼                                │
│  ┌──────────────────┐   ┌─────────────────────────┐           │
│  │  News Generator  │   │  A2UI Generator         │           │
│  │                  │   │                         │           │
│  │  Generates:      │──▶│  Creates A2UI JSON:     │           │
│  │  - Headlines     │   │  - Card components      │           │
│  │  - Script        │   │  - Tabs structure       │───────────┤
│  │  - Hashtags      │   │  - Button actions       │           │
│  │  - Checklist     │   │  - Text elements        │           │
│  └──────────────────┘   └─────────────────────────┘           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  In-Memory Store (Map)                                   │  │
│  │  newsId → { headlines, script, hashtags, checklist }     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Initial Generation

```
1. User Input
   ↓
2. Browser sends POST /api/generate
   {
     "input": "story content...",
     "type": "notes"
   }
   ↓
3. news-generator.js creates content
   {
     headlines: [3 options],
     script: { text, duration, wordCount },
     hashtags: [8 tags],
     thumbnailChecklist: [5 items]
   }
   ↓
4. a2ui-generator.js transforms to A2UI
   {
     surface: {
       components: [Card, Tabs, Button, ...]
     },
     dataModel: {
       newsId: "123",
       content: {...}
     }
   }
   ↓
5. Browser receives A2UI JSON
   ↓
6. A2UIRenderer.render() creates DOM
   ↓
7. User sees interactive workstation
```

## Data Flow: Selective Regeneration

```
1. User clicks "Regenerate Headlines" button
   ↓
2. Button has action:
   {
     type: 'post',
     url: '/api/regenerate',
     body: { newsId: '123', section: 'headlines' }
   }
   ↓
3. a2ui-renderer.js handleAction() sends POST
   ↓
4. Server retrieves stored content from Map
   ↓
5. news-generator.js regenerates ONLY headlines
   ↓
6. Server updates newsStore with new headlines
   ↓
7. a2ui-generator.js creates FULL A2UI payload
   (with new headlines, old script/hashtags)
   ↓
8. Browser receives updated A2UI JSON
   ↓
9. A2UIRenderer.render() rebuilds entire UI
   ↓
10. User sees new headlines, same script/hashtags
```

## Component Hierarchy

```
Surface (main)
└── Components[]
    ├── Card (Header)
    │   ├── Text (h1) - "తెలుగు షార్ట్-న్యూస్ వర్క్‌స్టేషన్"
    │   ├── Text (caption) - "Telugu Short-News Creation..."
    │   └── Divider
    │
    ├── Tabs
    │   ├── Tab (Headlines)
    │   │   ├── Text (h3) - "హెడ్‌లైన్ ఆప్షన్స్..."
    │   │   ├── Card (Option 1)
    │   │   │   └── Row
    │   │   │       ├── Column
    │   │   │       │   ├── Text (caption) - "ఆప్షన్ 1:"
    │   │   │       │   └── Text (h4) - Headline text
    │   │   │       └── Checkbox
    │   │   ├── Card (Option 2)
    │   │   ├── Card (Option 3)
    │   │   └── Button - "Regenerate Headlines"
    │   │
    │   ├── Tab (Script)
    │   │   ├── Text (h3)
    │   │   ├── Card
    │   │   │   ├── Text (body) - Script content
    │   │   │   ├── Divider
    │   │   │   └── Row
    │   │   │       ├── Text - "⏱️ వ్యవధి..."
    │   │   │       └── Text - "📝 పదాల సంఖ్య..."
    │   │   └── Button - "Regenerate Script"
    │   │
    │   ├── Tab (Hashtags)
    │   │   ├── Text (h3)
    │   │   ├── Card
    │   │   │   └── Text - All hashtags
    │   │   ├── List
    │   │   │   └── Text[] - Individual hashtags
    │   │   └── Button - "Regenerate Hashtags"
    │   │
    │   └── Tab (Thumbnail)
    │       ├── Text (h3)
    │       └── Card
    │           └── Row[]
    │               └── Checkbox - Each checklist item
    │
    └── Card (Actions)
        ├── Divider
        └── Row (distribution: end)
            ├── Button - "Save Draft"
            └── Button (primary) - "Approve & Export"
```

## A2UI Rendering Process

```
A2UI JSON Component
        ↓
A2UIRenderer.renderComponent()
        ↓
Switch on component.type
        ↓
    ┌───┴───┬────────┬─────────┬──────────┐
    ↓       ↓        ↓         ↓          ↓
  Card    Text    Button    Tabs       Row
    ↓       ↓        ↓         ↓          ↓
createElement('div')  ...etc...
    ↓
Set className, id, attributes
    ↓
Recursively render children
    ↓
Attach event listeners (for Buttons, Checkboxes)
    ↓
Return DOM element
    ↓
Append to parent container
    ↓
RENDERED IN BROWSER
```

## Security Model

```
Traditional Agent UI (Dangerous):
Agent → Generates JavaScript Code → Browser Executes
                                        ↑
                                   SECURITY RISK
                                   (Code injection,
                                    XSS, etc.)

A2UI Protocol (Safe):
Agent → Generates JSON Data → Browser Interprets
                                       ↑
                                  SAFE
                                  (Only pre-approved
                                   components rendered)
```

## Key Architectural Decisions

### 1. Why Separate Generator and A2UI Builder?

```
news-generator.js      a2ui-generator.js
(Content Logic)        (UI Logic)
       ↓                      ↓
   Content Data          UI Structure
       ↓                      ↓
     Easy to swap LLM    Easy to change UI
     without touching    without touching
     UI structure        content generation
```

**Benefit**: Separation of concerns. Can switch from mock to real LLM without modifying UI code.

### 2. Why Full Re-render on Regeneration?

**Current Approach**:
```
Regenerate Headlines → Send full A2UI → Re-render everything
```

**Pros**:
- Simple implementation
- No state synchronization issues
- Consistent rendering

**Cons**:
- Less efficient
- Loses UI state (scroll position, tab selection, etc.)

**Future Optimization**:
```
Regenerate Headlines → Send partial A2UI → Update only changed components
```

### 3. Why Custom Renderer Instead of Official A2UI Lit?

**Reasons**:
1. **Educational**: Shows how A2UI protocol works under the hood
2. **Simplicity**: No build tools, no framework dependencies
3. **Customization**: Easy to extend for demo purposes
4. **Lightweight**: Single 200-line JS file vs full framework

**For Production**: Use official renderers:
- Web: [@a2ui/lit](https://www.npmjs.com/package/@a2ui/lit)
- Flutter: [a2ui_flutter](https://pub.dev/packages/a2ui_flutter)
- React: (roadmap)

## Extensibility Points

### Add New Content Section
```
1. Update news-generator.js
   ↓
2. Update a2ui-generator.js
   ↓
3. No renderer changes needed
   (if using existing components)
```

### Add New A2UI Component
```
1. Define component in A2UI JSON
   ↓
2. Add renderer in a2ui-renderer.js
   ↓
3. Add CSS in styles.css
   ↓
4. Use in a2ui-generator.js
```

### Add Real LLM
```
1. Install SDK (e.g., @google/generative-ai)
   ↓
2. Replace generateTeluguNews() implementation
   ↓
3. Keep same return structure
   ↓
4. Zero changes to a2ui-generator or renderer
```

## Performance Considerations

**Current State** (Demo):
- In-memory storage (fast, but not persistent)
- Full UI re-render (simple, but not optimal)
- Synchronous generation (simulated async)

**Production Optimizations**:
- Database for persistence
- Partial UI updates
- Streaming LLM responses
- Caching generated content
- Progressive rendering
- WebSocket for real-time updates

## Comparison: Traditional vs A2UI Approach

### Traditional Agent UI
```
User Input → LLM → HTML String → dangerouslySetInnerHTML()
                                        ↓
                                  Security Issues
                                  No Validation
                                  XSS Vulnerabilities
```

### A2UI Approach
```
User Input → LLM → A2UI JSON → Renderer → Safe DOM
                        ↓              ↓
                   Declarative    Only Approved
                   Data Format    Components
```

**A2UI Benefits**:
- ✅ Security: No code execution
- ✅ Consistency: Same JSON works across platforms
- ✅ Validation: Can validate JSON structure
- ✅ Debugging: Easy to inspect JSON
- ✅ Testing: Can snapshot test JSON payloads
