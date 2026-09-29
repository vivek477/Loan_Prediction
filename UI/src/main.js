import './style.css';
import { MLEngine } from './mlEngine.js';
import { Storage } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initCreditScoreWidget();
  initSegmentedControls();
  initValidation();
  initStatsCounters();
  initHistory();
  initFormSubmission();
  pingBackend();
});

/* ==========================================================================
   1. Theme Management
   ========================================================================== */
function initTheme() {
  const currentTheme = Storage.getTheme();
  applyTheme(currentTheme);

  const themeBtn = document.getElementById('theme-toggle');
  themeBtn?.addEventListener('click', () => {
    const active = document.documentElement.getAttribute('data-theme');
    const next = active === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    Storage.setTheme(next);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const sunIcon = document.getElementById('theme-icon-sun');
  const moonIcon = document.getElementById('theme-icon-moon');

  if (theme === 'light') {
    if (sunIcon) sunIcon.style.display = 'block';
    if (moonIcon) moonIcon.style.display = 'none';
  } else {
    if (sunIcon) sunIcon.style.display = 'none';
    if (moonIcon) moonIcon.style.display = 'block';
  }
}

/* ==========================================================================
   2. Mobile & Navigation Smooth Scroll
   ========================================================================== */
function initNavigation() {
  const mobileBtn = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  mobileBtn?.addEventListener('click', () => {
    navMenu?.classList.toggle('open');
  });

  // Active menu link indicator on scroll
  const sections = document.querySelectorAll('section, article');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id') || '';
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (current && link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   3. Credit Score Visual Indicator
   ========================================================================== */
function initCreditScoreWidget() {
  const csInput = document.getElementById('input-creditScore');
  const badgeVal = document.getElementById('score-badge-val');
  const markerPin = document.getElementById('score-marker-pin');

  function updateMarker() {
    let val = parseInt(csInput.value) || 300;
    val = Math.min(Math.max(val, 300), 850);

    if (badgeVal) badgeVal.textContent = val;

    const percentage = ((val - 300) / (850 - 300)) * 100;
    if (markerPin) {
      markerPin.style.left = `${Math.min(Math.max(percentage, 2), 98)}%`;
    }
  }

  csInput?.addEventListener('input', updateMarker);
  updateMarker();
}

/* ==========================================================================
   4. Segmented Control Options
   ========================================================================== */
function initSegmentedControls() {
  setupSegmented('control-hasMortgage', 'input-hasMortgage');
  setupSegmented('control-hasCoSigner', 'input-hasCoSigner');
}

function setupSegmented(containerId, hiddenInputId) {
  const container = document.getElementById(containerId);
  const hiddenInput = document.getElementById(hiddenInputId);
  if (!container || !hiddenInput) return;

  const buttons = container.querySelectorAll('.segmented-option');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      container.setAttribute('data-value', val);
      hiddenInput.value = val;
    });
  });
}

/* ==========================================================================
   5. Form Validation
   ========================================================================== */
function initValidation() {
  const inputsToValidate = [
    { id: 'input-age', errorId: 'error-age', min: 18, max: 100 },
    { id: 'input-income', errorId: 'error-income', min: 1 },
    { id: 'input-creditScore', errorId: 'error-creditScore', min: 300, max: 850 },
    { id: 'input-monthsEmployed', errorId: 'error-monthsEmployed', min: 0 },
    { id: 'input-loanAmount', errorId: 'error-loanAmount', min: 1 },
    { id: 'input-interestRate', errorId: 'error-interestRate', min: 0 },
    { id: 'input-dtiRatio', errorId: 'error-dtiRatio', min: 0, max: 100 }
  ];

  inputsToValidate.forEach(item => {
    const inputEl = document.getElementById(item.id);
    const errorEl = document.getElementById(item.errorId);

    if (inputEl && errorEl) {
      inputEl.addEventListener('input', () => validateSingleField(inputEl, errorEl, item.min, item.max));
    }
  });
}

function validateSingleField(inputEl, errorEl, min, max) {
  const val = parseFloat(inputEl.value);
  let isValid = true;

  if (isNaN(val)) {
    isValid = false;
  } else {
    if (min !== undefined && val < min) isValid = false;
    if (max !== undefined && val > max) isValid = false;
  }

  if (!isValid) {
    errorEl.classList.add('visible');
    inputEl.style.borderColor = 'var(--risk-high)';
  } else {
    errorEl.classList.remove('visible');
    inputEl.style.borderColor = '';
  }

  return isValid;
}

function validateAllFields() {
  const ageValid = validateSingleField(document.getElementById('input-age'), document.getElementById('error-age'), 18, 100);
  const incomeValid = validateSingleField(document.getElementById('input-income'), document.getElementById('error-income'), 1);
  const csValid = validateSingleField(document.getElementById('input-creditScore'), document.getElementById('error-creditScore'), 300, 850);
  const monthsValid = validateSingleField(document.getElementById('input-monthsEmployed'), document.getElementById('error-monthsEmployed'), 0);
  const loanValid = validateSingleField(document.getElementById('input-loanAmount'), document.getElementById('error-loanAmount'), 1);
  const rateValid = validateSingleField(document.getElementById('input-interestRate'), document.getElementById('error-interestRate'), 0);
  const dtiValid = validateSingleField(document.getElementById('input-dtiRatio'), document.getElementById('error-dtiRatio'), 0, 100);

  return ageValid && incomeValid && csValid && monthsValid && loanValid && rateValid && dtiValid;
}

/* ==========================================================================
   6. Dashboard Counters Animation
   ========================================================================== */
function initStatsCounters() {
  const stats = Storage.getStats();
  animateCounter('stat-total', stats.totalChecks);
  animateCounter('stat-low', stats.lowRisk);
  animateCounter('stat-medium', stats.mediumRisk);
  animateCounter('stat-high', stats.highRisk);
}

function animateCounter(elementId, targetVal) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let current = 0;
  const increment = Math.max(1, Math.floor(targetVal / 35));
  const timer = setInterval(() => {
    current += increment;
    if (current >= targetVal) {
      current = targetVal;
      clearInterval(timer);
    }
    el.textContent = current.toLocaleString();
  }, 25);
}

/* ==========================================================================
   7. Form Submission & Result Display
   ========================================================================== */
function initFormSubmission() {
  const form = document.getElementById('prediction-form');
  const submitBtn = document.getElementById('btn-submit-predict');
  const retryBtn = document.getElementById('btn-retry-error');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateAllFields()) {
      const firstError = document.querySelector('.field-error.visible');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const formData = {
      age: document.getElementById('input-age').value,
      education: document.getElementById('input-education').value,
      employmentType: document.getElementById('input-employmentType').value,
      maritalStatus: document.getElementById('input-maritalStatus').value,
      hasDependents: document.getElementById('input-hasDependents').value,
      income: document.getElementById('input-income').value,
      creditScore: document.getElementById('input-creditScore').value,
      monthsEmployed: document.getElementById('input-monthsEmployed').value,
      numCreditLines: document.getElementById('input-numCreditLines').value,
      hasMortgage: document.getElementById('input-hasMortgage').value,
      loanAmount: document.getElementById('input-loanAmount').value,
      interestRate: document.getElementById('input-interestRate').value,
      loanTerm: document.getElementById('input-loanTerm').value,
      dtiRatio: document.getElementById('input-dtiRatio').value,
      loanPurpose: document.getElementById('input-loanPurpose').value,
      hasCoSigner: document.getElementById('input-hasCoSigner').value
    };

    // UI Loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      const result = await MLEngine.predict(formData);
      displayResult(result, formData);
      const updated = Storage.recordPrediction(result, formData);
      initStatsCounters();
      renderHistoryList(Storage.getHistory());
    } catch (err) {
      console.error('Prediction Error:', err);
      displayErrorState();
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });

  retryBtn?.addEventListener('click', () => {
    document.getElementById('result-error').style.display = 'none';
    document.getElementById('result-empty').style.display = 'block';
  });
}

function displayResult(result, formData) {
  const emptyBox = document.getElementById('result-empty');
  const activeBox = document.getElementById('result-active');
  const errorBox = document.getElementById('result-error');

  emptyBox.style.display = 'none';
  errorBox.style.display = 'none';
  activeBox.style.display = 'flex';

  // Risk Pill Styling & Text
  const pill = document.getElementById('result-risk-pill');
  const pillText = document.getElementById('result-risk-level-text');
  const headlineText = document.getElementById('result-headline-text');
  const detailText = document.getElementById('result-detail-text');
  const gaugeCircle = document.getElementById('gauge-circle');
  const gaugeScoreVal = document.getElementById('gauge-score-val');
  const gaugeSublabel = document.getElementById('gauge-sublabel-text');

  pill.className = `risk-pill ${result.riskLevel.toLowerCase()}`;
  pillText.textContent = `${result.riskLevel} Risk`;

  // Determine Headline & Details
  if (result.riskLevel === 'Low') {
    headlineText.textContent = 'Loan appears to have a lower predicted default risk.';
    detailText.innerHTML = `The ML model predicts a <strong>${result.confidence}% confidence</strong> of clean repayment based on strong financial health and stable income profile.`;
    gaugeCircle.setAttribute('class', 'gauge-progress low');
    gaugeSublabel.textContent = 'Confidence';
  } else if (result.riskLevel === 'Moderate') {
    headlineText.textContent = 'Applicant exhibits moderate default risk factors.';
    detailText.innerHTML = `The ML model indicates a <strong>${Math.round(result.probability * 100)}% default risk probability</strong>. Additional underwriting verification is recommended.`;
    gaugeCircle.setAttribute('class', 'gauge-progress moderate');
    gaugeSublabel.textContent = 'Risk Probability';
  } else {
    headlineText.textContent = 'The applicant has a higher predicted probability of loan default.';
    detailText.innerHTML = `The ML model projects a <strong>${Math.round(result.probability * 100)}% probability of default</strong> due to elevated debt-to-income and lower credit history.`;
    gaugeCircle.setAttribute('class', 'gauge-progress high');
    gaugeSublabel.textContent = 'Default Prob';
  }

  // Animate Gauge Progress Ring (Stroke circumference ~440)
  const targetScore = result.riskLevel === 'Low' ? result.confidence : Math.round(result.probability * 100);
  const strokeOffset = 440 - (440 * targetScore) / 100;
  
  setTimeout(() => {
    gaugeCircle.style.strokeDashoffset = strokeOffset;
  }, 50);

  // Animate Gauge Counter Number
  let currentVal = 0;
  const countTimer = setInterval(() => {
    currentVal += 2;
    if (currentVal >= targetScore) {
      currentVal = targetScore;
      clearInterval(countTimer);
    }
    gaugeScoreVal.textContent = `${currentVal}%`;
  }, 20);

  // Render Feature Importance Bars
  renderFeatureImportance(result.featureImportance);

  // Smooth scroll to results
  document.getElementById('result-container').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderFeatureImportance(factors) {
  const container = document.getElementById('importance-factors-list');
  if (!container) return;

  container.innerHTML = '';

  factors.forEach((factor, idx) => {
    const item = document.createElement('div');
    item.className = 'factor-item';
    
    const isPositive = factor.isPositive;
    const barClass = isPositive ? 'positive' : 'negative';

    item.innerHTML = `
      <div class="factor-name">${factor.feature}</div>
      <div class="factor-bar-wrapper">
        <div class="factor-bar-fill ${barClass}" id="factor-bar-${idx}" style="width: 0%;"></div>
      </div>
      <div class="factor-badge">${factor.impact}</div>
    `;

    container.appendChild(item);

    // Animate bar width fill
    setTimeout(() => {
      const fillBar = document.getElementById(`factor-bar-${idx}`);
      if (fillBar) fillBar.style.width = `${factor.score}%`;
    }, 150 + idx * 80);
  });
}

function displayErrorState() {
  document.getElementById('result-empty').style.display = 'none';
  document.getElementById('result-active').style.display = 'none';
  document.getElementById('result-error').style.display = 'block';
}

/* ==========================================================================
   8. Prediction History Section
   ========================================================================== */
function initHistory() {
  const historyData = Storage.getHistory();
  renderHistoryList(historyData);

  const clearBtn = document.getElementById('btn-clear-history');
  clearBtn?.addEventListener('click', () => {
    Storage.clearHistory();
    renderHistoryList([]);
    initStatsCounters();
  });
}

function renderHistoryList(historyData) {
  const container = document.getElementById('history-items-container');
  if (!container) return;

  if (!historyData || historyData.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 1.5rem; color: var(--text-muted); font-size: 0.9rem;">
        No recent predictions recorded yet.
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  historyData.forEach(item => {
    const row = document.createElement('div');
    row.className = 'history-row';
    const formattedAmount = Number(item.loanAmount).toLocaleString();
    const formattedIncome = Number(item.income).toLocaleString();
    const riskClass = item.riskLevel.toLowerCase();

    row.innerHTML = `
      <div class="history-meta">
        <span class="history-id">Applicant #${item.id}</span>
        <span class="history-sub">Credit: ${item.creditScore} • Loan: ₹${formattedAmount} • Income: ₹${formattedIncome}</span>
      </div>
      <div class="history-stats">
        <div class="risk-pill ${riskClass}" style="padding: 0.25rem 0.75rem; font-size: 0.75rem;">
          ${item.riskLevel} Risk
        </div>
        <div class="history-score">${item.confidence}%</div>
      </div>
    `;

    // Click history row to reload data into form
    row.addEventListener('click', () => {
      if (item.formData) {
        populateForm(item.formData);
        document.getElementById('prediction-form').scrollIntoView({ behavior: 'smooth' });
      }
    });

    container.appendChild(row);
  });
}

async function pingBackend() {
  const badge = document.getElementById('api-status-badge');
  if (!badge) return;
  try {
    const response = await fetch('/api/health');
    if (response.ok) {
      badge.textContent = '● Flask API Online';
      badge.style.color = 'var(--risk-low)';
      return;
    }
  } catch {
    // fall through to local engine label
  }
  badge.textContent = '● Local Engine';
  badge.style.color = 'var(--risk-moderate)';
}

function populateForm(data) {
  Object.keys(data).forEach(key => {
    const el = document.getElementById(`input-${key}`);
    if (el) {
      el.value = data[key];
      el.dispatchEvent(new Event('input'));
    }
  });

  // Handle segmented controls
  if (data.hasMortgage) {
    const mortgageCtrl = document.getElementById('control-hasMortgage');
    mortgageCtrl?.querySelectorAll('.segmented-option').forEach(btn => {
      if (btn.getAttribute('data-val') === data.hasMortgage) btn.click();
    });
  }

  if (data.hasCoSigner) {
    const coSignerCtrl = document.getElementById('control-hasCoSigner');
    coSignerCtrl?.querySelectorAll('.segmented-option').forEach(btn => {
      if (btn.getAttribute('data-val') === data.hasCoSigner) btn.click();
    });
  }
}
