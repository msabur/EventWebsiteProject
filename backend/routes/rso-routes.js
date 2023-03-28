import { checkIsSuperAdmin } from "../db_helpers.js"

/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} _options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes(fastify, _options) {
    // POST /rso - create a new rso with the given name and the current user as the owner
    // GET /rso/available/:name - check if the given rso name is available
    // GET /joinable-rsos - returns all rsos if superadmin, otherwise only those that the current user can join
    // GET /pending-rsos - returns all rsos that aren't approved yet (superadmin only)
    // POST /pending-rsos - approve/deny a pending rso. If accepted, owner becomes an admin
    // GET /my-rsos - get all rsos the current user is a member of
    // POST /rso/:id/join - join the rso with the given id (initially, is_approved is false)
    // GET /my-rsos/pending-memberships - get all pending memberships for the current user's rsos
    // POST /my-rsos/pending-memberships - approve/deny a pending membership

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
            INSERT INTO rso_memberships (rso_id, user_id, is_approved)
            VALUES ((SELECT id FROM rsos WHERE name = $1), $2, true);`,
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

    fastify.get("/joinable-rsos", {
        preHandler: fastify.authenticate,
    }, async (request, reply) => {
        const { id } = request.user
        const isSuperAdmin = await checkIsSuperAdmin(fastify, id)
        if (isSuperAdmin) {
            reply.status(401, "Superadmins cannot join RSOs")
        } else {
            const result = await fastify.pg.query(`
                SELECT * FROM rsos
                WHERE owner_id IN (
                    SELECT id FROM students
                    WHERE id != $1 AND university_id = (
                        SELECT university_id FROM students
                        WHERE id = $1
                    )
                ) AND id NOT IN (
                    SELECT rso_id FROM rso_memberships
                    WHERE user_id = $1
                )`,
                [id])
            reply.send(result.rows)
        }
    });

    fastify.get("/pending-rsos", {
        preHandler: fastify.authenticate,
    }, async (request, reply) => {
        const { id } = request.user
        const isSuperAdmin = await checkIsSuperAdmin(fastify, id)
        if (!isSuperAdmin) {
            reply.status(401, "Only superadmins can view pending RSOs")
        } else {
            const result = await fastify.pg.query(`
                SELECT name AS rso_name, users.username AS owner_name
                FROM rsos
                JOIN users ON rsos.owner_id = users.id
                WHERE rsos.is_approved = false`)
            reply.send(result.rows)
        }
    });

    fastify.post("/pending-rsos", {
        preHandler: fastify.authenticate,
        schema: {
            body: {
                type: "object",
                required: ["rso_name", "accept"],
                properties: {
                    rso_name: { type: "string" },
                    accept: { type: "boolean" },
                },
            },
        },
    }, async (request, reply) => {
        const { rso_name, accept } = request.body
        const { id } = request.user
        const isSuperAdmin = await checkIsSuperAdmin(fastify, id)
        if (!isSuperAdmin) {
            reply.status(401, "Only superadmins can approve/deny RSOs")
        } else if (accept) {
            await fastify.pg.query(`
                UPDATE rsos
                SET is_approved = $1
                WHERE name = $2;`,
                [accept, rso_name])

            await fastify.pg.query(`
                INSERT INTO admins (id)
                VALUES ((SELECT owner_id FROM rsos WHERE name = $1))`,
                [rso_name])

            reply.send({ message: "RSO updated" })
        } else {
            await fastify.pg.query(`
                    DELETE FROM rsos
                    WHERE name = $1`,
                [rso_name])
            reply.send({ message: "RSO deleted" })
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

    fastify.post("/rso/:id/join", {
        preHandler: fastify.authenticate,
        schema: {
            params: {
                type: "object",
                required: ["id"],
                properties: {
                    id: { type: "integer" },
                },
            },
        },
    }, async (request, reply) => {
        const { id } = request.params
        const { id: userId } = request.user
        try {
            await fastify.pg.query(`
                INSERT INTO rso_memberships (rso_id, user_id, is_approved)
                VALUES ($1, $2, 'false');`,
                [id, userId])
        } catch (err) {
            reply.code(400).send({ message: err.message })
            return
        }
    });

    fastify.get("/my-rsos/pending-memberships", {
        preHandler: fastify.authenticate,
    }, async (request, reply) => {
        const { id } = request.user

        // only get pending memberships for rsos owned by the current user
        const result = await fastify.pg.query(`
            SELECT users.username, rsos.name AS rso_name
            FROM rso_memberships
            JOIN users ON rso_memberships.user_id = users.id
            JOIN rsos ON rso_memberships.rso_id = rsos.id
            WHERE rso_memberships.is_approved = false AND
                rsos.owner_id = $1`,
            [id])
        reply.send(result.rows)
    });

    fastify.post("/my-rsos/pending-memberships", {
        preHandler: fastify.authenticate,
        schema: {
            body: {
                type: "object",
                required: ["username", "rso_name", "accept"],
                properties: {
                    username: { type: "string" },
                    rso_name: { type: "string" },
                    accept: { type: "boolean" },
                },
            },
        },
    }, async (request, reply) => {
        const { username, rso_name, accept } = request.body
        const { id } = request.user

        // if accepting, set is_approved to true. if rejecting, delete the row
        try {
            if (accept) {
                await fastify.pg.query(`
                    UPDATE rso_memberships
                    SET is_approved = true
                    WHERE user_id = (SELECT id FROM users WHERE username = $1)
                        AND rso_id = (SELECT id FROM rsos WHERE name = $2)
                        AND rso_id IN (
                            SELECT id FROM rsos
                            WHERE owner_id = $3
                        )`,
                    [username, rso_name, id])
            } else {
                await fastify.pg.query(`
                    DELETE FROM rso_memberships
                    WHERE is_approved = false
                        AND user_id = (SELECT id FROM users WHERE username = $1)
                        AND rso_id = (SELECT id FROM rsos WHERE name = $2)
                        AND rso_id IN (
                            SELECT id FROM rsos
                            WHERE owner_id = $3
                        )`,
                    [username, rso_name, id])
            }

        } catch (err) {
            reply.code(400).send({ message: err.message })
            return
        }
        reply.send({ message: "Membership updated" })
    });
}

export const rsoRoutes = routes
