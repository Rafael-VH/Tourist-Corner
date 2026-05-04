import { supabase, handleSupabaseError } from '../datasources/SupabaseClient';
import type { CommentRepository } from '@/domain/repositories/CommentRepository';
import type { Comment, CommentInput, CommentTargetType } from '@/domain/entities/Comment';

interface CommentRecord {
  id: string;
  target_id: string;
  target_type: CommentTargetType;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  content: string;
  images?: string[];
  likes: number;
  created_at: string;
  updated_at: string;
}

export class SupabaseCommentRepository implements CommentRepository {
  async getCommentsByTarget(targetId: string, targetType: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('target_id', targetId)
      .eq('target_type', targetType)
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return (data || []).map(this.mapToComment);
  }

  async createComment(
    input: CommentInput,
    userId: string,
    userName: string,
    userAvatar?: string,
  ): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        target_id: input.targetId,
        target_type: input.targetType,
        user_id: userId,
        user_name: userName,
        user_avatar: userAvatar,
        rating: input.rating,
        content: input.content,
        images: input.images,
        likes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return this.mapToComment(data);
  }

  async updateComment(id: string, content: string, rating: number): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .update({
        content,
        rating,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return this.mapToComment(data);
  }

  async deleteComment(id: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) handleSupabaseError(error);
  }

  async likeComment(id: string): Promise<number> {
    const { data, error } = await supabase
      .from('comments')
      .select('likes')
      .eq('id', id)
      .single();

    if (error) handleSupabaseError(error);
    if (!data) throw new Error('Comentario no encontrado');

    const newLikes = (data.likes || 0) + 1;

    const { error: updateError } = await supabase
      .from('comments')
      .update({ likes: newLikes })
      .eq('id', id);

    if (updateError) handleSupabaseError(updateError);

    return newLikes;
  }

  async getUserComments(userId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error);
    return (data || []).map(this.mapToComment);
  }

  private mapToComment(record: CommentRecord): Comment {
    return {
      id: record.id,
      targetId: record.target_id,
      targetType: record.target_type,
      userId: record.user_id,
      userName: record.user_name,
      userAvatar: record.user_avatar,
      rating: record.rating,
      content: record.content,
      images: record.images,
      likes: record.likes,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    };
  }
}
