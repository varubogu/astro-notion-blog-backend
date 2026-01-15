import { describe, expect, it } from "vitest";

describe("http://localhost:3000/api/v1/comments/add", () => {
    const post = async (postJson: any) =>
        fetch("http://localhost:3000/api/v1/comments/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postJson),
        });

    it("success", async () => {
        const response = await post({
            name: "varubogu",
            comment: "記事",
            slug: "slug",
        });

        if (!response.ok) {
            throw new Error("HTTP NG");
        }

        const actual = await response.json();
        expect(actual).toEqual({
            message: "コメントを投稿しました。運営者が確認後に公開されます。",
            result: true,
        });
        actual;
    });
});
