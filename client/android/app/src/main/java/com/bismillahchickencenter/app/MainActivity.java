package com.bismillahchickencenter.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createAlertsChannel();
    }

    // The channel every push uses ("bcc_alerts"). Created natively at start-up
    // so it exists — with HIGH importance, sound and vibration — before the
    // first push arrives. (If a push arrived first, Android would invent a
    // default channel that may be silent.)
    private void createAlertsChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager == null) return;

        NotificationChannel channel = new NotificationChannel(
                "bcc_alerts", "Orders & deliveries", NotificationManager.IMPORTANCE_HIGH);
        channel.setDescription("Orders, price changes, deliveries and payments");
        channel.enableVibration(true);
        channel.setVibrationPattern(new long[] {0, 250, 150, 250});
        channel.enableLights(true);
        channel.setSound(
                RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION),
                new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build());
        manager.createNotificationChannel(channel);
    }
}
