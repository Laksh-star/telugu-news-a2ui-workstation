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

    if (component.options) {
      component.options.forEach((option, index) => {
        const radio = this.renderRadio({
          id: `${component.id}-option-${index}`,
          name: component.id,
          label: option.label || option,
          value: option.value || option,
          checked: option.checked || index === 0
        });
        group.appendChild(radio);
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
    if (action.type === 'post') {
      try {
        console.log('🔄 Action triggered:', action.url, action.body);

        const response = await fetch(action.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(action.body)
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
          // Handle approval/export
          else if (action.url === '/api/approve') {
            console.log('✅ Approve action, has exportData:', !!result.exportData);
            this.showNotification(result.message, 'success');
            if (result.exportData) {
              this.downloadJSON(result.exportData, result.downloadFileName);
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
}

// Make renderer globally available
window.A2UIRenderer = A2UIRenderer;
