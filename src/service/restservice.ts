import {Cipher, DIDDocument} from "@elastosfoundation/did-js-sdk";
import {BaseService, ServiceBuilder} from "ts-retrofit";
import {
    HttpClient,
    HttpResponseParser,
    NetworkException,
    NodeRPCException,
    ServiceEndpoint
} from "..";
import {Logger} from '../utils/logger';

/**
 * Wrapper class to get the response body as a result object.
 */
export class APIResponse {
    constructor(private response) {}

    get<T>(responseParser: HttpResponseParser<T> = HttpClient.DO_NOTHING_RESPONSE_PARSER): T {
        // Here is 'object' which is different with @ResponseTransformer (raw 'string').
        return responseParser.deserialize(this.response.data);
    }

    getStream(): Buffer {
        return Buffer.from(this.response.data, 'binary');
    }

    /**
     * Transform the data on @ResponseTransformer to json object.
     *
     * @param data
     * @param callback
     */
    static handleResponseData(data: any, callback: (jsonObj) => any) {
        if (!data) {
            return data;
        }
        try {
            const jsonObj = JSON.parse(data);
            if ('error' in jsonObj && jsonObj['error'] && 'message' in jsonObj['error']) {
                // error response data.
                return jsonObj;
            }
            // success response data.
            return callback(jsonObj);
        } catch (e) {
            return data;
        }
    }
}

/**
 * TODO: To be removed.
 */
export class RestService {
    protected constructor(protected serviceContext: ServiceEndpoint, protected httpClient: HttpClient) {
    }

    public getServiceContext(): ServiceEndpoint {
        return this.serviceContext;
    }

    public getHttpClient(): HttpClient {
        return this.httpClient;
    }

    public async getEncryptionCipher(identifier: string, secureCode: number, storepass: string): Promise<Cipher> {
        const appContext = this.serviceContext.getAppContext();
        const doc: DIDDocument = await appContext.getAppContextProvider().getAppInstanceDocument();
        return await doc.createCipher(identifier, secureCode, storepass);
    }
}

/**
 * Base class for all services.
 */
export class RestServiceT<T> extends RestService {
    private static _LOG = new Logger("RestServiceT");

    private api;

    protected constructor(serviceContext: ServiceEndpoint, httpClient: HttpClient) {
        super(serviceContext, httpClient);
    }

    protected async getAPI<T extends BaseService>(api: new (builder: ServiceBuilder) => T, extraConfig?): Promise<T> {
        if (this.api == null) {
            this.api = new ServiceBuilder()
                .setEndpoint(await this.serviceContext.getProviderAddress())
                .setRequestInterceptors((config) => {
                    RestServiceT._LOG.info(`REQUEST: URL={}, METHOD={}, TOKEN={}, {}`,
                        config['url'],
                        config['method'],
                        'Authorization' in config['headers'] ? config['headers']['Authorization'] : 'null',
                        // BUGBUG: consider the bug of replace with {} on logger.
                        `ARGS=${JSON.stringify(config['params'])}, BODY=${JSON.stringify(config['data'])}`);

                    return extraConfig ? {...config, ...extraConfig} : config;
                })
                .setResponseInterceptors((response) => {
                    RestServiceT._LOG.info(`RESPONSE: URL={}, METHOD={}, STATUS={}, BODY={}`,
                        response['config']['url'],
                        response['config']['method'],
                        response.status,
                        JSON.stringify(response.data));
                    return response;
                })
                .build<T>(api);
        }
        return this.api;
    }

    protected async callAPI<T extends BaseService>(api: new (builder: ServiceBuilder) => T,
                                                   onRun: (a: T) => Promise<any>, // return Response
                                                   extraConfig?): Promise<any> {
        const serviceApi = await this.getAPI(api, extraConfig);
        const response = await onRun(serviceApi);
        return response ? response.data : null;
    }

    protected async getAccessToken(): Promise<string> {
        const accessToken = this.serviceContext.getAccessToken();
        return 'token ' + await accessToken.fetch();
    }

    private async tryHandleResponseError(e: Error): Promise<void> {
        if (!('response' in e) || !e['response'] || typeof e['response'] != 'object') {
            return;
        }

        if ('config' in e && 'url' in e['config'] && e['config']['url']) {
            RestServiceT._LOG.info('ERROR RESPONSE: URL={}, METHOD={}, STATUS={}, BODY={}',
                e['config']['url'],
                e['config']['method'],
                // @ts-ignore
                JSON.stringify(e.response.status),
                // @ts-ignore
                JSON.stringify(e.response.data));
        }

        // @ts-ignore
        const response = e.response;
        if (response.status >= 300) {
            if (response.status == 401 && this.serviceContext.hasAppContext()) {
                await this.serviceContext.getAccessToken().invalidate();
            }
            let [status, errorCode, errorMessage, jsonObj] = [response.status, -1, '', response.data];
            if (jsonObj && typeof jsonObj == 'object' && 'error' in jsonObj && 'message' in jsonObj['error']) {
                if ('internal_code' in jsonObj['error']) {
                    errorCode = jsonObj['error']['internal_code'];
                }
                errorMessage = jsonObj['error']['message'];
            }
            throw NodeRPCException.forHttpCode(status, errorMessage, errorCode);
        }
    }

    /**
     * Handle response error if need get a specify error.
     *
     * @param e from catch clause.
     * @protected
     */
    protected async handleResponseError(e): Promise<void> {
        if (e instanceof Error) {
            await this.tryHandleResponseError(e);
        }
        throw new NetworkException(e.message, e);
    }
}

