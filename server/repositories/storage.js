// Simple in-memory storage with file persistence (simulating localStorage for backend)
const fs = require('fs');
const path = require('path');

const STORAGE_FILE = path.join(__dirname, '../data/storage.json');

// Initialize storage
let storage = {};

function loadStorage() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      storage = JSON.parse(data);
    } else {
      storage = {
        parties: [],
        questionnaires: [],
        questionnaireAnswers: [],
        editRequests: [],
        amendments: [],
        verificationItems: [],
        gateReopenSignals: [],
        auditLogs: []
      };
      saveStorage();
    }
  } catch (error) {
    console.error('Error loading storage:', error);
    storage = {
      parties: [],
      questionnaires: [],
      questionnaireAnswers: [],
      editRequests: [],
      amendments: [],
      verificationItems: [],
      gateReopenSignals: [],
      auditLogs: []
    };
  }
}

function saveStorage() {
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(storage, null, 2));
  } catch (error) {
    console.error('Error saving storage:', error);
  }
}

// Initialize on load
loadStorage();

const Storage = {
  get(collection) {
    return storage[collection] || [];
  },

  set(collection, data) {
    storage[collection] = data;
    saveStorage();
  },

  add(collection, item) {
    if (!storage[collection]) {
      storage[collection] = [];
    }
    storage[collection].push(item);
    saveStorage();
    return item;
  },

  update(collection, id, updates) {
    if (!storage[collection]) return null;
    const index = storage[collection].findIndex(item => item.id === id);
    if (index === -1) return null;
    storage[collection][index] = { ...storage[collection][index], ...updates };
    saveStorage();
    return storage[collection][index];
  },

  delete(collection, id) {
    if (!storage[collection]) return false;
    const index = storage[collection].findIndex(item => item.id === id);
    if (index === -1) return false;
    storage[collection].splice(index, 1);
    saveStorage();
    return true;
  },

  find(collection, predicate) {
    if (!storage[collection]) return null;
    return storage[collection].find(predicate);
  },

  filter(collection, predicate) {
    if (!storage[collection]) return [];
    return storage[collection].filter(predicate);
  },

  clear() {
    storage = {
      parties: [],
      questionnaires: [],
      questionnaireAnswers: [],
      editRequests: [],
      amendments: [],
      verificationItems: [],
      gateReopenSignals: [],
      auditLogs: []
    };
    saveStorage();
  }
};

module.exports = Storage;
