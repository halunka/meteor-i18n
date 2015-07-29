Package.describe({
  name: 'halunka:i18n',
  version: '0.0.3',
  summary: 'Lightweight, reactive, isomorphic, extendable i18n package for meteor using MongoDB',
  git: 'https://github.com/halunka/meteor-i18n'
})

Package.onUse(function (api) {
  api.export('i18n')
  api.versionsFrom('METEOR@1.1')
  api.use(['reactive-dict', 'mongo', 'templating', 'underscore'])
  api.addFiles([
    'i18n.js'
  ])
})

Package.onTest(function (api) {
  api.use(['tinytest', 'halunka:i18n', 'underscore', 'reactive-dict'])
  api.addFiles('tests/i18n.js')
})
