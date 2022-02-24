import {
	InvalidParameterException,
	NetworkException,
	NodeRPCException, NotFoundException,
	NotImplementedException, ServerUnknownException,
	UnauthorizedException
} from "../../exceptions";
import { HttpClient } from "../../http/httpclient";
import { ServiceContext } from "../../http/servicecontext";
import { Logger } from '../../logger';
import { RestService } from "../restservice";
import { BackupResult } from "./backupresult";
import { HttpMethod } from "../../http/httpmethod";
import { HttpResponseParser } from '../../http/httpresponseparser';
import {CredentialCode} from "./credentialcode";
import {BackupContext} from "./backupcontext";

export class BackupService extends RestService {
	private static LOG = new Logger("BackupService");
	private static API_BACKUP_ENDPOINT = "/api/v2/vault/content";

	private credentialCode: CredentialCode;

    constructor(serviceContext: ServiceContext, httpClient: HttpClient) {
		super(serviceContext, httpClient);
	}

	public setBackupContext(backupContext: BackupContext) {
		this.credentialCode = new CredentialCode(this.serviceContext, backupContext);
	}

	public async startBackup() : Promise<void>{
		try {
			await this.httpClient.send<void>(`${BackupService.API_BACKUP_ENDPOINT}?to=hive_node`,
				{ "credential": await this.credentialCode.getToken() },
				HttpClient.NO_RESPONSE, HttpMethod.POST);
		} catch (e){
			this.handleError(e);
		}
	}

	public async stopBackup(): Promise<void> {
		return await new Promise<void>((resolve, reject) => {
			reject(new NotImplementedException());
		});
	}

	public async restoreFrom() : Promise<void>{
		try {
			await this.httpClient.send<void>(`${BackupService.API_BACKUP_ENDPOINT}?from=hive_node`,
				{ "credential": await this.credentialCode.getToken() },
				HttpClient.NO_RESPONSE, HttpMethod.POST);
		} catch (e){
			this.handleError(e);
		}
	}

	public async stopRestore(): Promise<void> {
		return await new Promise<void>((resolve, reject) => {
			reject(new NotImplementedException());
		});
	}

	public async checkResult() : Promise<BackupResult> {
		try {
			return await this.httpClient.send<BackupResult>(BackupService.API_BACKUP_ENDPOINT, HttpClient.NO_PAYLOAD,
					<HttpResponseParser<BackupResult>> {
				deserialize(content: any): BackupResult {
					const obj = JSON.parse(content);
					let result = new BackupResult();
					result.state = obj['state'];
					result.result = obj['result'];
					result.message = obj['message'];
					return result;
				}
			}, HttpMethod.GET);
		} catch (e) {
			this.handleError(e);
		}
	}

	private handleError(e: Error): unknown {
		if (e instanceof NodeRPCException) {
			switch (e.getCode()) {
				case NodeRPCException.UNAUTHORIZED:
					throw new UnauthorizedException(e.message, e);
				case NodeRPCException.BAD_REQUEST:
					throw new InvalidParameterException(e.message, e);
				case NodeRPCException.NOT_FOUND:
					throw new NotFoundException(e.message, e);
				default:
					throw new ServerUnknownException(NodeRPCException.SERVER_EXCEPTION, e.message, e);
			}
		}
		throw new NetworkException(e.message, e);
	}
}
