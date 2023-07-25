
# What is a JWT?

## tl;dr
![SecurityZines-jwt-image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffce4ecfc-6dc8-46f6-ae4f-f05b8da3467a_1530x1536.jpeg)

**JSON Web Tokens** (JWTs) are an open, industry standard [RFC 7519](https://tools.ietf.org/html/rfc7519) method for representing claims securely between two parties.

```jwt
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey
JzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikpva
G4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKx
wRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```
Although it may look like garbage text, it's actually just a grouping of Base64-Url strings consisting of the following:


<span style="color:red">xxxxx</span>.<span style="color:pink">yyyyy</span>.<span style="color:lightblue">zzzzz</span>

* <span style="color:red">xxxxx</span> represents the [Header](#header)

* <span style="color:pink">yyyyy</span> represents the [Payload](#payload)

* <span style="color:lightblue">zzzzz</span> represents the [Signature](#signature)

## Header
The header usually contains the `alg` (algorithm), and `typ` (type) of the JWT. Though it can also container additional keys, which may contain public keys, or URLs on where to locate public keys for validation, more on this later.

```json
{
    "alg": "HS256",
    "typ": "JWT"
}

or...

{
    "alg": "RS256",
    "typ": "JWT",
    "kid": "NTVBOTNjEyMw"
}
```

### Less common headers:
The following are valid in the `header` but maybe less common.
* `kid` - **Key ID** is used as an ID to lookup an asymetric key which is used for validation of the signature.
* `jku` - **JWK Url** is a JSON Web Key URL, and is the URL used to retrieve a JWK.
* `x5u` - **X.509 Url** is a URL used to retrieve an X.509 certificate.

:warning: **Note** It's worth mentioning that the type (`typ`) doesn't have to be `JWT`, although most are, you should get into a habbit of using [Explicit Typing](#explicit_typing) where possible. ie: `"typ": "at+jwt"` could represent an Access Token JWT. Be explicit, and check for types.


## Payload

The Payload contains claims. Claims are statements about an entity and additional metadata. Generally there are three types of claims:

* **Registered/Reserved Claims** - Are sets of [predefined claims](https://www.rfc-editor.org/rfc/rfc7519#section-4.1), although not required, provide useful, interoperable claims. Examples are: 
  * `iss` - **Issuer** identifies the principal that issued the JWT.
  * `sub` - **Subject** identifies the principal that is the subject of the JWT.
  * `aud` - **Audience** identifies the recipients that the JWT is intended for.
  * `exp` - **Expiration Time** identifies the expiration time on or after which the JWT **must not** be accepted for processing.
  * `nbf` - **Not Before** identifies the time before which the JWT **must not** be accepted for processing.
  * `iat` - **Issued At** identifies the time at which the JWT was issued.
  * `jti` - **JWT ID** is a unique identifier for the JWT.
* **Public Cliams** can be defined at will by those using JWTs. But to avoid collisions they should be defined in the IANA JSON Web Token Registry or be defined as a URI that contains a collision resistant namespace.
* **Private Claims** are the custom claims created to share information between parties that agree on using them.

Example:
```json
{
    "sub": "00000000-0000-1111-a111-000000000002",
    "username": "tdonaworth",
    "role": "admin",
    "exp": 1686239022
}
```

## Signature

The signature is made up of the encoded header, encoded payload, and the secret. These are then run through a hashing algorithm, the same one specified in the header, to give a resulting signature block. 

The signature is used to ensure the contents of the `header` and `payload` haven't been tampered with. Often times a Signed JWT will be referred to as a JWS (S = Signed). 

:warning: **Note** Because a JWS is only signed, and the contents are simply Base64Url encoded, they are considered clear-text, and readable by anyone who has the JWT. Because of this, one should **NEVER** store sensitive information in a JWT.

```javascript
// Pseudocode - for real examples see /examples directory

header = { 
        alg: "HS256", 
        typ: "JWT" 
    };

payload = {
        sub: "00000000-0000-1111-a111-000000000002",
        username: "tdonaworth",
        role: "admin",
        exp: 1686239022,  
    };

secret = "Super-Secret-Non-Guessable-Key";

// base64url encode the header and payload, and concatenate them with a '.' between them.
unsignedToken = base64url(header, "utf8") + "." + base64url(payload, "utf8);

// Use a known crypto library, to perform a hashing of the unsignedToken, using the secret.
hash = HMACSHA256(unsignedToken, secret);

// base64url encode the signature
signature = base64url(hash, "utf8");

// finally concatinate the unsignedToken, and the signature to get the JWT.
JWT = unsignedToken + "." + signature;
```

If you don't want to write code, but still want to tinker with JWTs, the defacto place to go is [JWT.io](https://jwt.io/#debugger-io) debugger.

#### References:
https://auth0.com/learn/json-web-tokens

https://jwt.io/introduction
