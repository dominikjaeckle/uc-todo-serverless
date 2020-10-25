import * as AWS from 'aws-sdk'

const s3Bucket = process.env.S3_BUCKET;
const expiration = Number(process.env.SIGNED_URL_EXPIRATION);

export class ImageAccess {

    private s3Client;

    constructor() {
        this.s3Client = new AWS.S3({ 'signatureVersion': 'v4' });
    }

    getSignedImgUploadUrl(todoId: string): string {
        return this.s3Client.getSignedUrl('putObject', {
            Bucket: s3Bucket,
            Key: todoId,
            Expires: expiration
        });
    }
}