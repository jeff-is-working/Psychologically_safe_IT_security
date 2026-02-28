/**
 * PeopleSafe SDLC Journal - Utility Functions
 * Date helpers, formatters, ID generation, and common utilities.
 */

const Utils = (() => {
  'use strict';

  // --- Date Helpers ---

  function today() {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }

  function parseDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // ISO 8601 week number (Monday start)
  function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  function getISOWeekYear(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    return d.getUTCFullYear();
  }

  // --- Period Keys ---

  function getWeekKey(dateStr) {
    const d = parseDate(dateStr);
    const year = getISOWeekYear(d);
    const week = getISOWeek(d);
    return `${year}-W${String(week).padStart(2, '0')}`;
  }

  function getMonthKey(dateStr) {
    return dateStr.slice(0, 7); // YYYY-MM
  }

  function getQuarterKey(dateStr) {
    const month = parseInt(dateStr.slice(5, 7), 10);
    const quarter = Math.ceil(month / 3);
    return `${dateStr.slice(0, 4)}-Q${quarter}`;
  }

  function getYearKey(dateStr) {
    return dateStr.slice(0, 4); // YYYY
  }

  // --- Period Ranges ---

  function getWeekRange(dateStr) {
    const d = parseDate(dateStr || today());
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.getFullYear(), d.getMonth(), diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: formatISO(monday),
      end: formatISO(sunday)
    };
  }

  function getMonthRange(dateStr) {
    const d = parseDate(dateStr || today());
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { start: formatISO(start), end: formatISO(end) };
  }

  function getQuarterRange(dateStr) {
    const d = parseDate(dateStr || today());
    const quarter = Math.floor(d.getMonth() / 3);
    const start = new Date(d.getFullYear(), quarter * 3, 1);
    const end = new Date(d.getFullYear(), quarter * 3 + 3, 0);
    return { start: formatISO(start), end: formatISO(end) };
  }

  function getYearRange(dateStr) {
    const year = (dateStr || today()).slice(0, 4);
    return { start: `${year}-01-01`, end: `${year}-12-31` };
  }

  function formatISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // --- Display Formatters ---

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const MONTHS_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function formatDate(dateStr) {
    const d = parseDate(dateStr);
    return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function formatDateShort(dateStr) {
    const d = parseDate(dateStr);
    return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function formatWeekLabel(weekKey) {
    // weekKey = "2026-W09"
    const [year, w] = weekKey.split('-W');
    return `Week ${parseInt(w, 10)}, ${year}`;
  }

  function formatMonthLabel(monthKey) {
    // monthKey = "2026-02"
    const [year, month] = monthKey.split('-');
    return `${MONTHS[parseInt(month, 10) - 1]} ${year}`;
  }

  function formatQuarterLabel(quarterKey) {
    // quarterKey = "2026-Q1"
    const [year, q] = quarterKey.split('-');
    return `${q} ${year}`;
  }

  function formatYearLabel(yearKey) {
    return yearKey;
  }

  // --- Utility Functions ---

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function truncate(str, maxLen) {
    if (!str || str.length <= maxLen) return str || '';
    return str.slice(0, maxLen - 1) + '\u2026';
  }

  function generateEntryId() {
    return today();
  }

  // Group entries by month for browse view
  function groupByMonth(entries) {
    const groups = {};
    for (const entry of entries) {
      const key = getMonthKey(entry.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    }
    // Sort groups by key descending, entries within each group by date descending
    const sorted = Object.keys(groups).sort().reverse();
    return sorted.map(key => ({
      monthKey: key,
      label: formatMonthLabel(key),
      entries: groups[key].sort((a, b) => b.date.localeCompare(a.date))
    }));
  }

  // --- Public API ---

  return {
    today,
    parseDate,
    getISOWeek,
    getISOWeekYear,
    getWeekKey,
    getMonthKey,
    getQuarterKey,
    getYearKey,
    getWeekRange,
    getMonthRange,
    getQuarterRange,
    getYearRange,
    formatISO,
    formatDate,
    formatDateShort,
    formatWeekLabel,
    formatMonthLabel,
    formatQuarterLabel,
    formatYearLabel,
    escapeHtml,
    debounce,
    truncate,
    generateEntryId,
    groupByMonth,
    MONTHS,
    MONTHS_SHORT,
    DAYS
  };
})();
