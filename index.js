const debug = require('debug')('express-userinfo')

function getAccessToken(req) {
  const auth = req.get('authorization')
  if (!auth) return undefined;
  const match = auth.match(/^Bearer (.+)$/)
  if (match && match.length === 2 && match[1]) return match[1];
  return undefined
}

module.exports = options => {

  debug('options', options)

  const handleError = options.handleError || function(status, message) {
    debug(`error, status=${ status }: ${ message }`)
    res.status(status)
    return next(message)
  }

  let fetcher
  if (options.fetcher) {
    fetcher = options.fetcher
  } else {
    const fetch = require('isomorphic-fetch')
    if (!options.site) {
      throw new Error('options.site not given, but required. Alternatively, give options.fetcher')
    }
    fetcher = token => {
      return fetch(options.site + '/userinfo', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${ token }`
        }
      }).then(res => res.json())
    }
  }

  return (req, res, next) => {
    const token = getAccessToken(req)
    if (!token) return handleError(401, new Error('missing or invalid authorization header'))
    req.access_token = token
    fetcher(token)
    .then(userinfo => {
      debug('userinfo', userinfo)
      req.userinfo = userinfo
      next()
    })
    .catch(err => handleError(401, err))
  }
}
