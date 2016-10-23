# Purpose

Use this [express](http://expressjs.com/)
[middleware](http://expressjs.com/en/guide/using-middleware.html) to retrieve
information about the user, when an [OAuth2 access
token](https://tools.ietf.org/html/rfc6749#section-4.1.3) is given.

The userinfo would typically adhere to [OIDC's
userinfo](http://openid.net/specs/openid-connect-core-1_0.html#UserInfo).

# How

(Note: You need promises and ES6 support for `const` keyword; if this is an
issue, it should be easy enough to downgrade; pull requests welcome.)

Assuming an existing expressjs application, install this middleware

```bash
npm install express-userinfo isomorphic-fetch
```

, then configure and use it in a route, e.g.

```javascript
const expressUserinfo = require('express-userinfo')

const getUserinfo = expressUserinfo({
  site: 'http://my-oidc-provider.com'
})
app.get('/something-with-userinfo', getUserinfo, (req, res, next) => {
  res.send(`sub=${ req.userinfo.sub }, token=${ req.access_token }`)
})
```

