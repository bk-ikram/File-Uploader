const { prisma } = require("../lib/prisma") ;

async function insertUser(username, firstname, lastname,hashedPassword){
    return prisma.$transaction(async (tx)=> {
        // 1. Create the user first
        const user = await tx.user.create({
        data: {
            userName: username,
            firstName: firstname,
            lastName: lastname,
            hash: hashedPassword,
        }
    });
        // 2. Create the main folder linked to the user
        const mainFolder = await tx.folder.create({
            data:{
                name: username,
                userId: user.id,
            }
        });

        // 3. Update the user with the mainFolderId
        return tx.user.update({
            where: { id: user.id },
            data: { mainFolderId: mainFolder.id }
        });
    });
}

async function getUserById(userId){
    return prisma.user.findUnique({
        where: {
            id : userId
        }
    })
}

async function getUserByUsername(username){
    return prisma.user.findUnique({
        where: {
            userName: username
        }
    })
}

module.exports ={
    insertUser,
    getUserById,
    getUserByUsername
}