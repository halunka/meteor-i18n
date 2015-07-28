i18n = {}

i18n.db = new Mongo.Collection('halunka:i18n')

i18n.state = new ReactiveDict('i18nValues')

i18n.default = function i18nDefault (newValue) {
  return this.state.set('default', newValue)
}

i18n.add = function i18nAdd (defTrns, trnsObj) {
  trnsObj[this.state.get('default')] = defTrns
  return this.db.upsert(trnsObj, { $set: trnsObj })
}

i18n.set = function i18nSet (lang) {
  return this.state.set('currLang', lang)
}

i18n.get = function i18nGet () {
  return this.state.get('currLang') || this.state.get('default') || 'en'
}

i18n._ = function i18n_ (key, lang) {
  lang = lang || this.get()
  var query = {}
  query[lang] = key
  return this.db.findOne(query)
}

Template.registerHelper('i18n', i18n._)
