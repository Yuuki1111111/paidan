#import <Capacitor/Capacitor.h>

// Register the Swift plugin with Capacitor's ObjC runtime.
CAP_PLUGIN(StoreKitPlugin, "StoreKit",
    CAP_PLUGIN_METHOD(getProducts, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(purchase, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(restorePurchases, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getCurrentEntitlements, CAPPluginReturnPromise);
)
