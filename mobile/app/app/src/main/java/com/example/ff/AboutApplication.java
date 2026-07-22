package com.example.ff;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
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

public class AboutApplication extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_about_application);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });


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
                startActivity(new Intent(AboutApplication.this, Main.class));
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
                startActivity(new Intent(AboutApplication.this, Profile.class));
                overridePendingTransition(0, 0);
                finish();
                return true;
            }
            return false;
        });

    }

    // Переопределяем кнопку "Назад"
    @Override
    public void onBackPressed() {
        Intent intent = new Intent(AboutApplication.this, Profile.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
        overridePendingTransition(0, 0);
        finish();

        // Вызов оригинальной реализации "Назад"
        super.onBackPressed();
    }

    public void BackProfile(View view) {
        Intent intent = new Intent(this, Profile.class);
        startActivity(intent);
        overridePendingTransition(0, 0);
    }

}
