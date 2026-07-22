package com.example.ff;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.graphics.PorterDuff;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.viewpager2.widget.ViewPager2;

import java.util.ArrayList;

public class TrenerProfileActivity extends AppCompatActivity {

    private static final String TAG = "TrenerProfileActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_trener_profile);

        // Получаем данные тренера
        Intent intent = getIntent();
        String name = intent.getStringExtra("name");
        String surname = intent.getStringExtra("surname");
        String description = intent.getStringExtra("description");
        String instagramUrl = intent.getStringExtra("instagramUrl");
        String whatsappNumber = intent.getStringExtra("whatsappNumber");
        String telegramUrl = "https://" + intent.getStringExtra("telegramUrl");
        ArrayList<String> photosList = intent.getStringArrayListExtra("photos");
        int cardColor = intent.getIntExtra("cardColor", Color.parseColor("#FFE0B2"));

        // Установка цвета кнопки
        Button backButton = findViewById(R.id.button4);
        backButton.setBackgroundColor(cardColor);

        // Установка фона с изменённым цветом
        setBackgroundColor(cardColor);

        // Инициализация UI
        String fullName = name + " " + surname;
        initViews(fullName, description, photosList);
        setupSocialButtons(instagramUrl, whatsappNumber, telegramUrl);
    }

    private void setBackgroundColor(int cardColor) {
        View backgroundView = findViewById(R.id.backgroundView);
        Drawable drawable = ContextCompat.getDrawable(this, R.drawable.blob_shape);

        if (drawable != null) {
            drawable.setColorFilter(cardColor, PorterDuff.Mode.SRC_IN);
        }

        backgroundView.setBackground(drawable);
    }

    private void initViews(String fullName, String description, ArrayList<String> photosList) {
        TextView nameTextView = findViewById(R.id.trenerName);
        TextView positionTextView = findViewById(R.id.trenerPosition);

        nameTextView.setText(fullName);
        positionTextView.setText(description);

        ViewPager2 viewPager = findViewById(R.id.viewPager);

        if (photosList != null && !photosList.isEmpty()) {
            TrenerPhotosAdapter adapter = new TrenerPhotosAdapter(this, photosList);
            viewPager.setAdapter(adapter);

            if (photosList.size() > 1) {
                viewPager.setCurrentItem(1, false);
            }

            setupViewPager(viewPager);
        } else {
            Log.w(TAG, "No photos available");
            viewPager.setVisibility(View.GONE);
        }
    }

    private void setupViewPager(ViewPager2 viewPager) {
        int padding = getResources().getDimensionPixelSize(R.dimen.viewpager_padding);
        viewPager.setPadding(padding, 0, padding, 0);
        viewPager.setClipToPadding(false);
        viewPager.setClipChildren(false);
        viewPager.setOffscreenPageLimit(3);

        viewPager.setPageTransformer((page, position) -> {
            float absPos = Math.abs(position);
            float scale = 0.85f + (1 - absPos) * 0.15f;
            page.setScaleY(scale);
            page.setAlpha(0.5f + (1 - absPos));
        });
    }

    private void setupSocialButtons(String instagramUrl, String whatsappNumber, String telegramUrl) {
        ImageButton btnInstagram = findViewById(R.id.btnInstagram);
        ImageButton btnWhatsapp = findViewById(R.id.btnWhatsapp);
        ImageButton btnTelegram = findViewById(R.id.btnTelegram);

        btnInstagram.setOnClickListener(v -> openSocialLink(instagramUrl, "Instagram"));
        btnWhatsapp.setOnClickListener(v -> openSocialLink(whatsappNumber, "WhatsApp"));
        btnTelegram.setOnClickListener(v -> openSocialLink(telegramUrl, "Telegram"));
    }

    private void openSocialLink(String url, String socialName) {
        if (url != null && !url.isEmpty()) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
            } catch (Exception e) {
                showToast("Не удалось открыть " + socialName);
                Log.e(TAG, "Error opening " + socialName + " link", e);
            }
        } else {
            showToast(socialName + " ссылка недоступна");
        }
    }

    private void showToast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    public void GoBack(View view) {
        finish();
        overridePendingTransition(0, 0);
    }
}
