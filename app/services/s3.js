import ENV from '../config/environment';

class S3 {
    constructor(key) {
        this.env = ENV.s3;
        this.key = key;
        this.blobParts = [];
        this.promises = [];
        this.partNumber = 1;
        // eslint-disable-next-line no-undef
        this.s3 = new AWS.S3({
            credentials: {
                accessKeyId: this.env.accessKeyId,
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
        const createResponse = await this.s3.createMultipartUpload({
            Bucket: this.env.bucket,
            Key: this.key,
            ContentType: "video/mp4",
        }).promise();
        this.uploadId = createResponse.UploadId;
    }

    async uploadPart(blob, partNumber) {
        let retry = 0;
        let err;
        while (retry < 3) {
            try {
                const uploadPartResponse = await this.s3.uploadPart({
                    Body: blob,
                    Bucket: this.env.bucket,
                    Key: this.key,
                    PartNumber: partNumber,
                    UploadId: this.uploadId,
                }).promise();

                return {
                    PartNumber: partNumber,
                    ETag: uploadPartResponse.ETag
                };
            } catch (_err) {
                err = _err;
                retry += 1;
            }
        }
        throw Error(`Upload part failed after 3 attempts. \n${err}`);
    }

    async completeUpload() {
        this.addUploadPartPromise();
        this.parts = await Promise.all(this.promises);

        return this.s3.completeMultipartUpload({
            Bucket: this.env.bucket,
            Key: this.key,
            MultipartUpload: {
                Parts: this.parts
            },
            UploadId: this.uploadId
        }).promise();
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
