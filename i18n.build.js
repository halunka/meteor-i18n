Plugin.registerSourceHandler('i18n.json', function (compileStep) {
  compileStep.addJavaScript({
    path: compileStep.inputPath + '.js',
    sourcePath: compileStep.inputPath,
    data: ['if(Meteor.isServer) i18n.add(', ')'].join(compileStep.read().toString('utf8'))
  })
})
