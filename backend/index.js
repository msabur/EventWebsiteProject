import * as dotenv from 'dotenv'
dotenv.config()

import Fastify from 'fastify'
import blippPlugin from "fastify-blipp";
import cors from '@fastify/cors'
import fastifyBcrypt from 'fastify-bcrypt'
import * as routes from './routes/index.js'
import * as plugins from './plugins/index.js'

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  exposeHeadRoutes: false,
  logger: {
    transport: {
      target: "@fastify/one-line-logger"
    }
  }
})

// Register Fastify plugins
fastify.register(blippPlugin)
fastify.register(cors)
fastify.register(fastifyBcrypt, { saltWorkFactor: 10 })

// Register custom plugins and routes
Object.values(plugins).forEach(plugin => fastify.register(plugin))
Object.values(routes).forEach(route => fastify.register(route))

const port = process.env.PORT || 3000;
const host = ("RENDER" in process.env) ? `0.0.0.0` : `localhost`;

const start = async () => {
  try {
    await fastify.listen({host: host, port: port })
    fastify.blipp()
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
