function summarizeLastRun() {
  let runData = require('./js-load.json')
  const enterprise = {
    type: 'enterprise',
    total: runData.aggregate.counters['stanza.enterprise'],
    success: runData.aggregate.counters['stanza.enterprise_200'],
    limited: runData.aggregate.counters['stanza.enterprise_429'],
  }

  // const pro = {
  //   type: 'pro',
  //   total: runData.aggregate.counters['stanza.pro'],
  //   success: runData.aggregate.counters['stanza.pro_200'],
  //   limited: runData.aggregate.counters['stanza.pro_429'],
  // }

  const free = {
    type: 'free',
    total: runData.aggregate.counters['stanza.free'],
    success: runData.aggregate.counters['stanza.free_200'],
    limited: runData.aggregate.counters['stanza.free_429'],
  }

  enterprise.successPct = enterprise.success/enterprise.total;
 // pro.successPct = pro.success/pro.total;
  free.successPct = free.success/free.total;

  console.table([enterprise,  free])
}

summarizeLastRun()