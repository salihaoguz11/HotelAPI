"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | Hotel Api
------------------------------------------------------- */

const Token = require("../models/token");
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const auth = req.headers?.authorization;
  const tokenKey = auth ? auth.split(" ") : null;

  if (tokenKey) {
    if (tokenKey[0] == "Token") {
      const tokenData = await Token.findOne({ token: tokenKey[1] }).populate(
        "userId"
      );

      req.user = tokenData ? tokenData.userId : false;
    } else if (tokenKey[0] == "Bearer") {
      // JWT AccessToken:
      // jwt.verify(accessToken, access_key, callbackFunction())
      //! bu veriyi bu accesskey ile çöz. çözdükten sonra ya error verir ya da datayı vericek
      // ? birinci keyi al, ikinci keyile şifrele, üçüncü ise fonksiyon datayı ver ya da hata gönder.

      jwt.verify(
        tokenKey[1],
        process.env.ACCESS_KEY,
        function (error, accessData) {
          req.user = accessData ? accessData : false;
        }
      );
    }
  }
  next();
};
