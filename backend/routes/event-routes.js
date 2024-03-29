import { getEvents, getEvent, checkIsAdmin, checkIsSuperAdmin } from "../db_helpers.js"
import { getLocationName, calculateDistance } from "../utils.js"

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
    // POST /events/:id/rating: create new rating or update existing rating
    // GET /events/:id/comments: get all comments of an event
    // GET /events/:id/ratingInfo: get rating info of an event: own rating, avg rating, num ratings
    // DELETE /events/:eventid/comments/:commentid: delete a comment (author only)
    // PUT /events/:eventid/comments/:commentid: update a comment (author only)
    // GET /events/public-pending: (superadmin) get public events pending approval
    // POST /events/public-pending: (superadmin) approve/deny a public event

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

    fastify.post('/events', {
        preHandler: fastify.authenticate,
        schema: {
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    type: { type: 'string' },
                    rso: { type: 'string' },
                    category: { type: 'string' },
                    description: { type: 'string' },
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    radius: { type: 'number' },
                    startTime: { type: 'string' },
                    endTime: { type: 'string' },
                    phoneNumber: { type: 'string' }
                },
                required: ['name', 'type', 'category',
                    'description', 'latitude', 'longitude',
                    'startTime', 'endTime', 'phoneNumber', 'radius']
            }
        }
    }, async (request, reply) => {
        const { id: userId } = request.user
        const {
            name, type, rso, category, description,
            latitude, longitude, radius,
            startTime, endTime, phoneNumber
        } = request.body

        if (!checkIsAdmin(fastify, userId)) {
            reply.code(403).send({ message: 'Not authorized' })
            return
        }

        const email_address = (await fastify.pg.query(
            `SELECT email FROM users WHERE id = $1`,
            [userId]
        )).rows[0].email

        const locationName = await getLocationName(latitude, longitude)

        const formattedStartTime = new Date(startTime).toISOString()
        const formattedEndTime = new Date(endTime).toISOString()

        if (formattedStartTime >= formattedEndTime) {
            reply.code(400).send({ message: 'Start time must be before end time' })
            return
        }

        // Check for events that overlap in time
        const overlappingEvents = await fastify.pg.query(
            `SELECT id, location_latitude, location_longitude, location_radius_m,
                start_time, end_time
            FROM events
            WHERE (
                (start_time <= $1 AND end_time >= $1) OR
                (start_time >= $1 AND start_time <= $2)
            )`,
            [formattedStartTime, formattedEndTime]
        )

        // Filter for events that conflict in location
        const conflictingEvents = overlappingEvents.rows.filter((event) => {
            const distance = calculateDistance(latitude, longitude, event.location_latitude, event.location_longitude)
            return distance <= (radius + event.location_radius_m)
        })

        if (conflictingEvents.length > 0) {
            reply.code(409).send({
                message: `Event conflicts with existing event: lat,lng,start,end: ${conflictingEvents[0].location_latitude},${conflictingEvents[0].location_longitude},${conflictingEvents[0].start_time},${conflictingEvents[0].end_time}`
            })
            return
        }

        let insertRes = await fastify.pg.query(
            `INSERT INTO events (email_address, category, phone_number,
                description, start_time, event_name, 
                location_latitude, location_longitude, end_time,
                location_name, location_radius_m)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id`,
            [email_address, category, phoneNumber, description,
                formattedStartTime, name, latitude, longitude,
                formattedEndTime, locationName, radius]
        )

        const rollback = async () => { await fastify.pg.query(`DELETE FROM events WHERE id = $1`, [insertRes.rows[0].id]) }

        if (type === 'public') {
            await fastify.pg.query(
                `INSERT INTO public_events (id)
                VALUES ($1)`,
                [insertRes.rows[0].id]
            )
        } else if (type === 'private') {
            const university_id = (await fastify.pg.query(
                `SELECT university_id FROM students WHERE id = $1`,
                [userId]
            )).rows[0].university_id

            await fastify.pg.query(
                `INSERT INTO private_events (id, host_university_id)
                VALUES ($1, $2)`,
                [insertRes.rows[0].id, university_id]
            )
        } else if (type === 'rso') {
            const rso_result = await fastify.pg.query(
                `SELECT id FROM rsos WHERE name = $1`,
                [rso]
            )
            if (rso_result.rows.length === 0) {
                await rollback()
                reply.code(400).send({ message: 'RSO not found' })
                return
            }
            const rso_id = rso_result.rows[0].id

            // check if user is owner of rso
            const isOwner = (await fastify.pg.query(
                `SELECT id FROM rsos WHERE id = $1 AND owner_id = $2`,
                [rso_id, userId]
            )).rows.length > 0

            if (!isOwner) {
                await rollback()
                reply.code(403).send({ message: 'You are not the owner of this RSO' })
                return
            }

            // insert into rso events
            await fastify.pg.query(
                `INSERT INTO rso_events (id, host_rso_id)
                VALUES ($1, $2)`,
                [insertRes.rows[0].id, rso_id]
            )
        } else {
            await rollback()
            reply.code(400).send({ message: 'Invalid event type' })
            return
        }

        reply.send({ message: 'Success!' })
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
            `UPDATE comments SET text = $1 WHERE id = $2`,
            [text, commentId]
        )

        reply.send({ message: 'Success!' })
    })

    fastify.post('/events/:id/rating', {
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
                    stars: { type: 'number' }
                },
                required: ['stars']
            }
        }
    }, async (request, reply) => {
        const { id: eventId } = request.params
        const { id: userId } = request.user
        const { stars } = request.body

        // check if user can access this event
        const event = await getEvent(fastify, eventId, userId)
        if (!event) {
            reply.code(404).send({ message: 'Event not found' })
            return
        }

        await fastify.pg.query(
            `INSERT INTO ratings (event_id, user_id, stars)
            VALUES ($1, $2, $3)
            ON CONFLICT (event_id, user_id) DO UPDATE SET stars = $3`,
            [eventId, userId, stars]
        )

        reply.send({ message: 'Success!' })
    })

    fastify.get('/events/:id/ratingInfo', {
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

        const ratingsResult = await fastify.pg.query(
            `SELECT AVG(stars) AS average, COUNT(*) AS count
            FROM ratings
            WHERE event_id = $1`,
            [eventId]
        )

        const ownRatingResult = await fastify.pg.query(
            `SELECT stars
            FROM ratings
            WHERE event_id = $1 AND user_id = $2`,
            [eventId, userId]
        )

        const ratings = ratingsResult.rows[0]
        const ownRating = ownRatingResult.rows[0] || { stars: null }

        reply.send({ ratings, ownRating })
    })

    fastify.get('/events/public-pending', {
        preHandler: fastify.authenticate
    }, async (request, reply) => {
        const { id: userId } = request.user

        if (!checkIsSuperAdmin(fastify, userId)) {
            reply.code(403).send({ message: 'Forbidden' })
            return
        }

        const eventsResult = await fastify.pg.query(
            `SELECT events.id, events.event_name AS name
            FROM events
            JOIN public_events USING (id)
            WHERE public_events.is_approved = false`
        )

        reply.send(eventsResult.rows)
    })

    fastify.post('/events/public-pending', {
        preHandler: fastify.authenticate,
        schema: {
            body: {
                type: 'object',
                properties: {
                    eventId: { type: 'number' },
                    approve: { type: 'boolean' }
                },
                required: ['eventId', 'approve']
            }
        }
    }, async (request, reply) => {
        const { id: userId } = request.user
        const { eventId, approve } = request.body

        if (!checkIsSuperAdmin(fastify, userId)) {
            reply.code(403).send({ message: 'Forbidden' })
            return
        }

        if (approve) {
            await fastify.pg.query(
                `UPDATE public_events SET is_approved = true WHERE id = $1`,
                [eventId]
            )
        } else {
            await fastify.pg.query(
                `DELETE FROM events WHERE id = $1`,
                [eventId]
            )
            // this will cascade delete the public_events entry too
        }

        reply.send({ message: 'Success!' })
    })
}

export const eventRoutes = routes
