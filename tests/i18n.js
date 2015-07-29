function clearState () {
  i18n.state.keys = {};
}

Tinytest.add('i18n', function (test) {
  test.equal(typeof i18n, 'object', 'Export an object i18n to both client and server')
})

Tinytest.add('i18n.addLang', function (test) {
  i18n.addLang('en', 'English')
  test.equal(i18n.state.get('langs')['en'], 'English', 'Add a key-value pair to i18n.state.langs')
  clearState()
})

Tinytest.add('i18n.setLang', function (test) {
  i18n.setLang('en')
  test.equal(i18n.state.get('currLang'), 'en', 'Set the i18n.state.currLang to the passed value')
  clearState()
})

Tinytest.add('i18n.defaultLang', function (test) {
  i18n.addLang('en', 'English')
  i18n.defaultLang('en')
  test.equal(i18n.state.get('default'), 'en', 'Should set state.default')
  clearState()
})

Tinytest.add('i18n.getLang', function (test) {
  i18n.addLang('en', 'English')
  test.equal(i18n.getLang(), 'en', 'Return the first value if no default and no currLang is set')
  i18n.defaultLang('ru')
  test.equal(i18n.getLang(), 'ru', 'Return the default if no currLang is set')
  i18n.setLang('de')
  test.equal(i18n.getLang(), 'de', 'Return the currLang if it\'s set')
  clearState()
})

Tinytest.add('i18n.listLang', function (test) {
  i18n.addLang('en', 'English')
  test.equal(i18n.listLang().length, 1, 'Return an array of all the registered languages')
})

if(Meteor.isServer) {
  Tinytest.add('i18n.add', function (test) {
    i18n.defaultLang('en')
    i18n.addLang('ru', 'Russian')
    i18n.add('test.i18n.add', {
      de: 'test'
    })
    test.isTrue(i18n.db.find({en: 'test.i18n.add'}).count() > 0, 'Add a new translation')
    test.isTrue(i18n.db.findOne({en: 'test.i18n.add'}).ru, 'Set defaults')
    i18n.add('test.i18n.add', {})
    test.equal(i18n.db.find({en: 'test.i18n.add'}).count(), 1, 'Use upsert')
    test.equal(i18n.db.findOne({en: 'test.i18n.add'})['de'], 'test', 'Insert the object passed')
  })
}

Tinytest.add('i18n.get', function (test) {
  if(Meteor.isServer) {
    i18n.addLang('en', 'English')
    i18n.addLang('de', 'Deutsch')
    i18n.defaultLang('en')
    i18n.add('test.i18n.geten', {
      de: 'test.i18n.getde'
    })
    i18n.setLang('de')
    test.equal(i18n.get('test.i18n.geten'), 'test.i18n.getde', 'Should return the string in the current lang')
  }
})
