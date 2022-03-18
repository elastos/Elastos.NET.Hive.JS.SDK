import { Order, Receipt, VaultSubscriptionService, Logger } from "@elastosfoundation/hive-js-sdk";
import { TestData } from "../config/testdata";

describe("test payment service", () => {
    const LOG = new Logger("paymentservice.test");

	const PRICING_PLAN_NAME = "Rookie";
    const ORDER_ID = "60ee8c056fdd17b16bb5b4c2";
    const TRANS_ID = "280a24034bfb241c31b5a73c792c9d05df2b1f79bb98733c5358aeb909c27010";

	let testData: TestData;
    let testOrderId: string;
    let testTransactionId: string;
	let vaultSubscriptionService: VaultSubscriptionService;

    beforeAll(async () => {
		testData = await TestData.getInstance("paymentservice.test");
        vaultSubscriptionService = new VaultSubscriptionService(testData.getAppContext(), testData.getProviderAddress());
        try {
            await vaultSubscriptionService.subscribe();    
        } catch (e){
            LOG.log("vault is already subscribed");
        }
	});

    test("testgetversion", async () => {
		let paymentVersion = await vaultSubscriptionService.getVersion();
		expect(paymentVersion).not.toBeNull();
        LOG.log("Payment Service version: " + paymentVersion);
    });

    test.skip("testPlaceOrder", async () => {
        let order: Order = await vaultSubscriptionService.placeOrder(PRICING_PLAN_NAME);
        expect(order).not.toBeNull();
        testOrderId = order.getOrderId();
        expect(testOrderId).not.toBeNull();
    });

    test.skip("testPayOrder", async () => {
        let receipt: Receipt = await vaultSubscriptionService.payOrder(ORDER_ID, TRANS_ID);
        expect(receipt).not.toBeNull();
        testTransactionId = receipt.getReceiptId();
        expect(testTransactionId).not.toBeNull();
        expect(receipt.getOrderId()).not.toBeNull();
    });

    test.skip("testGetReceipt", async () => {
        let receipt: Receipt = await vaultSubscriptionService.getReceipt(ORDER_ID);
        expect(receipt).not.toBeNull();
        expect(receipt.getReceiptId()).not.toBeNull();
        expect(receipt.getOrderId()).not.toBeNull();
        testTransactionId = receipt.getTransactionId();
    });

    test.skip("testGetOrder", async () => {
        let order: Order = await vaultSubscriptionService.getOrder(ORDER_ID);
        expect(order).not.toBeNull();
        expect(order.getOrderId()).not.toBeNull();
    });

    test.skip("testGetOrders", async () => {
        let orders: Order[] = await vaultSubscriptionService.getOrderList();
        expect(orders).not.toBeNull();
        expect(orders.length).toBeGreaterThan(0);
    });

});