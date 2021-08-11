#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(TDController, RCTEventEmitter)

RCT_EXTERN_METHOD(startTDLib)
RCT_EXTERN_METHOD(sendPhoneNumber:(NSString *)phoneNumber)
RCT_EXTERN_METHOD(sendCode:(NSString *)code)
RCT_EXTERN_METHOD(sendPassword:(NSString *)password)
RCT_EXTERN_METHOD(getContacts)
RCT_EXTERN_METHOD(downloadFile:(nonnull NSNumber *)id)
RCT_EXTERN_METHOD(logOut)
RCT_EXTERN_METHOD(initialTDLibs:(nonnull NSNumber *)apiId apiHash:(NSString *)apiHash systemLangCode:(NSString *)systemLangCode deviceModel:(NSString *)deviceModel systemVersion:(NSString *)systemVersion appVersion:(NSString *)appVersion)

@end
