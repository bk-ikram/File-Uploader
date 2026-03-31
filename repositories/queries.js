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

async function getFolderContents(folderid){
    const getchildFolders = () => prisma.folder.findMany({
        where: {
            parentId: folderid
        }
    })

    const getFiles = () => prisma.file.findMany({
        where: {
            folderid: folderid
        }
    })

    const [folders, files] = await Promise.all([getchildFolders(), getFiles()]);
    return { folders, files };
}

async function getUserMainFolder(userId){
    //chose to search in user table because there are fewer users than folders.
    const user =  await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            mainFolder: true
        }
    })

    return user.mainFolder;
}

module.exports ={
    insertUser,
    getUserById,
    getUserByUsername,
    getFolderContents,
    getUserMainFolder
}