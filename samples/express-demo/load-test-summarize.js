const runData = require('./js-load.json');

function summarize(type) {
  const total = runData.aggregate.counters[`stanza.${type}`];
  if (!total) return;

  const success = runData.aggregate.counters[`stanza.${type}_200`] || 0;
  const limited = runData.aggregate.counters[`stanza.${type}_429`] || 0;
  const successPct = Math.round((success/total) * 100);
  return { type, total, success, limited, successPct };
}

const types = Object.keys(runData.aggregate.counters)
  .map(key => key.match(/^stanza\.([^_]+)$/))
  .filter(match => !!match)
  .map(match => match[1]);

const results = [];
types.forEach(type => {
  const summary = summarize(type);
  if (summary) {
    results.push(summary);
  }
});

results.sort((a, b) => b.successPct - a.successPct);

console.table(results);
