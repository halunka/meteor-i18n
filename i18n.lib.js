maybeGet = function maybeGet (obj, key) {
  return obj && obj[key] ? obj[key] : ['']
}

genObject = function genObject (key, value, obj = {}) {
  obj[key] = value
  return obj
}

flattenObj = function flattenObj (obj, last, par, newObj = {}) {
  _.each(obj, function (value, key) {
    var newKey = par ? `${par}.${key}` : key
    if (typeof value === 'object') return flattenObj(value, last, newKey, newObj)
    if (last) return newObj[par] ? newObj[par][key] = value : newObj[par] = genObject(key, value)
    newObj[newKey] = value
  })
  return newObj
}

splitFormat = function splitFormat (obj) {
  _.each(obj, function (thing, key) {
    if(typeof thing === 'object') obj[key] = splitFormat(thing)
    if(typeof thing === 'string') {
      obj[key] = thing.split(/\$\{[^\}]*[^\\]{1}\}/g).map((elem) => elem
        .replace(/\\\$/g, '$')
        .replace(/\\\{/g, '{')
        .replace(/\\\}/g, '}')
      )
    }
  })
  return obj
}

joinFormat = function (arr, args) {
  return arr.map((elem, i) => elem + (args[i] || '')).join('')
}

joinFormatObj = function (obj, args) {
  _.each(obj, (elem, key) => {
    obj[key] = joinFormat(elem, args)
  })
  return obj
}
