"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | Hotel API 
------------------------------------------------------- */
// Auth Controller:

const User = require("../models/user");
const Token = require("../models/token");
const passwordEncrypt = require("../helpers/passwordEncrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  login: async (req, res) => {
    /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "Login"
            #swagger.description = 'Login with username (or email) and password for get simpleToken and JWT'
            #swagger.parameters["body"] = {
                in: "body",
                required: true,
                schema: {
                    "username": "test",
                    "password": "aA?123456",
                }
            }
        */

    const { username, email, password } = req.body;
    if ((username || email) && password) {
      const user = await User.findOne({ $or: [{ username }, { email }] });
      // console.log(user);
      if (user && user.password == passwordEncrypt(password)) {
        if (user.isActive) {
          /* SIMPLE TOKEN */

          let tokenData = await Token.findOne({ userId: user.id });

          if (!tokenData) {
            tokenData = await Token.create({
              userId: user.id,
              token: passwordEncrypt(user.id + Date.now()),
            });
          }
          /* SIMPLE TOKEN */

          /* JWT  */

          const accessInfo = {
            key: process.env.ACCESS_KEY,
            time: process.env?.ACCESS_EXP || "30s",
            data: {
              _id: user._id,
              id: user.id,
              username: user.username,
              email: user.email,
              password: user.password,
              isActive: user.isActive,
              isAdmin: user.isAdmin,
            },
          };
          const refreshInfo = {
            key: process.env.REFRESH_KEY,
            time: process.env?.REFRESH_EXP || "3d",
            data: {
              id: user.id,
              password: user.password,
            },
          };
          // jwt.sign(access_data, access_key, { expiresIn: '30m' })

          const accessToken = jwt.sign(accessInfo.data, accessInfo.key, {
            expiresIn: accessInfo.time,
          });
          const refreshToken = jwt.sign(refreshInfo.data, refreshInfo.key, {
            expiresIn: refreshInfo.time,
          });

          /* JWT  */

          res.status(200).send({
            error: false,
            token: tokenData.token,
            beraer: {
              access: accessToken,
              refresh: refreshToken,
            },
            user,
          });
        }
      } else {
        res.errorStatusCode = 401;
        throw new Error("Wrong username/email or password.");
      }
    } else {
      res.errorStatusCode = 401;
      throw new Error("Please enter username/email and password.");
    }
  },
  logout: async (req, res) => {
    /*
            #swagger.tags = ["Authentication"]
            #swagger.summary = "simpleToken: Logout"
            #swagger.description = 'Delete token key.'
        */

    const auth = req.headers?.authorization; // Token ...tokenKey...
    const tokenKey = auth ? auth.split(" ") : null; // ['Token', '...tokenKey...']
    const result = await Token.deleteOne({ token: tokenKey[1] });

    res.send({
      error: false,
      message: "Token deleted. Logout was OK.",
      result,
    });
  },
};
