module.exports = {
    token: '',
    start_folder_id: '01YJ3ACIZQXCIMALPBSZE2WGN4NTYZNCP7',
    configuration: {
        config: [
            { level: 0, type: "client" },
            { level: 1, type: "group" },
            { level: 2, type: "cabinet" }
        ]
    },
    AWS_ACCESS_KEY_ID: 'AWS_ACCESS_KEY',
    AWS_SECRET_ACCESS_KEY: 'AWS_SECRET_KEY',
    AWS_S3_REGION: 'us-east-1',//the region where the s3 bucket is located
    Bucket: '',//s3 bucket name
    S3_UPLOAD_PREFIX: 'docs/', //adds this string right before uploading to s3 (in case you want to upload to somewhere other than the root),
    CONCURRENT_FILE_TRANSFERS: 3 //number of simultaneous download/upload of files to s3 from one drive

}