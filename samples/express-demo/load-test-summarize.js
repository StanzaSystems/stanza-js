function summarizeLastRun() {
  let runData = require('./js-load.json')
  const enterprise = {
    type: 'enterprise',
    total: runData.aggregate.counters['stanza.enterprise'],
    success: runData.aggregate.counters['stanza.enterprise_200'] || 0,
    limited: runData.aggregate.counters['stanza.enterprise_429'] || 0
  }

  const pro = {
    type: 'pro',
    total: runData.aggregate.counters['stanza.pro'],
    success: runData.aggregate.counters['stanza.pro_200'] || 0,
    limited: runData.aggregate.counters['stanza.pro_429'] || 0
  }

  const free = {
    type: 'free',
    total: runData.aggregate.counters['stanza.free'],
    success: runData.aggregate.counters['stanza.free_200'] || 0,
    limited: runData.aggregate.counters['stanza.free_429'] || 0
  }

  enterprise.successPct = Math.round(
    (enterprise.success / enterprise.total) * 100
  )
  pro.successPct = Math.round((pro.success / pro.total) * 100)
  free.successPct = Math.round((free.success / free.total) * 100)

  console.table([enterprise, pro, free])
}

summarizeLastRun()
