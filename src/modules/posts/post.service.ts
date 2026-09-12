import { db, pool } from '../../db/index.js';
import { post as postTable } from '../../db/schema.js';
import { Post, CreatePostInput } from './post.types.js';
import { ApiError } from '../../utils/api-error.js';
import { desc, eq } from 'drizzle-orm';
import { logger } from '../../utils/logger.js';
import { enqueuePostLikeEmail } from '../../queues/email.queue.js';

export class PostService {
  public async getAllPosts(): Promise<Post[]> {
    try {
      const posts = await db.select().from(postTable).orderBy(desc(postTable.createdAt));
      return posts.map((p) => ({
        ...p,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      logger.info('Falling back to pool query for posts: ' + (err instanceof Error ? err.message : String(err)));
      const res = await pool.query('SELECT * FROM "post" ORDER BY "createdAt" DESC');
      return res.rows.map((p) => ({
        id: p.id,
        authorName: p.authorName,
        authorRole: p.authorRole,
        authorEmail: p.authorEmail,
        content: p.content,
        likes: p.likes || 0,
        commentsCount: p.commentsCount || 0,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
      }));
    }
  }

  public async createPost(input: CreatePostInput): Promise<Post> {
    const id = `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const newPostData = {
      id,
      authorName: input.authorName,
      authorRole: input.authorRole || 'user',
      authorEmail: input.authorEmail,
      content: input.content,
      likes: 0,
      commentsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const [inserted] = await db.insert(postTable).values(newPostData).returning();
      return {
        ...inserted,
        createdAt: inserted.createdAt.toISOString(),
        updatedAt: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      logger.info('Falling back to pool insert for posts: ' + (err instanceof Error ? err.message : String(err)));
      await pool.query(
        'INSERT INTO "post" ("id", "authorName", "authorRole", "authorEmail", "content", "likes", "commentsCount", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [id, input.authorName, input.authorRole || 'user', input.authorEmail, input.content, 0, 0, now, now]
      );
      return {
        ...newPostData,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
    }
  }

  public async toggleLike(
    id: string,
    increment: boolean = true,
    likerInfo?: { name?: string; email?: string }
  ): Promise<Post> {
    let postToReturn: Post;

    try {
      const [existing] = await db.select().from(postTable).where(eq(postTable.id, id));
      if (!existing) {
        throw ApiError.notFound(`Post '${id}' not found`);
      }
      const newLikes = Math.max(0, existing.likes + (increment ? 1 : -1));
      const [updated] = await db
        .update(postTable)
        .set({ likes: newLikes, updatedAt: new Date() })
        .where(eq(postTable.id, id))
        .returning();

      postToReturn = {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const res = await pool.query(
        'UPDATE "post" SET "likes" = GREATEST(0, "likes" + $1), "updatedAt" = NOW() WHERE "id" = $2 RETURNING *',
        [increment ? 1 : -1, id]
      );
      if (res.rowCount === 0) {
        throw ApiError.notFound(`Post '${id}' not found`);
      }
      const p = res.rows[0];
      postToReturn = {
        id: p.id,
        authorName: p.authorName,
        authorRole: p.authorRole,
        authorEmail: p.authorEmail,
        content: p.content,
        likes: p.likes,
        commentsCount: p.commentsCount,
        createdAt: new Date(p.createdAt).toISOString(),
        updatedAt: new Date(p.updatedAt).toISOString(),
      };
    }

    // Trigger BullMQ post-like email notification asynchronously if incrementing
    if (increment && postToReturn.authorEmail) {
      enqueuePostLikeEmail({
        recipientEmail: postToReturn.authorEmail,
        recipientName: postToReturn.authorName || 'Developer',
        likerName: likerInfo?.name || 'A community member',
        postContent: postToReturn.content,
        postId: postToReturn.id,
      }).catch((emailErr) => {
        logger.error('[LIKE EMAIL NOTICE] Failed to queue like notification:', emailErr);
      });
    }

    return postToReturn;
  }
}
