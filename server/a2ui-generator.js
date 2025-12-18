/**
 * A2UI JSON Generator for Telugu News Workstation
 * Generates declarative A2UI payloads following the A2UI v0.8 specification
 */

export function createWorkstationUI(newsId, newsContent) {
  const components = [];
  let componentId = 0;

  const getId = () => `c${componentId++}`;

  // Header Section
  components.push({
    id: getId(),
    type: 'Card',
    children: [
      {
        id: getId(),
        type: 'Text',
        text: 'తెలుగు షార్ట్-న్యూస్ వర్క్‌స్టేషన్',
        hint: 'h1'
      },
      {
        id: getId(),
        type: 'Text',
        text: 'Telugu Short-News Creation Workstation',
        hint: 'caption'
      },
      {
        id: getId(),
        type: 'Divider'
      }
    ]
  });

  // Tabbed Interface for different sections
  const tabsId = getId();
  components.push({
    id: tabsId,
    type: 'Tabs',
    children: [
      // Headlines Tab
      {
        id: getId(),
        type: 'Tab',
        label: 'హెడ్‌లైన్స్ / Headlines',
        children: createHeadlinesSection(newsId, newsContent.headlines)
      },
      // Script Tab
      {
        id: getId(),
        type: 'Tab',
        label: '15-సెకన్ల స్క్రిప్ట్ / Script',
        children: createScriptSection(newsId, newsContent.script)
      },
      // Hashtags Tab
      {
        id: getId(),
        type: 'Tab',
        label: 'హ్యాష్‌ట్యాగ్స్ / Hashtags',
        children: createHashtagsSection(newsId, newsContent.hashtags)
      },
      // Thumbnail Tab
      {
        id: getId(),
        type: 'Tab',
        label: 'థంబ్‌నెయిల్ / Thumbnail',
        children: createThumbnailSection(
          newsContent.headlines.find(h => h.selected)?.text || newsContent.headlines[0].text
        )
      }
    ]
  });

  // Approval Actions
  components.push({
    id: getId(),
    type: 'Card',
    children: [
      {
        id: getId(),
        type: 'Divider'
      },
      {
        id: getId(),
        type: 'Text',
        hint: 'h4',
        text: 'ఎగ్జిట్ ఫార్మాట్ / Export Format'
      },
      {
        id: getId(),
        type: 'RadioGroup',
        name: 'exportFormat',
        children: [
          {
            id: getId(),
            type: 'Radio',
            label: 'JSON (స్ట్రక్చర్డ్ డేటా / Structured Data)',
            value: 'json',
            checked: true
          },
          {
            id: getId(),
            type: 'Radio',
            label: 'Text (టెక్స్ట్ ఫైల్ / Plain Text)',
            value: 'text'
          },
          {
            id: getId(),
            type: 'Radio',
            label: 'PDF (డాక్యుమెంట్ / Document)',
            value: 'pdf'
          }
        ]
      },
      {
        id: getId(),
        type: 'Row',
        distribution: 'end',
        children: [
          {
            id: getId(),
            type: 'Button',
            text: 'డ్రాఫ్ట్ సేవ్ చేయండి / Save Draft',
            action: {
              type: 'post',
              url: '/api/save',
              body: { newsId }
            }
          },
          {
            id: getId(),
            type: 'Button',
            text: 'ఆమోదించండి & ఎగ్జిట్ / Approve & Export',
            primary: true,
            action: {
              type: 'post',
              url: '/api/approve',
              body: { newsId, format: 'json' }
            }
          }
        ]
      }
    ]
  });

  // Create the complete A2UI message
  return {
    surface: {
      id: 'main',
      components: components
    },
    dataModel: {
      newsId: newsId,
      content: newsContent
    }
  };
}

function createHeadlinesSection(newsId, headlines) {
  const components = [];
  let componentId = 100;
  const getId = () => `h${componentId++}`;

  // Header with icon and badge
  components.push({
    id: getId(),
    type: 'Row',
    children: [
      {
        id: getId(),
        type: 'Icon',
        name: 'title',
        color: '#667eea',
        size: '28px'
      },
      {
        id: getId(),
        type: 'Text',
        text: 'హెడ్‌లైన్ ఆప్షన్స్ ఎంచుకోండి:',
        hint: 'h3'
      },
      {
        id: getId(),
        type: 'Badge',
        text: `${headlines.length} Options`,
        variant: 'primary'
      }
    ]
  });

  // Display each headline option with editable text fields
  headlines.forEach((headline, index) => {
    components.push({
      id: getId(),
      type: 'Card',
      children: [
        {
          id: getId(),
          type: 'Row',
          children: [
            {
              id: getId(),
              type: 'Text',
              text: `ఆప్షన్ ${index + 1}:`,
              hint: 'caption'
            },
            headline.selected ? {
              id: getId(),
              type: 'Badge',
              text: 'Selected',
              variant: 'success'
            } : null
          ].filter(Boolean)
        },
        {
          id: `headline-${index}`,
          type: 'TextField',
          value: headline.text,
          placeholder: 'Edit headline...'
        },
        {
          id: getId(),
          type: 'Row',
          distribution: 'spaceBetween',
          children: [
            {
              id: getId(),
              type: 'Row',
              children: [
                {
                  id: getId(),
                  type: 'Icon',
                  name: 'text_fields',
                  color: '#888',
                  size: '18px'
                },
                {
                  id: getId(),
                  type: 'Text',
                  text: `${headline.text.length} characters`,
                  hint: 'caption'
                }
              ]
            },
            {
              id: getId(),
              type: 'Radio',
              name: 'headline-selection',
              value: headline.id,
              checked: headline.selected,
              label: 'Use this'
            }
          ]
        }
      ]
    });
  });

  // Action buttons
  components.push({
    id: getId(),
    type: 'Row',
    distribution: 'spaceBetween',
    children: [
      {
        id: getId(),
        type: 'Row',
        children: [
          {
            id: getId(),
            type: 'Icon',
            name: 'save',
            color: '#4caf50'
          },
          {
            id: getId(),
            type: 'Button',
            text: 'హెడ్‌లైన్స్ సేవ్ చేయండి / Save Headlines',
            action: {
              type: 'post',
              url: '/api/update-headlines',
              body: { newsId }
            }
          }
        ]
      },
      {
        id: getId(),
        type: 'Row',
        children: [
          {
            id: getId(),
            type: 'Icon',
            name: 'refresh',
            color: '#667eea'
          },
          {
            id: getId(),
            type: 'Button',
            text: 'రీజెనరేట్ / Regenerate',
            action: {
              type: 'post',
              url: '/api/regenerate',
              body: { newsId, section: 'headlines' }
            }
          }
        ]
      }
    ]
  });

  return components;
}

function createScriptSection(newsId, script) {
  const components = [];
  let componentId = 200;
  const getId = () => `s${componentId++}`;

  // Header with icon
  components.push({
    id: getId(),
    type: 'Row',
    children: [
      {
        id: getId(),
        type: 'Icon',
        name: 'description',
        color: '#667eea',
        size: '28px'
      },
      {
        id: getId(),
        type: 'Text',
        text: '15-సెకన్ల వీడియో స్క్రిప్ట్:',
        hint: 'h3'
      }
    ]
  });

  // Script text display (editable)
  components.push({
    id: getId(),
    type: 'Card',
    children: [
      {
        id: 'script-editor',
        type: 'TextField',
        label: 'స్క్రిప్ట్ / Script (Editable):',
        placeholder: 'Edit your script here...',
        value: script.text,
        multiline: true,
        rows: 6
      },
      {
        id: getId(),
        type: 'Text',
        text: '💡 Tip: Keep it conversational and within 15 seconds for best results',
        hint: 'caption'
      },
      {
        id: getId(),
        type: 'Divider'
      },
      {
        id: getId(),
        type: 'Row',
        distribution: 'spaceBetween',
        children: [
          {
            id: getId(),
            type: 'Row',
            children: [
              {
                id: getId(),
                type: 'Icon',
                name: 'timer',
                color: '#888'
              },
              {
                id: getId(),
                type: 'Text',
                text: `వ్యవధి: ${script.duration}`,
                hint: 'caption'
              },
              {
                id: getId(),
                type: 'Icon',
                name: 'article',
                color: '#888'
              },
              {
                id: getId(),
                type: 'Text',
                text: `పదాల సంఖ్య: ${script.wordCount}`,
                hint: 'caption'
              }
            ]
          },
          {
            id: getId(),
            type: 'Button',
            text: 'స్క్రిప్ట్ సేవ్ చేయండి / Save Script',
            action: {
              type: 'post',
              url: '/api/update-script',
              body: { newsId }
            }
          }
        ]
      }
    ]
  });

  // Duration slider
  components.push({
    id: getId(),
    type: 'Slider',
    label: 'స్క్రిప్ట్ వ్యవధి సర్దుబాటు / Adjust Duration:',
    min: 10,
    max: 20,
    value: 15,
    unit: ' సెకన్లు'
  });

  // Word count progress bar
  const wordCountPercentage = Math.min((script.wordCount / 60) * 100, 100);
  components.push({
    id: getId(),
    type: 'ProgressBar',
    label: 'పదాల సంఖ్య లక్ష్యం (Target: 40-50 words):',
    value: wordCountPercentage,
    showValue: true
  });

  // Regenerate button with icon
  components.push({
    id: getId(),
    type: 'Row',
    children: [
      {
        id: getId(),
        type: 'Icon',
        name: 'refresh',
        color: '#667eea'
      },
      {
        id: getId(),
        type: 'Button',
        text: 'స్క్రిప్ట్ రీజెనరేట్ చేయండి / Regenerate Script',
        action: {
          type: 'post',
          url: '/api/regenerate',
          body: { newsId, section: 'script' }
        }
      }
    ]
  });

  return components;
}

function createHashtagsSection(newsId, hashtags) {
  const components = [];
  let componentId = 300;
  const getId = () => `t${componentId++}`;

  components.push({
    id: getId(),
    type: 'Text',
    text: 'సోషల్ మీడియా హ్యాష్‌ట్యాగ్స్:',
    hint: 'h3'
  });

  components.push({
    id: getId(),
    type: 'Card',
    children: [
      {
        id: getId(),
        type: 'Text',
        text: hashtags.join(' '),
        hint: 'body'
      }
    ]
  });

  components.push({
    id: getId(),
    type: 'Button',
    text: '🔄 హ్యాష్‌ట్యాగ్స్ రీజెనరేట్ చేయండి / Regenerate Hashtags',
    action: {
      type: 'post',
      url: '/api/regenerate',
      body: { newsId, section: 'hashtags' }
    }
  });

  return components;
}

function createThumbnailSection(selectedHeadline) {
  const components = [];
  let componentId = 400;
  const getId = () => `th${componentId++}`;

  // Header with icon
  components.push({
    id: getId(),
    type: 'Row',
    children: [
      {
        id: getId(),
        type: 'Icon',
        name: 'image',
        color: '#667eea',
        size: '28px'
      },
      {
        id: getId(),
        type: 'Text',
        text: 'థంబ్‌నెయిల్ జనరేటర్ / Thumbnail Generator:',
        hint: 'h3'
      },
      {
        id: getId(),
        type: 'Badge',
        text: 'Ready',
        variant: 'success'
      }
    ]
  });

  // Thumbnail customization controls
  components.push({
    id: getId(),
    type: 'Card',
    children: [
      {
        id: getId(),
        type: 'Text',
        text: '1️⃣ బ్యాక్‌గ్రౌండ్ కలర్ / Background Color:',
        hint: 'h4'
      },
      {
        id: 'thumbnail-bg-color',
        type: 'TextField',
        placeholder: '#667eea',
        value: '#667eea',
        inputType: 'color'
      },
      {
        id: getId(),
        type: 'Divider'
      },
      {
        id: getId(),
        type: 'Text',
        text: '2️⃣ హెడ్‌లైన్ టెక్స్ట్ / Headline Text:',
        hint: 'h4'
      },
      {
        id: 'thumbnail-headline',
        type: 'TextField',
        value: selectedHeadline,
        multiline: true,
        rows: 2,
        placeholder: 'Enter headline for thumbnail...'
      },
      {
        id: getId(),
        type: 'Divider'
      },
      {
        id: getId(),
        type: 'Text',
        text: '3️⃣ టెక్స్ట్ కలర్ / Text Color:',
        hint: 'h4'
      },
      {
        id: 'thumbnail-text-color',
        type: 'TextField',
        placeholder: '#ffffff',
        value: '#ffffff',
        inputType: 'color'
      }
    ]
  });

  // Thumbnail preview with canvas
  components.push({
    id: getId(),
    type: 'Card',
    children: [
      {
        id: getId(),
        type: 'Text',
        text: '📸 ప్రివ్యూ / Preview (9:16 aspect ratio for shorts):',
        hint: 'h4'
      },
      {
        id: getId(),
        type: 'Text',
        text: 'Canvas preview will be rendered here',
        hint: 'caption'
      }
    ]
  });

  // Generate and download buttons
  components.push({
    id: getId(),
    type: 'Row',
    distribution: 'end',
    children: [
      {
        id: getId(),
        type: 'Button',
        text: '🎨 థంబ్‌నెయిల్ జనరేట్ చేయండి / Generate Thumbnail',
        primary: true,
        action: {
          type: 'custom',
          handler: 'generateThumbnail'
        }
      },
      {
        id: getId(),
        type: 'Button',
        text: '💾 డౌన్‌లోడ్ / Download',
        action: {
          type: 'custom',
          handler: 'downloadThumbnail'
        }
      }
    ]
  });

  // Status message area
  components.push({
    id: getId(),
    type: 'Card',
    children: [
      {
        id: 'thumbnail-status',
        type: 'Text',
        text: 'రెడీ / Ready to generate thumbnail',
        hint: 'body'
      }
    ]
  });

  return components;
}
