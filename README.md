# meteor-i18n - 0.0.1 - early alpha
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
<p>{{ i18n "Hello Dolly" }}</p>
```

## API
