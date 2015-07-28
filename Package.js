Package.describe({
  name: 'halunka:i18n',
  version: '0.0.1',
  summary: 'Lightweight, reactive, isomorphic, extendable i18n package for meteor using MongoDB',
  git: 'https://github.com/halunka/meteor-i18n'
})

Package.onUse(function (api) {
  api.export('i18n')
  api.versionsFrom('METEOR@1.1')
  api.use(['reactive-dict', 'mongo', 'templating'])
  api.addFiles([
    'i18n.js'
  ])
})
