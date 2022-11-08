import {FilesService} from "./filesservice";
import {InvalidParameterException, ServiceEndpoint} from "../..";
import {Cipher} from "@elastosfoundation/did-js-sdk";
import {EncryptionFile} from "./encryptionfile";
import {ProgressHandler} from "./progresshandler";
import {ProgressDisposer} from "./progressdisposer";
import {checkArgument} from "../../utils/utils";

export class EncryptionFilesService extends FilesService {
    private cipher: Cipher;

    constructor(serviceContext: ServiceEndpoint) {
        super(serviceContext);
    }

    async encryptionInit(identifier: string, secureCode: number, storepass: string) {
        this.cipher = await this.getEncryptionCipher(identifier, secureCode, storepass);
    }

    async download(path: string, progressHandler: ProgressHandler = new ProgressDisposer()): Promise<Buffer> {
        const result = await super.download(path, progressHandler);
        return Buffer.from(new EncryptionFile(this.cipher, result).decrypt());
    }

    async upload(path: string, data: Buffer | string,
                 progressHandler: ProgressHandler = new ProgressDisposer(),
                 isPublic: boolean = false,
                 scriptName: string = null): Promise<string> {
        checkArgument(!!data, 'Invalid data');
        if (isPublic)
            throw new InvalidParameterException('No support for public the encrypted file.');

        const encryptedData = Buffer.from(new EncryptionFile(this.cipher, data).encrypt())
        return super.uploadInternal(path, encryptedData, progressHandler, isPublic, scriptName, true);
    }
}
