i18n = {}

i18n.db = new Mongo.Collection('halunka:i18n')
i18n.state = new ReactiveDict('i18nValues')
i18n.trns = new ReactiveDict('i18nTrns')
i18n.acts = {}

i18n.default = function i18nDefault (newValue) {
  return this.state.set('default', newValue)
}

i18n.add = function i18nAdd (defTrns, trnsObj) {
  trnsObj[this.state.get('default')] = defTrns
  return this.db.upsert(trnsObj, { $set: trnsObj })
}

i18n.addLang = function i18nAddLang (key, str) {
  var langs = this.state.get('langs') || {}
  langs[key] = str
  this.state.set('langs', langs)
}

i18n.set = function i18nSet (lang) {
  return this.state.set('currLang', lang)
}

i18n.get = function i18nGet () {
  return this.state.get('currLang') || this.state.get('default') || 'en'
}

i18n.list = function i18nList () {
  return _.map(this.state.get('langs'), function (val, key) {
    return {
      key: key,
      name: val
    }
  })
}

i18n._ = function i18n_ (key, lang) {
  lang = typeof lang == 'string' ? lang : this.get()
  var query = {}
  var act
  var trns
  query[this.state.get('default')] = key
  act = this.db.findOne.bind(this.db, query)
  this.acts[key + lang] = act
  this.trns.set(key + lang, act())
  trns = this.trns.get(key + lang)
  return (trns && trns[lang])
}

i18n.updateTrns = function i18nUpdateTrns () {
  var self = this
  _.each(this.acts, function (act, key) {
    self.trns.set(key, act())
  })
}

if(Meteor.isServer) {
  Meteor.publish('AllTranslations', function () {
    return i18n.db.find()
  })
}

if(Meteor.isClient) {
  Meteor.subscribe('AllTranslations', function () {
    i18n.updateTrns()
  })
  Template.registerHelper('i18n_', i18n._.bind(i18n))
  Template.registerHelper('i18nList', i18n.list.bind(i18n))
}
