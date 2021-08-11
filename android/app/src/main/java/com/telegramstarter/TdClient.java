package com.telegramstarter;

import android.app.Activity;

import org.drinkless.td.libcore.telegram.Client;
import org.drinkless.td.libcore.telegram.TdApi;

public class TdClient {
    private static Client client;

    private TdClient(){

    }

    public static Client getClient(Callback activity){
        client = Client.create(activity,null,null);
        return client;
    }

    public interface Callback extends Client.ResultHandler{
        @Override
        void onResult(TdApi.Object object);
    }
}
