module.exports = function (config) {
  return {
    ...config,
    output: {
      ...config.output,
      banner: () => '"use client";'
    }
  }
}
