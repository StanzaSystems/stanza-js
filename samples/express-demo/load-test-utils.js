module.exports = { trackRateLimits };

function trackRateLimits(req, res, context, events, done) {

  const plan = req.headers["x-user-plan"] ?? 'pro';
  const status = res.statusCode
  events.emit("counter", `stanza.${plan}`, 1);
  events.emit("counter", `stanza.${plan}_${status}`, 1);
  return done();
}