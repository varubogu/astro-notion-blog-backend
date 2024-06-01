import { Hono, type Context } from "hono";
import { addPage, getArticleIdFromSlug as fetchArticleIdFromSlug } from "../../../lib/notion/utils";
import { CommentFormInput } from "../../../lib/schemas/commentFormInput";
import { CommentFormSend } from "../../../lib/schemas/commentFormSend";
import { Client } from "@notionhq/client";
import { csrf } from "hono/csrf";

const commentsApi = new Hono();

commentsApi.post('/add', async (c: Context) => {

    const json = await c.req.json();
    const formParseResult = await CommentFormInput.safeParseAsync(json);

    if (!formParseResult.success) {
        const message = formParseResult.error.errors
            .map((e) => e.message)
            .join(', ');

        return c.json({ result: false, message: message });
    }

    const formData = formParseResult.data;

    const notionClient = new Client({
        auth: c.env.NOTION_API_SECRET ?? ''
    })
    const postsDbId = c.env.NOTION_DATABASE_POSTS_ID || '';
    const articleId = await fetchArticleIdFromSlug(
        notionClient,
        postsDbId,
        formData.slug
    );

    const postData = new CommentFormSend(
        formData.name,
        formData.comment,
        articleId
    );

    const commentDbId = c.env.NOTION_DATABASE_COMMENTS_ID || '';
    await addPage(notionClient, commentDbId, postData);

    return c.json({
        result: true,
        message: 'コメントを投稿しました。運営者が確認後に公開されます。'
    });
});

export default commentsApi;