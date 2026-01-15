import { type Context, Hono } from "hono";

const securityApi = new Hono();

/**
 * CSRFトークンを取得します。
 * @param {Context} c コンテキスト
 * @returns {Promise<Response>} CSRFトークンを含むJSONオブジェクト
 */
securityApi.get("/csrf-token", async (c: Context) => {
    return c.json({
        csrfToken: c.req.header("x-csrf-token"),
    });
});

export default securityApi;
