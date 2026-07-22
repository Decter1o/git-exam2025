package com.example.ff;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.TextView;
import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;

public class VideoActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_video);

        // Получаем данные из Intent
        Intent intent = getIntent();
        String videoId = intent.getStringExtra("videoId");
        String title = intent.getStringExtra("title");
        String description = intent.getStringExtra("description");
        int color = intent.getIntExtra("color", Color.WHITE);

        // Если есть полное описание, заменяем
        if (Descriptions.FULL_DESCRIPTIONS.containsKey(description)) {
            description = Descriptions.FULL_DESCRIPTIONS.get(description);
        }

        // Находим элементы
        TextView titleTextView = findViewById(R.id.textView);
        TextView descriptionTextView = findViewById(R.id.textView5);
        View backgroundView = findViewById(R.id.backgroundView);
        View yellowBar = findViewById(R.id.yellowBar);
        Button backButton = findViewById(R.id.button3);
        WebView webView = findViewById(R.id.webView);

        // Устанавливаем данные
        if (titleTextView != null) titleTextView.setText(title);
        if (descriptionTextView != null) descriptionTextView.setText(description);

        // Устанавливаем цвет без потери закругления
        if (backgroundView != null) {
            GradientDrawable drawable = (GradientDrawable) backgroundView.getBackground().mutate();
            drawable.setColor(color);
            backgroundView.setBackground(drawable);
        }

        if (yellowBar != null) yellowBar.setBackgroundColor(color);
        if (backButton != null) backButton.setBackgroundColor(color);

        // Настройка WebView
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webView.setWebViewClient(new WebViewClient());

        String embedUrl = "https://www.youtube.com/embed/" + videoId + "?autoplay=1&modestbranding=1&showinfo=0&controls=1";
        String iframe = "<html><body style=\"margin:0;padding:0;\"><iframe width=\"100%\" height=\"100%\" " +
                "src=\"" + embedUrl + "\" frameborder=\"0\" allowfullscreen></iframe></body></html>";

        webView.loadData(iframe, "text/html", "utf-8");
    }

    public void GoBack(View view) {
        finish();
        overridePendingTransition(0, 0);
    }
}