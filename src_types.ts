export type User = {
  id: string;
  name: string;
  avatarColor?: string;
  isCurrent?: boolean;
};

export type Comment = {
  id: string;
  user: User;
  text: string;
  createdAt: string; // ISO
  likes: number;
  likedByMe?: boolean;
  replies?: Comment[]; // replies anidadas
  pendingModeration?: boolean;
  isEditing?: boolean;
};