export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  tags: string[];
  deadline?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  assignedToId?: string | null;
  projectId: string;
  createdBy?: User;
  assignedTo?: User | null;
}

export interface List {
  id: string;
  title: string;
  cards: Task[];
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  createdBy?: User;
  tasks: Task[];
  lists?: List[]; // We'll organize tasks into lists in the frontend
}

export interface DroppableListProps {
  list: {
    id: string;
    title: string;
    cards: Task[];
  };
  onCardDrop: (
    cardId: string,
    sourceStatus: string,
    targetStatus: string,
  ) => void;
  onAddCardClick: (listId: string) => void;
  activeAddCardList: string | null;
  newCardTitle: string;
  setNewCardTitle: (title: string) => void;
  newCardDescription: string;
  setNewCardDescription: (description: string) => void;
  submitNewCard: (listId: string) => void;
  cancelNewCard: () => void;
  loadingListIds: Record<string, boolean>;
  onTaskUpdate: (() => void) | null;
}

export interface SignupErrorResponse {
  message?: string;
}
