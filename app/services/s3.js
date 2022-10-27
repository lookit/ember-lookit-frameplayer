import { CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, S3Client } from "@aws-sdk/client-s3";
import Ember from 'ember';

class S3 {
    constructor(key) {
        this.env = Ember.getOwner(this).resolveRegistration('config:environment').s3;
        this.key = key;
        this.blobParts = [];
        this.promises = [];
        this.partNumber = 1;
        this.client = new S3Client({
            region: this.env.region,
            credentials: {
                accessKeyId: this.env.accesskeyId,
                secretAccessKey: this.env.secretAccessKey
            }
        });
    }
    get blobPartsSize() {
        return this.blobParts.reduce((p, c) => {
            return p + c.size;
        }, 0);
    }
    async createUpload() {
        const createInput = {
            Bucket: this.env.BUCKET,
            Key: this.key,
            ContentType: "video/webm",
        };
        const create = new CreateMultipartUploadCommand(createInput);
        const createResponse = await this.client.send(create);
        this.uploadId = createResponse.UploadId;
    }
    async uploadPart(blob, partNumber) {
        let retry = 0;
        let err;
        while (retry < 3) {
            try {
                const uploadInput = {
                    Bucket: this.env.BUCKET,
                    Key: this.key,
                    UploadId: this.uploadId,
                    PartNumber: partNumber,
                    Body: blob,
                };
                const upload = new UploadPartCommand(uploadInput);
                // upload file
                const uploadPartResponse = await this.client.send(upload);
                return {
                    PartNumber: partNumber,
                    ETag: uploadPartResponse.ETag
                };
            }
            catch (_err) {
                err = _err;
                retry += 1;
            }
        }
        throw Error(`Upload part failed after 3 attempts. \n${err}`);
    }
    async completeUpload() {
        this.addUploadPartPromise();
        this.parts = await Promise.all(this.promises);
        const completeInput = {
            Bucket: this.env.BUCKET,
            Key: this.key,
            UploadId: this.uploadId,
            MultipartUpload: { Parts: this.parts },
        };
        const complete = new CompleteMultipartUploadCommand(completeInput);
        return await this.client.send(complete);
    }
    addUploadPartPromise() {
        this.promises.push(this.uploadPart(new Blob(this.blobParts), this.partNumber++));
        this.blobParts = [];
    }
    onDataAvailable(blob) {
        this.blobParts.push(blob);
        if (this.blobPartsSize > 5 * (1024 * 1024)) {
            this.addUploadPartPromise();
        }
    }
}

export default S3;
