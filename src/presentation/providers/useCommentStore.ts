import { create } from 'zustand';
import type { Comment, CommentInput } from '@/domain/entities/Comment';
import { getContainer } from '@/core/di/Container';

interface CommentState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;

  setComments: (comments: Comment[]) => void;
  fetchCommentsByTarget: (targetId: string, targetType: string) => Promise<void>;
  addComment: (input: CommentInput, userId: string, userName: string, userAvatar?: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
}

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  isLoading: false,
  error: null,

  setComments: (comments) => set({ comments }),

  fetchCommentsByTarget: async (targetId, targetType) => {
    set({ isLoading: true, error: null });
    try {
      const { getCommentsByTarget } = getContainer();
      const comments = await getCommentsByTarget.execute(targetId, targetType);
      set({ comments, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addComment: async (input, userId, userName, userAvatar) => {
    set({ isLoading: true });
    try {
      const { createComment } = getContainer();
      const newComment = await createComment.execute(input, userId, userName, userAvatar);
      set((state) => ({
        comments: [newComment, ...state.comments],
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  likeComment: async (commentId) => {
    try {
      const { likeComment } = getContainer();
      const newLikes = await likeComment.execute(commentId);
      set((state) => ({
        comments: state.comments.map((c) =>
          c.id === commentId ? { ...c, likes: newLikes } : c
        ),
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message });
    }
  },
}));
