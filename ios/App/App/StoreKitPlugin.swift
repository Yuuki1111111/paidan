import Capacitor
import StoreKit

/// Minimal StoreKit 2 Capacitor bridge for 画了么 Pro subscriptions.
/// Exposes: getProducts, purchase, restorePurchases, getCurrentEntitlements.
/// Transaction listener runs automatically on load.
@objc(StoreKitPlugin)
@available(iOS 15.0, *)
public class StoreKitPlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier = "StoreKitPlugin"
    public let jsName = "StoreKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCurrentEntitlements", returnType: CAPPluginReturnPromise),
    ]

    // MARK: - Lifecycle

    private var transactionTask: Task<Void, Never>?

    public override func load() {
        // Start listening for transaction updates (renewals, refunds, family sharing, etc.)
        transactionTask = Task.detached { [weak self] in
            for await result in Transaction.updates {
                guard let self = self else { return }
                if case .verified(let tx) = result {
                    await tx.finish()
                    // Notify JS about the change
                    self.notifyEntitlementChange()
                }
            }
        }
    }

    deinit {
        transactionTask?.cancel()
    }

    // MARK: - Plugin methods

    /// Fetch product metadata from App Store.
    /// Call with { productIds: ["pro_monthly", "pro_yearly"] }
    @objc func getProducts(_ call: CAPPluginCall) {
        guard let ids = call.getArray("productIds", String.self), !ids.isEmpty else {
            call.reject("productIds is required")
            return
        }
        Task {
            do {
                let products = try await Product.products(for: Set(ids))
                let mapped = products.map { productToDict($0) }
                call.resolve(["products": mapped])
            } catch {
                call.reject("Failed to load products: \(error.localizedDescription)")
            }
        }
    }

    /// Purchase a product by its ID.
    /// Call with { productId: "pro_monthly" }
    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId"), !productId.isEmpty else {
            call.reject("productId is required")
            return
        }
        Task {
            do {
                let products = try await Product.products(for: [productId])
                guard let product = products.first else {
                    call.reject("Product not found: \(productId)")
                    return
                }
                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    switch verification {
                    case .verified(let tx):
                        await tx.finish()
                        let entitlements = await self.collectEntitlements()
                        call.resolve(["success": true, "entitlements": entitlements])
                    case .unverified(_, let error):
                        call.reject("Transaction verification failed: \(error.localizedDescription)")
                    }
                case .pending:
                    call.resolve(["success": false, "pending": true])
                case .userCancelled:
                    call.resolve(["success": false, "userCancelled": true])
                @unknown default:
                    call.reject("Unknown purchase result")
                }
            } catch {
                call.reject("Purchase failed: \(error.localizedDescription)")
            }
        }
    }

    /// Restore purchases — syncs with App Store and returns current entitlements.
    @objc func restorePurchases(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
                let entitlements = await collectEntitlements()
                call.resolve(["entitlements": entitlements])
            } catch {
                call.reject("Restore failed: \(error.localizedDescription)")
            }
        }
    }

    /// Get current active entitlements without hitting the network.
    @objc func getCurrentEntitlements(_ call: CAPPluginCall) {
        Task {
            let entitlements = await collectEntitlements()
            call.resolve(["entitlements": entitlements])
        }
    }

    // MARK: - Helpers

    /// Walk Transaction.currentEntitlements to build a simple array of active subs.
    private func collectEntitlements() async -> [[String: Any]] {
        var result: [[String: Any]] = []
        for await verification in Transaction.currentEntitlements {
            if case .verified(let tx) = verification {
                if tx.revocationDate != nil { continue }
                if tx.isUpgraded { continue }
                var entry: [String: Any] = [
                    "productId": tx.productID,
                    "productType": productTypeString(tx.productType),
                    "purchaseDate": iso8601(tx.purchaseDate),
                ]
                if let exp = tx.expirationDate {
                    entry["expirationDate"] = iso8601(exp)
                }
                result.append(entry)
            }
        }
        return result
    }

    private func notifyEntitlementChange() {
        Task {
            let entitlements = await collectEntitlements()
            self.notifyListeners("entitlementUpdate", data: ["entitlements": entitlements])
        }
    }

    private func productToDict(_ p: Product) -> [String: Any] {
        var d: [String: Any] = [
            "id": p.id,
            "displayName": p.displayName,
            "description": p.description,
            "price": NSDecimalNumber(decimal: p.price).doubleValue,
            "displayPrice": p.displayPrice,
            "type": productTypeString(p.type),
        ]
        if let sub = p.subscription {
            d["subscriptionPeriod"] = periodString(sub.subscriptionPeriod)
        }
        return d
    }

    private func productTypeString(_ t: Product.ProductType) -> String {
        switch t {
        case .autoRenewable: return "autoRenewable"
        case .nonRenewable: return "nonRenewable"
        case .consumable: return "consumable"
        case .nonConsumable: return "nonConsumable"
        default: return "unknown"
        }
    }

    private func periodString(_ p: Product.SubscriptionPeriod) -> String {
        switch p.unit {
        case .day: return "\(p.value)d"
        case .week: return "\(p.value)w"
        case .month: return "\(p.value)m"
        case .year: return "\(p.value)y"
        @unknown default: return "\(p.value)?"
        }
    }

    private func iso8601(_ date: Date) -> String {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime]
        return f.string(from: date)
    }
}
