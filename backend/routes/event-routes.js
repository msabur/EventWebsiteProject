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
            const feedbacksResult = await fastify.pg.query(
                `SELECT users.username, comment, rating
                FROM feedbacks
                JOIN users ON feedbacks.author_id = users.id
                WHERE event_id = $1`,
                [eventId]
            )
            const feedbacks = feedbacksResult.rows || []
            reply.send({ event, feedbacks })
        }
    })

    fastify.post('/events', { preHandler: fastify.authenticate }, async (request, reply) => {
        // TODO
        reply.send({ message: 'Not implemented' })
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
}

export const eventRoutes = routes
