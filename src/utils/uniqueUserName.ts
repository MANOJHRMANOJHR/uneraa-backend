import prisma from '../lib/prisma.js';

export const getUniqueUserName = async (email: string) => {
  const baseName = email.split('@')[0];
  let uniqueName = baseName;
  let counter = 1;

  while (true) {
    const existingUser = await prisma.user.findFirst({
      where: {
        name: uniqueName,
      },
    });

    if (!existingUser) {
      return uniqueName;
    }

    uniqueName = `${baseName}${counter}`;
    counter++;
  }
};
