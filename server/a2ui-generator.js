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
        children: createThumbnailSection(newsContent.thumbnailChecklist)
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
              body: { newsId }
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

  // Display each headline option with radio buttons
  headlines.forEach((headline, index) => {
    components.push({
      id: getId(),
      type: 'Card',
      children: [
        {
          id: getId(),
          type: 'Row',
          distribution: 'spaceBetween',
          children: [
            {
              id: getId(),
              type: 'Column',
              weight: 1,
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
                  id: getId(),
                  type: 'Text',
                  text: headline.text,
                  hint: 'h4'
                }
              ]
            },
            {
              id: getId(),
              type: 'Radio',
              name: 'headline-selection',
              value: headline.id,
              checked: headline.selected,
              label: ''
            }
          ]
        }
      ]
    });
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
        text: 'హెడ్‌లైన్స్ రీజెనరేట్ చేయండి / Regenerate Headlines',
        action: {
          type: 'post',
          url: '/api/regenerate',
          body: { newsId, section: 'headlines' }
        }
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
        id: getId(),
        type: 'TextField',
        label: 'స్క్రిప్ట్ (Edit if needed):',
        value: script.text,
        multiline: true,
        rows: 5
      },
      {
        id: getId(),
        type: 'Divider'
      },
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
    type: 'List',
    children: hashtags.map(tag => ({
      id: getId(),
      type: 'Text',
      text: tag,
      hint: 'body'
    }))
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

function createThumbnailSection(checklist) {
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
        text: 'థంబ్‌నెయిల్ చెక్‌లిస్ట్:',
        hint: 'h3'
      },
      {
        id: getId(),
        type: 'Badge',
        text: `${checklist.filter(i => i.checked).length}/${checklist.length} Complete`,
        variant: checklist.every(i => i.checked) ? 'success' : 'warning'
      }
    ]
  });

  // Thumbnail preview placeholder
  components.push({
    id: getId(),
    type: 'Card',
    children: [
      {
        id: getId(),
        type: 'Text',
        text: 'థంబ్‌నెయిల్ ప్రివ్యూ / Thumbnail Preview:',
        hint: 'caption'
      },
      {
        id: getId(),
        type: 'Image',
        url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"%3E%3Crect fill="%23667eea" width="640" height="360"/%3E%3Ctext x="320" y="180" text-anchor="middle" fill="white" font-size="24" font-family="Arial"%3EThumbnail Preview%3C/text%3E%3C/svg%3E',
        alt: 'Thumbnail preview placeholder',
        width: '100%'
      }
    ]
  });

  // Progress bar for completion
  const completionPercentage = (checklist.filter(i => i.checked).length / checklist.length) * 100;
  components.push({
    id: getId(),
    type: 'ProgressBar',
    label: 'థంబ్‌నెయిల్ పూర్తి స్థాయి / Completion Progress:',
    value: completionPercentage,
    showValue: true
  });

  // Checklist
  components.push({
    id: getId(),
    type: 'Card',
    children: checklist.map(item => ({
      id: getId(),
      type: 'Row',
      children: [
        {
          id: getId(),
          type: 'Checkbox',
          value: item.checked,
          label: item.label
        },
        item.checked ? {
          id: getId(),
          type: 'Icon',
          name: 'check_circle',
          color: '#4caf50'
        } : null
      ].filter(Boolean)
    }))
  });

  return components;
}
