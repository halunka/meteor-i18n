maybeGet = function maybeGet (obj, key) {
  return obj ? obj[key] : ''
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
