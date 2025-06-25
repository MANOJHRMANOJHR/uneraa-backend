import prisma from '../lib/prisma';
import emitter from '../utils/emitter';

emitter.on('PostPublished', async (post) => {
  const followers = await prisma.follow.findMany({
    where: { followingId: post.authorId },
    include: { follower: true }
  });

  for (const follow of followers) {
    const user = follow.follower;
    // Send notification (in-app, email, etc.)
    console.log(`🔔 Notify ${user.name} → Post by ${post.author.name} published: ${post.title}`);
    
    //  Store in notifications table
    // await prisma.notification.create({
    //   data: {
    //     userId: user.id,
    //     postId: post.id,
    //     message: `New post published by ${post.author.name}: ${post.title}`,
    //   }
    // });
  }
});
