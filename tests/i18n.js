function clearState (cb) {
  i18n.state.keys = {}
  if(Meteor.isServer) return i18n.db.remove({}, cb)
  if(cb) return cb()
}

if(Meteor.isServer) {
  i18n.db.allow({
    insert: function () { return true },
    update: function () { return true },
    remove: function () { return true }
  })
}

if(Meteor.isClient) i18n.loadAll()

setTimeout(function () {

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

  Tinytest.addAsync('i18n.setDefaultLanguage', function (test, done) {
    i18n.addLanguage('en', 'English')
    i18n.setDefaultLanguage('en')
    test.equal(i18n.state.get('default'), 'en', 'Should set state.default')
    clearState(done)
  })

  Tinytest.addAsync('i18n.getLanguage', function (test, done) {
    i18n.addLanguage('en', 'English')
    test.equal(i18n.getLanguage(), 'en', 'Return the first value if no default and no currLang is set')
    i18n.setDefaultLanguage('ru')
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

  Tinytest.addAsync('i18n.add', function (test, done) {
    i18n.setDefaultLanguage('en')
    i18n.addLanguage('ru', 'Russian')
    i18n.add({
      en: 'test.i18n.add',
      de: 'test'
    }, function () {
      test.isTrue(i18n.db.find({en: 'test.i18n.add'}).count() > 0, 'Add a new translation')
      test.isTrue(i18n.db.findOne({en: 'test.i18n.add'}).ru, 'Set defaults')
      i18n.add({en: 'test.i18n.add'})
      test.equal(i18n.db.find({en: 'test.i18n.add'}).count(), 1, 'Use upsert')
      test.equal(i18n.db.findOne({en: 'test.i18n.add'})['de'], 'test', 'Insert the object passed')
    })
    i18n.add(
      [
        {
          en: 'test.i18n.add:Multi:en:1',
          de: 'test.i18n.add:Multi:de:1',
        },
        {
          en: 'test.i18n.add:Multi:en:2',
          de: 'test.i18n.add:Multi:de:2',
        },
        {
          en: 'test.i18n.add:Multi:en:3',
          de: 'test.i18n.add:Multi:de:3',
        }
      ],
      function () {
        test.equal(i18n.db.find().count(), 4, 'Add an array of translations')
        clearState(done)
      }
    )
  })

  Tinytest.addAsync('i18n.get', function (test, done) {
    i18n.addLanguage('en', 'English')
    i18n.addLanguage('de', 'Deutsch')
    i18n.addLanguage('rg', 'Rumantsch')
    i18n.setDefaultLanguage('en')
    i18n.add({
      en: 'test.i18n.geten',
      de: 'test.i18n.getde',
      rg: 'test.i18n.getrg'
    }, function () {
      var testString
      i18n.setLanguage('de')
      test.equal(i18n.get('test.i18n.geten'), 'test.i18n.getde', 'Should return the string in the current lang')
      i18n.setLanguage('rg')
      test.equal(i18n.get('test.i18n.geten'), 'test.i18n.getrg', 'Should be able to handle more that two languages')
      if(Meteor.isClient) {
        Tracker.autorun(function () {
          testString = i18n.get('test.i18n.geten')
        })
        i18n.add({
          en: 'test.i18n.geten',
          de: 'test.i18n.getde',
          rg: 'test.i18n.getrg_new'
        }, function () {
          Meteor.setTimeout(function () {
            test.equal(testString, 'test.i18n.getrg_new', 'get should react to changes in the data')
            clearState(done)
          },0)
        })
      } else {
        clearState(done)
      }
    })
  })

  Tinytest.addAsync('i18n.getAll', function (test, done) {
    i18n.addLanguage('en', 'English')
    i18n.addLanguage('de', 'Deutsch')
    i18n.addLanguage('rg', 'Rumantsch')
    i18n.add({
      en: 'test.i18n.getAllen',
      de: 'test.i18n.getAllde',
      rg: 'test.i18n.getAllrg'
    }, function () {
      test.equal(
        i18n.getAll('test.i18n.getAllen'),
        {
          en: 'test.i18n.getAllen',
          de: 'test.i18n.getAllde',
          rg: 'test.i18n.getAllrg'
        },
        'getAll should return an object with all translationse'
      )
      clearState(done)
    })
  })

}, 0)
