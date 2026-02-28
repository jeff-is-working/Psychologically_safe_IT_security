/**
 * PeopleSafe SDLC Journal - Rollup Aggregation Logic
 * Generates weekly/monthly/quarterly/yearly summaries from decrypted entries.
 * Auto-content is generated on the fly; only user reflections are stored encrypted.
 */

const Rollups = (() => {
  'use strict';

  const CATEGORIES = ['success', 'delight', 'learning', 'compliment'];
  const TYPES = ['weekly', 'monthly', 'quarterly', 'yearly'];

  /**
   * Aggregate decrypted entries into categorized lists.
   * Each entry's plaintext is expected to be JSON: { success, delight, learning, compliment }
   */
  function _aggregateEntries(decryptedEntries) {
    const auto = {
      success: [],
      delight: [],
      learning: [],
      compliment: []
    };

    for (const entry of decryptedEntries) {
      const date = entry.date;
      const dateLabel = Utils.formatDateShort(date);
      for (const cat of CATEGORIES) {
        const text = (entry.data[cat] || '').trim();
        if (text) {
          auto[cat].push({ date, dateLabel, text });
        }
      }
    }

    return auto;
  }

  /**
   * Generate a summary for a given period.
   * @param {Array} decryptedEntries - Array of { date, data: { success, delight, learning, compliment } }
   * @param {string} periodKey - e.g. "2026-W09", "2026-02", "2026-Q1", "2026"
   * @param {string} type - "weekly" | "monthly" | "quarterly" | "yearly"
   * @param {string} existingReflection - Previously saved reflection text (if any)
   */
  function generateSummary(decryptedEntries, periodKey, type, existingReflection) {
    const formatLabel = {
      weekly: Utils.formatWeekLabel,
      monthly: Utils.formatMonthLabel,
      quarterly: Utils.formatQuarterLabel,
      yearly: Utils.formatYearLabel
    };

    return {
      periodKey,
      type,
      periodLabel: formatLabel[type](periodKey),
      entryCount: decryptedEntries.length,
      autoContent: _aggregateEntries(decryptedEntries),
      reflection: existingReflection || ''
    };
  }

  /**
   * Get entries that fall within a given period.
   */
  function getEntriesForPeriod(allEntries, periodKey, type) {
    const keyFn = {
      weekly: Utils.getWeekKey,
      monthly: Utils.getMonthKey,
      quarterly: Utils.getQuarterKey,
      yearly: Utils.getYearKey
    };

    return allEntries.filter(e => keyFn[type](e.date) === periodKey);
  }

  /**
   * Scan all entry metadata to determine which periods have data.
   * Returns { weeks: [], months: [], quarters: [], years: [] } sorted descending.
   */
  function getAvailablePeriods(allEntryMetas) {
    const sets = {
      weeks: new Set(),
      months: new Set(),
      quarters: new Set(),
      years: new Set()
    };

    for (const meta of allEntryMetas) {
      sets.weeks.add(Utils.getWeekKey(meta.date));
      sets.months.add(Utils.getMonthKey(meta.date));
      sets.quarters.add(Utils.getQuarterKey(meta.date));
      sets.years.add(Utils.getYearKey(meta.date));
    }

    return {
      weeks: [...sets.weeks].sort().reverse(),
      months: [...sets.months].sort().reverse(),
      quarters: [...sets.quarters].sort().reverse(),
      years: [...sets.years].sort().reverse()
    };
  }

  /**
   * Get sub-period reflections for higher-level rollups.
   * E.g., monthly rollup includes weekly reflections for that month.
   */
  async function getSubPeriodReflections(type, periodKey, cryptoKey) {
    const subTypes = {
      monthly: 'weekly',
      quarterly: 'monthly',
      yearly: 'quarterly'
    };

    const subType = subTypes[type];
    if (!subType) return [];

    const rollups = await Storage.getRollupsByType(subType);
    const reflections = [];

    for (const rollup of rollups) {
      // Check if this sub-period falls within the parent period
      if (!_subPeriodInParent(rollup.periodKey, subType, periodKey, type)) continue;

      if (rollup.ciphertext && rollup.iv) {
        try {
          const text = await Crypto.decrypt(rollup.ciphertext, rollup.iv, cryptoKey);
          if (text.trim()) {
            const formatLabel = {
              weekly: Utils.formatWeekLabel,
              monthly: Utils.formatMonthLabel,
              quarterly: Utils.formatQuarterLabel
            };
            reflections.push({
              periodKey: rollup.periodKey,
              label: formatLabel[subType](rollup.periodKey),
              reflection: text
            });
          }
        } catch (e) {
          // Skip unreadable rollups
        }
      }
    }

    return reflections.sort((a, b) => a.periodKey.localeCompare(b.periodKey));
  }

  /**
   * Check if a sub-period key falls within a parent period.
   */
  function _subPeriodInParent(subKey, subType, parentKey, parentType) {
    // For simplicity, use a date-based approach: get a representative date
    // from the sub-period and check it against the parent period
    if (parentType === 'monthly' && subType === 'weekly') {
      // A week belongs to a month if the week's Thursday falls in that month
      // (ISO 8601 convention). Simplified: check if week key's year-month overlaps.
      const [year, w] = subKey.split('-W').map(Number);
      // Get the Thursday of this ISO week
      const jan4 = new Date(year, 0, 4);
      const dayOfWeek = jan4.getDay() || 7;
      const monday = new Date(jan4);
      monday.setDate(jan4.getDate() - dayOfWeek + 1 + (w - 1) * 7);
      const thursday = new Date(monday);
      thursday.setDate(monday.getDate() + 3);
      const monthKey = `${thursday.getFullYear()}-${String(thursday.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === parentKey;
    }

    if (parentType === 'quarterly' && subType === 'monthly') {
      const [pYear, pQ] = parentKey.split('-Q');
      const [mYear, mMonth] = subKey.split('-');
      const quarter = Math.ceil(parseInt(mMonth, 10) / 3);
      return pYear === mYear && parseInt(pQ, 10) === quarter;
    }

    if (parentType === 'yearly' && subType === 'quarterly') {
      return subKey.startsWith(parentKey);
    }

    return false;
  }

  return {
    CATEGORIES,
    TYPES,
    generateSummary,
    getEntriesForPeriod,
    getAvailablePeriods,
    getSubPeriodReflections
  };
})();
