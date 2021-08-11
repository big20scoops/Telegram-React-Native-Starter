package com.telegramstarter;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import android.util.Log;

import androidx.annotation.Nullable;

import org.drinkless.td.libcore.telegram.Client;
import org.drinkless.td.libcore.telegram.TdApi;

public class TDController extends ReactContextBaseJavaModule implements TdClient.Callback {
    private final String TAG = "TDController";
    private final String EVENT = "TDLib";
    private final String CONTACT_EVENT = "TDContact";

    private TdApi.GetAuthorizationState authState;
    private TdApi.PhoneNumberAuthenticationSettings settings;

    private WritableMap params;
    private final String CONTACTS = "contacts";
    private final String ID = "id";
    private final String FIRST_NAME = "first_name";
    private final String LAST_NAME = "last_name";
    private final String PROFILE_PHOTO = "profile_photo";
    private final String SMALL_PROFILE_PHOTO = "small";
    private final String SMALL_PROFILE_PHOTO_id = "id";
    private final String FILE_PATH = "path";

    private final String CONTACT = "contact";
    private final String FILE = "file";
    private final String STATE = "state";

    private TdApi.TdlibParameters authStateRequest;

    public Client client;
    private ReactApplicationContext context;

    public TDController(ReactApplicationContext context){
        super(context);
        this.context = context;
    }

    @Override
    public String getName() {
        return TAG;
    }

    @ReactMethod
    public void startTDLib() {
        authState = new TdApi.GetAuthorizationState();
        client = TdClient.getClient(this);
        client.send(authState,this);
    }

    @ReactMethod
    public void initialTDLibs(int apiId, String apiHash, String systemLangCode, String deviceModel, String systemVersion, String appVersion) {
        authStateRequest = new TdApi.TdlibParameters();
        authStateRequest.apiId = apiId;
        authStateRequest.apiHash = apiHash;
        authStateRequest.databaseDirectory = context.getFilesDir().getAbsolutePath();

        authStateRequest.useTestDc = false;
        authStateRequest.filesDirectory = "";
        authStateRequest.useFileDatabase = false;
        authStateRequest.useChatInfoDatabase = false;
        authStateRequest.useMessageDatabase = false;

        authStateRequest.useSecretChats = false;
        authStateRequest.systemLanguageCode = systemLangCode;
        authStateRequest.deviceModel = deviceModel;
        authStateRequest.systemVersion = systemVersion;
        authStateRequest.applicationVersion = appVersion;

        authStateRequest.enableStorageOptimizer = true;
        authStateRequest.ignoreFileNames = false;
        client.send(new TdApi.SetTdlibParameters(authStateRequest), this);
    }

    @ReactMethod
    private void sendPhoneNumber(String phoneNumber) {
        settings = new TdApi.PhoneNumberAuthenticationSettings();
        settings.allowFlashCall = false;
        settings.isCurrentPhoneNumber = true;
        settings.allowSmsRetrieverApi = false;
        if (client != null) {
            client.send(new TdApi.SetAuthenticationPhoneNumber(phoneNumber, settings),this);
        }
    }

    @ReactMethod
    private void sendCode(String code) {
        if (client != null) {
            client.send(new TdApi.CheckAuthenticationCode(code),this);
        }
    }

    @ReactMethod
    private void sendPassword(String password) {
        if (client != null) {
            client.send(new TdApi.CheckAuthenticationPassword(password),this);
        }
    }

    @ReactMethod
    private void getContacts() {
        if (client != null) {
            client.send(new TdApi.GetContacts(),this);
        }
    }

    @ReactMethod
    private void downloadFile(int id) {
        if (client != null) {
            client.send(new TdApi.DownloadFile(id, 32, 0, 0, false),this);
        }
    }

    @ReactMethod
    private void logOut() {
        if (client != null) {
            client.send(new TdApi.LogOut(),this);
        }
    }

    public void onResult(TdApi.Object object) {
        try {
            params = Arguments.createMap();
            switch (object.getConstructor()) {
                case TdApi.UpdateAuthorizationState.CONSTRUCTOR:
                    Log.d(TAG, "onResult: UpdateAuthState");
                    onAuthStateUpdated(((TdApi.UpdateAuthorizationState) object).authorizationState);
                    break;
                case TdApi.Users.CONSTRUCTOR:
                    Log.d(TAG, "onResult: getContacts");
                    int[] userIDs = ((TdApi.Users)object).userIds;
                    WritableArray convertedUserIds = new WritableNativeArray();
                    for (int userID : userIDs) {
                        convertedUserIds.pushInt((Integer) userID);
                    }
                    params.putArray(CONTACTS, convertedUserIds);
                    sendContactEvent(params);
                    break;
                case TdApi.UpdateUser.CONSTRUCTOR:
                    Log.d(TAG, "onResult: contactDetail");
                    TdApi.User userDetail = ((TdApi.UpdateUser)object).user;
                    WritableMap user = Arguments.createMap();
                    user.putInt(ID, userDetail.id);
                    user.putString(FIRST_NAME, userDetail.firstName);
                    user.putString(LAST_NAME, userDetail.lastName);

                    WritableMap profilePhoto = Arguments.createMap();
                    WritableMap smallProfilePhoto = Arguments.createMap();
                    if (userDetail.profilePhoto != null) {
                        smallProfilePhoto.putInt(SMALL_PROFILE_PHOTO_id, userDetail.profilePhoto.small.id);
                        profilePhoto.putMap(SMALL_PROFILE_PHOTO, smallProfilePhoto);
                        user.putMap(PROFILE_PHOTO, profilePhoto);
                    }

                    params.putMap(CONTACT, user);
                    sendContactEvent(params);
                    break;
                case TdApi.UpdateFile.CONSTRUCTOR:
                    Log.d(TAG, "onResult: updateFile");
                    TdApi.File file = ((TdApi.UpdateFile)object).file;
                    WritableMap mappedFile = Arguments.createMap();
                    mappedFile.putInt(SMALL_PROFILE_PHOTO_id, file.id);
                    mappedFile.putString(FILE_PATH, file.local.path);

                    params.putMap(FILE, mappedFile);
                    sendContactEvent(params);
                    break;
            }
        } catch (Exception e) {
            Log.d(TAG, "onResult: Errors");
        }
    }

    private void sendEvent(@Nullable WritableMap params) {
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(EVENT, params);
    }

    private void sendContactEvent(@Nullable WritableMap params) {
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(CONTACT_EVENT, params);
    }

    private void onAuthStateUpdated(TdApi.AuthorizationState authorizationState) {
        params = Arguments.createMap();
        switch (authorizationState.getConstructor()) {
            case TdApi.AuthorizationStateWaitTdlibParameters.CONSTRUCTOR:
                params.putString(STATE, "authorizationStateWaitTdlibParameters");
                sendEvent(params);
                Log.d(TAG, "onResult: TDlibParams");
                break;
            case TdApi.AuthorizationStateWaitEncryptionKey.CONSTRUCTOR:
                client.send(new TdApi.CheckDatabaseEncryptionKey(), this);
                Log.d(TAG, "onResult: checked");
                break;
            case TdApi.AuthorizationStateWaitPhoneNumber.CONSTRUCTOR:
                params.putString(STATE, "authorizationStateWaitPhoneNumber");
                sendEvent(params);
                Log.d(TAG, "onResult: wait phone");
                break;
            case TdApi.AuthorizationStateWaitCode.CONSTRUCTOR:
                params.putString(STATE, "authorizationStateWaitCode");
                sendEvent(params);
                Log.d(TAG, "onResult: wait code");
                break;
            case TdApi.AuthorizationStateWaitPassword.CONSTRUCTOR:
                params.putString(STATE, "authorizationStateWaitPassword");
                sendEvent(params);
                Log.d(TAG, "onResult: wait password");
                break;
            case TdApi.AuthorizationStateWaitRegistration.CONSTRUCTOR:
                params.putString(STATE, "authorizationStateWaitRegistration");
                sendEvent(params);
                Log.d(TAG, "onResult: wait registration");
                break;
            case TdApi.AuthorizationStateReady.CONSTRUCTOR:
                params.putString(STATE, "authorizationStateReady");
                sendEvent(params);
                Log.d(TAG, "onResult: ready");
                break;
            case TdApi.AuthorizationStateLoggingOut.CONSTRUCTOR:
                Log.d(TAG, "onResult: Logging out");
                break;
            case TdApi.AuthorizationStateClosing.CONSTRUCTOR:
                Log.d(TAG, "onResult: Closing");
                break;
            case TdApi.AuthorizationStateClosed.CONSTRUCTOR:
                params.putString(STATE, "authorizationStateClosed");
                sendEvent(params);
                Log.d(TAG, "onResult: Closed");
                break;
        }

    }
}
