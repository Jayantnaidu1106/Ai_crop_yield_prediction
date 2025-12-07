import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import StudyRoom from '../models/studyroom.model.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function cleanupDuplicateParticipants() {
  try {
    console.log('Starting duplicate participant cleanup...');
    
    const studyRooms = await StudyRoom.find({});
    console.log(`Found ${studyRooms.length} study rooms`);
    
    let totalCleaned = 0;
    
    for (const room of studyRooms) {
      const uniqueParticipants = [];
      const seenUsers = new Set();
      let duplicatesInRoom = 0;
      
      for (const participant of room.participants) {
        const userId = participant.user.toString();
        if (!seenUsers.has(userId)) {
          seenUsers.add(userId);
          uniqueParticipants.push(participant);
        } else {
          duplicatesInRoom++;
        }
      }
      
      if (duplicatesInRoom > 0) {
        console.log(`Room "${room.name}" (${room._id}): Removing ${duplicatesInRoom} duplicate(s)`);
        room.participants = uniqueParticipants;
        await room.save();
        totalCleaned += duplicatesInRoom;
      }
    }
    
    console.log(`\nCleanup complete! Removed ${totalCleaned} duplicate participants across all rooms.`);
    process.exit(0);
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
}

cleanupDuplicateParticipants();
