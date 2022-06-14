import { DataStorage } from '../../utils/storage/datastorage';
import { BridgeHandler } from './bridgehandler';
import { ServiceEndpoint } from '../serviceendpoint';
import { AuthService } from '../../service/auth/authservice';
import { HttpClient } from '../httpclient';
import { Logger } from '../../utils/logger';
import { Claims, JWTParserBuilder } from '@elastosfoundation/did-js-sdk'

/**
 * The access token is made by hive node and represents the user DID and the application DID.
 *
 * <p>Some of the node APIs requires access token when handling request.</p>
 */
export class AccessToken {
	private static LOG = new Logger("AccessToken");
	private jwtCode: string;
	private authService: AuthService;
	private storage: DataStorage;
	private bridge: BridgeHandler;

	/**
	 * Create the access token by service end point, data storage, and bridge handler.
	 *
	 * @param endpoint The service end point.
	 * @param storage The data storage which is used to save the access token.
	 * @param bridge The bridge handle is used for caller to do sth when getting the access token.
	 */
	public constructor(serviceContext: ServiceEndpoint, storage: DataStorage) {
		this.authService = new AuthService(serviceContext, new HttpClient(serviceContext, HttpClient.NO_AUTHORIZATION, HttpClient.DEFAULT_OPTIONS));
		this.storage = storage;
		this.bridge = new BridgeHandlerImpl(serviceContext);
	}

	// TEMPORARY DEBUG METHOD
	public getJwtCode(): string {
		return this.jwtCode;
	}

	/**
	 * Get the access token without exception.
	 *
	 * @return null if not exists.
	 */
	public async getCanonicalizedAccessToken(): Promise<string> {
		try {
			this.jwtCode = await this.fetch();
		} catch (e) {
			AccessToken.LOG.error("error on getCanonicalizedAccessToken: " + e);
			throw e;
		}
		return "token " + this.jwtCode;
	}

	public async fetch(): Promise<string> {
		if (this.jwtCode != null) {
			return this.jwtCode;
		}

		this.jwtCode = await this.restoreToken();
		if (this.jwtCode == null) {
			this.jwtCode = await this.authService.fetch();
			if (this.jwtCode != null) {
				await this.saveToken(this.jwtCode);
			}
		}

		if (this.jwtCode != null) {
			await this.bridge.flush(this.jwtCode);
		}

		return Promise.resolve(this.jwtCode);
	}

	public async invalidate(): Promise<void> {
		await this.clearToken();
	}

	private async restoreToken() : Promise<string> {
		let endpoint = this.bridge.target() as ServiceEndpoint;
		if (endpoint == null)
			return null;

		let serviceDid = endpoint.getServiceInstanceDid();
		let address	= await endpoint.getProviderAddress();

        let jwtCode = this.storage.loadAccessTokenByAddress(address);
        if (jwtCode == null && serviceDid) {
            jwtCode = this.storage.loadAccessToken(serviceDid);
        }

        if (jwtCode == null || await this.isExpired(jwtCode)) {
            this.storage.clearAccessTokenByAddress(address);
            serviceDid && this.storage.clearAccessToken(serviceDid);
            return null;
        }

		return jwtCode;
	}

	private async isExpired(jwtCode: string) : Promise<boolean> {
        let claims : Claims = (await new JWTParserBuilder().setAllowedClockSkewSeconds(300).build().parse(jwtCode)).getBody();
        if (claims == null)
            return true;

        return claims.getExpiration() * 1000 < Date.now();
	}

	private async saveToken( jwtCode: string) : Promise<void> {
		let endpoint = this.bridge.target() as ServiceEndpoint;
		if (endpoint == null)
		    return;

		const serviceDid = endpoint.getServiceInstanceDid();
		if (serviceDid)
            this.storage.storeAccessToken(serviceDid, jwtCode);

		const address = await endpoint.getProviderAddress();
        if (address)
		    this.storage.storeAccessTokenByAddress(address, jwtCode);
	}

	private async clearToken(): Promise<void> {
		let endpoint = this.bridge.target() as ServiceEndpoint;
		if (endpoint == null)
			return;

		if (endpoint.getServiceInstanceDid()) {
			this.storage.clearAccessToken(endpoint.getServiceInstanceDid());
		}
		this.storage.clearAccessTokenByAddress(await endpoint.getProviderAddress());
	}
}

class BridgeHandlerImpl implements BridgeHandler {
	private static LOG = new Logger("BridgeHandler");

    private ref: ServiceEndpoint;

    constructor(endpoint: ServiceEndpoint) {
		this.ref = endpoint;
    }

    public async flush(value: string): Promise<void> {
        try {
            let claims: Claims;
            claims = (await new JWTParserBuilder().setAllowedClockSkewSeconds(300).build().parse(value)).getBody();
			this.ref.flushDids(claims.getAudience(), claims.getIssuer());
        } catch (e) {
            BridgeHandlerImpl.LOG.error("An error occured in the BridgeHandler");
            throw e;
        }
    }

    public target(): any {
        return this.ref;
    }
}