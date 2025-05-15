const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient();
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

const connectWithRetry = async (retries = MAX_RETRIES) => {
  try {
    await prisma.$connect();
    logger.info('Database connection established');
    return prisma;
  } catch (error) {
    if (retries > 0) {
      logger.warn(`Database connection failed, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectWithRetry(retries - 1);
    }
    logger.error('Database connection failed after all retries');
    throw error;
  }
};

module.exports = { prisma, connectWithRetry };