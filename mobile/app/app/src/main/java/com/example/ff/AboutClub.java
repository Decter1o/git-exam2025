package com.example.ff;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class AboutClub extends AppCompatActivity {

    private final String phoneNumber3 = "+7 707 635 2020";
    private final String phoneNumber4 = "+7 747 303 6555";
    private final String emailAddress = "FitnessFamily@mail.ru";
    private static final String TAG = "AboutClub";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_about_club);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        @SuppressLint({"MissingInflatedId", "LocalSuppress"})
        BottomNavigationView bottomNavigationView = findViewById(R.id.bottom_navigation);
        ViewCompat.setOnApplyWindowInsetsListener(bottomNavigationView, (v, insets) -> {
            v.setPadding(0, 0, 0, 0);
            return WindowInsetsCompat.CONSUMED;
        });

        // Устанавливаем активный пункт меню
        bottomNavigationView.setSelectedItemId(R.id.nav_profile);

        bottomNavigationView.setOnItemSelectedListener(item -> {
            int itemId = item.getItemId();
            if (itemId == R.id.nav_home) {
                startActivity(new Intent(AboutClub.this, Main.class));
                overridePendingTransition(0, 0);
                finish();
                return true;
            } else if (itemId == R.id.nav_schedule) {
                new Thread(() -> {
                    try {
                        URL url = new URL("https://affectionate-mcclintock.89-35-125-20.plesk.page/src/helpers/requestreader.php?platform=mobile&action=get_schedule");
                        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                        connection.setRequestMethod("GET");
                        connection.setConnectTimeout(5000);
                        connection.setReadTimeout(5000);

                        BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                        StringBuilder sb = new StringBuilder();
                        String line;
                        while ((line = reader.readLine()) != null) {
                            sb.append(line);
                        }

                        JSONObject root = new JSONObject(sb.toString());
                        JSONArray schedule = root.getJSONArray("schedule");

                        runOnUiThread(() -> {
                            Intent intent = new Intent(this, ScheduleActivity.class);
                            intent.putExtra("schedule_json", schedule.toString());
                            startActivity(intent);
                            overridePendingTransition(0, 0);
                        });


                    } catch (Exception e) {
                        runOnUiThread(() ->
                                Toast.makeText(this, "Ошибка запроса: " + e.getMessage(), Toast.LENGTH_LONG).show()
                        );
                    }
                }).start();
                return true;
            } else if (itemId == R.id.nav_profile) {
                startActivity(new Intent(AboutClub.this, Profile.class));
                overridePendingTransition(0, 0);
                finish();
                return true;
            }
            return false;
        });

        // Обработчик клика по телефону
        TextView phoneTextView = findViewById(R.id.tv_phone);
        if (phoneTextView != null) {
            phoneTextView.setOnClickListener(v -> {
                Log.d(TAG, "Телефон нажат");
                showCallConfirmationDialog();
            });
        }

        // Обработчик клика по email
        TextView emailTextView = findViewById(R.id.tv_email);
        if (emailTextView != null) {
            emailTextView.setOnClickListener(v -> {
                Log.d(TAG, "Email нажат");
                showEmailConfirmationDialog();
            });
        }

// Обработчик клика по WhatsApp (первый номер)
        TextView whatsappTextView1 = findViewById(R.id.textView7_whatsapp);
        if (whatsappTextView1 != null) {
            whatsappTextView1.setOnClickListener(v -> {
                Log.d(TAG, "WhatsApp нажат (номер 1)");
                openWhatsApp("+7 747 303 6555");
            });
        }

// Обработчик клика по WhatsApp (второй номер)
        TextView whatsappTextView2 = findViewById(R.id.textView8_whatsapp);
        if (whatsappTextView2 != null) {
            whatsappTextView2.setOnClickListener(v -> {
                Log.d(TAG, "WhatsApp нажат (номер 2)");
                openWhatsApp("+7 707 635 2020");
            });
        }

        // Обработчик клика по Instagram
        TextView instagramTextView = findViewById(R.id.textView7_instagram);
        if (instagramTextView != null) {
            instagramTextView.setOnClickListener(v -> {
                Log.d(TAG, "Instagram нажат");
                openInstagram("https://www.instagram.com/fitness_family_centre/");
            });
        }
    }

    private void showCallConfirmationDialog() {
        new AlertDialog.Builder(this)
                .setTitle("Подтверждение вызова")
                .setMessage("Вы хотите позвонить на номер " + phoneNumber3 + "?")
                .setPositiveButton("Позвонить", (dialog, which) -> {
                    Log.d(TAG, "Пользователь подтвердил звонок");
                    Intent callIntent = new Intent(Intent.ACTION_DIAL);
                    callIntent.setData(Uri.parse("tel:" + phoneNumber3));
                    startActivity(callIntent);
                })
                .setNegativeButton("Отмена", (dialog, which) -> Log.d(TAG, "Пользователь отменил звонок"))
                .show();
    }

    private void showEmailConfirmationDialog() {
        new AlertDialog.Builder(this)
                .setTitle("Отправка письма")
                .setMessage("Отправить email на " + emailAddress + "?")
                .setPositiveButton("Отправить", (dialog, which) -> {
                    Log.d(TAG, "Пользователь отправляет email");
                    Intent emailIntent = new Intent(Intent.ACTION_SENDTO);
                    emailIntent.setData(Uri.parse("mailto:" + emailAddress));
                    startActivity(emailIntent);
                })
                .setNegativeButton("Отмена", (dialog, which) -> Log.d(TAG, "Пользователь отменил отправку email"))
                .show();
    }

    private void openWhatsApp(String phone) {
        try {
            String url = "https://wa.me/" + phone.replace("+", "").replace(" ", "");
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse(url));
            startActivity(intent);
        } catch (Exception e) {
            Log.e(TAG, "Ошибка при открытии WhatsApp", e);
        }
    }

    private void openInstagram(String url) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse(url));
            intent.setPackage("com.instagram.android");
            startActivity(intent);
        } catch (Exception e) {
            Log.w(TAG, "Instagram не установлен, открываем в браузере");
            Intent webIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            startActivity(webIntent);
        }
    }

    public void BackProfile(View view) {
        Intent intent = new Intent(this, Profile.class);
        startActivity(intent);
        overridePendingTransition(0, 0);
    }
}
