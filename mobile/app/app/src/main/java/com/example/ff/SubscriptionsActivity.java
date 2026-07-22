package com.example.ff;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;


import org.json.JSONArray;
import org.json.JSONObject;

public class SubscriptionsActivity extends AppCompatActivity {
    private RecyclerView recyclerView;
    private SubscriptionAdapter adapter;
    private List<SubscriptionModel> subscriptionList;
    private EditText searchBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_subscriptions);

        deleteDatabase("subscriptions.db");

        recyclerView = findViewById(R.id.recyclerViewSubscriptions);
        searchBar = findViewById(R.id.searchBar);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

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

            String json = getIntent().getStringExtra("memberships_json");
            JSONArray array = new JSONArray(json);

            subscriptionList = new ArrayList<>();
            for (int i = 0; i < array.length(); i++) {
                JSONObject obj = array.getJSONObject(i);
                String type = obj.getString("type");
                String specialGroup = obj.getString("specialGroup");
                if ("нет абонемента".equalsIgnoreCase(type)) {
                    continue;
                }

                String capitalizedType = type.substring(0, 1).toUpperCase() + type.substring(1);
                String capitalizedSpecialGroup = specialGroup.substring(0, 1).toUpperCase() + specialGroup.substring(1);
                String priceRaw = obj.getString("price");
                double priceValue = Double.parseDouble(priceRaw);
                String formattedPrice = (priceValue % 1 == 0) ?
                        ((int) priceValue) + " тг" : priceValue + " тг";

                Random random = new Random();
                String randomColor = lightColors[random.nextInt(lightColors.length)];

                subscriptionList.add(new SubscriptionModel(
                        obj.getString("id"),
                        capitalizedType,
                        obj.getString("duration"),
                        formattedPrice,
                        capitalizedSpecialGroup,
                        android.graphics.Color.parseColor(randomColor)
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            subscriptionList = new ArrayList<>();
        }

        adapter = new SubscriptionAdapter(this, subscriptionList);
        recyclerView.setAdapter(adapter);

        setupSearch();
        setupBottomNavigation();
    }

    private void setupSearch() {
        searchBar.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void afterTextChanged(Editable s) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {
                filterSubscriptions(s.toString());
            }
        });
    }

    private void filterSubscriptions(String query) {
        List<SubscriptionModel> filtered = new ArrayList<>();
        for (SubscriptionModel sub : subscriptionList) {
            if (sub.getTitle().toLowerCase().contains(query.toLowerCase()) || sub.getSpecialGroup().toLowerCase().contains(query.toLowerCase())) {
                filtered.add(sub);
            }
        }
        adapter = new SubscriptionAdapter(this, filtered);
        recyclerView.setAdapter(adapter);
    }

    private void setupBottomNavigation() {
        BottomNavigationView nav = findViewById(R.id.bottom_navigation);
        nav.setOnItemSelectedListener(item -> {
            if (item.getItemId() == R.id.nav_home) {
                startActivity(new Intent(this, Main.class));
                overridePendingTransition(0, 0);
                finish();
                return true;
            } else if (item.getItemId() == R.id.nav_profile) {
                startActivity(new Intent(this, Profile.class));
                overridePendingTransition(0, 0);
                finish();
                return true;
            } else if (item.getItemId() == R.id.nav_schedule) {
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
            }
            return false;
        });
    }

    public void GoBack(View view) {
        finish();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }
}
