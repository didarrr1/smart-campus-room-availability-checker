import type { Booking, Room } from '@/types';

export function findRoom(rooms: Room[], id: string | null): Room | undefined {
  return rooms.find((room) => room.id === id);
}

export const ROOMS: Room[] = [
  { id: 'R101', name: 'Lecture Hall A',   building: 'North Wing',  capacity: 120, equipment: ['projector', 'microphone', 'whiteboard'], blocked: false },
  { id: 'R102', name: 'Seminar Room 12',   building: 'North Wing',  capacity: 30,  equipment: ['projector', 'whiteboard'], blocked: false },
  { id: 'R201', name: 'Computer Lab 3',    building: 'South Wing',  capacity: 40,  equipment: ['computers', 'projector'], blocked: true  },
  { id: 'R202', name: 'Study Lounge B',    building: 'South Wing',  capacity: 20,  equipment: ['whiteboard'], blocked: false },
  { id: 'R305', name: 'Auditorium C',      building: 'Main Block',   capacity: 300, equipment: ['projector', 'microphone', 'video-conference'], blocked: false },
];

export const BOOKINGS: Booking[] = [
  { id: 'B001', roomId: 'R101', start: 540,  end: 600,  bookedBy: 'Prof. Chen'    }, // 09:00–10:00
  { id: 'B002', roomId: 'R101', start: 720,  end: 780,  bookedBy: 'Prof. Lin'     }, // 12:00–13:00
  { id: 'B003', roomId: 'R102', start: 600,  end: 660,  bookedBy: 'Prof. Garcia'  }, // 10:00–11:00
  { id: 'B004', roomId: 'R102', start: 840,  end: 900,  bookedBy: 'Prof. Okoye'   }, // 14:00–15:00
  { id: 'B005', roomId: 'R202', start: 480,  end: 540,  bookedBy: 'Student Council' }, // 08:00–09:00
  { id: 'B006', roomId: 'R305', start: 900,  end: 960,  bookedBy: 'Prof. Ahmed'   }, // 15:00–16:00
];

export function bookingsForRoom(roomId: string, bookings: Booking[]): Booking[] {
  return bookings.filter((b) => b.roomId === roomId);
}
