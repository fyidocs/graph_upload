const options = require('./options');
const GraphHelper = require('./lib/graph.helper');




async function start() {
    //computes simple tree structure
    let treeStructure = await GraphHelper.getTreeFormatById(options.start_folder_id);

    //adds an isValid flag for each folder in the tree structure
    let validatedTreeStructure = await GraphHelper.validateTree(treeStructure);

    //uploads files of valid folders
    let uploadedFiles = await GraphHelper.uploadValidFolders(validatedTreeStructure);
    return uploadedFiles;



}


start().then(uploadedFiles => {
    console.log(uploadedFiles);
    console.log('All done :) ')

}).catch(err => {
    console.error(err);
    process.exit(1);
})



