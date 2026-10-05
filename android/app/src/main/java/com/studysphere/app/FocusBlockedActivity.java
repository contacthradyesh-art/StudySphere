package com.studysphere.app;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

/** Premium modal blocker shown above the blocked app during an active Focus Shield session. */
public class FocusBlockedActivity extends Activity {
    private TextView message;
    private TextView timer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        window.setBackgroundDrawableResource(android.R.color.transparent);
        window.addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND);
        WindowManager.LayoutParams lp = window.getAttributes();
        lp.dimAmount = 0.62f;
        window.setAttributes(lp);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            try { window.setBackgroundBlurRadius(24); } catch (Throwable ignored) {}
        }

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setPadding(dp(20), dp(24), dp(20), dp(24));
        root.setBackgroundColor(Color.TRANSPARENT);

        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setGravity(Gravity.CENTER_HORIZONTAL);
        card.setPadding(dp(22), dp(22), dp(22), dp(20));
        card.setBackground(cardBackground());

        ImageView icon = new ImageView(this);
        try {
            icon.setImageDrawable(getApplicationInfo().loadIcon(getPackageManager()));
        } catch (Throwable ignored) {}
        LinearLayout.LayoutParams iconLp = new LinearLayout.LayoutParams(dp(46), dp(46));
        iconLp.bottomMargin = dp(8);
        card.addView(icon, iconLp);

        TextView brand = text("StudySphere", 15, Color.rgb(70, 42, 130), Typeface.BOLD);
        card.addView(brand);

        TextView title = text("Focus Shield Active", 28, Color.rgb(24, 18, 42), Typeface.BOLD);
        title.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams titleLp = wrap();
        titleLp.topMargin = dp(12);
        card.addView(title, titleLp);

        TextView hindi = text("फोकस शील्ड चालू है", 22, Color.rgb(92, 49, 158), Typeface.BOLD);
        hindi.setGravity(Gravity.CENTER);
        card.addView(hindi);

        LinearLayout info = new LinearLayout(this);
        info.setOrientation(LinearLayout.VERTICAL);
        info.setPadding(dp(16), dp(14), dp(16), dp(14));
        info.setBackground(infoBackground());
        LinearLayout.LayoutParams infoLp = wrap();
        infoLp.topMargin = dp(18);
        infoLp.width = ViewGroup.LayoutParams.MATCH_PARENT;
        card.addView(info, infoLp);

        TextView appTitle = text(blockedAppLabel(), 18, Color.rgb(42, 35, 55), Typeface.BOLD);
        appTitle.setGravity(Gravity.CENTER);
        info.addView(appTitle, wrap());

        message = text("", 15, Color.rgb(92, 84, 105), Typeface.NORMAL);
        message.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams msgLp = wrap();
        msgLp.topMargin = dp(10);
        info.addView(message, msgLp);

        timer = text("", 15, Color.rgb(80, 64, 110), Typeface.BOLD);
        timer.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams timerLp = wrap();
        timerLp.topMargin = dp(12);
        info.addView(timer, timerLp);

        Button back = new Button(this);
        back.setAllCaps(false);
        back.setText("Back to Focus  →");
        back.setTextColor(Color.WHITE);
        back.setTextSize(16);
        back.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        back.setBackground(buttonBackground());
        back.setOnClickListener(v -> goToStudySphere());
        LinearLayout.LayoutParams backLp = wrap();
        backLp.topMargin = dp(18);
        backLp.width = ViewGroup.LayoutParams.MATCH_PARENT;
        backLp.height = dp(54);
        card.addView(back, backLp);

        root.addView(card, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
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
        String reason = getIntent() == null ? "" : getIntent().getStringExtra("reason");
        if ("shorts".equals(reason)) {
            message.setText("Shorts are blocked in Study YouTube mode.\nशॉर्ट्स बंद हैं — पढ़ाई वाले वीडियो पर लौटें।");
        } else if ("channel".equals(reason)) {
            message.setText("Ye channel study list mein nahi hai.\nयह चैनल स्टडी लिस्ट में नहीं है।");
        } else {
            String label = blockedAppLabel();
            message.setText(label + " can wait, your goal can't.\nअभी पढ़ाई पहले — " + label + " बाद में।");
        }

        SharedPreferences prefs = getSharedPreferences(FocusShieldAccessibilityService.PREFS, MODE_PRIVATE);
        long endsAt = prefs.getLong(FocusShieldAccessibilityService.KEY_ENDS_AT, 0);
        long minutes = Math.max(1, (endsAt - System.currentTimeMillis() + 59_999) / 60_000);
        timer.setText("⏱  " + minutes + " min focus session remaining / " + minutes + " मिनट बाकी");
    }

    private String blockedAppLabel() {
        String pkg = getIntent() == null ? null : getIntent().getStringExtra("blocked_package");
        if (pkg == null || pkg.isEmpty()) return "This app";
        try {
            return getPackageManager().getApplicationLabel(
                    getPackageManager().getApplicationInfo(pkg, 0)).toString();
        } catch (Throwable ignored) {
            if ("com.google.android.youtube".equals(pkg)) return "YouTube";
            if ("com.instagram.android".equals(pkg)) return "Instagram";
            return "This app";
        }
    }

    private GradientDrawable cardBackground() {
        GradientDrawable d = new GradientDrawable(
                GradientDrawable.Orientation.TL_BR,
                new int[]{Color.WHITE, Color.rgb(249, 244, 255)});
        d.setCornerRadius(dp(28));
        d.setStroke(dp(2), Color.rgb(153, 87, 229));
        return d;
    }

    private GradientDrawable infoBackground() {
        GradientDrawable d = new GradientDrawable(
                GradientDrawable.Orientation.TOP_BOTTOM,
                new int[]{Color.rgb(250, 247, 255), Color.rgb(244, 236, 255)});
        d.setCornerRadius(dp(20));
        d.setStroke(1, Color.rgb(225, 211, 244));
        return d;
    }

    private GradientDrawable buttonBackground() {
        GradientDrawable d = new GradientDrawable(
                GradientDrawable.Orientation.LEFT_RIGHT,
                new int[]{Color.rgb(104, 50, 224), Color.rgb(177, 61, 218)});
        d.setCornerRadius(dp(28));
        return d;
    }

    private TextView text(String value, float size, int color, int style) {
        TextView v = new TextView(this);
        v.setText(value);
        v.setTextSize(size);
        v.setTextColor(color);
        v.setTypeface(Typeface.DEFAULT, style);
        return v;
    }

    private LinearLayout.LayoutParams wrap() {
        return new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

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
