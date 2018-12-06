const stream = require('stream');
const aws = require('aws-sdk');
const Options = require('../options');
const MsGraphHelper = require('./ms-graph.helper');
let _s3Instance = null;

function getS3() {

    if (_s3Instance) {
        return _s3Instance;
    }
    let awsConfig = new aws.Config({
        region: Options.AWS_S3_REGION,
        accessKeyId: Options.AWS_ACCESS_KEY_ID,
        secretAccessKey: Options.AWS_SECRET_ACCESS_KEY
    })
    _s3Instance = new aws.S3(awsConfig);
    return _s3Instance;
}

module.exports.getWriteStreamForUpload = function (fileKey, callback) {
    const pass = new stream.PassThrough();

    let promiseObject = {
        object: null,
        resolve: null,
        reject: null
    }
    promiseObject.object = new Promise((resolve, reject) => {
        promiseObject.resolve = resolve;
        promiseObject.reject = reject;

        var params = {
            Bucket: Options.Bucket,
            Key: Options.S3_UPLOAD_PREFIX + fileKey,
            Body: pass
        }
        getS3().upload(params, function (err) {
            if (err) {
                reject(err);
                pass.destroy(err);
                return;
            }
            resolve();

        });
    });




    return {
        writeStream: pass,
        promise: promiseObject
    };

}



/**
 * @param  {MsFile} file
 * @returns {Promise<MsFile>}
 */
module.exports.uploadDriveFileToS3 = async function (file) {

    return new Promise((resolve, reject) => {

        let s3UploadObject = module.exports.getWriteStreamForUpload(file.name);
        let writeStream = s3UploadObject.writeStream;
        let readStream = MsGraphHelper.pipeFileToStream(file.id, writeStream);

        s3UploadObject.promise.object.then(v => {
            resolve();
        }).catch(err => {
            writeStream.destroy(err);
            readStream.destroy(err);

            reject(err);
        })



        readStream.once('error', err => {
            s3UploadObject.promise.reject(err);
        });

    })
}



