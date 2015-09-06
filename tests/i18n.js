function clearState (cb) {
  i18n.state.keys = {}
  if(Meteor.isServer) return i18n.db.remove({}, cb)
  if(cb) return cb()
}

function autorun (cb) {
  if(Meteor.isServer)
    Meteor.setTimeout(cb, 10)
  else
    Tracker.autorun(cb)
}

if(Meteor.isServer) {
  i18n.db.allow({
    insert: function () { return true },
    update: function () { return true },
    remove: function () { return true }
  })
  Meteor.methods({
    'i18n:add': i18n.add
  })
} else {
  i18n.add = function (data, lang) {
    Meteor.call('i18n:add', data, lang)
  }
}

if(Meteor.isClient) i18n.loadAll()

Meteor.setTimeout(function () {

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

  Tinytest.addAsync('i18n.getLanguage', function (test, done) {
    i18n.addLanguage('en', 'English')
    i18n.setLanguage('ru')
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
    i18n.setLanguage('en')
    i18n.addLanguage('ru', 'Russian')
    i18n.add({
      i18nAddTest: 'test.i18n.add:de'
    }, 'de')
    i18n.add({
      i18nAddTest: 'test.i18n.add:en'
    }, 'en')
    autorun(function (comp) {
      var allTrs = i18n.getAll('i18nAddTest')
      if(!(allTrs && allTrs.en && allTrs.de)) return
      if(comp) comp.stop()
      test.isTrue(i18n.db.find().count() > 0, 'Add a new translation')
      i18n.add({i18nAddTest: 'test.i18n.add'}, 'en')
      autorun(function () {
        if(i18n.get('i18nAddTest') === 'test.i18n.add')
        test.equal(i18n.get('i18nAddTest'), 'test.i18n.add', 'Use upsert')
      })
      test.equal(i18n.get('i18nAddTest', 'de'), 'test.i18n.add:de', 'Insert the object passed')
    })
    i18n.add({
      'test.i18n.add:Multi:1': 'test.i18n.add:Multi:en:1',
      'test.i18n.add:Multi:2': 'test.i18n.add:Multi:en:2',
      'test.i18n.add:Multi:3': 'test.i18n.add:Multi:en:3'
    }, 'en')
    i18n.add({
      'test.i18n.add:Multi:1': 'test.i18n.add:Multi:de:1',
      'test.i18n.add:Multi:2': 'test.i18n.add:Multi:de:2',
      'test.i18n.add:Multi:3': 'test.i18n.add:Multi:de:3'
    }, 'de')
    autorun(function (comp) {
      var allTrs = i18n.getAll('test.i18n.add:Multi:1')
      if(!(allTrs && allTrs.en && allTrs.de)) return
      if(comp) comp.stop()
      test.equal(i18n.db.find().count(), 4, 'Add an multiple translations')
      clearState(done)
    })
  })

  Tinytest.addAsync('i18n.get', function (test, done) {
    i18n.addLanguage('en', 'English')
    i18n.addLanguage('de', 'Deutsch')
    i18n.addLanguage('rg', 'Rumantsch')
    i18n.setLanguage('en')
    i18n.add({
      'i18n.get': {
        en: 'test.i18n.geten',
        de: 'test.i18n.getde',
        rg: 'test.i18n.getrg'
      }
    })
    autorun(function (comp) {
      var testString
      if(!i18n.get('i18n.get')) return
      if(comp) comp.stop()
      i18n.setLanguage('de')
      test.equal(i18n.get('i18n.get'), 'test.i18n.getde', 'Should return the string in the current lang')
      i18n.setLanguage('rg')
      test.equal(i18n.get('i18n.get'), 'test.i18n.getrg', 'Should be able to handle more that two languages')
      if(Meteor.isClient) {
        autorun(function () {
          testString = i18n.get('i18n.get')
        })
        i18n.add({
          'i18n.get': {
            en: 'test.i18n.geten',
            de: 'test.i18n.getde',
            rg: 'test.i18n.getrg_new'
          }
        })
        autorun(function () {
          if(i18n.get('i18n.get') === 'test.i18n.getrg_new')
          test.equal(testString, 'test.i18n.getrg_new', 'get should react to changes in the data')
          clearState(done)
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
      'test.i18n.getAll': {
        en: 'test.i18n.getAllen',
        de: 'test.i18n.getAllde',
        rg: 'test.i18n.getAllrg'
      }
    })
    autorun(function () {
      if(i18n.getAll('test.i18n.getAll'))
      test.equal(
        i18n.getAll('test.i18n.getAll'),
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
