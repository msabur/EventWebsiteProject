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
        let publicEventsResult, privateEventsResult, rsoEventsResult
        // if superadmin, return all events
        // otherwise, return:
        // public events, private events at his university,
        // RSO events at RSOs he is in

        const superAdminResult = await fastify.pg.query('SELECT * FROM super_admins WHERE id = $1', [id])
        const isSuperAdmin = superAdminResult.rows.length != 0
        if (isSuperAdmin) {
            publicEventsResult = await fastify.pg.query(
                `SELECT public_events.id, event_name, description, location_name, time
                FROM public_events
                JOIN events ON public_events.id = events.id`
            )
            privateEventsResult = await fastify.pg.query(
                `SELECT private_events.id, event_name, description, location_name, time
                FROM private_events
                JOIN events ON private_events.id = events.id`
            )
            rsoEventsResult = await fastify.pg.query(
                `SELECT rso_events.id, event_name, description, location_name, time
                FROM rso_events
                JOIN events ON rso_events.id = events.id`
            )
        } else {
            publicEventsResult = await fastify.pg.query(
                `SELECT public_events.id, event_name, description, location_name, time
                FROM public_events
                JOIN events ON public_events.id = events.id`
            )

            privateEventsResult = await fastify.pg.query(
                `SELECT private_events.id, event_name, description, location_name, time
                FROM private_events
                JOIN events ON private_events.id = events.id
                WHERE private_events.host_university_id = (
                    SELECT university_id
                    FROM students
                    WHERE students.id = $1
                )`,
                [id]
            )

            rsoEventsResult = await fastify.pg.query(
                `SELECT rso_events.id, event_name, description, location_name, time
                FROM rso_events
                JOIN events ON rso_events.id = events.id
                WHERE rso_events.host_rso_id IN (
                    SELECT rso_id
                    FROM rso_memberships
                    WHERE rso_memberships.student_id = $1
                )`,
                [id]
            )

        }

        // add a field with event type
        const publicEvents = publicEventsResult.rows.map(event => (
            { ...event, type: 'public' }
        ))
        const privateEvents = privateEventsResult.rows.map(event => (
            { ...event, type: 'private' }
        ))
        const rsoEvents = rsoEventsResult.rows.map(event => (
            { ...event, type: 'rso' }
        ))

        const events = [...publicEvents, ...privateEvents, ...rsoEvents]
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
        const { id } = request.params
        const { id: userId } = request.user
        let publicEventsResult, privateEventsResult, rsoEventsResult
        let feedbacksResult

        const superAdminResult = await fastify.pg.query('SELECT * FROM super_admins WHERE id = $1', [userId])
        const isSuperAdmin = superAdminResult.rows.length != 0
        if (isSuperAdmin) {
            publicEventsResult = await fastify.pg.query(
                `SELECT public_events.id, email_address, category, phone_number, description, time, event_name, location_name, location_latitude, location_longitude
                FROM public_events
                JOIN events ON public_events.id = events.id
                WHERE public_events.id = $1`,
                [id]
            )
            privateEventsResult = await fastify.pg.query(
                `SELECT private_events.id, private_events.host_university_id, email_address, category, phone_number, description, time, event_name, location_name, location_latitude, location_longitude
                FROM private_events
                JOIN events ON private_events.id = events.id
                WHERE private_events.id = $1`,
                [id]
            )
            rsoEventsResult = await fastify.pg.query(
                `SELECT rso_events.id, rso_events.host_rso_id, email_address, category, phone_number, description, time, event_name, location_name, location_latitude, location_longitude
                FROM rso_events
                JOIN events ON rso_events.id = events.id
                WHERE rso_events.id = $1`,
                [id]
            )
        } else {
            publicEventsResult = await fastify.pg.query(
                `SELECT public_events.id, email_address, category, phone_number, description, time, event_name, location_name, location_latitude, location_longitude
                FROM public_events
                JOIN events ON public_events.id = events.id
                WHERE public_events.id = $1`,
                [id]
            )
            privateEventsResult = await fastify.pg.query(
                `SELECT private_events.id, private_events.host_university_id, email_address, category, phone_number, description, time, event_name, location_name, location_latitude, location_longitude
                FROM private_events
                JOIN events ON private_events.id = events.id
                WHERE private_events.id = $1 AND
                    private_events.host_university_id = (
                        SELECT university_id
                        FROM students
                        WHERE students.id = $2
                )`,
                [id, userId]
            )
            rsoEventsResult = await fastify.pg.query(
                `SELECT rso_events.id, rso_events.host_rso_id, email_address, category, phone_number, description, time, event_name, location_name, location_latitude, location_longitude
                FROM rso_events
                JOIN events ON rso_events.id = events.id
                WHERE rso_events.id = $1 AND
                    rso_events.host_rso_id IN (
                        SELECT rso_id
                        FROM rso_memberships
                        WHERE rso_memberships.student_id = $2
                )`,
                [id, userId]
            )
        }

        feedbacksResult = await fastify.pg.query(
            `SELECT feedbacks.id, feedbacks.comment, feedbacks.rating, users.username
            FROM feedbacks
            JOIN users ON feedbacks.author_id = users.id
            WHERE feedbacks.event_id = $1`,
            [id]
        )

        const feedbacks = feedbacksResult.rows

        const publicEvent = publicEventsResult.rows[0]
        const privateEvent = privateEventsResult.rows[0]
        const rsoEvent = rsoEventsResult.rows[0]

        if (publicEvent) {
            reply.send({
                event: { ...publicEvent, type: 'public' },
                feedbacks
            })
        } else if (privateEvent) {
            reply.send({
                event: {
                    ...privateEvent, type: 'private'
                },
                feedbacks
            })
        } else if (rsoEvent) {
            reply.send({
                event: { ...rsoEvent, type: 'rso' },
                feedbacks
            })
        } else {
            reply.code(404).send({ message: 'Event not found' })
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
                    id: { type: 'string' }
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
        const { id } = request.params
        const { id: userId } = request.user
        const { comment, rating } = request.body

        // check if user can access this event
        let eventFound = false

        const isSuperAdmin = (await fastify.pg.query('SELECT * FROM super_admins WHERE id = $1', [userId])).rows.length != 0
        if (isSuperAdmin) {
            const eventResult = await fastify.pg.query(
                `SELECT * FROM events WHERE id = $1`,
                [id]
            )
            eventFound = eventResult.rows.length != 0
        } else {
            const publicEventResult = await fastify.pg.query(
                `SELECT public_events.id FROM public_events WHERE id = $1`,
                [id]
            )
            const privateEventResult = await fastify.pg.query(
                `SELECT private_events.id FROM private_events WHERE id = $1 AND
                    private_events.host_university_id = (
                        SELECT university_id
                        FROM students
                        WHERE students.id = $2
                    )`,
                [id, userId]
            )
            const rsoEventResult = await fastify.pg.query(
                `SELECT rso_events.id FROM rso_events WHERE id = $1 AND
                    rso_events.host_rso_id IN (
                        SELECT rso_id
                        FROM rso_memberships
                        WHERE rso_memberships.student_id = $2
                    )`,
                [id, userId]
            )
            eventFound = publicEventResult.rows.length != 0 || privateEventResult.rows.length != 0 || rsoEventResult.rows.length != 0
        }

        if (!eventFound) {
            reply.code(404).send({ message: 'Event not found' })
            return
        }

        await fastify.pg.query(
            `INSERT INTO feedbacks (event_id, author_id, comment, rating)
            VALUES ($1, $2, $3, $4)`,
            [id, userId, comment, rating]
        )

        reply.send({ message: 'Success!' })
    })
}

export const eventRoutes = routes
