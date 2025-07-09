import { Queue, Worker } from 'bullmq';
import prisma from '../../lib/prisma';
import emitter from '../emitter';
import redis from '../redis';
const connection = redis();
export const postQueue = new Queue('postQueue', { connection });
// Worker to process scheduled posts
new Worker('postQueue', async (job) => {
    const { postId } = job.data;
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post && !post.published) {
        await prisma.post.update({
            where: { id: postId },
            data: {
                published: true,
                publishedAt: new Date(),
            },
        });
        console.log(`Scheduled post published: ${post.title}`);
        // Emit event to notify followers
        emitter.emit('PostPublished', post);
    }
}, { connection });
