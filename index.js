var debug = require('debug')('express-userinfo')

function getAccessToken(req) {
  var auth = req.get('authorization')
  if (!auth) return undefined;
  var match = auth.match(/^Bearer (.+)$/)
  if (match && match.length === 2 && match[1]) return match[1];
  return undefined
}

module.exports = function(options) {

  debug('options', options)

  var fetcher
  if (options.fetcher) {
    fetcher = options.fetcher
  } else {
    var fetch = require('isomorphic-fetch')
    if (!options.site) {
      throw new Error('options.site not given, but required. Alternatively, give options.fetcher')
    }
    fetcher = function(token) {
      return fetch(options.site + '/userinfo', {
        method: 'GET',
        headers: {
          authorization: 'Bearer ' + token
        }
      }).then(function(res) {
        debug('userinfo response, status=' + res.status)
        if (res.status >= 300) {
          return res.text().then(function(body) {
            throw new Error('Unable to retrieve userinfo: ' + body)
          })
        }
        return res.json()
      })
    }
  }

  return function(req, res, next) {

    var handleError = options.handleError || function(status, message) {
      debug('error, status=' + status + ': ' + message)
      res.status(status)
      return next(message)
    }

    var token = getAccessToken(req)
    if (!token) return handleError(401, new Error('missing or invalid authorization header'))
    req.access_token = token
    fetcher(token)
    .then(function(userinfo) {
      debug('userinfo', userinfo)
      req.userinfo = userinfo
      next()
    })
    .catch(function(err) { return handleError(401, err) })
  }
}
