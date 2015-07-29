i18n = {}

i18n.db = new Mongo.Collection('halunka:i18n')
i18n.state = new ReactiveDict('i18nValues')
i18n._trns = new ReactiveDict('i18nTrns')
i18n.state.set('langs', {})

i18n.add = function i18nAdd (defTrns, trnsObj) {
  trnsObj = _.extend(i18n.state.get('langs'), trnsObj)
  trnsObj[i18n.getDefaultLang()] = defTrns
  return i18n.db.upsert(trnsObj, { $set: trnsObj })
}

i18n.get = function i18nget (key, lang) {
  lang = typeof lang == 'string' ? lang : i18n.getLang()
  return maybeGet(i18n._trns.get(key), lang)
}

i18n.defaultLang = function i18nDefaultLang (newValue) {
  i18n.state.set('default', newValue)
  i18n.updateTrns()
  return newValue
}

i18n.getDefaultLang = function i18nGetDefaultLang (newValue) {
  return i18n.state.get('default') ||
    _.keys(i18n.state.get('langs'))[0]
}

i18n.addLang = function i18nAddLang (key, str) {
  var langs = i18n.state.get('langs') || {}
  langs[key] = str
  i18n.state.set('langs', langs)
}

i18n.setLang = function i18nSet (lang) {
  return i18n.state.set('currLang', lang)
}

i18n.getLang = function i18nGet () {
  return i18n.state.get('currLang') ||
    i18n.getDefaultLang()
}

i18n.listLang = function i18nList () {
  return _.map(i18n.state.get('langs'), function (val, key) {
    return {
      key: key,
      name: val
    }
  })
}

i18n.updateTrns = function i18nUpdateTrns () {
  i18n.db.find().forEach(function (doc) {
    var def = i18n.getDefaultLang()
    i18n._trns.set(doc[def], _.omit(doc, '_id'))
  })
}

function maybeGet (obj, key) {
  return obj ? obj[key] : ''
}

i18n.updateTrns()

if(Meteor.isServer) {
  Meteor.publish('AllTranslations', function () {
    return i18n.db.find()
  })
}

if(Meteor.isClient) {
  i18n.sub = Meteor.subscribe('AllTranslations', function () {
    i18n.updateTrns()
  })
  Template.registerHelper('i18nget', i18n.get)
  Template.registerHelper('i18nlist', i18n.listLang)
}
