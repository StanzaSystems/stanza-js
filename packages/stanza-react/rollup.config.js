// const SECONDARY_LIBS = ['client', 'server'];
// const SECONDARY_PATH = SECONDARY_LIBS.map(
//   (p) => `packages/stanza-react/src/${p}.ts`
// );

module.exports = function (config) {
  return {
    ...config,
    // input: [config.input, ...SECONDARY_PATH],
    output: {
      ...config.output,
      // entryFileNames: ({ facadeModuleId }) => {
      //   const index = SECONDARY_PATH.findIndex((pth) =>
      //     facadeModuleId.endsWith(pth)
      //   );
      //   console.warn('##### facadeModuleId', facadeModuleId)
      //   console.warn('##### index', index)
      //   return index >= 0
      //     ? `src/${SECONDARY_LIBS[index]}.js`
      //     : '[name].js';
      // },
      banner:  (...args) => {
        console.trace('foo')
        console.warn('%%%%% args', args)
        // const index = SECONDARY_PATH.findIndex((pth) =>
        //   facadeModuleId.endsWith(pth)
        // );
        //
        // if(SECONDARY_LIBS[index] === 'client') {
        //   return "'use client'"
        // }
        return ''
      }
    }
  }
}
