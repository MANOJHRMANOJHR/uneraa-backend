//import { userEmailTemplates } from "./emailTemplates";
//import { sendEmail } from "./emailconfig";

// 1️⃣ Configure the email transporter

// 3️⃣ Demo function to send all types of emails
/*
async function sendAllDemoEmails() {
  const clientEmail = "client@example.com"; // Replace with actual email
  const username = "Manoj";

  await sendEmail(clientEmail, "Welcome to Team Connect!", userEmailTemplates.signup(username));
  await sendEmail(clientEmail, "Login Alert", userEmailTemplates.login(username));
  await sendEmail(clientEmail, "Onboarding Started", userEmailTemplates.onboard(username));
  await sendEmail(clientEmail, "Account Deleted", userEmailTemplates.deleteAccount(username));
  await sendEmail(clientEmail, "New Message Received", userEmailTemplates.message("Alice", username, "Hey! Let's connect." ));
  await sendEmail(clientEmail, "XP Earned!", userEmailTemplates.earnXP(username, 150));
  await sendEmail(clientEmail, "Waitlist Confirmation", userEmailTemplates.joinWaitlist(username));
  await sendEmail(clientEmail, "Welcome Aboard!", userEmailTemplates.welcome(username));
  await sendEmail(clientEmail, "Friend Request Received", userEmailTemplates.receiveFriendRequest("Alice", username));
  await sendEmail(clientEmail, "Friend Request Sent", userEmailTemplates.sendFriendRequest(username, "Bob"));
  await sendEmail(clientEmail, "New Follower Alert", userEmailTemplates.userFollow("Charlie", username));
  await sendEmail(clientEmail, "Followed By Someone", userEmailTemplates.followedBy(username, "David"));
}

/ 4️⃣ Run the demo
sendAllDemoEmails()
  .then(() => console.log("All demo emails sent!"))
  .catch(err => console.error(err));*/
