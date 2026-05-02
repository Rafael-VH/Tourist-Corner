import { create } from 'zustand';
import type { Comment } from '@/domain/entities/Comment';

interface CommentState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setComments: (comments: Comment[]) => void;
  fetchCommentsByTarget: (targetId: string, targetType: string) => Promise<void>;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
}

const demoComments: Comment[] = [
  {
    id: 'c1',
    targetId: '1',
    targetType: 'hotel',
    userId: 'u1',
    userName: 'Maria Garcia',
    userAvatar: 'https://i.pravatar.cc/150?u=maria',
    rating: 5,
    content: 'Excelente hotel! El servicio es impecable y las vistas desde la habitacion son espectaculares. Definitivamente volvere en mi proximo viaje.',
    likes: 12,
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-11-15'),
  },
  {
    id: 'c2',
    targetId: '1',
    targetType: 'hotel',
    userId: 'u2',
    userName: 'Juan Perez',
    userAvatar: 'https://i.pravatar.cc/150?u=juan',
    rating: 4,
    content: 'Muy buena ubicacion y habitaciones comodas. El desayuno buffet es variado y delicioso. Solo le doy 4 estrellas porque el estacionamiento es un poco pequeno.',
    likes: 8,
    createdAt: new Date('2024-11-10'),
    updatedAt: new Date('2024-11-10'),
  },
  {
    id: 'c3',
    targetId: '101',
    targetType: 'room',
    userId: 'u3',
    userName: 'Ana Lopez',
    userAvatar: 'https://i.pravatar.cc/150?u=ana',
    rating: 5,
    content: 'La Suite Presidencial es increible! El jacuzzi con vista a la ciudad fue lo mejor de nuestra luna de miel. Altamente recomendada.',
    likes: 15,
    createdAt: new Date('2024-11-20'),
    updatedAt: new Date('2024-11-20'),
  },
  {
    id: 'c4',
    targetId: '2',
    targetType: 'hotel',
    userId: 'u4',
    userName: 'Pedro Sanchez',
    userAvatar: 'https://i.pravatar.cc/150?u=pedro',
    rating: 5,
    content: 'El Resort Los Tajibos es un paraiso! Los jardines son hermosos, la piscina es enorme y el personal super amable. Perfecto para descansar.',
    likes: 20,
    createdAt: new Date('2024-11-18'),
    updatedAt: new Date('2024-11-18'),
  },
  {
    id: 'c5',
    targetId: '1',
    targetType: 'hotel',
    userId: 'u5',
    userName: 'Laura Martinez',
    userAvatar: 'https://i.pravatar.cc/150?u=laura',
    rating: 3,
    content: 'El hotel es bonito pero el precio es un poco elevado para lo que ofrece. La habitacion estaba limpia pero el aire acondicionado hacia ruido.',
    likes: 3,
    createdAt: new Date('2024-11-05'),
    updatedAt: new Date('2024-11-05'),
  },
];

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  isLoading: false,
  error: null,

  setComments: (comments) => set({ comments }),

  fetchCommentsByTarget: async (targetId, targetType) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const filtered = demoComments.filter(
        (c) => c.targetId === targetId && c.targetType === targetType
      );
      set({ comments: filtered, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addComment: async (commentData) => {
    set({ isLoading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newComment: Comment = {
        ...commentData,
        id: `c${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => ({
        comments: [newComment, ...state.comments],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  likeComment: async (commentId) => {
    set((state) => ({
      comments: state.comments.map((c) =>
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      ),
    }));
  },
}));
