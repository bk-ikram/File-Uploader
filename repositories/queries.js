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

async function getchildFolders(folderid) {
    prisma.folder.findMany({
        where: {
            parentId: folderid
        }
    })
} 

async function getFiles(folderid) {
    prisma.file.findMany({
        where: {
            folderid: folderid
        }
    })
}

async function getFolderContents(folderid){

    const [folders, files] = await Promise.all([getchildFolders(folderid), getFiles(folderid)]);
    return { folders, files };
}

/*
async function getFolderbyId(folder){
    return prisma.folder.findUnique({
        where: {
            id: folder
        }
    })
}
    */

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

async function createFolder(folderid, userid, name){
    return prisma.folder.create({
        data: {
            name: name,
            parentId: folderid,
            userId: userid,
        }
    })

}


module.exports ={
    insertUser,
    getUserById,
    getUserByUsername,
    getFolderContents,
    getUserMainFolder,
    getFiles,
    getchildFolders,
    createFolder
}