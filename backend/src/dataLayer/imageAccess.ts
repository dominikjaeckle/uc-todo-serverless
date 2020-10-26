import * as AWS from 'aws-sdk'

const s3Bucket = process.env.S3_BUCKET;
const expiration = Number(process.env.SIGNED_URL_EXPIRATION);

import { createLogger } from '../utils/logger'

const logger = createLogger('createTodo')

export class ImageAccess {

    private s3Client;

    constructor() {
        this.s3Client = new AWS.S3({ 'signatureVersion': 'v4' });
    }

    getSignedImgUploadUrl(todoId: string): string {
        logger.info('dataLayer: Requesting signed url from s3 client for todo item:', todoId);
        return this.s3Client.getSignedUrl('putObject', {
            Bucket: s3Bucket,
            Key: todoId,
            Expires: expiration
        });
    }
}