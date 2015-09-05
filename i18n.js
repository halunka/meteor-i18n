i18n = {}

i18n.db = new Mongo.Collection('halunka:i18n')
i18n.state = new ReactiveDict('i18nValues')
i18n.state.set('langs', {})
i18n.dep = new Tracker.Dependency
i18n.depChanged = i18n.dep.changed.bind(i18n.dep)

i18n.add = function i18nAdd (dataArr, cb) {
  var done = cb ?
    _.compose(cb, i18n.depChanged):
    i18n.depChanged
  dataArr = [].concat(dataArr)
  for(var i = 0; i < dataArr.length - 1; i++) {
    i18n.insert(dataArr[i])
  }
  i18n.insert(dataArr[i], done)
}

i18n.insert = function i18nInsert (translations, done) {
  var oldId
  var lang = i18n.getDefaultLanguage()
  oldId = ( i18n.db.findOne(constructObject(lang, translations[lang])) || {} )._id
  translations = _.extend(i18n.state.get('langs'), translations)
  if(oldId) return i18n.db.update(oldId, { $set: translations }, done)
  return i18n.db.insert(translations, done)
}

i18n.get = function i18nget (key, lang) {
  lang = typeof lang == 'string' ? lang : i18n.getLanguage()
  return maybeGet(i18n.reactiveQuery(key), lang)
}

i18n.getAll = function i18nGetAll (key) {
  lang = typeof lang == 'string' ? lang : i18n.getLanguage()
  return _.omit(i18n.reactiveQuery(key), '_id')
}

i18n.reactiveQuery = function i18nReactiveQuery (key) {
  i18n.dep.depend()
  return i18n.db.findOne(constructObject(i18n.getDefaultLanguage(), key))
}

i18n.setDefaultLanguage = function i18nSetDefaultLang (newValue) {
  i18n.state.set('default', newValue)
  return newValue
}

i18n.getDefaultLanguage = function i18nGetDefaultLanguage () {
  return i18n.state.get('default') ||
    _.keys(i18n.state.get('langs') || [])[0]
}

i18n.addLanguage = function i18nAddLanguage (key, str) {
  var langs = i18n.state.get('langs') || {}
  langs[key] = str
  i18n.state.set('langs', langs)
}

i18n.setLanguage = function i18nSet (lang) {
  return i18n.state.set('currLang', lang)
}

i18n.getLanguage = function i18nGet () {
  return i18n.state.get('currLang') ||
    i18n.getDefaultLanguage()
}

i18n.listLanguages = function i18nListLanguages () {
  return _.map(i18n.state.get('langs'), function (val, key) {
    return {
      key: key,
      name: val
    }
  })
}

function maybeGet (obj, key) {
  return obj ? obj[key] : ''
}

function constructObject (key, value) {
  var obj = {}
  obj[key] = value
  return obj
}

if(Meteor.isServer) {
  Meteor.publish('i18n:all', function () {
    return i18n.db.find()
  })
  Meteor.publish('i18n:specific', function (lang) {
    return i18n.db.find({ fields: [lang] })
  })
}

if(Meteor.isClient) {
  Template.registerHelper('i18nget', i18n.get)
  Template.registerHelper('i18nlist', i18n.listLanguage)

  i18n.loadSpecific = function i18nLoadSpecific (lang, cb) {
    Meteor.subscribe('i18n:specific', lang, function () {
      i18n.depChanged()
      if(cb) cb()
    })
  }

  i18n.loadAll = function i18nLoadAll (cb) {
    Meteor.subscribe('i18n:all', function () {
      i18n.depChanged()
      if(cb) cb()
    })
  }
}
