i18n = {}

i18n.db = new Mongo.Collection('halunka:i18n')
i18n.state = new ReactiveDict('i18nValues')
i18n._trns = new ReactiveDict('i18nTrns')
i18n.state.set('langs', {})

i18n.add = function i18nAdd (dataArr, cb) {
  var done = cb ?
    _.compose(cb, i18n.updateTranslations):
    i18n.updateTranslations
  dataArr = [].concat(dataArr)
  for(var i = 0; i < dataArr.length - 1; i++) {
    i18n.insert(dataArr[i])
  }
  i18n.insert(dataArr[i], done)
}

i18n.insert = function i18nInsert (translations, done) {
  var old = i18n.db.findOne(translations)
  translations = _.extend(i18n.state.get('langs'), translations)
  if(old) return i18n.db.update(old._id, { $set: translations }, done)
  return i18n.db.insert(translations, done)
}

i18n.get = function i18nget (key, lang) {
  lang = typeof lang == 'string' ? lang : i18n.getLanguage()
  return maybeGet(i18n._trns.get(key), lang)
}

i18n.setDefaultLanguage = function i18nSetDefaultLang (newValue) {
  i18n.state.set('default', newValue)
  i18n.updateTranslations()
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

i18n.updateTranslations = function i18nUpdateTrns () {
  i18n.db.find().forEach(function (doc) {
    i18n._trns.set(doc[i18n.getDefaultLanguage()], _.omit(doc, '_id'))
  })
}

function maybeGet (obj, key) {
  return obj ? obj[key] : ''
}

i18n.updateTranslations()

if(Meteor.isServer) {
  Meteor.publish('AllTranslations', function () {
    return i18n.db.find()
  })
}

if(Meteor.isClient) {
  i18n.sub = Meteor.subscribe('AllTranslations', function () {
    i18n.updateTranslations()
  })
  Template.registerHelper('i18nget', i18n.get)
  Template.registerHelper('i18nlist', i18n.listLanguage)
}
