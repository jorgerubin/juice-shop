/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import challengeUtils = require('../lib/challengeUtils')
import { reviewsCollection } from '../data/mongodb'

import * as utils from '../lib/utils'
import { challenges } from '../data/datacache'

const security = require('../lib/insecurity')

module.exports = function productReviews () {
  return (req: Request, res: Response) => {

    const user = security.authenticatedUsers.from(req)

    // Verifica que el usuario está autenticado
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User not authenticated' });
    }

    const sanitizedMessage = security(req.body.message);

    if (!sanitizedMessage || typeof sanitizedMessage !== 'string' || sanitizedMessage.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid or empty message' });
    }

    challengeUtils.solveIf(challenges.forgedReviewChallenge, 
      () => { return user && user.data.email !== req.body.author })

    reviewsCollection.insertOne({
      product: req.params.id,
      message: sanitizedMessage,
      author: req.body.email,
      likesCount: 0,
      likedBy: []
    }).then(() => {
      res.status(201).json({ status: 'success' })
    }, (err: unknown) => {
      res.status(500).json(utils.getErrorMessage(err))
    })

  }
}
