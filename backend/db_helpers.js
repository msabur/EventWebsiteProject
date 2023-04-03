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
 * 
 * @param {import('fastify').FastifyInstance} fastify 
 * @param {number} id 
 * @returns {Promise<boolean>}
 */
export async function checkIsAdmin(fastify, id) {
    const result = await fastify.pg.query('SELECT * FROM admins WHERE id = $1', [id])
    return result.rows.length !== 0
}

/**
 * @param {import('fastify').FastifyInstance} fastify
 * @param {number} userId the id of the user
 * @returns 
 */
export async function getEvents(fastify, userId) {
    let query = (
        `SELECT id, host_university_id, host_rso_id, event_name, description,
                location_name, start_time, end_time, type
            FROM events_view
        `)

    let eventResult

    const isSuperAdmin = await checkIsSuperAdmin(fastify, userId)
    if (isSuperAdmin) {
        console.log('isSuperAdmin', isSuperAdmin)
        eventResult = await fastify.pg.query(query)
    } else {
        query += (`
            WHERE (
                type = 'public' OR (
                    type = 'private' AND
                    host_university_id = (
                        SELECT university_id
                        FROM students
                        WHERE students.id = $1
                    ) OR (
                        type = 'rso' AND
                        host_rso_id IN (
                            SELECT rso_id
                            FROM rso_memberships
                            WHERE rso_memberships.user_id = $1
                        )
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
    // in the select, add a column for the event type
    // if has host_university_id, then it's a private event
    // if has host_rso_id, then it's an rso event
    // if has neither, then it's a public event
    let query = (
        `SELECT *
            FROM events_view
            WHERE id = $1
        `)

    let eventResult

    const isSuperAdmin = await checkIsSuperAdmin(fastify, userId)
    if (isSuperAdmin) {
        eventResult = await fastify.pg.query(query, [eventId])
    } else {
        query += (`
            AND (
                type = 'public' OR (
                    type = 'private' AND
                    host_university_id = (
                        SELECT university_id
                        FROM students
                        WHERE students.id = $2
                    ) OR (
                        type = 'rso' AND
                        host_rso_id IN (
                            SELECT rso_id
                            FROM rso_memberships
                            WHERE rso_memberships.user_id = $2
                        )
                    )
                )
            )
        `)
        eventResult = await fastify.pg.query(query, [eventId, userId])
    }

    return eventResult.rows[0] || null
}
