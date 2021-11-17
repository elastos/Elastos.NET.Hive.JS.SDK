import { VaultSubscriptionService, PricingPlan, BackupSubscriptionService } from "@elastosfoundation/elastos-hive-js-sdk";
import { ClientConfig } from "../config/clientconfig";
import { TestData } from "../config/testdata";

describe("test vault subscribe function", () => {

    let testData: TestData;
    let vaultsubscriptionService: VaultSubscriptionService;
    let PRICING_PLAN_NAME = "Rookie";

    beforeEach(async () => {
        testData = await TestData.getInstance("vault subscribe.test", ClientConfig.CUSTOM, TestData.USER_DIR);
        vaultsubscriptionService = new VaultSubscriptionService(
            testData.getAppContext(),
            testData.getProviderAddress());
    });

    test("testGetPricingPlanList", async() => {
        let plans: PricingPlan[] = await vaultsubscriptionService.getPricingPlanList();
        expect(plans).not.toBeNull();
        expect(plans.length).toBeGreaterThan(0);
    });

    test("testGetPricingPlan", async() => {
        let plan: PricingPlan = await vaultsubscriptionService.getPricingPlan(PRICING_PLAN_NAME);
        expect(plan).not.toBeNull();
        expect(plan.getName()).toBe(PRICING_PLAN_NAME);
    });

    test("testSubscribeCheckUnsubscribe", async () => {
        let vaultInfo;
        try {
            vaultInfo = await vaultsubscriptionService.subscribe();
        } catch (e) {
            await vaultsubscriptionService.unsubscribe();
            vaultInfo = await vaultsubscriptionService.subscribe();
        }
        expect(vaultInfo).not.toBeNull();
        expect(await vaultsubscriptionService.checkSubscription()).not.toBeNull();
        let error = null;
        try {
            await vaultsubscriptionService.unsubscribe()
        } catch (e) {
            error = e;
        }
        expect(error).toBeNull();
    });
});


describe("test backup subscribe function", () => {

    let testData: TestData;
    let backupsubscriptionService: BackupSubscriptionService;
    let PRICING_PLAN_NAME = "Rookie";

    beforeEach(async () => {
        testData = await TestData.getInstance("backup subscribe.test", ClientConfig.CUSTOM, TestData.USER_DIR);
        backupsubscriptionService = new BackupSubscriptionService(
            testData.getAppContext(),
            testData.getProviderAddress());
    });

    test("testGetPricingPlanList", async() => {
        let plans: PricingPlan[] = await backupsubscriptionService.getPricingPlanList();
        expect(plans).not.toBeNull();
        expect(plans.length).toBeGreaterThan(0);
    });

    test("testGetPricingPlan", async() => {
        let plan: PricingPlan = await backupsubscriptionService.getPricingPlan(PRICING_PLAN_NAME);
        expect(plan).not.toBeNull();
        expect(plan.getName()).toBe(PRICING_PLAN_NAME);
    });

    test("testSubscribeCheckUnsubscribe", async () => {
        let backupInfo;
        try {
            backupInfo = await backupsubscriptionService.subscribe();
        } catch (e) {
            await backupsubscriptionService.unsubscribe();
            backupInfo = await backupsubscriptionService.subscribe();
        }
        expect(backupInfo).not.toBeNull();
        expect(await backupsubscriptionService.checkSubscription()).not.toBeNull();
        let error = null;
        try {
            await backupsubscriptionService.unsubscribe()
        } catch (e) {
            error = e;
        }
        expect(error).toBeNull();
    });
});


