i18n = {}

i18n.db = new Mongo.Collection('halunka:i18n')
i18n.state = new ReactiveDict('i18nValues')
i18n.state.set('langs', {})
i18n.dep = new Tracker.Dependency
i18n.depChanged = i18n.dep.changed.bind(i18n.dep)

i18n.db.find().observe({
  addded: i18n.depChanged,
  changed: i18n.depChanged,
  removed: i18n.depChanged
})

i18n.get = function i18nget (key, lang) {
  lang = typeof lang == 'string' ? lang : i18n.getLanguage()
  return maybeGet(i18n.reactiveQuery(queryWithKey(key)), lang)
}

i18n.getAll = function i18nGetAll (key) {
  return i18n.reactiveQuery(queryWithKey(key))
}

i18n.reactiveQuery = function i18nReactiveQuery (query) {
  i18n.dep.depend()
  return _.values(_.omit(i18n.db.findOne(query), '_id'))[0]
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
  return i18n.state.get('currLang')
}

i18n.listLanguages = function i18nListLanguages () {
  return _.map(i18n.state.get('langs'), function (val, key) {
    return {
      key: key,
      name: val
    }
  })
}

if(Meteor.isServer) {

  i18n.add = function i18nAdd (data, lang, parent) {
    _.each(escKeysObj(flattenObj(data, !lang)), function (translation, key) {
      i18n.db.upsert(
        ( i18n.db.findOne(queryWithKey(key)) || {} )._id,
        { $set: genObject(lang ? [key, lang].join('.') : key, translation) }
      )
    })
  }

  Meteor.publish('i18n:all', function () {
    return i18n.db.find()
  })

  Meteor.publish('i18n:specific', function (lang) {
    return i18n.db.find({fields: lang})
  })

} else {
  Template.registerHelper('i18nget', i18n.get)
  Template.registerHelper('i18nlist', i18n.listLanguage)

  i18n.loadAll = function i18nLoadAll (cb) {
    Meteor.subscribe('i18n:all', function () {
      i18n.depChanged()
      if(cb) cb()
    })
  }

  i18n.loadSpecific = function i18nLoadSpecific (lang, cb) {
    Meteor.subscribe('i18n:specific', lang, function () {
      i18n.depChanged()
      if(cb) cb()
    })
  }
}
