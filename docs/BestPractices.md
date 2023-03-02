# Security Best Practices

Initial dump of [RFC8725](https://datatracker.ietf.org/doc/rfc8725/), with additional commentary added where it would make more sense or make the point clearer.

1.  Perform Algorithm Verification

 Libraries MUST enable the caller to specify a supported set of algorithms and MUST NOT use any other algorithms when performing cryptographic operations.  The library MUST ensure that the "alg" or "enc" header specifies the same algorithm that is used for the cryptographic operation.  Moreover, each key MUST be used with exactly one algorithm, and this MUST be checked when the cryptographic operation is performed.

2.  Use Appropriate Algorithms

 As Section 5.2 of [RFC7515] says, "it is an application decision which algorithms may be used in a given context.  Even if a JWS can be successfully validated, unless the algorithm(s) used in the JWS are acceptable to the application, it SHOULD consider the JWS to be invalid."

 Therefore, applications MUST only allow the use of cryptographically current algorithms that meet the security requirements of the application.  This set will vary over time as new algorithms are introduced and existing algorithms are deprecated due to discovered cryptographic weaknesses.  Applications MUST therefore be designed to enable cryptographic agility.

 That said, if a JWT is cryptographically protected end-to-end by a transport layer, such as TLS using cryptographically current algorithms, there may be no need to apply another layer of cryptographic protections to the JWT.  In such cases, the use of the "none" algorithm can be perfectly acceptable.  The "none" algorithm should only be used when the JWT is cryptographically protected by other means.  JWTs using "none" are often used in application contexts in which the content is optionally signed; then, the URL-safe claims representation and processing can be the same in both the signed and unsigned cases.  JWT libraries SHOULD NOT generate JWTs using "none" unless explicitly requested to do so by the caller. Similarly, JWT libraries SHOULD NOT consume JWTs using "none" unless explicitly requested by the caller.

 Applications SHOULD follow these algorithm-specific recommendations:
 * Avoid all RSA-PKCS1 v1.5 encryption algorithms ([RFC8017], Section 7.2), preferring RSAES-OAEP ([RFC8017], Section 7.1).
 * Elliptic Curve Digital Signature Algorithm (ECDSA) signatures [ANSI-X962-2005] require a unique random value for every message that is signed. If even just a few bits of the random value are predictable across multiple messages, then the security of the signature scheme may be compromised. In the worst case, the private key may be recoverable by an attacker. To counter these attacks, JWT libraries SHOULD implement ECDSA using the deterministic approach defined in [RFC6979]. This approach is completely compatible with existing ECDSA verifiers and so can be implemented without new algorithm identifiers being required.

3. Validate All Cryptographic Operations

 All cryptographic operations used in the JWT MUST be validated and the entire JWT MUST be rejected if any of them fail to validate. This is true not only of JWTs with a single set of Header Parameters but also for Nested JWTs in which both outer and inner operations MUST be validated using the keys and algorithms supplied by the application.
 
4. Validate Cryptographic Inputs

 Some cryptographic operations, such as Elliptic Curve Diffie-Hellman key agreement ("ECDH-ES"), take inputs that may contain invalid values. This includes points not on the specified elliptic curve or other invalid points (e.g., [Valenta], Section 7.1). The JWS/JWE library itself must validate these inputs before using them, or it must use underlying cryptographic libraries that do so (or both!).
 Elliptic Curve Diffie-Hellman Ephemeral Static (ECDH-ES) ephemeral public key (epk) inputs should be validated according to the recipient's chosen elliptic curve. For the NIST prime-order curves P-256, P-384, and P-521, validation MUST be performed according to Section 5.6.2.3.4 (ECC Partial Public-Key Validation Routine) of "Recommendation for Pair-Wise Key-Establishment Schemes Using Discrete Logarithm Cryptography" [nist-sp-800-56a-r3]. If the "X25519" or "X448" [RFC8037] algorithms are used, then the security considerations in [RFC8037] apply.

5. Ensure Cryptographic Keys Have Sufficient Entropy

 The Key Entropy and Random Values advice in Section 10.1 of [RFC7515] and the Password Considerations in Section 8.8 of [RFC7518] MUST be followed. In particular, human-memorizable passwords MUST NOT be directly used as the key to a keyed-MAC algorithm such as "HS256". Moreover, passwords should only be used to perform key encryption, rather than content encryption, as described in Section 4.8 of [RFC7518]. Note that even when used for key encryption, password- based encryption is still subject to brute-force attacks.

6. Avoid Compression of Encryption Inputs

 Compression of data SHOULD NOT be done before encryption, because such compressed data often reveals information about the plaintext.

7. Use UTF-8

 [RFC7515], [RFC7516], and [RFC7519] all specify that UTF-8 be used for encoding and decoding JSON used in Header Parameters and JWT Claims Sets. This is also in line with the latest JSON specification [RFC8259]. Implementations and applications MUST do this and not use or admit the use of other Unicode encodings for these purposes.

8. Validate Issuer and Subject

 When a JWT contains an "iss" (issuer) claim, the application MUST validate that the cryptographic keys used for the cryptographic operations in the JWT belong to the issuer. If they do not, the application MUST reject the JWT.

 The means of determining the keys owned by an issuer is application- specific. As one example, OpenID Connect [OpenID.Core] issuer values are "https" URLs that reference a JSON metadata document that contains a "jwks_uri" value that is an "https" URL from which the issuer's keys are retrieved as a JWK Set [RFC7517]. This same mechanism is used by [RFC8414]. Other applications may use different means of binding keys to issuers.

 Similarly, when the JWT contains a "sub" (subject) claim, the application MUST validate that the subject value corresponds to a valid subject and/or issuer-subject pair at the application. This may include confirming that the issuer is trusted by the application. If the issuer, subject, or the pair are invalid, the application MUST reject the JWT.
9. Use and Validate Audience

 If the same issuer can issue JWTs that are intended for use by more than one relying party or application, the JWT MUST contain an "aud" (audience) claim that can be used to determine whether the JWT is being used by an intended party or was substituted by an attacker at an unintended party.

 In such cases, the relying party or application MUST validate the audience value, and if the audience value is not present or not associated with the recipient, it MUST reject the JWT.

10. Do Not Trust Received Claims

 The "kid" (key ID) header is used by the relying application to perform key lookup. Applications should ensure that this does not create SQL or LDAP injection vulnerabilities by validating and/or sanitizing the received value.

 Similarly, blindly following a "jku" (JWK set URL) or "x5u" (X.509 URL) header, which may contain an arbitrary URL, could result in server-side request forgery (SSRF) attacks. Applications SHOULD protect against such attacks, e.g., by matching the URL to a whitelist of allowed locations and ensuring no cookies are sent in the GET request.

11. Use Explicit Typing

 Sometimes, one kind of JWT can be confused for another. If a particular kind of JWT is subject to such confusion, that JWT can include an explicit JWT type value, and the validation rules can specify checking the type. This mechanism can prevent such confusion. Explicit JWT typing is accomplished by using the "typ" Header Parameter. For instance, the [RFC8417] specification uses the "application/secevent+jwt" media type to perform explicit typing of Security Event Tokens (SETs).

 Per the definition of "typ" in Section 4.1.9 of [RFC7515], it is RECOMMENDED that the "application/" prefix be omitted from the "typ" value. Therefore, for example, the "typ" value used to explicitly include a type for a SET SHOULD be "secevent+jwt". When explicit typing is employed for a JWT, it is RECOMMENDED that a media type name of the format "application/example+jwt" be used, where "example" is replaced by the identifier for the specific kind of JWT.

 When applying explicit typing to a Nested JWT, the "typ" Header Parameter containing the explicit type value MUST be present in the inner JWT of the Nested JWT (the JWT whose payload is the JWT Claims Set). In some cases, the same "typ" Header Parameter value will be present in the outer JWT as well, to explicitly type the entire Nested JWT.

 Note that the use of explicit typing may not achieve disambiguation from existing kinds of JWTs, as the validation rules for existing kinds of JWTs often do not use the "typ" Header Parameter value. Explicit typing is RECOMMENDED for new uses of JWTs.

12.  Use Mutually Exclusive Validation Rules for Different Kinds of JWTs

 Each application of JWTs defines a profile specifying the required and optional JWT claims and the validation rules associated with them.  If more than one kind of JWT can be issued by the same issuer, the validation rules for those JWTs MUST be written such that they are mutually exclusive, rejecting JWTs of the wrong kind.  To prevent substitution of JWTs from one context into another, application developers may employ a number of strategies:

   *  Use explicit typing for different kinds of JWTs.  Then the distinct "typ" values can be used to differentiate between the different kinds of JWTs.

   *  Use different sets of required claims or different required claim values.  Then the validation rules for one kind of JWT will reject those with different claims or values.

   *  Use different sets of required Header Parameters or different required Header Parameter values.  Then the validation rules for one kind of JWT will reject those with different Header Parameters or values.

   *  Use different keys for different kinds of JWTs.  Then the keys used to validate one kind of JWT will fail to validate other kinds of JWTs.

   *  Use different "aud" values for different uses of JWTs from the same issuer.  Then audience validation will reject JWTs substituted into inappropriate contexts.

   *  Use different issuers for different kinds of JWTs.  Then the distinct "iss" values can be used to segregate the different kinds of JWTs.

   Given the broad diversity of JWT usage and applications, the best combination of types, required claims, values, Header Parameters, key usages, and issuers to differentiate among different kinds of JWTs will, in general, be application-specific.  As discussed in Section 11, for new JWT applications, the use of explicit typing is RECOMMENDED.