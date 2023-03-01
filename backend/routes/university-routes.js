/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes(fastify, options) {
    // GET /universities - get all universities
    // POST /universities - create a new university (super admin only)
    // DELETE /universities/:name - delete a university (super admin only)

    fastify.get('/universities', async (request, reply) => {
        const result = await fastify.pg.query('SELECT * FROM universities')
        reply.send(result.rows)
    })

    fastify.post('/universities', {
        preHandler: fastify.authenticate,
        schema: {
            body: {
                type: 'object',
                required: ['name', 'location', 'description', 'num_students'],
                properties: {
                    name: { type: 'string' },
                    location: { type: 'string' },
                    description: { type: 'string' },
                    num_students: { type: 'number' },
                },
            },
        },
    }, async (request, reply) => {
        const { name, location, description, num_students } = request.body
        // check if user is super admin (is in super_admins table)
        const { id } = request.user
        const superAdminResult = await fastify.pg.query('SELECT * FROM super_admins WHERE id = $1', [id])
        if (superAdminResult.rows.length === 0) {
            reply.code(400).send({ error: 'Not authorized' })
            return
        }
        try {
            await fastify.pg.query(`
                INSERT INTO universities (name, location, description, num_students)
                VALUES ($1, $2, $3, $4)`,
                [name, location, description, num_students])
            reply.send({ message: 'University created' })
        } catch (err) {
            reply.code(400).send({ error: 'University already exists' })
        }
    })

    fastify.delete('/universities/:name', {
        preHandler: fastify.authenticate,
        schema: {
            params: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string' },
                },
            },
        },
    }, async (request, reply) => {
        const { name } = request.params
        // check if user is super admin (is in super_admins table)
        const { id } = request.user
        const superAdminResult = await fastify.pg.query('SELECT * FROM super_admins WHERE id = $1', [id])
        if (superAdminResult.rows.length === 0) {
            reply.code(400).send({ error: 'Not authorized' })
            return
        }
        try {
            await fastify.pg.query('DELETE FROM universities WHERE name = $1', [name])
            reply.send({ message: 'University deleted' })
        } catch (err) {
            reply.code(400).send({ error: 'University not found' })
        }
    })
}

export const universityRoutes = routes