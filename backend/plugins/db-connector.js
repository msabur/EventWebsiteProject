import fastifyPlugin from 'fastify-plugin'
import fastifyPostgres from '@fastify/postgres'

export const dbConnector = fastifyPlugin(async (fastify, options) => {
    fastify.register(fastifyPostgres, {
        connectionString: process.env.DATABASE_CONNECTION_STRING,
    })
})
