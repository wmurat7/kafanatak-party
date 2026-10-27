package com.kafanatak.party;

import android.os.Bundle;
import android.view.KeyEvent;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private void triggerHardwareBack() {
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().post(new Runnable() {
                @Override
                public void run() {
                    getBridge().getWebView().evaluateJavascript(
                        "if (window.gameApp && typeof window.gameApp.handleHardwareBack === 'function') {" +
                        "  window.gameApp.handleHardwareBack();" +
                        "} else {" +
                        "  window.dispatchEvent(new Event('backbutton'));" +
                        "}",
                        null
                    );
                }
            });
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Android 13+ Predictive Back Gesture ve OnBackPressedDispatcher
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                triggerHardwareBack();
            }
        });
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        // Fiziksel tuş / ADB / sanal navigasyon çubuğu geri tuşu basıldığında
        if (event.getKeyCode() == KeyEvent.KEYCODE_BACK && event.getAction() == KeyEvent.ACTION_UP) {
            triggerHardwareBack();
            return true; // İşletim sistemine ve WebView'a devretme, biz yönettik
        }
        return super.dispatchKeyEvent(event);
    }
}
