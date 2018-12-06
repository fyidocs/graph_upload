const options = require('./options');
const GraphHelper = require('./lib/graph.helper');




async function start() {
    let treeStructure = await GraphHelper.getTreeFormatById(options.start_folder_id);
   
    let uploadedFiles = await GraphHelper.uploadValidFolders(treeStructure);
    return uploadedFiles;



}


start().then(uploadedFiles => {
    console.log(uploadedFiles);
    console.log('All done :) ')

}).catch(err => {
    console.error(err);
    process.exit(1);
})



