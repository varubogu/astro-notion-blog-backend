import { z } from "zod";


export const CommentFormInput = z.object({
    name: z.string().min(1, "名前は必須です" ),
    comment: z.string().min(1, "コメントは必須です"),
    slug: z.string().min(1, "不明なエラーが発生しました" ),

});
