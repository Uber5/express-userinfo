const debug = require('debug')('express-userinfo')
export default const options => {
  debug('options', options)
  return (req, res, next) => {
    next()
  }
}
