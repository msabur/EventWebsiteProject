import { getEvents, getEvent } from "../db_helpers.js"

/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */

async function routes(fastify, options) {
    // GET /events: get basic info of all events
    // GET /events/:id: get full info of an event and its feedbacks (comments/ratings)
    // POST /events: create new event (admin only)
    // POST /events/:id/feedbacks: create new feedback
    // GET /events/:id/feedbacks: get all feedbacks of an event
    // DELETE /events/:eventid/feedbacks/:feedbackid: delete a feedback (author only)
    // PUT /events/:eventid/feedbacks/:feedbackid: update a feedback (author only)

    fastify.get('/events', { preHandler: fastify.authenticate, }, async (request, reply) => {
        const { id } = request.user
        const events = await getEvents(fastify, id)
        reply.send({ events })
    })

    fastify.get('/events/:id', {
        preHandler: fastify.authenticate,
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                },
                required: ['id']
            }
        }
    }, async (request, reply) => {
        const { id: eventId } = request.params
        const { id: userId } = request.user

        const event = await getEvent(fastify, eventId, userId)
        if (!event) {
            reply.code(404).send({ message: 'Event not found' })
        } else {
            reply.send({ event })
        }
    })

    fastify.post('/events', { preHandler: fastify.authenticate }, async (request, reply) => {
        // TODO
        reply.send({ message: 'Not implemented' })
    })

    fastify.get('/events/:id/feedbacks', {
        preHandler: fastify.authenticate,
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'number' }
                },
                required: ['id']
            }
        }
    }, async (request, reply) => {
        const { id: eventId } = request.params
        const { id: userId } = request.user

        // check if user can access this event
        const event = await getEvent(fastify, eventId, userId)
        if (!event) {
            reply.code(404).send({ message: 'Event not found' })
            return
        }
        
        // this adds a "is_mine" field indicating if the author is the current user
        const feedbacksResult = await fastify.pg.query(
            `SELECT feedbacks.id, users.username, comment, rating,
                CASE WHEN feedbacks.author_id = $2 THEN true ELSE false END AS is_mine
            FROM feedbacks
            JOIN users ON feedbacks.author_id = users.id
            WHERE event_id = $1`,
            [eventId, userId]
        )
        const feedbacks = feedbacksResult.rows || []
        reply.send({ feedbacks })
    })


    fastify.post('/events/:id/feedbacks', {
        preHandler: fastify.authenticate,
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'number' }
                },
                required: ['id']
            },
            body: {
                type: 'object',
                properties: {
                    comment: { type: 'string' },
                    rating: { type: 'number' }
                },
                required: ['comment', 'rating']
            }
        }
    }, async (request, reply) => {
        const { id: eventId } = request.params
        const { id: userId } = request.user
        const { comment, rating } = request.body

        // check if user can access this event
        const event = await getEvent(fastify, eventId, userId)
        if (!event) {
            reply.code(404).send({ message: 'Event not found' })
            return
        }

        await fastify.pg.query(
            `INSERT INTO feedbacks (event_id, author_id, comment, rating)
            VALUES ($1, $2, $3, $4)`,
            [eventId, userId, comment, rating]
        )

        reply.send({ message: 'Success!' })
    })

    // event id isn't needed here, but it's included for consistency
    fastify.delete('/events/:eventid/feedbacks/:feedbackid', {
        preHandler: fastify.authenticate,
        schema: {
            params: {
                type: 'object',
                properties: {
                    eventid: { type: 'number' },
                    feedbackid: { type: 'number' }
                },
                required: ['eventid', 'feedbackid']
            }
        }
    }, async (request, reply) => {
        const { feedbackid: feedbackId } = request.params
        const { id: userId } = request.user

        // check if user is the author of the feedback
        const feedbackResult = await fastify.pg.query(
            `SELECT * FROM feedbacks WHERE id = $1 AND author_id = $2`,
            [feedbackId, userId]
        )
        const feedback = feedbackResult.rows[0]
        if (!feedback) {
            reply.code(403).send({ message: 'Forbidden' })
            return
        }

        await fastify.pg.query(
            `DELETE FROM feedbacks WHERE id = $1`,
            [feedbackId]
        )

        reply.send({ message: 'Success!' })
    })

    fastify.put('/events/:eventid/feedbacks/:feedbackid', {
        preHandler: fastify.authenticate,
        schema: {
            params: {
                type: 'object',
                properties: {
                    eventid: { type: 'number' },
                    feedbackid: { type: 'number' }
                },
                required: ['eventid', 'feedbackid']
            },
            body: {
                type: 'object',
                properties: {
                    comment: { type: 'string' },
                    rating: { type: 'number' }
                },
                required: ['comment', 'rating']
            }
        }
    }, async (request, reply) => {
        const { feedbackid: feedbackId } = request.params
        const { id: userId } = request.user
        const { comment, rating } = request.body

        // check if user is the author of the feedback
        const feedbackResult = await fastify.pg.query(
            `SELECT * FROM feedbacks WHERE id = $1 AND author_id = $2`,
            [feedbackId, userId]
        )
        const feedback = feedbackResult.rows[0]
        if (!feedback) {
            reply.code(403).send({ message: 'Forbidden' })
            return
        }

        await fastify.pg.query(
            `UPDATE feedbacks SET comment = $1, rating = $2 WHERE id = $3`,
            [comment, rating, feedbackId]
        )

        reply.send({ message: 'Success!' })
    })
}

export const eventRoutes = routes
