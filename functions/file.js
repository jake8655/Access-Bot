//#region Imports
//* NPM packages
import fsp from 'fs/promises';
//#endregion

export default async function editFile(type, data) {
   let file = await fsp.readFile('data/dontchange.json');
   let obj = JSON.parse(file);

   if(type === 'message') obj.messageID = data;
   else if(type === 'server') obj.serverID = data;
   else if(type === 'status') obj.status = data;
   else return;

   await fsp.writeFile('data/dontchange.json', JSON.stringify(obj));
}