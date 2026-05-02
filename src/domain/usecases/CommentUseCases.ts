import type { CommentRepository } from '@/domain/repositories/CommentRepository';
import type { Comment, CommentInput } from '@/domain/entities/Comment';

export class GetCommentsByTargetUseCase {
  private commentRepository: CommentRepository;

  constructor(commentRepository: CommentRepository) {
    this.commentRepository = commentRepository;
  }

  async execute(targetId: string, targetType: string): Promise<Comment[]> {
    return this.commentRepository.getCommentsByTarget(targetId, targetType);
  }
}

export class CreateCommentUseCase {
  private commentRepository: CommentRepository;

  constructor(commentRepository: CommentRepository) {
    this.commentRepository = commentRepository;
  }

  async execute(
    input: CommentInput,
    userId: string,
    userName: string,
    userAvatar?: string,
  ): Promise<Comment> {
    return this.commentRepository.createComment(input, userId, userName, userAvatar);
  }
}

export class UpdateCommentUseCase {
  private commentRepository: CommentRepository;

  constructor(commentRepository: CommentRepository) {
    this.commentRepository = commentRepository;
  }

  async execute(id: string, content: string, rating: number): Promise<Comment> {
    return this.commentRepository.updateComment(id, content, rating);
  }
}

export class DeleteCommentUseCase {
  private commentRepository: CommentRepository;

  constructor(commentRepository: CommentRepository) {
    this.commentRepository = commentRepository;
  }

  async execute(id: string): Promise<void> {
    return this.commentRepository.deleteComment(id);
  }
}

export class LikeCommentUseCase {
  private commentRepository: CommentRepository;

  constructor(commentRepository: CommentRepository) {
    this.commentRepository = commentRepository;
  }

  async execute(id: string): Promise<number> {
    return this.commentRepository.likeComment(id);
  }
}

export class GetUserCommentsUseCase {
  private commentRepository: CommentRepository;

  constructor(commentRepository: CommentRepository) {
    this.commentRepository = commentRepository;
  }

  async execute(userId: string): Promise<Comment[]> {
    return this.commentRepository.getUserComments(userId);
  }
}
