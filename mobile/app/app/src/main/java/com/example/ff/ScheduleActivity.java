package com.example.ff;

import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.widget.EditText;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class ScheduleActivity extends AppCompatActivity {
    private RecyclerView scheduleRecyclerView;
    private ScheduleAdapter scheduleAdapter;
    private EditText searchBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_schedule);

        // Инициализация RecyclerView
        scheduleRecyclerView = findViewById(R.id.recyclerViewSchedule);
        scheduleRecyclerView.setLayoutManager(new LinearLayoutManager(this));


        String scheduleJson = getIntent().getStringExtra("schedule_json");
        List<ScheduleItem> scheduleList = new ArrayList<>();
        try {
            String[] lightColors = {
                    "#FCC1A3", // светло-персиковый
                    "#D9A18A", // светло-розовато-коричневый
                    "#A3E9FC", // светло-голубой
                    "#A3FCA3", // светло-зелёный
                    "#90F790"  // светло-зелёный (чуть ярче)
            };

            String[] colors = {
                    "#FCC1A3", "#D9A18A", "#C58871",
                    "#A3E9FC", "#78C4E8", "#60B0DA",
                    "#A3FCA3", "#90F790", "#78E878",
                    "#60DA60", "#999EFF", "#7A85FF",
                    "#5A64CC"
            };
            JSONArray jsonArray = new JSONArray(scheduleJson);
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject obj = jsonArray.getJSONObject(i);

                Random random = new Random();
                String randomColor = lightColors[random.nextInt(lightColors.length)];

                ScheduleItem item = new ScheduleItem(
                        obj.getString("day_of_week"),
                        obj.getString("start_time").substring(0, 5),
                        obj.getString("end_time").substring(0, 5),
                        obj.getString("training_type"),
                        obj.getString("trainer"),
                        obj.getString("room_name"),
                        Color.parseColor(randomColor),  // Цвет для карточки
                        obj.getString("category")
                );

                scheduleList.add(item);
            }
        } catch (JSONException e) {
            e.printStackTrace();
            Toast.makeText(this, "Ошибка обработки данных расписания", Toast.LENGTH_LONG).show();
        }


        scheduleAdapter = new ScheduleAdapter(scheduleList);
        scheduleRecyclerView.setAdapter(scheduleAdapter);

        // Инициализация поля для поиска
        searchBar = findViewById(R.id.searchBar);
        searchBar.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence charSequence, int start, int before, int count) {
                scheduleAdapter.filter(charSequence.toString()); // Фильтрация по введенной строке
            }

            @Override
            public void afterTextChanged(Editable editable) {}
        });

        // Навигационное меню
        BottomNavigationView bottomNavigationView = findViewById(R.id.bottom_navigation);
        bottomNavigationView.setSelectedItemId(R.id.nav_schedule); // Подсвечиваем текущий пункт меню (расписание)

        bottomNavigationView.setOnItemSelectedListener(item -> {
            int itemId = item.getItemId();
            if (itemId == R.id.nav_home) {
                // Переход на главную страницу
                startActivity(new Intent(ScheduleActivity.this, Main.class));
                overridePendingTransition(0, 0); // Анимация перехода
                finish(); // Закрытие текущей активности
                return true;
            } else if (itemId == R.id.nav_schedule) {
                return true;
            } else if (itemId == R.id.nav_profile) {
                // Переход на страницу профиля
                startActivity(new Intent(ScheduleActivity.this, Profile.class));
                overridePendingTransition(0, 0);
                finish(); // Закрытие текущей активности
                return true;
            }
            return false;
        });
    }
}
