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

i18n.get = function i18nGet (key, lang, ...vars) {
  lang = typeof lang == 'string' ? lang : i18n.getLanguage()
  return joinFormat(maybeGet(i18n.reactiveQuery({key: key}), lang), vars)
}

i18n.getAll = function i18nGetAll (key, ...vars) {
  return joinFormatObj(i18n.reactiveQuery({key: key}), vars)
}

i18n.reactiveQuery = function i18nReactiveQuery (query) {
  i18n.dep.depend()
  return _.omit(i18n.db.findOne(query), '_id', 'key')
}

i18n.addLanguage = function i18nAddLanguage (key, str) {
  var langs = i18n.state.get('langs') || {}
  langs[key] = str
  i18n.state.set('langs', langs)
}

i18n.setLanguage = function i18nSet (lang) {
  return i18n.state.set('currLang', lang)
}

i18n.getLanguage = function i18nGetLanguage () {
  return i18n.state.get('currLang')
}

i18n.listLanguages = function i18nListLanguages () {
  return _.map(i18n.state.get('langs'), (name, key) => { return { key, name }})
}

if(Meteor.isServer) {
  i18n.add = function i18nAdd (data, lang, parent) {
    _.each(splitFormat(flattenObj(data, !lang)), (translation, key) => {
      i18n.db.upsert(
        ( i18n.db.findOne({key: key}) || {} )._id,
        {$set: _.extend(
          { key: key },
          lang
            ? {[lang]: translation}
            : translation
        )}
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
  Template.registerHelper('i18nlist', i18n.listLanguages)

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
