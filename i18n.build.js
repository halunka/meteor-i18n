Plugin.registerSourceHandler('i18n.json', function (CompileStep) {
  i18n.add(JSON.parse(CompileStep.read().toString('utf8')))
})
