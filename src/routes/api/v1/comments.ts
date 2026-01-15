import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { type Context, Hono } from "hono";
import {
    addPage,
    fetchArticleIdFromSlug,
    getCommentsFromArticleId,
    getPropertyValue,
} from "@/lib/notion/utils";
import { CommentFormInput } from "@/lib/schemas/commentFormInput";
import { CommentFormSend } from "@/lib/schemas/commentFormSend";

const commentsApi = new Hono();

/**
 * 指定されたスラッグを検索し、コメントを取得します。
 */
commentsApi.get("/get/:slug", async (c: Context) => {
    const slug = c.req.param("slug");

    const notionClient = new Client({
        auth: c.env.NOTION_API_SECRET ?? "",
        fetch: fetch.bind(globalThis),
    });

    // Slug->ArticleId
    const postsDataSourceId = c.env.NOTION_DATASOURCE_POSTS_ID || "";
    const articleId = await fetchArticleIdFromSlug(
        notionClient,
        postsDataSourceId,
        slug,
    );

    // ArticleId->CommentList
    const commentsDataSourceId = c.env.NOTION_DATASOURCE_COMMENTS_ID || "";
    const comments = await getCommentsFromArticleId(
        notionClient,
        commentsDataSourceId,
        articleId,
    );
    const outputPropertyMappings: Record<string, string> = {
        Commenter: "commenter",
        Comment: "comment",
        作成日時: "createdAt",
    };
    return c.json({
        result: true,
        comments: comments
            .filter((element) => element.object === "page")
            .map((element) =>
                Object.entries((element as PageObjectResponse).properties)
                    .filter(
                        ([propName, _prop]) =>
                            propName in outputPropertyMappings,
                    )
                    .reduce(
                        (acc, [propName, prop]) => {
                            acc[outputPropertyMappings[propName]] =
                                getPropertyValue(
                                    prop as PageObjectResponse["properties"][string],
                                );
                            return acc;
                        },
                        {} as Record<string, unknown>,
                    ),
            ),
    });
});

/**
 * コメントを投稿します。
 */
commentsApi.post("/add", async (c: Context) => {
    const json = await c.req.json();
    const formParseResult = await CommentFormInput.safeParseAsync(json);

    if (!formParseResult.success) {
        const message = formParseResult.error.issues
            .map((e) => e.message)
            .join(", ");

        return c.json({ result: false, message: message });
    }

    const formData = formParseResult.data;

    const notionClient = new Client({
        auth: c.env.NOTION_API_SECRET ?? "",
        fetch: fetch.bind(globalThis),
    });
    const postsDataSourceId = c.env.NOTION_DATASOURCE_POSTS_ID || "";
    const articleId = await fetchArticleIdFromSlug(
        notionClient,
        postsDataSourceId,
        formData.slug,
    );

    const postData = new CommentFormSend(
        formData.name,
        formData.comment,
        articleId,
    );

    const commentDataSourceId = c.env.NOTION_DATASOURCE_COMMENTS_ID || "";
    await addPage(notionClient, commentDataSourceId, postData);

    return c.json({
        result: true,
        message: "コメントを投稿しました。運営者が確認後に公開されます。",
    });
});

export default commentsApi;
