/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes(fastify, options) {
    // GET /events: get basic info of all events
    // POST /events: create new event (admin only)

    fastify.get('/events', { preHandler: fastify.authenticate, }, async (request, reply) => {
        const { id } = request.user
        // if superadmin, return all events
        // otherwise, return:
        // public events, private events at his university,
        // RSO events at RSOs he is in
        const superAdminResult = await fastify.pg.query('SELECT * FROM super_admins WHERE id = $1', [id])
        const isSuperAdmin = superAdminResult.rows.length != 0
        if (isSuperAdmin) {
            const eventsResult = await fastify.pg.query(
                `SELECT id, email_address, category, phone_number, event_name, description, location_name, time, location_latitude, location_longitude
                FROM events`)
            const events = eventsResult.rows
            console.log(events)
            reply.send({ events })
            return
        } else {
            const eventsResult = await fastify.pg.query(
                `SELECT public_events.id, email_address, category, phone_number, event_name, description, location_name, time, location_latitude, location_longitude
                FROM public_events
                JOIN events ON public_events.id = events.id

                UNION
                
                SELECT private_events.id, email_address, category, phone_number, event_name, description, location_name, time, location_latitude, location_longitude
                FROM private_events
                JOIN events ON private_events.id = events.id
                WHERE private_events.host_university_id = (
                    SELECT university_id
                    FROM students
                    WHERE students.id = $1
                )
                
                UNION
                
                SELECT rso_events.id, email_address, category, phone_number, event_name, description, location_name, time, location_latitude, location_longitude
                FROM rso_events
                JOIN events ON rso_events.id = events.id
                WHERE rso_events.host_rso_id IN (
                    SELECT rso_id
                    FROM rso_memberships
                    WHERE rso_memberships.student_id = $1
                )`,
                [id]
            )
            const events = eventsResult.rows
            reply.send({ events })
            return
        }
    })
}

export const eventRoutes = routes
