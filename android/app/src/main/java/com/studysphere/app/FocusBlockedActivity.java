package com.studysphere.app;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/** Native interstitial shown when a distraction app is opened during a shield session. */
public class FocusBlockedActivity extends Activity {
    private TextView message;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setPadding(48, 48, 48, 48);
        root.setBackgroundColor(Color.rgb(12, 9, 22));

        TextView title = new TextView(this);
        title.setText("Focus Shield is active\nफोकस शील्ड चालू है");
        title.setTextColor(Color.WHITE);
        title.setTextSize(24);
        title.setGravity(Gravity.CENTER);

        message = new TextView(this);
        message.setTextColor(Color.LTGRAY);
        message.setTextSize(16);
        message.setGravity(Gravity.CENTER);
        message.setPadding(0, 24, 0, 32);

        Button back = new Button(this);
        back.setText("Back to StudySphere / स्टडीस्फीयर पर लौटें");
        back.setOnClickListener(v -> goToStudySphere());

        root.addView(title, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        root.addView(message, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        root.addView(back, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        setContentView(root);
        refreshMessage();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        refreshMessage();
    }

    private void refreshMessage() {
        SharedPreferences prefs = getSharedPreferences(FocusShieldAccessibilityService.PREFS, MODE_PRIVATE);
        long endsAt = prefs.getLong(FocusShieldAccessibilityService.KEY_ENDS_AT, 0);
        long minutes = Math.max(1, (endsAt - System.currentTimeMillis() + 59_999) / 60_000);
        message.setText("This app is blocked for about " + minutes + " more min.\nयह ऐप करीब " + minutes
                + " मिनट तक बंद है। पढ़ाई जारी रखें!");
    }

    /** Leaving via finish() would land the student straight back in the blocked app, so open StudySphere instead. */
    private void goToStudySphere() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        startActivity(intent);
        finish();
    }

    @Override
    public void onBackPressed() {
        goToStudySphere();
    }
}
