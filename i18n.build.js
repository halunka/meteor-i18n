Plugin.registerSourceHandler('i18n.json', function (compileStep) {
  compileStep.addJavaScript({
    path: compileStep.inputPath + '.js',
    sourcePath: compileStep.inputPath,
    data: [
      'if(Meteor.isServer) i18n.add(',
      compileStep.read().toString('utf8'), ')',
      compileStep.inputPath.split('.i18n.json')[0].split('.')[1],
    ].join('')
  })
})
