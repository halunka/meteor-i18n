# meteor-i18n - 1.1.0
Lightweight, reactive, isomorphic, extendable i18n package for meteor using MongoDB

## Usage

_server_

```js
i18n.addLanguage('en', 'English')
i18n.addLanguage('de', 'Deutsch')
i18n.addLanguage('it', 'Italiano')
i18n.add({
  welcome: {
    salutation: {
      en: 'Hello Dolly',
      de: 'Hallo Dolly'
    }
  }
})
i18n.add({
  welcome: {
    salutation: 'Ciao Dolly'
  }
}, 'it')
i18n.setLanguage('en')
i18n.getLanguage()
// -> en
i18n.setLanguage('it')
i18n.get('welcome.salutation')
// -> 'Ciao Dolly'
i18n.get('welcome.salutation', 'de')
// -> 'Hallo Dolly'
```

_client_

By default the client can't add translations. You can simply set up allow/deny rules on the database.

```js
i18n.addLanguage('de', 'Deutsch')
i18n.addLanguage('en', 'English')
i18n.loadAll(function () {
  i18n.setLanguage('it')
  i18n.get('welcome.salutation')
  // -> 'Ciao Dolly'
  i18n.get('welcome.salutation', 'de')
})
```

```html
<p>{{ i18nget "welcome.salutation" }}</p>
```

The name of the default-helper is kind of clunky. So I'd add the following helper:

```js
Template.registerHelper('_', i18n.get)
```

## API

### translations.i18n.json
`halunka:i18n` adds the contents of files with the `.i18n.json` extension to the database. The filenames cannot contain dots.
Example:
```json
{
  "salutations": {
    dolly: {
      "en": "Hello Dolly",
      "de": "Hallo Dolly",
      "it": "Ciao Dolly"
    },
    sam: {
      "en": "Hello Sam",
      "de": "Hallo Sam",
      "it": "Ciao Sam"
    }
  }
}
```

### i18n.add(translations[, language]) - _server_
Adds a translation to the DB. This function is only availible on the server, mainly because you can't `upsert` from the client. Also it seems like an edge-case. If you want to use it on the client you can do something like this:

```js
if(Meteor.isServer) {
  Meteor.methods({
    'i18n:add': i18n.add
  })
} else {
  i18n.add = function (data, lang) {
    Meteor.call('i18n:add', data, lang)
  }
}
```

### i18n.get(key[, languageKey]) - _common_
Returns a translation for either the passed language or the current one.

### i18n.getAll(key) - _common_
Returns an object with all translations with a key.

### i18n.addLanguage(key, name) - _common_
Adds a new language.

### i18n.setLanguage(language) - _common_
Sets the current language.

### i18n.getLanguage() - _common_
Returns the current language. Falls back to the default language and the first language added

### i18n.listLanguages() - _common_
Returns an array of all added languages in the following format:
```js
{
  key: key,
  name: val
}
```

### i18n.loadSpecific(language, callback) - _client_
Loads translations for a specific language on the client and the calls the `callback`.

### i18n.loadAll(callback) - _client_
Loads all translation on the client and calls the callback function.

### i18n.db
The Mongo DB.

### Helper: i18nget - _common_
An interface to `i18n.get`.

### Helper: i18nList - _common_
An interface to `i18n.listLang`.

# TODO
* document string templating
