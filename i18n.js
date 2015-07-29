i18n = {}

i18n.db = new Mongo.Collection('halunka:i18n')
i18n.state = new ReactiveDict('i18nValues')
i18n._trns = new ReactiveDict('i18nTrns')
i18n._acts = {}

i18n.add = function i18nAdd (defTrns, trnsObj) {
  _.extend(trnsObj, i18n.state.get('langs'))
  trnsObj[i18n.state.get('default')] = defTrns
  return i18n.db.upsert(trnsObj, { $set: trnsObj })
}

i18n.get = function i18nget (key, lang) {
  lang = typeof lang == 'string' ? lang : i18n.get()
  var query = {}
  var act
  var trns
  query[i18n.state.get('default')] = key
  act = i18n.db.findOne.bind(i18n.db, query)
  i18n._acts[key + lang] = act
  i18n._trns.set(key + lang, act())
  trns = i18n._trns.get(key + lang)
  return (trns && trns[lang])
}

i18n.defaultLang = function i18nDefault (newValue) {
  return i18n.state.set('default', newValue)
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
    i18n.state.get('default') ||
    _.keys(i18n.state.get('langs'))[0]
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
  var self = i18n
  _.each(i18n._acts, function (act, key) {
    self._trns.set(key, act())
  })
}

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
