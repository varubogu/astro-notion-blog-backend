import { Hono, type Context } from "hono";
import { csrf } from "hono/csrf";

const securityApi = new Hono();

securityApi.get('/csrf-token', async (c: Context) => {

    return c.json({
        csrfToken: c.req.header('x-csrf-token'),
    });
});


export default securityApi;