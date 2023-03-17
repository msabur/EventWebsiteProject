import { getEvents, getEvent } from "../db_helpers.js"

/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */

async function routes(fastify, options) {
    // GET /events: get basic info of all events
    // GET /events/:id: get full info of an event and its comments (comments/ratings)
    // POST /events: create new event (admin only)
    // POST /events/:id/comments: create new comment
    // GET /events/:id/comments: get all comments of an event
    // DELETE /events/:eventid/comments/:commentid: delete a comment (author only)
    // PUT /events/:eventid/comments/:commentid: update a comment (author only)

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

    fastify.get('/events/:id/comments', {
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
        const commentsResult = await fastify.pg.query(
            `SELECT comments.id, users.username, comments.text,
                CASE WHEN comments.author_id = $2 THEN true ELSE false END AS is_mine
            FROM comments
            JOIN users ON comments.author_id = users.id
            WHERE event_id = $1`,
            [eventId, userId]
        )
        const comments = commentsResult.rows || []
        reply.send({ comments })
    })


    fastify.post('/events/:id/comments', {
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
                    text: { type: 'string' }
                },
                required: ['text']
            }
        }
    }, async (request, reply) => {
        const { id: eventId } = request.params
        const { id: userId } = request.user
        const { text } = request.body

        // check if user can access this event
        const event = await getEvent(fastify, eventId, userId)
        if (!event) {
            reply.code(404).send({ message: 'Event not found' })
            return
        }

        await fastify.pg.query(
            `INSERT INTO comments (event_id, author_id, text)
            VALUES ($1, $2, $3)`,
            [eventId, userId, text]
        )

        reply.send({ message: 'Success!' })
    })

    // event id isn't needed here, but it's included for consistency
    fastify.delete('/events/:eventid/comments/:commentid', {
        preHandler: fastify.authenticate,
        schema: {
            params: {
                type: 'object',
                properties: {
                    eventid: { type: 'number' },
                    commentid: { type: 'number' }
                },
                required: ['eventid', 'commentid']
            }
        }
    }, async (request, reply) => {
        const { commentid: commentId } = request.params
        const { id: userId } = request.user

        // check if user is the author of the comment
        const commentResult = await fastify.pg.query(
            `SELECT * FROM comments WHERE id = $1 AND author_id = $2`,
            [commentId, userId]
        )
        const comment = commentResult.rows[0]
        if (!comment) {
            reply.code(403).send({ message: 'Forbidden' })
            return
        }

        await fastify.pg.query(
            `DELETE FROM comments WHERE id = $1`,
            [commentId]
        )

        reply.send({ message: 'Success!' })
    })

    fastify.put('/events/:eventid/comments/:commentid', {
        preHandler: fastify.authenticate,
        schema: {
            params: {
                type: 'object',
                properties: {
                    eventid: { type: 'number' },
                    commentid: { type: 'number' }
                },
                required: ['eventid', 'commentid']
            },
            body: {
                type: 'object',
                properties: {
                    comment: { type: 'string' },
                    rating: { type: 'number' }
                },
                required: ['text']
            }
        }
    }, async (request, reply) => {
        const { commentid: commentId } = request.params
        const { id: userId } = request.user
        const { text } = request.body

        // check if user is the author of the comment
        const commentResult = await fastify.pg.query(
            `SELECT * FROM comments WHERE id = $1 AND author_id = $2`,
            [commentId, userId]
        )
        
        if (commentResult.rows.length === 0) {
            reply.code(403).send({ message: 'Forbidden' })
            return
        }

        await fastify.pg.query(
            `UPDATE comments SET text = $1 WHERE id = $3`,
            [text, commentId]
        )

        reply.send({ message: 'Success!' })
    })
}

export const eventRoutes = routes
