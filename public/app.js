/**
 * Main Application Logic
 */

const renderer = new A2UIRenderer();
let currentNewsId = null;

document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  const newsInput = document.getElementById('newsInput');
  const workstation = document.getElementById('workstation');
  const loading = document.getElementById('loading');

  generateBtn.addEventListener('click', async () => {
    const input = newsInput.value.trim();

    if (!input) {
      alert('Please enter a story URL, transcript, or notes');
      return;
    }

    const inputType = document.querySelector('input[name="inputType"]:checked').value;

    // Show loading, hide workstation
    loading.style.display = 'block';
    workstation.style.display = 'none';

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input, type: inputType })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const a2uiPayload = await response.json();

      console.log('📦 Received A2UI payload:', a2uiPayload);

      // Validate payload structure
      if (!a2uiPayload || !a2uiPayload.surface) {
        throw new Error('Invalid A2UI payload structure');
      }

      // Store news ID
      currentNewsId = a2uiPayload.dataModel?.newsId;
      console.log('✅ News ID:', currentNewsId);

      // Render the A2UI workstation
      renderer.render(a2uiPayload, workstation);

      // Show workstation, hide loading
      loading.style.display = 'none';
      workstation.style.display = 'block';

      // Scroll to workstation
      workstation.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
      console.error('❌ Generation failed:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Failed to generate news package: ${error.message}\n\nCheck console for details.`);
      loading.style.display = 'none';
    }
  });
});
