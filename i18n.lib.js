maybeGet = function maybeGet (obj, key) {
  return obj && obj[key] ? obj[key] : ['']
}

genObject = function genObject (key, value, obj) {
  obj = obj || {}
  obj[key] = value
  return obj
}

flattenObj = function flattenObj (obj, last, par, newObj) {
  newObj = newObj || {}
  _.each(obj, function (value, key) {
    var newKey = par ? [par, key].join('.') : key
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
      obj[key] = _.map(thing.split('%s'), function (el) {
        return replaceAll(el, '%\\s', '%s')
      })
    }
  })
  return obj
}

joinFormat = function (arr, args) {
  return arr.map(function (elem, i) { return elem + (args[i] || '') }).join('')
}

joinFormatObj = function (obj, args) {
  _.each(obj, function (elem, key) {
    obj[key] = joinFormat(elem, args)
  })
  return obj
}

replaceAll = function (str, where, that) {
  while(str.indexOf(where) > -1) str = str.replace(where, that)
  return str
}
