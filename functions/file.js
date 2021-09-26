//#region Imports
//* NPM packages
const fsp = require('fs').promises;
//#endregion

async function editFileID(id) {
    try {
        let data = await fsp.readFile('data/dontchange.json');
        let obj = JSON.parse(data);

        obj.messageID = id;

        await fsp.writeFile('data/dontchange.json', JSON.stringify(obj));
     } catch(e) {
        console.log(e);
        throw e;
     }
}

async function editFileServer(id) {
    try {
        let data = await fsp.readFile('data/dontchange.json');
        let obj = JSON.parse(data);

        obj.serverID = id;

        await fsp.writeFile('data/dontchange.json', JSON.stringify(obj));
     } catch(e) {
        console.log(e);
        throw e;
     }
}

async function editFileStatus(status) {
   try {
       let data = await fsp.readFile('data/dontchange.json');
       let obj = JSON.parse(data);

       obj.status = status;

       await fsp.writeFile('data/dontchange.json', JSON.stringify(obj));
    } catch(e) {
       console.log(e);
       throw e;
    }
}

//#region Exports
module.exports = { editFileID, editFileServer, editFileStatus };
//#endregion