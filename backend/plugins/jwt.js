import fastifyPlugin from 'fastify-plugin'
import jwt from '@fastify/jwt'

export const jwtAssistant = fastifyPlugin(async (fastify) => {
    fastify.register(jwt, {
        secret: process.env.JWT_SECRET
    })

    fastify.decorate("authenticate", async function (request, reply) {
        try {
            await request.jwtVerify()
        } catch (err) {
            reply.send(err)
        }
    })
})

