export class CommentFormSend {
    Commenter: string;
    Comment: string;
    Article: string

    constructor(author: string, comment: string, articleId: string) {
        this.Commenter = author;
        this.Comment = comment;
        this.Article = articleId;
    }
};


