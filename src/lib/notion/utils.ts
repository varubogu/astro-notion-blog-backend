import { DatabasePropertyConfigResponse, type CreatePageParameters, type GetDatabaseResponse, type CreatePageResponse } from "@notionhq/client/build/src/api-endpoints";
import type { CommentFormSend } from "../schemas/commentFormSend";
import type { Client } from "@notionhq/client";

export async function getCommentsFromArticleId(
    notion: Client,
    databaseId: string,
    articleId: string
): Promise<string> {
    const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
            and: [
                {
                    property: "Published",
                    checkbox: {
                        equals: true
                    }
                },
                {
                    property: "Article",
                    relation: {
                        contains: articleId
                    }
                }
            ]
        },
        sorts: [
            {
                property: "作成日時",
                direction: "ascending"
            }
        ]
    });
    return response.results;
}

/**
 * Notionクライアントとスラッグを受け取り、対応する記事のIDを返します。
 * 
 * @param notion Notionのクライアントインスタンス
 * @param databaseId 対象のデータベースID
 * @param slug 記事のスラッグ
 * @returns 記事IDをPromiseで返します。
 */
export async function fetchArticleIdFromSlug(
    notion: Client,
    databaseId: string,
    slug: string
): Promise<string> {
    const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
            and: [
                {
                    property: "Slug",
                    rich_text: {
                        equals: slug
                    }
                },
                {
                    property: "Published",
                    checkbox: {
                        equals: true
                    }
                }
            ]
        }
    });

    if (response.results.length == 0) {
        throw new Error('not found......');
    } else if (response.results.length > 1) {
        throw new Error('multiple found......');
    } else {
        return response.results[0].id;
    }
}

/**
 * 指定されたコメントデータを使用して、Notionのコメントデータベースに新しいページを作成します。
 * 
 * @param notion Notionのクライアントインスタンス
 * @param databaseId 対象のデータベースID
 * @param postData コメントデータを含むオブジェクト。このデータはNotionデータベースのプロパティと一致する必要があります。
 * @returns {Promise<CreatePageResponse>} Notion APIからのレスポンスを返します。
 */
export async function addPage(
    notion: Client,
    databaseId: string,
    postData: CommentFormSend
): Promise<CreatePageResponse> {

    // プロパティを取得
    const { properties } = await notion.databases.retrieve({
        database_id: databaseId,
    });

    // プロパティデータと入力データを使用して、
    // Notion APIのページ作成パラメータに適合する形式に変換します。
    const propertiesData = await makePropertiesData(properties, postData);

    const parameters = {
        parent: {
            database_id: databaseId,
        },
        properties: propertiesData,
    } as CreatePageParameters;

    return await notion.pages.create(parameters);
}

/**
 * プロパティデータと入力データを使用して、
 * Notion APIのページ作成パラメータに適合する形式に変換します。
 * 
 * @param properties Notionデータベースのプロパティ設定。
 * @param data 入力データ。このデータはNotionデータベースのプロパティと一致する必要があります。
 * @returns {Promise<any>} Notion APIのページ作成パラメータに適合するプロパティ値のレコードをPromiseで返します。
 */
async function makePropertiesData(
    properties: GetDatabaseResponse["properties"],
    data: any
): Promise<any> {

    const propertyValues: Record<string, any> = {};

    Object.entries(data).forEach(([name, value]) => {
        if (!properties.hasOwnProperty(name)) {
            return;
        }
        const property = properties[name];

        const postData = makePostPropertyValue(property, value);
        if (postData != undefined) {
            propertyValues[name] = postData;
        }
    });
    return propertyValues;
}

/**
 * プロパティデータとJSONデータを受け取り、
 * Notion APIのページ作成パラメータに適合する形式に変換します。
 * 
 * @param property Notionデータベースのプロパティ設定。
 * @param value 設定するデータ
 * @returns {object | undefined} Notion APIの
 *          ページ作成パラメータに適合するプロパティ値のレコード。
 *          不明な場合はundefined
 */
export function makePostPropertyValue(
    property: DatabasePropertyConfigResponse,
    value: any
): object | undefined {
    if (property.type === "date") {
        return {
            type: "date",
            date: {
                start: value,
            },
        };
    } else if (property.type === "multi_select") {
        const multiSelectOption = property.multi_select.options[value];
        if (multiSelectOption) {
            return {
                type: "multi_select",
                multi_select: [multiSelectOption],
            };
        }
    } else if (property.type === "select") {
        const selectOption = property.select.options[value];
        if (selectOption) {
            return {
                type: "select",
                id: property.id,
                select: selectOption,
            };
        }
    } else if (property.type === "email") {
        return {
            type: "email",
            id: property.id,
            email: value,
        };
    } else if (property.type === "checkbox") {
        return {
            type: "checkbox",
            id: property.id,
            checkbox: value,
        };
    } else if (property.type === "url") {
        return {
            type: "url",
            id: property.id,
            url: value,
        };
    } else if (property.type === "number") {
        return {
            type: "number",
            id: property.id,
            number: value,
        };
    } else if (property.type === "title") {
        return {
            type: "title",
            id: property.id,
            title: [
                {
                    type: "text",
                    text: { content: value },
                },
            ],
        };
    } else if (property.type === "rich_text") {
        return {
            type: "rich_text",
            id: property.id,
            rich_text: [
                {
                    type: "text",
                    text: { content: value },
                },
            ],
        };
    } else if (property.type === "phone_number") {
        return {
            type: "phone_number",
            id: property.id,
            phone_number: value,
        };
    } else if (property.type === "relation") {
        return {
            relation: [
                {
                    id: value
                }
            ]
        };
    } else {
        console.log("unimplemented property type: ", property.type);
        return undefined;
    }
}

export function getPropertyValue(
    property: DatabasePropertyConfigResponse
): any {
    if (property.type === "date") {
        return property["date"];
    } else if (property.type === "multi_select") {
        return property["multi_select"];
    } else if (property.type === "select") {
        return property["select"];
    } else if (property.type === "email") {
        return property["email"];
    } else if (property.type === "checkbox") {
        return property["checkbox"];
    } else if (property.type === "url") {
        return property["url"];
    } else if (property.type === "number") {
        return property["number"];
    } else if (property.type === "title") {
        return property["title"][0]['text']['content'];
    } else if (property.type === "rich_text") {
        return property['rich_text'][0]['text']['content'];
    } else if (property.type === "phone_number") {
        return property['phone_number'];
    } else if (property.type === "relation") {
        return property["relation"]["id"];
    } else if (property.type === "created_time") {
        return property['created_time'];
    } else if (property.type === "last_edited_time") {
        return property['last_edited_time'];
    } else {
        console.log("unimplemented property type: ", property.type);
        return undefined;
    }
}