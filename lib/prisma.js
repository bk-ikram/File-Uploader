require("dotenv").config();
const { PrismaPg } = require("@prisma/adapter-pg") ;
const { PrismaClient } = require("../generated/prisma/client.js") ;

const connectionString = `${process.env.DB_CONNECTION_STRING}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

module.exports = { prisma };