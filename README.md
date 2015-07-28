# meteor-i18n
Lightweight, reactive, isomorphic, extendable i18n package for meteor using MongoDB

## Usage

```js
i18n.default('en')
i18n.add('Hello Dolly', {
  de: 'Hallo Dolly',
  it: 'Ciao Dolly'
})
i18n.set('en')
i18n.get()
// -> en
i18n.set('it')
i18n._('Hello Dolly')
// -> 'Ciao Dolly'
i18n._('Hello Dolly', 'de')
// -> 'Hallo Dolly'
```

```html
<p>{{ _ "Hello Dolly" }}</p>
```
