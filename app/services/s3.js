class S3 {
    constructor(key, s3vars) {
        this.env = s3vars;
        this.key = key;
        this.blobParts = [];
        this.promises = [];
        this.partNumber = 1;
        this.partsUploaded = 0;
        this.hasStartedCompletingUpload = false;
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

    get percentUploadComplete() {
        return Math.floor((this.partsUploaded / this.partNumber) * 100);
    }

    async createUpload() {
        this.logRecordingEvent(`Creating video upload connection.`);
        const createResponse = await this.s3.createMultipartUpload({
            Bucket: this.env.bucket,
            Key: this.key,
            ContentType: "video/webm",
        }).promise()
            .catch((e) => {
                this.logRecordingEvent(`Error creating upload: ${e}`);
                throw new Error(`Error creating upload: ${e}`);
            });
        this.uploadId = createResponse.UploadId;
        this.logRecordingEvent(`Connection established.`);
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
                this.logRecordingEvent(`Uploaded file part ${partNumber}.`);

                this.partsUploaded++;

                return {
                    PartNumber: partNumber,
                    ETag: uploadPartResponse.ETag
                };
            } catch (_err) {
                this.logRecordingEvent(`Error uploading part ${partNumber}.\nError: ${_err}`);
                err = _err;
                retry += 1;
            }
        }
        throw Error(`Upload part failed after 3 attempts.\nError: ${err}`);
    }

    completeUpload() {
        this.hasStartedCompletingUpload = true;
        this.addUploadPartPromise();

        return Promise.all(this.promises)
            .then((parts) => {
                this.parts = parts;
                return this.s3.completeMultipartUpload({
                    Bucket: this.env.bucket,
                    Key: this.key,
                    MultipartUpload: {
                        Parts: this.parts
                    },
                    UploadId: this.uploadId
                }).promise();
            })
            .then((resp) => {
                this.logRecordingEvent(`Upload complete: ${resp.Location}`);
            })
            .catch((e) => {
                // This block will catch any errors in promise chain (uploadPart and completeMultipartUpload).
                // Throwing another error here ensures it will be caught and logged in the researcher data
                // via the video/session-record mixin's stop method.
                this.logRecordingEvent(`Error completing upload: ${e}`);
                throw new Error(`Error completing upload: ${e}`);
            });
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

    logRecordingEvent(msg) {
        // right now this just prints to the console, but we could also send this info to permanent storage (similar to pipe logs)
        const timestamp = new Date().toISOString();
        console.log(`Recording log: ${timestamp}\nFile: ${this.key}\n${msg}\n`);
    }
}
export default S3;
