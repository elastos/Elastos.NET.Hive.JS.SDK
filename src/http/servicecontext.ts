import { checkNotNull } from '../domain/utils'
import { File } from '../domain/file'
import { AppContext } from './security/appcontext'
import { AccessToken } from './security/accesstoken'
import { DataStorage } from '../domain/datastorage'

export class ServiceContext {
	private context: AppContext;
	private providerAddress: string;

	private appDid: string;
	private appInstanceDid: string;
	private serviceInstanceDid: string;

	private accessToken: AccessToken;
	private dataStorage: DataStorage;

    constructor(context: AppContext, providerAddress: string) {
        checkNotNull(context, "Empty context parameter");
        checkNotNull(providerAddress, "Empty provider address parameter");

        this.context = context;
        this.providerAddress = providerAddress;
    }

    private init():void {
        let dataDir = this.context.getAppContextProvider().getLocalDataDir();
		if (!dataDir.endsWith(File.SEPARATOR))
			dataDir += File.SEPARATOR;

        this.dataStorage = new FileStorage(dataDir, context.getUserDid());

    }

    public getAccessToken(): AccessToken {
        return this.accessToken;
    }

    public getProviderAddress(): string {
        return this.providerAddress;
    }

    public getAppContext(): AppContext {
		return this.context;
	}

*/


/*
    protected ServiceContext(AppContext context, String providerAddress) {
		if (context == null || providerAddress == null)
			throw new IllegalArgumentException("Empty context or provider address parameter");

		this.context = context;
		this.providerAddress = providerAddress;

		String dataDir = context.getAppContextProvider().getLocalDataDir();
		if (!dataDir.endsWith(File.separator))
			dataDir += File.separator;

		this.dataStorage = new FileStorage(dataDir, context.getUserDid());
		this.accessToken = new AccessToken(this, dataStorage, new BridgeHandler() {
			private WeakReference<ServiceContext> weakref;

			@Override
			public void flush(String value) {
				try {
					ServiceContext endpoint = weakref.get();
					Claims claims;

					claims = new JwtParserBuilder().build().parseClaimsJws(value).getBody();
					endpoint.flushDids(claims.getAudience(), claims.getIssuer());

				} catch (Exception e) {
					e.printStackTrace();
					return;
				}
			}

			BridgeHandler setTarget(ServiceContext endpoint) {
				this.weakref = new WeakReference<>(endpoint);
				return this;
			}

			@Override
			public Object target() {
				return weakref.get();
			}

		}.setTarget(this));
	}

*/
	/**
	 * Get the end-point address of this service End-point.
	 *
	 * @return provider address
	 */
     /**
      * Get the user DID string of this ServiceContext.
      *
      * @return user did
      */
/*     public String getUserDid() {
         return context.getUserDid();
     }
*/ 
     /**
      * Get the application DID in the current calling context.
      *
      * @return application did
      */
/*     public String getAppDid() {
         return appDid;
     }
*/
     /**
      * Get the application instance DID in the current calling context;
      *
      * @return application instance did
      */
/*     public String getAppInstanceDid() {
         return appInstanceDid;
     }
*/
     /**
      * Get the remote node service application DID.
      *
      * @return node service did
      */
/*     public String getServiceDid() {
         throw new NotImplementedException();
     }
*/ 
     /**
      * Get the remote node service instance DID where is serving the storage service.
      *
      * @return node service instance did
      */
/*     public String getServiceInstanceDid() {
         return serviceInstanceDid;
     }
*/
/*
     private void flushDids(String appInstanceDId, String serviceInstanceDid) {
         this.appInstanceDid = appInstanceDId;
         this.serviceInstanceDid = serviceInstanceDid;
     }
 
     public DataStorage getStorage() {
         return dataStorage;
     }
 
     public void refreshAccessToken() throws NodeRPCException {
         accessToken.fetch();
     }
 
     public CompletableFuture<NodeVersion> getNodeVersion() {
         return CompletableFuture.supplyAsync(() -> {
             try {
                 return new AboutController(this).getNodeVersion();
             } catch (HiveException | RuntimeException e) {
                 throw new CompletionException(e);
             }
         });
     }
 
     public CompletableFuture<String> getLatestCommitId() {
         return CompletableFuture.supplyAsync(() -> {
             try {
                 return new AboutController(this).getCommitId();
             } catch (HiveException | RuntimeException e) {
                 throw new CompletionException(e);
             }
         });
     }
 }
*/ 