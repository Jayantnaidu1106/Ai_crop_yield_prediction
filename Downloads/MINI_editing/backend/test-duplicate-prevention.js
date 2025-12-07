import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import StudyRoom from './models/studyroom.model.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function testDuplicatePrevention() {
  try {
    console.log('\n=== Testing Duplicate Prevention ===\n');
    
    // Get a test room
    const rooms = await StudyRoom.find({});
    if (rooms.length === 0) {
      console.log('No study rooms found to test');
      process.exit(0);
    }
    
    const testRoom = rooms[0];
    console.log(`Testing with room: "${testRoom.name}" (${testRoom._id})`);
    console.log(`Current participants: ${testRoom.participants.length}`);
    
    const beforeCount = testRoom.participants.length;
    
    // Try to add the same user multiple times (simulating race condition)
    const testUserId = testRoom.participants[0]?.user;
    if (!testUserId) {
      console.log('No participants to test with');
      process.exit(0);
    }
    
    console.log(`\nAttempting to add user ${testUserId} three times simultaneously...`);
    
    // Simulate 3 concurrent join requests
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(
        StudyRoom.findByIdAndUpdate(
          testRoom._id,
          {
            $addToSet: {
              participants: {
                user: testUserId,
                joinedAt: new Date()
              }
            }
          },
          { new: true }
        )
      );
    }
    
    await Promise.all(promises);
    
    // Check result
    const updatedRoom = await StudyRoom.findById(testRoom._id);
    const afterCount = updatedRoom.participants.length;
    
    console.log(`\nResults:`);
    console.log(`- Participants before: ${beforeCount}`);
    console.log(`- Participants after: ${afterCount}`);
    console.log(`- Duplicates prevented: ${beforeCount === afterCount ? 'YES ✅' : 'NO ❌'}`);
    
    // Count unique users
    const uniqueUsers = new Set();
    for (const p of updatedRoom.participants) {
      uniqueUsers.add(p.user.toString());
    }
    
    console.log(`- Total participants: ${updatedRoom.participants.length}`);
    console.log(`- Unique users: ${uniqueUsers.size}`);
    console.log(`- Has duplicates: ${updatedRoom.participants.length > uniqueUsers.size ? 'YES ❌' : 'NO ✅'}`);
    
    console.log('\n=== Test Complete ===\n');
    process.exit(0);
    
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

testDuplicatePrevention();
