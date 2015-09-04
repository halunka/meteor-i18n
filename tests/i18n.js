function clearState (cb) {
  i18n.state.keys = {};
  i18n.db.remove({}, cb())
}

Tinytest.add('i18n', function (test) {
  test.equal(typeof i18n, 'object', 'Export an object i18n to both client and server')
})

Tinytest.addAsync('i18n.addLanguage', function (test, done) {
  i18n.addLanguage('en', 'English')
  test.equal(i18n.state.get('langs')['en'], 'English', 'Add a key-value pair to i18n.state.langs')
  clearState(done)
})

Tinytest.addAsync('i18n.setLanguage', function (test, done) {
  i18n.setLanguage('en')
  test.equal(i18n.state.get('currLang'), 'en', 'Set the i18n.state.currLang to the passed value')
  clearState(done)
})

Tinytest.addAsync('i18n.defaultLanguage', function (test, done) {
  i18n.addLanguage('en', 'English')
  i18n.defaultLanguage('en')
  test.equal(i18n.state.get('default'), 'en', 'Should set state.default')
  clearState(done)
})

Tinytest.addAsync('i18n.getLanguage', function (test, done) {
  i18n.addLanguage('en', 'English')
  test.equal(i18n.getLanguage(), 'en', 'Return the first value if no default and no currLang is set')
  i18n.defaultLanguage('ru')
  test.equal(i18n.getLanguage(), 'ru', 'Return the default if no currLang is set')
  i18n.setLanguage('de')
  test.equal(i18n.getLanguage(), 'de', 'Return the currLang if it\'s set')
  clearState(done)
})

Tinytest.addAsync('i18n.listLanguages', function (test, done) {
  i18n.addLanguage('en', 'English')
  i18n.addLanguage('de', 'Other')
  test.equal(i18n.listLanguages().length, 2, 'Return an array of all the registered languages')
  clearState(done)
})

if(Meteor.isServer) {
  Tinytest.addAsync('i18n.add', function (test, done) {
    i18n.defaultLanguage('en')
    i18n.addLanguage('ru', 'Russian')
    i18n.add('test.i18n.add', {
      de: 'test'
    })
    test.isTrue(i18n.db.find({en: 'test.i18n.add'}).count() > 0, 'Add a new translation')
    test.isTrue(i18n.db.findOne({en: 'test.i18n.add'}).ru, 'Set defaults')
    i18n.add('test.i18n.add', {})
    test.equal(i18n.db.find({en: 'test.i18n.add'}).count(), 1, 'Use upsert')
    test.equal(i18n.db.findOne({en: 'test.i18n.add'})['de'], 'test', 'Insert the object passed')
    clearState(done)
  })
}

Tinytest.addAsync('i18n.get', function (test, done) {
  if(Meteor.isServer) {
    i18n.addLanguage('en', 'English')
    i18n.addLanguage('de', 'Deutsch')
    i18n.addLanguage('rg', 'Rumantsch')
    i18n.defaultLanguage('en')
    i18n.add('test.i18n.geten', {
      de: 'test.i18n.getde',
      rg: 'test.i18n.getrg'
    })
    i18n.setLanguage('de')
    test.equal(i18n.get('test.i18n.geten'), 'test.i18n.getde', 'Should return the string in the current lang')
    i18n.setLanguage('rg')
    test.equal(i18n.get('test.i18n.geten'), 'test.i18n.getrg', 'Should be able to handle more that two languages')
    clearState(done)
  }
})
