const Options = require('../options');
const MsGraphHelper = require('./ms-graph.helper');
const CheckFunctions = require('./check-functions');
const stream = require('stream');
const S3Helper = require('./s3.helper');
let _levelMappings = null;

const CONCURRENT_UPLOAD_LIMIT = Options.CONCURRENT_FILE_TRANSFERS;

/**
 * @module GraphHelper
 * @typedef {{id: string, name: string, size: number}} module:GraphHelper.foo
 * @typedef {{id: string, name: string, size: number}} MsFile
 * @typedef {{id: string, name: string, folders: MsFolder[], files: MsFile[], isValid?: boolean}} MsFolder
 */

function getLevelMappings() {
    if (_levelMappings) {
        return _levelMappings;
    }
    _levelMappings = {};

    for (let levelConfig of Options.configuration.config) {

        if (_levelMappings[levelConfig.level]) {
            throw new Error(`duplicate level ${levelConfig.level} in configuration`);
        }
        _levelMappings[levelConfig.level] = levelConfig.type
    }
    return _levelMappings;
}
/**
 * @param  {MsFolder|MsFile} fileOrFolder
 * @returns {boolean}
 */
function isMsGraphFolder(fileOrFolder) {
    return !!fileOrFolder.folder;
}
/**
 * @async
 * @param {Object} root MS Graph OneDrive Item Object
 * @returns {MsFolder|MsFile}
 */
async function getTreeFormat(root) {
    if (!isMsGraphFolder(root)) {
        // debugger;//To check
        return {
            id: root.id,
            name: root.name,
            size: root.size,
        };
    }


    let formattedRootItem = {
        id: root.id,
        name: root.name,
        files: [],
        folders: [],
    };



    let childItems = await MsGraphHelper.getSubItemsById(root.id);

    for (let item of childItems) {
        let formattedItem = await getTreeFormat(item);


        if (isMsGraphFolder(item)) {
            formattedRootItem.folders.push(formattedItem);
        }
        else {
            formattedRootItem.files.push(formattedItem);

        }
    }
    return formattedRootItem;
}
/**
 * @param  {string} rootId
 * @returns {MsFolder[]}
 */
module.exports.getTreeFormatById = async function (rootId) {

    let root = await MsGraphHelper.getItemById(rootId);
    let treeStructure = await getTreeFormat(root);
    if (!treeStructure) {
        return null;
    }
    return treeStructure.folders;
}




module.exports.validateTree = async function (rootFolders, level = 0, doClone = true) {

    if (doClone) {
        rootFolders = JSON.parse(JSON.stringify(rootFolders));
    }
    if (!rootFolders.length) {
        return rootFolders;
    }

    let nameFunction = getFunctionByLevel(level);
    for (let folder of rootFolders) {
        let computedName = await nameFunction(folder.name).catch(X => undefined);
        if (!computedName) {
            folder.isValid = false;
            continue;
        }
        folder.isValid = true;
        await module.exports.validateTree(folder.folders, level + 1, false);
    }
    return rootFolders;
}

/**
 * Uploads files of valid folders to S3
 * @async
 * @param  {MsFolder[]} folders
 * @returns {Promise<MsFile[]>} List of folders which were valid and uploaded
 */
module.exports.uploadValidFolders = async function (folders) {
    let validFolders = getValidFolders(folders);
    let validFiles = getFilesOfFolders(validFolders);
    await uploadOnedriveFilesToS3(validFiles);

    return validFiles;

}


function getFunctionByLevel(level) {
    let levelType = getLevelMappings()[level];
    if (typeof levelType === 'undefined') {
        throw new Error('Invalid level: ' + level)
    }
    switch (levelType) {
        case 'client':
            return CheckFunctions.getClient;
        case 'group':
            return CheckFunctions.getGroup;
        case 'cabinet':
            return CheckFunctions.getCabinet;
        default:
            throw new Error("Invalid level type " + levelType)

    }
}

/**
 * @param  {MsFolder[]} folders
 * @returns {MsFile[]}
 */
function getFilesOfFolders(folders) {
    let allFiles = [];

    folders.forEach(folder => {
        allFiles = allFiles.concat(folder.files);
    })
    return allFiles;
}
/**
 * Trivial function. Just loop and upload the files of this folder to S3
 * @async
 * @param  {MsFolder} folder
 * @returns {Promise<null>}
 */
async function uploadAllFilesOfFolders(folders) {


    //Depending on how many files are expected, we can group them together in a single upload,
    //or move this task to some kind of queue so that the server isn't overloaded
    let files = await getFilesOfFolders(folders);//trivial function. Does what the function name suggests
    await uploadOnedriveFilesToS3(files);//trivial function. Does what the function name suggests
    return null;
}


/**
 * Recursively checks the folders returned to see if they 
 * @param  {MsFolder[]} folders array of MsGraph folder structure
 * @param  {number} level the current level of recursive iteration
 * @returns {MsFolder[]} array of valid folders whos files need to be uploaded
 */
function getValidFolders(folders, foldersToUpload = []) {

    if (!folders.length) {
        return foldersToUpload;
    }


    for (let folder of folders) {
        if (!folder.isValid) {
            continue;
        }

        //alternatively, we could simply do the upload here. Depends on the use case of the application which approach is better
        foldersToUpload.push(folder);

        getValidFolders(folder.folders, foldersToUpload)


    }
    return foldersToUpload;
}
/**
 * @async
 * @param {MsFile[]} files
 */
async function uploadOnedriveFilesToS3(files) {

    let allPromises = [];
    let currentUploads = 0;

    for (let file of files) {

        let promise = S3Helper.uploadDriveFileToS3(file).catch(err => file.error = err);
        allPromises.push(promise);
        currentUploads++;

        if (currentUploads >= CONCURRENT_UPLOAD_LIMIT) {
            await Promise.all(allPromises);
            allPromises = [];
            currentUploads = 0;
        }
    }

    await Promise.all(allPromises)
    return null;
}

