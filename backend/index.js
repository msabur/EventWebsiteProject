import * as dotenv from 'dotenv'
dotenv.config()

import Fastify from 'fastify'
import cors from '@fastify/cors'
import * as routes from './routes/index.js'
import * as plugins from './plugins/index.js'

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true
})

// Register Fastify plugins
fastify.register(cors)

// Register custom plugins and routes
Object.values(plugins).forEach(plugin => fastify.register(plugin))
Object.values(routes).forEach(route => fastify.register(route))

const start = async () => {
  try {
    await fastify.listen({ port: 3000})
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
