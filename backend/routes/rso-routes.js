import { checkIsSuperAdmin } from "../db_helpers.js"

/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} _options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes(fastify, _options) {
    // POST /rso - create a new rso with the given name and the current user as the owner
    // GET /rso/available/:name - check if the given rso name is available
    // GET /rsos - get all rsos (if not superadmin, only rsos owned by someone in his university)
    // GET /my-rsos - get all rsos the current user is a member of

    // TODO: changing is_active to true when an rso has >4 members
    // and changing it to false when an rso has <=4 members
    // maybe we can do this in a trigger?

    fastify.post("/rso", {
        preHandler: fastify.authenticate,
        schema: {
            body: {
                type: "object",
                required: ["name"],
                properties: {
                    name: { type: "string" },
                },
            },
        },
    }, async (request, reply) => {
        const { name } = request.body
        const { id } = request.user
        try {
            await fastify.pg.query(`
                INSERT INTO rsos (name, owner_id)
                VALUES ($1, $2);`,
                [name, id])
        } catch (err) {
            reply.code(400).send({ message: "RSO already exists" })
            return
        }

        await fastify.pg.query(`
            INSERT INTO rso_memberships (rso_id, user_id)
            VALUES ((SELECT id FROM rsos WHERE name = $1), $2);`,
            [name, id])

        reply.send({ message: "RSO created" })
    })

    fastify.get("/rso/available/:name", {
        preHandler: fastify.authenticate,
    }, async (request, reply) => {
        const { name } = request.params

        const result = await fastify.pg.query(`
            SELECT * FROM rsos
            WHERE name = $1`,
            [name])
        if (result.rowCount === 0) {
            reply.send({ available: true })
        } else {
            reply.send({ available: false })
        }
    });

    fastify.get("/rsos", {
        preHandler: fastify.authenticate,
    }, async (request, reply) => {
        const { id } = request.user
        const isSuperAdmin = await checkIsSuperAdmin(fastify, id)
        if (isSuperAdmin) {
            const result = await fastify.pg.query(`
                SELECT * FROM rsos`)
            reply.send(result.rows)
        } else {
            const result = await fastify.pg.query(`
                SELECT * FROM rsos
                WHERE owner_id IN (
                    SELECT id FROM students
                    WHERE id != $1 AND university_id = (
                        SELECT university_id FROM students
                        WHERE id = $1
                    )
                )`,
                [id])
            reply.send(result.rows)
        }
    });

    fastify.get("/my-rsos", {
        preHandler: fastify.authenticate,
    }, async (request, reply) => {
        const { id } = request.user
        const result = await fastify.pg.query(`
            SELECT * FROM rsos
            WHERE id IN (
                SELECT rso_id FROM rso_memberships
                WHERE user_id = $1
            )`,
            [id])
        reply.send(result.rows)
    });
}

export const rsoRoutes = routes
