maybeGet = function maybeGet (obj, key) {
  return obj ? obj[key] : ''
}

genObject = function genObject (key, value, obj) {
  obj = obj || {}
  obj[key] = value
  return obj
}

queryWithKey = function queryWithKey (key) {
  return genObject(escKey(key), {$exists: true})
}

flattenObj = function flattenObj (obj, last, par, newObj) {
  newObj = newObj || {}
  _.each(obj, function (value, key) {
    var newKey = par ? [par, key].join('.') : key
    if (typeof value === 'object') return flattenObj(value, last, newKey, newObj)
    if (last) newObj[par] ? newObj[par][key] = value : newObj[par] = genObject(key, value)
    newObj[newKey] = value
  })
  return newObj
}

escKey = function escKey (key) {
  return key.split('.').join('-')
}

escKeysObj = function escKeysObj (obj) {
  return _.object(_.map(_.keys(obj), escKey), _.values(obj))
}