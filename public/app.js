/**
 * Main Application Logic
 */

const renderer = new A2UIRenderer();
let currentNewsId = null;

// Validation configuration
const VALIDATION_RULES = {
  minLength: {
    url: 10,
    transcript: 50,
    notes: 30
  },
  maxLength: 5000,
  urlPattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i
};

/**
 * Validate user input based on input type
 */
function validateInput(input, inputType) {
  const errors = [];

  // Check if empty
  if (!input || input.trim().length === 0) {
    errors.push({
      en: 'Please enter content',
      te: 'దయచేసి కంటెంట్ నమోదు చేయండి'
    });
    return errors;
  }

  const trimmedInput = input.trim();
  const minLength = VALIDATION_RULES.minLength[inputType];

  // Check minimum length
  if (trimmedInput.length < minLength) {
    errors.push({
      en: `${inputType.charAt(0).toUpperCase() + inputType.slice(1)} must be at least ${minLength} characters`,
      te: `${inputType === 'url' ? 'URL' : inputType === 'transcript' ? 'ట్రాన్స్క్రిప్ట్' : 'నోట్స్'} కనీసం ${minLength} అక్షరాలు ఉండాలి`
    });
  }

  // Check maximum length
  if (trimmedInput.length > VALIDATION_RULES.maxLength) {
    errors.push({
      en: `Input cannot exceed ${VALIDATION_RULES.maxLength} characters`,
      te: `ఇన్‌పుట్ ${VALIDATION_RULES.maxLength} అక్షరాలకు మించకూడదు`
    });
  }

  // Validate URL format if input type is URL
  if (inputType === 'url' && !VALIDATION_RULES.urlPattern.test(trimmedInput)) {
    errors.push({
      en: 'Please enter a valid URL (e.g., https://example.com/article)',
      te: 'దయచేసి చెల్లుబాటు అయ్యే URL నమోదు చేయండి'
    });
  }

  return errors;
}

/**
 * Display validation errors to user
 */
function showValidationErrors(errors) {
  const errorMessages = errors.map(err => `${err.te} / ${err.en}`).join('\n\n');
  alert(`❌ ధ్రువీకరణ లోపం / Validation Error:\n\n${errorMessages}`);
}

document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  const newsInput = document.getElementById('newsInput');
  const workstation = document.getElementById('workstation');
  const loading = document.getElementById('loading');
  const charCount = document.getElementById('charCount');
  const charStatus = document.getElementById('charStatus');

  // Update character count as user types
  function updateCharCount() {
    const length = newsInput.value.length;
    const inputType = document.querySelector('input[name="inputType"]:checked').value;
    const minLength = VALIDATION_RULES.minLength[inputType];

    charCount.textContent = length;

    // Update status message
    if (length === 0) {
      charStatus.textContent = '';
      charStatus.className = 'char-status';
    } else if (length < minLength) {
      charStatus.textContent = `(కనీసం ${minLength} కావాలి / min ${minLength} needed)`;
      charStatus.className = 'char-status warning';
    } else if (length > VALIDATION_RULES.maxLength) {
      charStatus.textContent = '(పరిమితిని మించిపోయింది / limit exceeded)';
      charStatus.className = 'char-status error';
    } else {
      charStatus.textContent = '✓';
      charStatus.className = 'char-status valid';
    }
  }

  // Update count on input
  newsInput.addEventListener('input', updateCharCount);

  // Update count when input type changes
  document.querySelectorAll('input[name="inputType"]').forEach(radio => {
    radio.addEventListener('change', updateCharCount);
  });

  // Progress tracking
  function updateProgress(percent, status) {
    const progressBar = document.getElementById('progressBar');
    const progressStatus = document.getElementById('progressStatus');
    const progressPercent = document.getElementById('progressPercent');

    progressBar.style.width = `${percent}%`;
    progressStatus.textContent = status;
    progressPercent.textContent = `${percent}%`;
  }

  // Simulate progress based on typical generation time
  function startProgressSimulation() {
    const stages = [
      { percent: 10, status: 'విశ్లేషిస్తోంది... / Analyzing input', delay: 500 },
      { percent: 25, status: 'హెడ్‌లైన్స్ సృష్టిస్తోంది... / Generating headlines', delay: 3000 },
      { percent: 50, status: 'స్క్రిప్ట్ రాస్తోంది... / Writing script', delay: 5000 },
      { percent: 75, status: 'హ్యాష్‌ట్యాగ్స్ సృష్టిస్తోంది... / Creating hashtags', delay: 3000 },
      { percent: 90, status: 'చివరి స్పర్శలు... / Finalizing', delay: 2000 }
    ];

    let currentStage = 0;
    const progressInterval = setInterval(() => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage];
        updateProgress(stage.percent, stage.status);
        currentStage++;
      } else {
        clearInterval(progressInterval);
      }
    }, 500);

    return progressInterval;
  }

  generateBtn.addEventListener('click', async () => {
    const input = newsInput.value.trim();
    const inputType = document.querySelector('input[name="inputType"]:checked').value;

    // Validate input
    const validationErrors = validateInput(input, inputType);
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }

    // Show loading, hide workstation
    loading.style.display = 'block';
    workstation.style.display = 'none';

    // Reset and start progress
    updateProgress(0, 'ప్రారంభిస్తోంది... / Starting');
    const progressInterval = startProgressSimulation();

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

      // Clear progress simulation
      clearInterval(progressInterval);
      updateProgress(100, '✅ పూర్తయింది! / Complete!');

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
      // Clear progress on error
      clearInterval(progressInterval);

      console.error('❌ Generation failed:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Failed to generate news package: ${error.message}\n\nCheck console for details.`);
      loading.style.display = 'none';
    }
  });
});
