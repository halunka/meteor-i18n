# meteor-i18n - 0.0.3 - alpha
Lightweight, reactive, isomorphic, extendable i18n package for meteor using MongoDB

## Usage

```js
i18n.defaultLang('en')
i18n.addLang('de', 'Deutsch')
i18n.add('Hello Dolly', {
  de: 'Hallo Dolly',
  it: 'Ciao Dolly'
})
i18n.setLang('en')
i18n.getLang()
// -> en
i18n.setLang('it')
i18n.get('Hello Dolly')
// -> 'Ciao Dolly'
i18n.get('Hello Dolly', 'de')
// -> 'Hallo Dolly'
```

```html
<p>{{ i18nget "Hello Dolly" }}</p>
```

The name of the default-helper is kind of clunky. So I'd add the following helper:

```js
Template.registerHelper('_', i18n.get)
```

## API
### i18n.add(key, otherTranslations)
Adds a translation to the DB.

### i18n.get(key[, languageKey])
Returns a translation for either the passed language or the current one.

### i18n.defaultLang(language)
Sets a default language.

### i18n.addLang(key, name)
Adds a new language.

### i18n.setLang(language)
Sets the current language.

### i18n.getLang()
Returns the current language. Falls back to the default language and the first language added

### i18n.listLang()
Returns an array of all added languages in the following format:
```js
{
  key: key,
  name: val
}
```

### i18n.updateTrns()
Updates all translations. This is mainly meant for internal usage.

### Helper: i18nget
An interface to `i18n.get`.

### Helper: i18nList
An interface to `i18n.listLang`.
