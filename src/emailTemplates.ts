export const userEmailTemplates = {
  signup: (username: string) => `
  <div style="font-family: Arial, sans-serif; color:#333; line-height:1.5;">
    <h2 style="color:#4CAF50;">🎉 Welcome, ${username}!</h2>
    <p>We’re thrilled to have you onboard. Your journey with us starts now, and there’s so much to explore! 🚀</p>
    <p>Here’s what you can do next:</p>
    <ul>
      <li>Complete your profile and stand out ✨</li>
      <li>Discover amazing features tailored for you 💡</li>
      <li>Connect with friends and share your journey 🤝</li>
    </ul>
    <p>We’re excited to have you join our community!</p>
  </div>
  `,

  login: (username: string) => `
  <div style="font-family: Arial, sans-serif; color:#333; line-height:1.5;">
    <h2 style="color:#2196F3;">👋 Welcome back, ${username}!</h2>
    <p>It’s great to see you again. We noticed you just logged in — hope you’re ready for another amazing session!</p>
    <p>Check out what’s new since your last visit:</p>
    <ul>
      <li>New features and updates 🛠️</li>
      <li>Messages from friends 💌</li>
      <li>Recent achievements and rewards 🏆</li>
    </ul>
    <p>Let’s make today productive and fun! 😎</p>
  </div>
  `,

  onboard: (username: string) => `
  <div style="font-family: Arial, sans-serif; color:#333; line-height:1.5;">
    <h2 style="color:#FF9800;">🚀 Get Started, ${username}!</h2>
    <p>You’re all set! Let’s get you onboarded and fully ready to explore everything our platform has to offer.</p>
    <p>Tips to get started:</p>
    <ul>
      <li>Complete your profile 📝</li>
      <li>Join communities and find like-minded friends 🌐</li>
      <li>Start sharing and earning XP points 🎯</li>
    </ul>
    <p>We’re here to make your experience unforgettable. Enjoy your adventure! 🌟</p>
  </div>
  `,

  deleteAccount: (username: string) => `
  <div style="font-family: Arial, sans-serif; color:#333; line-height:1.5;">
    <h2 style="color:#F44336;">⚠️ Account Deletion Notice, ${username}</h2>
    <p>We’re sad to see you go. Your account has been successfully deleted, and all your data has been removed from our servers.</p>
    <p>If this was a mistake or you wish to return, you can always sign up again and continue your journey with us!</p>
    <p>Thank you for being part of our community. 💔</p>
  </div>
  `,

  message: (fromUser: string, toUser: string, messageText: string) => `
  <div style="font-family: Arial, sans-serif; color:#333; line-height:1.5;">
    <h2 style="color:#9C27B0;">📩 New Message from ${fromUser}</h2>
    <p>Hello ${toUser},</p>
    <p>You just received a new message from ${fromUser}:</p>
    <blockquote style="border-left:3px solid #9C27B0; padding-left:10px; color:#555;">${messageText}</blockquote>
    <p>Don’t miss out — reply and keep the conversation going! 💬</p>
  </div>
  `,

  earnXP: (username: string, xp: number) => `
  <div style="font-family: Arial, sans-serif; color:#333; line-height:1.5;">
    <h2 style="color:#FFEB3B;">🏆 Congratulations, ${username}!</h2>
    <p>You just earned <strong>${xp} XP</strong> points! Keep engaging and achieving more milestones.</p>
    <p>Ways to earn more XP:</p>
    <ul>
      <li>Complete challenges and tasks 📌</li>
      <li>Interact with the community 🤝</li>
      <li>Share your knowledge and achievements ✨</li>
    </ul>
    <p>Keep climbing the leaderboard and enjoy your rewards! 🚀</p>
  </div>
  `,

  joinWaitlist: (username: string) => `
  <div style="font-family: Arial, sans-serif; color:#333; line-height:1.5;">
    <h2 style="color:#00BCD4;">⏳ You’re on the Waitlist, ${username}!</h2>
    <p>Thank you for joining the waitlist. We’ll notify you as soon as your access is available.</p>
    <p>While you wait, you can:</p>
    <ul>
      <li>Invite friends and earn bonus perks 🎁</li>
      <li>Explore community updates 🌟</li>
      <li>Prepare your profile for a smooth onboarding 🚀</li>
    </ul>
    <p>Exciting things are coming — stay tuned! 🔔</p>
  </div>
  `,

  welcome: (username: string) => `
  <div style="font-family: Arial, sans-serif; color:#333; line-height:1.5;">
    <h2 style="color:#4CAF50;">🎉 Welcome Aboard, ${username}!</h2>
    <p>We’re thrilled to have you as part of our vibrant community. Explore, connect, and enjoy all the features we’ve built just for you.</p>
    <p>Here’s a quick guide to get started:</p>
    <ul>
      <li>Customize your profile 🖌️</li>
      <li>Connect with friends and peers 🤝</li>
      <li>Start earning XP and rewards 🏆</li>
    </ul>
    <p>We’re excited to see you shine! 🌟</p>
  </div>
  `,

  receiveFriendRequest: (fromUser: string, toUser: string) => `
  <div style="font-family: Arial, sans-serif; color:#333; line-height:1.5;">
    <h2 style="color:#FF5722;">👫 New Friend Request!</h2>
    <p>Hello ${toUser},</p>
    <p>${fromUser} has sent you a friend request. Connect and start collaborating today! 🤝</p>
    <p>Don’t wait — grow your network and expand your community. 🌐</p>
  </div>
  `,

  sendFriendRequest: (fromUser: string, toUser: string) => `
  <div style="font-family: Arial, sans-serif; color:#333; line-height:1.5;">
    <h2 style="color:#FF9800;">📨 Friend Request Sent</h2>
    <p>Hello ${fromUser},</p>
    <p>Your friend request has been successfully sent to ${toUser}. Let’s see if they accept and connect! 🌟</p>
  </div>
  `,

  userFollow: (follower: string, following: string) => `
  <div style="font-family: Arial, sans-serif; color:#333; line-height:1.5;">
    <h2 style="color:#3F51B5;">👤 New Follow Alert</h2>
    <p>${follower} is now following ${following}. Check out their profile and connect! 🌐</p>
  </div>
  `,

  followedBy: (username: string, follower: string) => `
  <div style="font-family: Arial, sans-serif; color:#333; line-height:1.5;">
    <h2 style="color:#009688;">🎉 You’ve Got a New Follower!</h2>
    <p>Hi ${username},</p>
    <p>${follower} has started following you. Engage with them and grow your community! 🚀</p>
  </div>
  `,
};
