/**
 * A2UI Simple Web Renderer
 * Renders A2UI JSON payloads into HTML
 */

class A2UIRenderer {
  constructor() {
    this.componentRenderers = {
      Card: this.renderCard.bind(this),
      Text: this.renderText.bind(this),
      Button: this.renderButton.bind(this),
      Row: this.renderRow.bind(this),
      Column: this.renderColumn.bind(this),
      Divider: this.renderDivider.bind(this),
      Tabs: this.renderTabs.bind(this),
      Tab: this.renderTab.bind(this),
      Checkbox: this.renderCheckbox.bind(this),
      List: this.renderList.bind(this),
      Image: this.renderImage.bind(this),
      Icon: this.renderIcon.bind(this),
      TextField: this.renderTextField.bind(this),
      Radio: this.renderRadio.bind(this),
      RadioGroup: this.renderRadioGroup.bind(this),
      Slider: this.renderSlider.bind(this),
      ProgressBar: this.renderProgressBar.bind(this),
      Badge: this.renderBadge.bind(this),
    };
  }

  render(a2uiPayload, container) {
    try {
      // Clear container safely
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      if (!a2uiPayload.surface) {
        console.error('Invalid A2UI payload: missing surface');
        return;
      }

      const components = a2uiPayload.surface.components || [];

      components.forEach(component => {
        const element = this.renderComponent(component);
        if (element) {
          container.appendChild(element);
        }
      });

      // Initialize tabs after rendering
      this.initializeTabs(container);
    } catch (error) {
      console.error('❌ Render error:', error);
      throw error;
    }
  }

  renderComponent(component) {
    try {
      const renderer = this.componentRenderers[component.type];
      if (!renderer) {
        console.warn(`No renderer for component type: ${component.type}`);
        return this.renderFallback(component);
      }

      return renderer(component);
    } catch (error) {
      console.error(`❌ Error rendering component type "${component.type}":`, error);
      console.error('Component data:', component);
      throw error;
    }
  }

  renderCard(component) {
    const card = document.createElement('div');
    card.className = 'a2ui-card';
    card.id = component.id;

    if (component.children) {
      component.children.forEach(child => {
        const childElement = this.renderComponent(child);
        if (childElement) {
          card.appendChild(childElement);
        }
      });
    }

    return card;
  }

  renderText(component) {
    const text = document.createElement('div');
    text.id = component.id;
    text.textContent = component.text || '';

    const hint = component.hint || 'body';
    text.className = `a2ui-text-${hint}`;

    return text;
  }

  renderButton(component) {
    const button = document.createElement('button');
    button.id = component.id;
    button.className = 'a2ui-button';
    button.textContent = component.text || 'Button';

    if (component.primary) {
      button.classList.add('primary');
    }

    if (component.action) {
      button.addEventListener('click', () => {
        this.handleAction(component.action);
      });
    }

    return button;
  }

  renderRow(component) {
    const row = document.createElement('div');
    row.id = component.id;
    row.className = 'a2ui-row';

    if (component.distribution) {
      row.classList.add(component.distribution);
    }

    if (component.children) {
      component.children.forEach(child => {
        const childElement = this.renderComponent(child);
        if (childElement) {
          if (child.weight) {
            childElement.style.flex = child.weight;
          }
          row.appendChild(childElement);
        }
      });
    }

    return row;
  }

  renderColumn(component) {
    const column = document.createElement('div');
    column.id = component.id;
    column.className = 'a2ui-column';

    if (component.weight) {
      column.style.flex = component.weight;
    }

    if (component.children) {
      component.children.forEach(child => {
        const childElement = this.renderComponent(child);
        if (childElement) {
          column.appendChild(childElement);
        }
      });
    }

    return column;
  }

  renderDivider(component) {
    const divider = document.createElement('hr');
    divider.id = component.id;
    divider.className = 'a2ui-divider';
    return divider;
  }

  renderTabs(component) {
    const tabsContainer = document.createElement('div');
    tabsContainer.id = component.id;
    tabsContainer.className = 'a2ui-tabs';

    const tabsHeader = document.createElement('div');
    tabsHeader.className = 'a2ui-tabs-header';

    const tabsContent = document.createElement('div');
    tabsContent.className = 'a2ui-tabs-contents';

    if (component.children) {
      component.children.forEach((tab, index) => {
        // Create tab button
        const tabButton = document.createElement('button');
        tabButton.className = 'a2ui-tab-button';
        if (index === 0) tabButton.classList.add('active');
        tabButton.textContent = tab.label || `Tab ${index + 1}`;
        tabButton.dataset.tabId = tab.id;
        tabsHeader.appendChild(tabButton);

        // Create tab content
        const tabContent = document.createElement('div');
        tabContent.id = tab.id;
        tabContent.className = 'a2ui-tab-content';
        if (index === 0) tabContent.classList.add('active');

        if (tab.children) {
          tab.children.forEach(child => {
            const childElement = this.renderComponent(child);
            if (childElement) {
              tabContent.appendChild(childElement);
            }
          });
        }

        tabsContent.appendChild(tabContent);
      });
    }

    tabsContainer.appendChild(tabsHeader);
    tabsContainer.appendChild(tabsContent);

    return tabsContainer;
  }

  renderTab(component) {
    // Tabs are handled by renderTabs
    return null;
  }

  renderCheckbox(component) {
    const container = document.createElement('label');
    container.className = 'a2ui-checkbox';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = component.id;
    checkbox.checked = component.value || false;

    const label = document.createElement('span');
    label.textContent = component.label || '';

    container.appendChild(checkbox);
    container.appendChild(label);

    return container;
  }

  renderList(component) {
    const list = document.createElement('div');
    list.id = component.id;
    list.className = 'a2ui-list';

    if (component.children) {
      component.children.forEach(child => {
        const childElement = this.renderComponent(child);
        if (childElement) {
          list.appendChild(childElement);
        }
      });
    }

    return list;
  }

  renderImage(component) {
    const img = document.createElement('img');
    img.id = component.id;
    img.className = 'a2ui-image';
    img.src = component.url || component.src || '';
    img.alt = component.alt || '';
    if (component.width) img.style.width = component.width;
    if (component.height) img.style.height = component.height;
    return img;
  }

  renderIcon(component) {
    const icon = document.createElement('span');
    icon.id = component.id;
    icon.className = 'a2ui-icon material-icons';
    icon.textContent = component.name || component.icon || 'info';
    if (component.color) icon.style.color = component.color;
    if (component.size) icon.style.fontSize = component.size;
    return icon;
  }

  renderTextField(component) {
    const container = document.createElement('div');
    container.className = 'a2ui-textfield-container';

    if (component.label) {
      const label = document.createElement('label');
      label.textContent = component.label;
      label.className = 'a2ui-textfield-label';
      container.appendChild(label);
    }

    const input = component.multiline
      ? document.createElement('textarea')
      : document.createElement('input');

    input.id = component.id;
    input.className = 'a2ui-textfield';

    // Only set type for input elements (not textarea)
    if (!component.multiline) {
      input.type = component.inputType || 'text';
    }

    input.placeholder = component.placeholder || '';
    input.value = component.value || '';

    if (component.disabled) input.disabled = true;
    if (component.rows && component.multiline) input.rows = component.rows;

    container.appendChild(input);

    // Add character counter for editable fields (headlines and script)
    if (component.id && (component.id.startsWith('headline-') || component.id === 'script-editor')) {
      const charCounter = document.createElement('div');
      charCounter.className = 'a2ui-textfield-counter';
      charCounter.textContent = `${input.value.length} characters`;

      // Update counter on input
      input.addEventListener('input', () => {
        charCounter.textContent = `${input.value.length} characters`;
      });

      container.appendChild(charCounter);
    }

    return container;
  }

  renderRadio(component) {
    const container = document.createElement('label');
    container.className = 'a2ui-radio';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.id = component.id;
    radio.name = component.name || 'radio-group';
    radio.value = component.value || '';
    radio.checked = component.checked || false;

    const label = document.createElement('span');
    label.textContent = component.label || '';

    container.appendChild(radio);
    container.appendChild(label);

    return container;
  }

  renderRadioGroup(component) {
    const group = document.createElement('div');
    group.id = component.id;
    group.className = 'a2ui-radio-group';

    if (component.label) {
      const groupLabel = document.createElement('div');
      groupLabel.className = 'a2ui-radio-group-label';
      groupLabel.textContent = component.label;
      group.appendChild(groupLabel);
    }

    // Support both 'options' (legacy) and 'children' (A2UI standard)
    const items = component.children || component.options;

    if (items) {
      items.forEach((item, index) => {
        // If item is a Radio component, render it directly
        if (item.type === 'Radio') {
          const radioElement = this.renderRadio({
            ...item,
            name: component.name || component.id
          });
          group.appendChild(radioElement);
        }
        // Legacy support for plain option objects
        else {
          const radio = this.renderRadio({
            id: `${component.id}-option-${index}`,
            name: component.name || component.id,
            label: item.label || item,
            value: item.value || item,
            checked: item.checked || index === 0
          });
          group.appendChild(radio);
        }
      });
    }

    return group;
  }

  renderSlider(component) {
    const container = document.createElement('div');
    container.className = 'a2ui-slider-container';

    if (component.label) {
      const label = document.createElement('label');
      label.textContent = component.label;
      label.className = 'a2ui-slider-label';
      container.appendChild(label);
    }

    const sliderWrapper = document.createElement('div');
    sliderWrapper.className = 'a2ui-slider-wrapper';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = component.id;
    slider.className = 'a2ui-slider';
    slider.min = component.min || 0;
    slider.max = component.max || 100;
    slider.value = component.value || 50;
    slider.step = component.step || 1;

    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'a2ui-slider-value';
    valueDisplay.textContent = slider.value + (component.unit || '');

    slider.addEventListener('input', (e) => {
      valueDisplay.textContent = e.target.value + (component.unit || '');
    });

    sliderWrapper.appendChild(slider);
    sliderWrapper.appendChild(valueDisplay);
    container.appendChild(sliderWrapper);

    return container;
  }

  renderProgressBar(component) {
    const container = document.createElement('div');
    container.id = component.id;
    container.className = 'a2ui-progressbar-container';

    if (component.label) {
      const label = document.createElement('div');
      label.className = 'a2ui-progressbar-label';
      label.textContent = component.label;
      container.appendChild(label);
    }

    const progressBar = document.createElement('div');
    progressBar.className = 'a2ui-progressbar';

    const progressFill = document.createElement('div');
    progressFill.className = 'a2ui-progressbar-fill';
    progressFill.style.width = `${component.value || 0}%`;

    progressBar.appendChild(progressFill);
    container.appendChild(progressBar);

    if (component.showValue) {
      const valueText = document.createElement('div');
      valueText.className = 'a2ui-progressbar-value';
      valueText.textContent = `${component.value || 0}%`;
      container.appendChild(valueText);
    }

    return container;
  }

  renderBadge(component) {
    const badge = document.createElement('span');
    badge.id = component.id;
    badge.className = `a2ui-badge a2ui-badge-${component.variant || 'default'}`;
    badge.textContent = component.text || component.label || '';
    return badge;
  }

  renderFallback(component) {
    const fallback = document.createElement('div');
    fallback.textContent = `[Unsupported component: ${component.type}]`;
    fallback.style.color = '#999';
    fallback.style.fontStyle = 'italic';
    return fallback;
  }

  initializeTabs(container) {
    const tabButtons = container.querySelectorAll('.a2ui-tab-button');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.dataset.tabId;
        const tabsContainer = button.closest('.a2ui-tabs');

        // Remove active class from all buttons and contents
        tabsContainer.querySelectorAll('.a2ui-tab-button').forEach(btn => {
          btn.classList.remove('active');
        });
        tabsContainer.querySelectorAll('.a2ui-tab-content').forEach(content => {
          content.classList.remove('active');
        });

        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        const activeContent = tabsContainer.querySelector(`#${tabId}`);
        if (activeContent) {
          activeContent.classList.add('active');
        }
      });
    });
  }

  async handleAction(action) {
    // Handle custom actions (like thumbnail generation)
    if (action.type === 'custom') {
      if (action.handler === 'generateThumbnail') {
        this.generateThumbnail();
        return;
      } else if (action.handler === 'downloadThumbnail') {
        this.downloadThumbnail();
        return;
      }
    }

    if (action.type === 'post') {
      try {
        console.log('🔄 Action triggered:', action.url, action.body);

        // Get export format if this is an approve action
        let requestBody = { ...action.body };

        if (action.url === '/api/approve') {
          const selectedFormat = document.querySelector('input[name="exportFormat"]:checked');
          if (selectedFormat) {
            requestBody.format = selectedFormat.value;
          }
        }

        // Get edited headlines if this is an update-headlines action
        if (action.url === '/api/update-headlines') {
          const headlineInputs = document.querySelectorAll('[id^="headline-"]');
          const headlines = Array.from(headlineInputs).map(input => input.value);
          requestBody.headlines = headlines;
        }

        // Get edited script if this is an update-script action
        if (action.url === '/api/update-script') {
          const scriptEditor = document.getElementById('script-editor');
          if (scriptEditor) {
            requestBody.scriptText = scriptEditor.value;
          }
        }

        const response = await fetch(action.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        const result = await response.json();
        console.log('📨 Server response:', result);

        if (result.surface) {
          // Re-render with new A2UI payload
          const workstation = document.getElementById('workstation');
          this.render(result, workstation);
        } else if (result.success) {
          // Handle save draft
          if (action.url === '/api/save') {
            console.log('💾 Save draft action');
            this.showNotification(result.message, 'success');
          }
          // Handle update headlines
          else if (action.url === '/api/update-headlines') {
            console.log('💾 Update headlines action');
            this.showNotification(result.message, 'success');
          }
          // Handle update script
          else if (action.url === '/api/update-script') {
            console.log('💾 Update script action');
            this.showNotification(result.message, 'success');
          }
          // Handle approval/export
          else if (action.url === '/api/approve') {
            console.log('✅ Approve action, has exportData:', !!result.exportData);
            this.showNotification(result.message, 'success');
            if (result.exportData) {
              // Download based on format
              if (result.format === 'json') {
                this.downloadJSON(result.exportData, result.downloadFileName);
              } else if (result.format === 'text') {
                this.downloadText(result.exportData, result.downloadFileName);
              } else if (result.format === 'pdf') {
                this.downloadPDF(result.exportData, result.downloadFileName);
              }
            }
          }
          // Generic success
          else {
            this.showNotification(result.message || 'Action completed successfully!', 'success');
          }
        }
      } catch (error) {
        console.error('❌ Action failed:', error);
        this.showNotification('Action failed. Please try again.', 'error');
      }
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-size: 15px;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  downloadJSON(data, filename) {
    try {
      console.log('📥 Downloading JSON:', filename);
      console.log('📄 Export data:', data);

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'telugu-news-export.json';
      link.style.display = 'none';

      document.body.appendChild(link);

      // Trigger download
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('✅ Download triggered successfully');
      }, 100);

    } catch (error) {
      console.error('❌ Download failed:', error);
      this.showNotification('Download failed: ' + error.message, 'error');
    }
  }

  downloadText(data, filename) {
    try {
      console.log('📥 Downloading Text:', filename);

      // Format data as plain text
      let textContent = `Telugu Short-News Package
================================================

Generated At: ${data.generatedAt}
News ID: ${data.newsId}
Input Type: ${data.inputType}

================================================
HEADLINES (హెడ్‌లైన్స్)
================================================

Selected Headline:
${data.selectedHeadline}

All Headlines:
${data.allHeadlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}

================================================
SCRIPT (స్క్రిప్ట్)
================================================

${data.script}

================================================
HASHTAGS (హ్యాష్‌ట్యాగ్స్)
================================================

${data.hashtags.join(' ')}

================================================
THUMBNAIL CHECKLIST (థంబ్‌నైల్ చెక్‌లిస్ట్)
================================================

${data.thumbnailChecklist.map((item, i) => `${item.completed ? '✓' : '☐'} ${i + 1}. ${item.label}`).join('\n')}

================================================
ORIGINAL INPUT
================================================

${data.originalInput}
`;

      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename.replace('.json', '.txt');
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('✅ Text download triggered successfully');
      }, 100);

    } catch (error) {
      console.error('❌ Text download failed:', error);
      this.showNotification('Text download failed: ' + error.message, 'error');
    }
  }

  downloadPDF(data, filename) {
    // Simple HTML-to-PDF approach using print dialog
    try {
      console.log('📥 Generating PDF preview:', filename);

      // Create a printable HTML view
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Telugu News Package - ${data.newsId}</title>
          <meta charset="UTF-8">
          <style>
            @page { margin: 2cm; }
            body {
              font-family: 'Noto Sans Telugu', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 { color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
            h2 { color: #764ba2; margin-top: 30px; }
            .meta { color: #666; font-size: 14px; }
            .headline-box {
              background: #f5f5f5;
              padding: 15px;
              border-left: 4px solid #667eea;
              margin: 10px 0;
            }
            .script-box {
              background: #fafafa;
              padding: 20px;
              border-radius: 8px;
              margin: 15px 0;
            }
            .hashtags {
              color: #667eea;
              font-weight: 600;
            }
            .checklist {
              list-style: none;
              padding-left: 0;
            }
            .checklist li {
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <h1>🎬 Telugu Short-News Package</h1>
          <div class="meta">
            <p><strong>Generated:</strong> ${new Date(data.generatedAt).toLocaleString()}</p>
            <p><strong>News ID:</strong> ${data.newsId}</p>
            <p><strong>Input Type:</strong> ${data.inputType}</p>
          </div>

          <h2>📰 Selected Headline / ఎంచుకున్న హెడ్‌లైన్</h2>
          <div class="headline-box">
            ${data.selectedHeadline}
          </div>

          <h2>📝 All Headlines / అన్ని హెడ్‌లైన్స్</h2>
          ${data.allHeadlines.map((h, i) => `<div class="headline-box">${i + 1}. ${h}</div>`).join('')}

          <h2>🎬 Script (15 seconds) / స్క్రిప్ట్</h2>
          <div class="script-box">
            ${data.script}
          </div>

          <h2>#️⃣ Hashtags / హ్యాష్‌ట్యాగ్స్</h2>
          <p class="hashtags">${data.hashtags.join(' ')}</p>

          <h2>✅ Thumbnail Checklist / థంబ్‌నైల్ చెక్‌లిస్ట్</h2>
          <ul class="checklist">
            ${data.thumbnailChecklist.map(item =>
              `<li>${item.completed ? '✓' : '☐'} ${item.label}</li>`
            ).join('')}
          </ul>

          <h2>📄 Original Input</h2>
          <div class="script-box">
            ${data.originalInput}
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load, then trigger print dialog
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          console.log('✅ PDF print dialog opened');
        }, 250);
      };

      this.showNotification('PDF preview opened. Use Print dialog to save as PDF.', 'success');

    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      this.showNotification('PDF generation failed: ' + error.message, 'error');
    }
  }

  generateThumbnail() {
    try {
      console.log('🎨 Generating thumbnail...');

      // Get values from inputs
      const bgColor = document.getElementById('thumbnail-bg-color')?.value || '#667eea';
      const headline = document.getElementById('thumbnail-headline')?.value || 'Sample Headline';
      const textColor = document.getElementById('thumbnail-text-color')?.value || '#ffffff';

      // Create or get canvas
      let canvas = document.getElementById('thumbnail-canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'thumbnail-canvas';
        canvas.width = 1080;  // 9:16 aspect ratio
        canvas.height = 1920;
        canvas.style.maxWidth = '100%';
        canvas.style.border = '2px solid #ddd';
        canvas.style.borderRadius = '8px';

        // Find the preview card and add canvas to it
        const previewCards = document.querySelectorAll('.a2ui-card');
        for (let card of previewCards) {
          const text = card.textContent;
          if (text.includes('ప్రివ్యూ / Preview')) {
            // Clear existing content except the header
            const children = Array.from(card.children);
            children.forEach((child, idx) => {
              if (idx > 0) child.remove();
            });
            card.appendChild(canvas);
            break;
          }
        }
      }

      const ctx = canvas.getContext('2d');

      // Clear canvas
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add gradient overlay for better text readability
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Configure text
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw headline with word wrapping
      const maxWidth = canvas.width - 100;
      const lineHeight = 120;
      const words = headline.split(' ');
      const lines = [];
      let currentLine = words[0];

      ctx.font = 'bold 90px Arial, sans-serif';

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      // Draw lines centered
      const startY = (canvas.height - (lines.length * lineHeight)) / 2;
      lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, startY + (i * lineHeight));
      });

      // Add branding at bottom
      ctx.font = 'bold 40px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Telugu Short News', canvas.width / 2, canvas.height - 100);

      // Update status message
      const statusElement = document.getElementById('thumbnail-status');
      if (statusElement) {
        statusElement.textContent = '✅ థంబ్‌నెయిల్ జనరేట్ చేయబడింది! / Thumbnail generated successfully!';
        statusElement.style.color = '#4caf50';
      }

      this.showNotification('థంబ్‌నెయిల్ జనరేట్ చేయబడింది! / Thumbnail generated successfully!', 'success');
      console.log('✅ Thumbnail generated');

    } catch (error) {
      console.error('❌ Thumbnail generation failed:', error);

      // Update status message
      const statusElement = document.getElementById('thumbnail-status');
      if (statusElement) {
        statusElement.textContent = '❌ థంబ్‌నెయిల్ జనరేషన్ విఫలమైంది / Thumbnail generation failed';
        statusElement.style.color = '#f44336';
      }

      this.showNotification('Thumbnail generation failed: ' + error.message, 'error');
    }
  }

  downloadThumbnail() {
    try {
      const canvas = document.getElementById('thumbnail-canvas');
      if (!canvas) {
        this.showNotification('దయచేసి మొదట థంబ్‌నెయిల్ జనరేట్ చేయండి / Please generate thumbnail first', 'error');
        return;
      }

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `telugu-news-thumbnail-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);

        // Update status message
        const statusElement = document.getElementById('thumbnail-status');
        if (statusElement) {
          statusElement.textContent = '💾 థంబ్‌నెయిల్ డౌన్‌లోడ్ చేయబడింది! / Thumbnail downloaded successfully!';
          statusElement.style.color = '#2196f3';
        }

        this.showNotification('థంబ్‌నెయిల్ డౌన్‌లోడ్ చేయబడింది! / Thumbnail downloaded!', 'success');
        console.log('✅ Thumbnail downloaded');
      }, 'image/png');

    } catch (error) {
      console.error('❌ Thumbnail download failed:', error);

      // Update status message
      const statusElement = document.getElementById('thumbnail-status');
      if (statusElement) {
        statusElement.textContent = '❌ డౌన్‌లోడ్ విఫలమైంది / Download failed';
        statusElement.style.color = '#f44336';
      }

      this.showNotification('Thumbnail download failed: ' + error.message, 'error');
    }
  }
}

// Make renderer globally available
window.A2UIRenderer = A2UIRenderer;
