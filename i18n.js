i18n = {}

i18n.db = new Mongo.Collection('halunka:i18n')
i18n.state = new ReactiveDict('i18nValues')
i18n._trns = new ReactiveDict('i18nTrns')
i18n._acts = {}

i18n.add = function i18nAdd (defTrns, trnsObj) {
  _.extend(trnsObj, this.state.get('langs'))
  trnsObj[this.state.get('default')] = defTrns
  return this.db.upsert(trnsObj, { $set: trnsObj })
}

i18n.get = function i18nget (key, lang) {
  lang = typeof lang == 'string' ? lang : this.get()
  var query = {}
  var act
  var trns
  query[this.state.get('default')] = key
  act = this.db.findOne.bind(this.db, query)
  this._acts[key + lang] = act
  this._trns.set(key + lang, act())
  trns = this._trns.get(key + lang)
  return (trns && trns[lang])
}

i18n.defaultLang = function i18nDefault (newValue) {
  return this.state.set('default', newValue)
}

i18n.addLang = function i18nAddLang (key, str) {
  var langs = this.state.get('langs') || {}
  langs[key] = str
  this.state.set('langs', langs)
}

i18n.setLang = function i18nSet (lang) {
  return this.state.set('currLang', lang)
}

i18n.getLang = function i18nGet () {
  return this.state.get('currLang') ||
    this.state.get('default') ||
    _.keys(this.state.get('langs'))[0]
}

i18n.listLang = function i18nList () {
  return _.map(this.state.get('langs'), function (val, key) {
    return {
      key: key,
      name: val
    }
  })
}

i18n.updateTrns = function i18nUpdateTrns () {
  var self = this
  _.each(this._acts, function (act, key) {
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
  Template.registerHelper('i18nget', i18n.get.bind(i18n))
  Template.registerHelper('i18nlist', i18n.listLang.bind(i18n))
}
