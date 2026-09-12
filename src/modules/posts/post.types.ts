export interface Post {
  id: string;
  authorName: string;
  authorRole: string;
  authorEmail: string;
  content: string;
  likes: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  authorName: string;
  authorRole?: string;
  authorEmail: string;
  content: string;
}
