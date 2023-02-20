/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes(fastify, options) {
    fastify.get('/fruits', async (request, reply) => {
        const result = await fastify.pg.query('SELECT * FROM fruits')
        return result.rows
    })

    fastify.get('/fruits/:fruit', async (request, reply) => {
        const result = await fastify.pg.query('SELECT * FROM fruits WHERE name = $1', [request.params.fruit])
        return result.rows
    })

    const fruitBodyJsonSchema = {
        type: 'object',
        required: ['name', 'description'],
        properties: {
            name: { type: 'string' },
            description: { type: 'string' },
        },
    }

    const schema = {
        body: fruitBodyJsonSchema,
    }

    fastify.post('/fruits', { schema }, async (request, reply) => {
        const result = fastify.pg.query('INSERT INTO fruits (name, description) VALUES ($1, $2)', [request.body.name, request.body.description])
        return result
    })
}

export const fruitRoutes = routes
