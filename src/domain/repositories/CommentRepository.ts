import type { Comment, CommentInput } from '../entities/Comment';

export interface CommentRepository {
  getCommentsByTarget(targetId: string, targetType: string): Promise<Comment[]>;
  createComment(input: CommentInput, userId: string, userName: string, userAvatar?: string): Promise<Comment>;
  updateComment(id: string, content: string, rating: number): Promise<Comment>;
  deleteComment(id: string): Promise<void>;
  likeComment(id: string): Promise<number>;
  getUserComments(userId: string): Promise<Comment[]>;
}
