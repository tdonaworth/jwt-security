import * as jose from jose

const header = { 
    alg: "HS256", 
    typ: "JWT" 
};

const payload = {
    sub: "00000000-0000-1111-a111-000000000002",
    username: "tdonaworth",
    role: "admin",
    exp: 1686239022,
};

const secret = "Super-Secret-Non-Guessable-Key";

const unsignedToken = `${base64object(head)}.${base64object(payload)}`;
const hash = CryptoJS.HmacSHA256(unsignedToken, secret);
const signature = CryptoJS.enc.Base64.stringify(hash);
