/**
 * Storage Helper for LoanAI
 * Stores prediction history, dashboard stats, and user preferences in localStorage.
 */

const STORAGE_KEYS = {
  THEME: 'loanai_theme',
  HISTORY: 'loanai_prediction_history',
  STATS: 'loanai_dashboard_stats',
  API_ENDPOINT: 'loanai_api_endpoint'
};

const DEFAULT_STATS = {
  totalChecks: 1248,
  lowRisk: 824,
  mediumRisk: 286,
  highRisk: 138
};

const SEED_HISTORY = [
  {
    id: 'L-1024',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    creditScore: 740,
    loanAmount: 500000,
    income: 850000,
    riskLevel: 'Low',
    confidence: 86,
    prediction: 0,
    probability: 0.14
  },
  {
    id: 'L-1023',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    creditScore: 610,
    loanAmount: 850000,
    income: 420000,
    riskLevel: 'High',
    confidence: 79,
    prediction: 1,
    probability: 0.79
  },
  {
    id: 'L-1022',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    creditScore: 675,
    loanAmount: 350000,
    income: 600000,
    riskLevel: 'Moderate',
    confidence: 62,
    prediction: 0,
    probability: 0.38
  }
];

export class Storage {
  static getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  }

  static setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  static getApiEndpoint() {
    return localStorage.getItem(STORAGE_KEYS.API_ENDPOINT) || '';
  }

  static setApiEndpoint(endpoint) {
    localStorage.setItem(STORAGE_KEYS.API_ENDPOINT, endpoint);
  }

  static getStats() {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!data) {
      this.saveStats(DEFAULT_STATS);
      return { ...DEFAULT_STATS };
    }
    try {
      return JSON.parse(data);
    } catch {
      return { ...DEFAULT_STATS };
    }
  }

  static saveStats(stats) {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }

  static recordPrediction(result, formData) {
    const stats = this.getStats();
    stats.totalChecks += 1;

    if (result.riskLevel === 'Low') stats.lowRisk += 1;
    else if (result.riskLevel === 'Moderate') stats.mediumRisk += 1;
    else if (result.riskLevel === 'High') stats.highRisk += 1;

    this.saveStats(stats);

    // Save to history
    const history = this.getHistory();
    const newRecord = {
      id: `L-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: result.timestamp || new Date().toISOString(),
      creditScore: formData.creditScore,
      loanAmount: formData.loanAmount,
      income: formData.income,
      riskLevel: result.riskLevel,
      confidence: result.confidence,
      prediction: result.prediction,
      probability: result.probability,
      formData: { ...formData }
    };

    history.unshift(newRecord);
    // Keep max 20 records
    if (history.length > 20) history.pop();

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    return { stats, newRecord };
  }

  static getHistory() {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(SEED_HISTORY));
      return SEED_HISTORY;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_HISTORY;
    }
  }

  static clearHistory() {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  }
}
