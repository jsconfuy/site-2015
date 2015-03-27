var ApiError = function (message, code, internal) {
  this.name = 'ApiError'
  this.message = message || 'Api Error'
  this.code = code || 'ERROR'
  this.internal = internal || true
}

ApiError.prototype = Object.create(Error.prototype)
ApiError.prototype.constructor = ApiError

ApiError.prototype.get = function () {
  return {code: this.code, message: this.message }
}

module.exports = exports = ApiError
