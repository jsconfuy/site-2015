var JsonError = function (message, code, internal) {
  this.name = 'JsonError'
  this.message = message || 'Json Error'
  this.code = code || 'ERROR'
  this.internal = internal || true
}

JsonError.prototype = Object.create(Error.prototype)
JsonError.prototype.constructor = JsonError

JsonError.prototype.get = function () {
  return {code: this.code, message: this.message }
}


module.exports = exports = JsonError
