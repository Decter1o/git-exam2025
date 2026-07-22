package com.example.ff;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Bundle;
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

public class FAQ extends AppCompatActivity {

    private BottomNavigationView bottomNavigationView;

    @SuppressLint("MissingInflatedId")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_faq);
        EdgeToEdge.enable(this);

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
        // Связываем нижнее меню
        bottomNavigationView = findViewById(R.id.bottom_navigation);

        // Устанавливаем активный пункт меню
        bottomNavigationView.setSelectedItemId(R.id.nav_profile);

        bottomNavigationView.setOnItemSelectedListener(item -> {
            int itemId = item.getItemId();
            if (itemId == R.id.nav_home) {
                startActivity(new Intent(this, Main.class));
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
                startActivity(new Intent(this, Profile.class));
                overridePendingTransition(0, 0);
                finish();
                return true;
            }
            return false;
        });

        // Настройка FAQ
        setupFAQToggle(R.id.question1, R.id.answer1);
        setupFAQToggle(R.id.question2, R.id.answer2);
        setupFAQToggle(R.id.question3, R.id.answer3);
        setupFAQToggle(R.id.question4, R.id.answer4);
    }

    private void setupFAQToggle(int questionId, int answerId) {
        TextView question = findViewById(questionId);
        TextView answer = findViewById(answerId);

        question.setOnClickListener(v -> {
            if (answer.getVisibility() == View.GONE) {
                answer.setVisibility(View.VISIBLE);
            } else {
                answer.setVisibility(View.GONE);
            }
        });
    }

    public void BackProfile(View view) {
        Intent intent = new Intent(this, Profile.class);
        startActivity(intent);
        overridePendingTransition(0, 0);
    }
}
