"use strict";
// import { Queue, Worker } from 'bullmq';
// import prisma from '../../lib/prisma.js';
// import emitter from '../emitter.js';
// import redis from '../redis.js';
// const connection = redis();
// export const postQueue = new Queue('postQueue', { connection });
// if (process.env.ENABLE_WORKERS === 'true') {
// const worker = new Worker(
//   'postQueue',
//   async job => {
//     try {
//       const { postId } = job.data;
//       const post = await prisma.post.findUnique({ where: { id: postId } });
//       if (post && !post.published) {
//         await prisma.post.update({
//           where: { id: postId },
//           data: {
//             published: true,
//             publishedAt: new Date(),
//           },
//         });
//         console.log(`✅ Scheduled post published: ${post.title}`);
//         emitter.emit('PostPublished', post);
//       }
//     } catch (err) {
//       // ✅ Handle Upstash limit exceeded error
//       if (
//         err?.toString()?.includes('ERR max requests limit exceeded')
//       ) {
//         console.error('🛑 Upstash Redis request limit exceeded. Pausing worker...');
//         await worker.pause(); // 🔴 Automatically pause worker
//         return;
//       }
//       console.error('❌ Job failed:', err);
//     }
//   },
//   {
//     connection,
//     limiter: {
//       max: 1,         // 🔄 1 job
//       duration: 60000 // ⏱️ per 1 min
//     },
//   }
// );
// }
