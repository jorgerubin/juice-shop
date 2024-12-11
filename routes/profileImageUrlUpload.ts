/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs = require('fs')
import { type Request, type Response, type NextFunction } from 'express'
import logger from '../lib/logger'

import { UserModel } from '../models/user'
import * as utils from '../lib/utils'
const {security, redirectAllowlist} = require('../lib/insecurity')
const request = require('request')

function sanitizeUrl(inputUrl) {
    try {
        const sanitizedUrl = new URL(inputUrl);
        if (!['http:', 'https:'].includes(sanitizedUrl.protocol)) {
            throw new Error('Protocolo no permitido');
        }
        return sanitizedUrl.toString();
    } catch (error) {
        console.error('URL inválida:', error.message);
        return null; // Devuelve null si la URL no es válida
    }
}

module.exports = function profileImageUrlUpload () {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body.imageUrl !== undefined) {
      const url = req.body.imageUrl
<<<<<<< HEAD
      const allowedPaths = /^\/solve\/challenges\/server-side$/;
      if (url && typeof url === 'string' && allowedPaths.test(url)) {
        req.app.locals.abused_ssrf_bug = true
      } else {
        req.app.locals.abused_ssrf_bug = false
      }
=======
      if (url.match(/(.)*solve\/challenges\/server-side(.)*/) !== null && redirectAllowlist.includes(url )) req.app.locals.abused_ssrf_bug = true
>>>>>>> 154e25c67e8a5854f56e5556d44b58d015e8d826
      const loggedInUser = security.authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        const imageRequest = request.get(sanitizeUrl(url));
        imageRequest.on('error', function (err: unknown) {
            UserModel.findByPk(loggedInUser.data.id).then(async (user: UserModel | null) => { return await user?.update({ profileImage: url }) }).catch((error: Error) => { next(error) })
            logger.warn(`Error retrieving user profile image: ${utils.getErrorMessage(err)}; using image link directly`)
          })
          .on('response', function (res: Response) {
            if (res.statusCode === 200) {
              const ext = ['jpg', 'jpeg', 'png', 'svg', 'gif'].includes(url.split('.').slice(-1)[0].toLowerCase()) ? url.split('.').slice(-1)[0].toLowerCase() : 'jpg'
              imageRequest.pipe(fs.createWriteStream(`frontend/dist/frontend/assets/public/images/uploads/${loggedInUser.data.id}.${ext}`))
              UserModel.findByPk(loggedInUser.data.id).then(async (user: UserModel | null) => { return await user?.update({ profileImage: `/assets/public/images/uploads/${loggedInUser.data.id}.${ext}` }) }).catch((error: Error) => { next(error) })
            } else UserModel.findByPk(loggedInUser.data.id).then(async (user: UserModel | null) => { return await user?.update({ profileImage: url }) }).catch((error: Error) => { next(error) })
          })
      } else {
        next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress))
      }
    }
    res.location(process.env.BASE_PATH + '/profile')
    res.redirect(process.env.BASE_PATH + '/profile')
  }
}
