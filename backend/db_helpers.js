/**
 * 
 * @param {import('fastify').FastifyInstance} fastify 
 * @param {number} id 
 * @returns {Promise<boolean>}
 */
export async function checkIsSuperAdmin(fastify, id) {
    const result = await fastify.pg.query('SELECT * FROM super_admins WHERE id = $1', [id])
    return result.rows.length !== 0
}

/**
 * @param {import('fastify').FastifyInstance} fastify
 * @param {number} userId the id of the user
 * @returns 
 */
export async function getEvents(fastify, userId) {
    let query = (
        `SELECT id, host_university_id, host_rso_id, event_name, description, location_name, start_time, end_time
            FROM events
            LEFT JOIN public_events USING (id)
            LEFT JOIN private_events USING (id)
            LEFT JOIN rso_events USING (id)
        `)

    let eventResult

    const isSuperAdmin = await checkIsSuperAdmin(fastify, userId)
    if (isSuperAdmin) {
        console.log('isSuperAdmin', isSuperAdmin)
        eventResult = await fastify.pg.query(query)
    } else {
        query += (`
            WHERE (
                public_events.id IS NOT NULL OR (
                private_events.id IS NOT NULL AND
                    private_events.host_university_id = (
                        SELECT university_id
                        FROM students
                        WHERE students.id = $1
                    )
                ) OR (
                    rso_events.id IS NOT NULL AND
                    rso_events.host_rso_id IN (
                        SELECT rso_id
                        FROM rso_memberships
                        WHERE rso_memberships.user_id = $1
                    )
                )
            )
        `)
        eventResult = await fastify.pg.query(query, [userId])
    }

    return eventResult.rows || []
}

/**
 * @param {import('fastify').FastifyInstance} fastify
 * @param {number} eventId the id of the event
 * @param {number} userId the id of the user
 * @returns {Promise<Object>}
 */

export async function getEvent(fastify, eventId, userId) {
    let query = (
        `SELECT id, host_university_id, host_rso_id, email_address, category, phone_number, description, start_time, end_time, event_name, location_name, location_latitude, location_longitude
            FROM events
            LEFT JOIN public_events USING (id)
            LEFT JOIN private_events USING (id)
            LEFT JOIN rso_events USING (id)
            WHERE events.id = $1
        `)

    let eventResult

    const isSuperAdmin = await checkIsSuperAdmin(fastify, userId)
    if (isSuperAdmin) {
        eventResult = await fastify.pg.query(query, [eventId])
    } else {
        query += (`
            AND (
                public_events.id IS NOT NULL OR (
                private_events.id IS NOT NULL AND
                    private_events.host_university_id = (
                        SELECT university_id
                        FROM students
                        WHERE students.id = $2
                    )
                ) OR (
                    rso_events.id IS NOT NULL AND
                    rso_events.host_rso_id IN (
                        SELECT rso_id
                        FROM rso_memberships
                        WHERE rso_memberships.user_id = $2
                    )
                )
            )
        `)
        eventResult = await fastify.pg.query(query, [eventId, userId])
    }

    return eventResult.rows[0] || null
}
