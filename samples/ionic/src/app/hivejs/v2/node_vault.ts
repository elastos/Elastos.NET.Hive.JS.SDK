import ClientConfig from "../config/clientconfig";
import {AppContext, HiveException, VaultServices, VaultSubscriptionService} from "@elastosfoundation/hive-js-sdk";
import {Claims, DIDDocument, JWTParserBuilder} from "@elastosfoundation/did-js-sdk";
import {AppDID} from "../did/appdid";
import {UserDID} from "../did/userdid";
import {VaultBase} from "./vault_base";

/**
 * This class is the wrapper with nodejs style which runs like in the nodejs.
 *
 * Usage is simple:
 *
 *      // initialize vault.
 *      const node = await NodeVault.create(ClientConfig.DEV);
 *      const vault = await node.createVault();
 *
 *      // create collection.
 *      await vault.getDatabaseService().createCollection(collectionName);
 *
 */
export class NodeVault extends VaultBase {
    private readonly config: ClientConfig;
    private static readonly LOCAL_STORE_PATH = '/data/userDir/data/store';
    private static readonly USER_DIR = '/data/userDir';
    public static readonly RESOLVE_CACHE = '/data/didCache';

    private appInstanceDid: AppDID;
    private userDid: UserDID;

    private constructor(config: ClientConfig) {
        super();
        this.config = config;
    }

    private async init(): Promise<NodeVault> {

        AppContext.setupResolver(this.config['resolverUrl'], NodeVault.USER_DIR);

        this.appInstanceDid = await AppDID.create(
            this.config['application']['name'],
            this.config['application']['mnemonic'],
            this.config['application']['passPhrase'],
            this.config['application']['storepass'],
            this.config['resolverUrl']);

        this.userDid = await UserDID.create(
            this.config['user']['name'],
            this.config['user']['mnemonic'],
            this.config['user']['passPhrase'],
            this.config['user']['storepass'],
            this.config['user']['did']);

        return this;
    }

    public static async create(config: ClientConfig): Promise<NodeVault> {
        return await new NodeVault(config).init();
    }

    protected async createAppContext(): Promise<AppContext> {
        const owner = this;
        return await AppContext.build({
            getLocalDataDir(): string {
                return `${NodeVault.LOCAL_STORE_PATH}/${owner.config['node']['storePath']}`;
            },

            async getAppInstanceDocument(): Promise<DIDDocument>  {
                return await owner.appInstanceDid.getDocument();
            },

            async getAuthorization(jwtToken: string): Promise<string> {
                const claims: Claims = (await new JWTParserBuilder().build().parse(jwtToken)).getBody();
                if (claims == null)
                    throw new HiveException('Invalid jwt token as authorization.');

                const presentation = await owner.appInstanceDid.createPresentation(
                    await owner.userDid.issueDiplomaFor(owner.appInstanceDid),
                    claims.getIssuer(),
                    claims.get('nonce') as string);

                return await owner.appInstanceDid.createToken(presentation,  claims.getIssuer());
            }
        }, owner.userDid.getDid().toString());
    }

    public async createVault(): Promise<VaultServices> {
        return new VaultServices(await this.createAppContext(), this.config['node']['provider']);
    }

    public async createVaultSubscription(): Promise<VaultSubscriptionService> {
        return new VaultSubscriptionService(await this.createAppContext(), this.config['node']['provider']);
    }

    public getTargetUserDid(): string {
        return this.userDid.toString();
    }

    public getTargetAppDid(): string {
        return AppDID.APP_DID;
    }
}