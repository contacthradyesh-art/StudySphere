package com.studysphere.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class StudyReminderBootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        MainActivity.rescheduleStoredReminders(context);
    }
}
