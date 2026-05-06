import { create } from 'zustand';
import type { SupportTicket, CreateSupportTicketDto } from '@/domain/entities/SupportTicket';
import { getContainer } from '@/core/di/Container';

interface SupportTicketState {
  tickets: SupportTicket[];
  currentTicket: SupportTicket | null;
  isLoading: boolean;
  error: string | null;

  setTickets: (tickets: SupportTicket[]) => void;
  setCurrentTicket: (ticket: SupportTicket | null) => void;
  setError: (error: string | null) => void;
  fetchTicketsByUser: (userId: string) => Promise<void>;
  createTicket: (userId: string, dto: CreateSupportTicketDto) => Promise<void>;
  fetchTicketById: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useSupportTicketStore = create<SupportTicketState>((set) => ({
  tickets: [],
  currentTicket: null,
  isLoading: false,
  error: null,

  setTickets: (tickets) => set({ tickets }),
  setCurrentTicket: (ticket) => set({ currentTicket: ticket }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  fetchTicketsByUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { getTicketsByUser } = getContainer();
      const tickets = await getTicketsByUser.execute(userId);
      set({ tickets, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createTicket: async (userId, dto) => {
    set({ isLoading: true, error: null });
    try {
      const { createSupportTicket } = getContainer();
      await createSupportTicket.execute(userId, dto);
      set({ isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  fetchTicketById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { getTicketById } = getContainer();
      const ticket = await getTicketById.execute(id);
      set({ currentTicket: ticket, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
