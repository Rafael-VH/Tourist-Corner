export type CommentTargetType = 'hotel' | 'room';

export interface Comment {
  id: string;
  targetId: string;
  targetType: CommentTargetType;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  content: string;
  images?: string[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentInput {
  targetId: string;
  targetType: CommentTargetType;
  rating: number;
  content: string;
  images?: string[];
}
