import z from 'zod';
export var EmojiType;
(function (EmojiType) {
    EmojiType["LIKE"] = "like";
    EmojiType["LAUGH"] = "laugh";
    EmojiType["CRY"] = "cry";
    EmojiType["ANGRY"] = "angry";
})(EmojiType || (EmojiType = {}));
export const userRegisterSchema = z.object({
    name: z.string().min(2).max(20),
    email: z.string().email(),
    password: z.string().min(8).max(20),
    bio: z.string().max(700),
});
export const userLoginSchema = z.object({
    emailOrUsername: z.string().email(),
    password: z.string().min(8).max(20),
});
export const userPostSchema = z.object({
    title: z.string().min(2).max(100),
    content: z.string().min(10).max(5000),
    tags: z.array(z.string()).max(10).optional(),
    imageUrl: z.string().url().optional(),
    markdown: z.string().min(10).max(5000).optional(),
    category: z.string().min(2).max(50).optional(),
    categoryId: z.string().min(1).max(50).optional(),
    authorId: z.string().min(1).max(50),
    videoUrl: z.string().url().optional(),
    embedUrl: z.string().url().optional(),
    isPublished: z.boolean().optional(),
    publishedAt: z.string().optional(),
});
export const emojiInputSchema = z.object({
    emoji: z.nativeEnum(EmojiType),
});
export const commentSchema = z.object({
    content: z.string().min(1).max(1000),
    postId: z.string(),
    authorId: z.string(),
    parentId: z.string().optional(),
});
export const userEditSchema = z.object({
    name: z.string().min(2).max(20).optional(),
    email: z.string().email().optional(),
    bio: z.string().max(700).optional(),
    username: z.string().max(20).optional(),
    portfolioLink: z.string().max(100).optional(),
});
export const userFollowerSchema = z.object({
    followingId: z.string(),
    followerId: z.string(),
});
