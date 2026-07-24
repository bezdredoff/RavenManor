export type RoomUnlockRule =
  | Readonly<{ type: 'always' }>
  | Readonly<{
      type: 'room-restoration';
      roomId: string;
      completedTasks: number;
    }>;

export type RoomDefinition = Readonly<{
  id: string;
  title: string;
  description: string;
  unlock: RoomUnlockRule;
}>;
