/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes(fastify, options) {
    fastify.post('/login', {
        schema: {
            body: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                    username: { type: 'string' },
                    password: { type: 'string' },
                },
            },
        },
    }, async (request, reply) => {
        const invalidLogin = { error: 'Invalid username or password' }
        const { username, password } = request.body
        const result = await fastify.pg.query('SELECT * FROM users WHERE username = $1', [username])
        const user = result.rows[0]
        if (!user) {
            reply.code(400).send(invalidLogin)
            return
        }
        const isPasswordValid = await fastify.bcrypt.compare(password, user.pass_hash)
        if (isPasswordValid) {
            const token = fastify.jwt.sign({ username: user.username, id: user.id })
            let isAdmin, isSuperAdmin
            const adminResult = await fastify.pg.query('SELECT * FROM admins WHERE id = $1', [user.id])
            const superAdminResult = await fastify.pg.query('SELECT * FROM super_admins WHERE id = $1', [user.id])
            isAdmin = adminResult.rows.length > 0
            isSuperAdmin = superAdminResult.rows.length > 0
            reply.send({ token, isAdmin, isSuperAdmin })
        } else {
            reply.code(400).send(invalidLogin)
        }
    })

    fastify.post('/logout', async (request, reply) => {
        // no real logout, the client should just delete the token on his side
        reply.send({ message: 'Logout success' })
    })

    fastify.post('/register', {
        schema: {
            body: {
                type: 'object',
                required: ['username', 'password', 'email', 'universityName'],
                properties: {
                    username: { type: 'string' },
                    password: { type: 'string' },
                    email: { type: 'string' },
                    universityName: { type: 'string' },
                },
            },
        },
    }, async (request, reply) => {
        const { username, password, email, universityName } = request.body
        const universityResult = await fastify.pg.query('SELECT * FROM universities WHERE name = $1', [universityName])
        if (universityResult.rows.length === 0) {
            reply.code(400).send({ error: 'University not found' })
            return
        }
        const hashedPassword = await fastify.bcrypt.hash(password)
        try {
            await fastify.pg.query(`
                INSERT INTO users (username, pass_hash, email)
                VALUES ($1, $2, $3)`,
                [username, hashedPassword, email])
        } catch (err) {
            reply.code(400).send({ error: 'Username already exists' })
        }
        const universityId = universityResult.rows[0].id
        await fastify.pg.query(`
            INSERT INTO students (id, university_id)
            VALUES ((SELECT id FROM users WHERE username = $1), $2)`,
            [username, universityId])
        reply.send({ message: 'Successfully registered!' })
    })

    fastify.get('/protected', { preHandler: fastify.authenticate }, async (request, reply) => {
        let { username, id } = request.user
        reply.send({ message: `You are authenticated: username ${username}, id ${id}` })
    })
}

export const authRoutes = routes
