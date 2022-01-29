import { AppContext } from "../http/auth/appcontext";
import { HttpClient } from "../http/httpclient";
import { PromotionService } from "../restclient/promotion/promotionservice";
import { ServiceContext } from "../http/servicecontext";

export class Backup extends ServiceContext {
    private readonly promotionService: PromotionService;

    public constructor(context: AppContext, providerAddress: string) {
        super(context, providerAddress);
        let httpClient = new HttpClient(this, HttpClient.WITH_AUTHORIZATION, HttpClient.DEFAULT_OPTIONS);
        this.promotionService  = new PromotionService(this, httpClient);
    }

    public getPromotionService(): PromotionService  {
        return this.promotionService;
    }
}
