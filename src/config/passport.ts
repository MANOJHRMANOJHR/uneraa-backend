import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as DiscordStrategy } from 'passport-discord';
import prisma from '../lib/prisma.js';
import { getUniqueUserName } from '../utils/uniqueUserName.js';

// Load environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:8080';

console.log(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${CALLBACK_URL}/api/v1/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const user = await findOrCreateUser('google', profile);
        return cb(null, user);
      } catch (error) {
        return cb(error as Error);
      }
    }
  )
);

// Configure GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: `${CALLBACK_URL}/api/v1/auth/github/callback`,
      scope: ['user:email'],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      cb: (error: any, user?: any) => void
    ) => {
      try {
        const user = await findOrCreateUser('github', profile);
        return cb(null, user);
      } catch (error) {
        return cb(error as Error);
      }
    }
  )
);

// Configure Discord Strategy
passport.use(
  new DiscordStrategy(
    {
      clientID: DISCORD_CLIENT_ID,
      clientSecret: DISCORD_CLIENT_SECRET,
      callbackURL: `${CALLBACK_URL}/api/v1/auth/discord/callback`,
      scope: ['identify', 'email'],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      cb: (error: any, user?: any) => void
    ) => {
      try {
        const user = await findOrCreateUser('discord', profile);
        console.log("user in callback", user);
        return cb(null, user);
      } catch (error) {
        return cb(error as Error);
      }
    }
  )
);

// Helper function to find or create user
async function findOrCreateUser(provider: string, profile: any) {
  try {
    const email = getEmailFromProfile(provider, profile);
    const uniqueUserName = await getUniqueUserName(email);

    console.log("user's email extracted", email);
    // Check if user exists with this email
    let user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      // Create new user if not exists
      user = await prisma.user.create({
        data: {
          email,
          name: getFirstNameFromProfile(provider, profile),
          username: uniqueUserName,
          bio: '',
          profileImgUrl: getProfileImageFromProfile(provider, profile),
          coverImgUrl: '',
          [provider + 'Id']: profile.id, // Store provider-specific ID
        },
      });
    } else if (
      (provider === 'google' && !user.googleId) ||
      (provider === 'github' && !user.githubId) ||
      (provider === 'discord' && !user.discordId)
    ) {
      // If user exists but doesn't have this provider linked
      await prisma.user.update({
        where: { id: user.id },
        data: {
          [provider + 'Id']: profile.id,
        },
      });
    }
    console.log('created user ', user);
    return user;
  } catch (error) {
    console.log('error in creating or finding user', error);
  }
}

// Helper functions to extract profile data
function getEmailFromProfile(provider: string, profile: any): string {
  console.log('user profile', profile, provider);
  switch (provider) {
    case 'google':
      return profile.emails[0].value;
    case 'github':
      return profile.emails?.[0]?.value || `${profile.username}@github.com`;
    case 'discord':
      return profile.email;
    default:
      return '';
  }
}

function getFirstNameFromProfile(provider: string, profile: any): string {
  switch (provider) {
    case 'google':
      return profile.name.givenName || 'User';
    case 'github':
      return profile.displayName?.split(' ')[0] || profile.username || 'User';
    case 'discord':
      return profile.username || 'User';
    default:
      return 'User';
  }
}


function getProfileImageFromProfile(provider: string, profile: any): string {
  switch (provider) {
    case 'google':
      return profile.photos?.[0]?.value || '';
    case 'github':
      return profile.photos?.[0]?.value || '';
    case 'discord':
      return (
        `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` ||
        ''
      );
    default:
      return '';
  }
}

export default passport;
