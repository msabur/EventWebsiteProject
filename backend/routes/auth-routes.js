/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes(fastify, options) {
    fastify.post('/login', async (request, reply) => {
        const { username, password } = request.body
        // dummy login
        if (password === 'password') {
            const token = fastify.jwt.sign({ username: username })
            reply.send({ token })
        } else {
            reply.code(401).send({ error: 'Invalid username or password' })
        }
    })

    fastify.post('/logout', async (request, reply) => {
        // no real logout, the client should just delete the token on his side
        reply.send({ message: 'Logout success' })
    })

    fastify.post('/register', async (request, reply) => {
        const { username, password, email } = request.body
        // TODO: implement register
        reply.send({ message: 'Not implemented' })
    })

    fastify.get('/protected', { preHandler: fastify.authenticate }, async (request, reply) => {
        reply.send({ message: 'You are authenticated' })
    })
}

export const authRoutes = routes
