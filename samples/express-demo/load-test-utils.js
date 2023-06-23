module.exports = { trackRateLimitsFromApp, trackRateLimitsFromHub };

function trackRateLimitsFromApp(req, res, context, events, done) {

  const plan = req.headers["x-user-plan"] ?? 'pro';
  const status = res.statusCode
  events.emit("counter", `stanza.${plan}`, 1);
  events.emit("counter", `stanza.${plan}_${status}`, 1);
  return done();
}


function trackRateLimitsFromHub(req, res, context, events, done) {
  const plan = req.headers["x-user-plan"] ?? 'pro';
  const response = JSON.parse(res.body)
  console.log(response)
  const status = (response?.granted === true) ? 200 : 429;
  events.emit("counter", `stanza.${plan}`, 1);
  events.emit("counter", `stanza.${plan}_${status}`, 1);
  return done();
}