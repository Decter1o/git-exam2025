package com.example.ff;

import android.graphics.Color;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.View;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.GridLayout;
import android.widget.ImageView;
import android.widget.ScrollView;
import android.content.Intent;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

public class activity_treners extends AppCompatActivity {
    private RecyclerView recyclerView;
    private TrenersAdapter adapter;
    private List<TrenerModel> trenersList = new ArrayList<>();
    private List<TrenerModel> filteredList = new ArrayList<>();
    private EditText searchBar;
    private ScrollView categoryScrollView;
    private GridLayout categoryGrid;
    private boolean isFilterVisible = false;
    private Set<String> selectedCategories = new HashSet<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_treners);

        recyclerView = findViewById(R.id.recyclerViewExercises);
        searchBar = findViewById(R.id.searchBar);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        categoryScrollView = findViewById(R.id.categoryScrollView);
        categoryGrid = findViewById(R.id.categoryGrid);
        ImageView menuIcon = findViewById(R.id.menuIcon);

        menuIcon.setOnClickListener(v -> toggleCategoryFilter());

        String jsonString = getIntent().getStringExtra("trainers_json");
        if (jsonString != null) {
            trenersList = parseTrainersJson(jsonString);
            filteredList = new ArrayList<>(trenersList);
        }

        adapter = new TrenersAdapter(this, filteredList);
        recyclerView.setAdapter(adapter);

        setupCategoryFilter();
        setupSearch();
        setupBottomNavigation();
    }

    public List<TrenerModel> parseTrainersJson(String jsonString) {
        List<TrenerModel> trenersList = new ArrayList<>();

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
            // Парсим как JSONArray, так как это массив объектов
            JSONArray trainersArray = new JSONArray(jsonString);

            for (int i = 0; i < trainersArray.length(); i++) {
                JSONObject trainerObject = trainersArray.getJSONObject(i);

                String name = trainerObject.optString("name");
                String surname = trainerObject.optString("surname");
                String description = trainerObject.optString("description");

                List<String> photoUrls = new ArrayList<>();
                if (trainerObject.has("images")) {
                    JSONArray imagesArray = trainerObject.getJSONArray("images");
                    for (int j = 0; j < imagesArray.length(); j++) {
                        String imageUrl = imagesArray.optString(j);
                        if (imageUrl != null && !imageUrl.isEmpty()) {
                            photoUrls.add(imageUrl);
                        }
                    }
                }

                Random random = new Random();
                String randomColor = lightColors[random.nextInt(lightColors.length)];

                TrenerModel trener = new TrenerModel(
                        trainerObject.optString("id"),
                        name,
                        surname,
                        trainerObject.optString("phone_number"),
                        trainerObject.optString("training_type"),
                        trainerObject.optString("instagram"),
                        trainerObject.optString("whatsapp"),
                        trainerObject.optString("telegram"),
                        description,
                        Color.parseColor(randomColor),  // Цвет для карточки
                        photoUrls
                );
                trenersList.add(trener);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return trenersList;
    }



    private void toggleCategoryFilter() {
        categoryScrollView.setVisibility(isFilterVisible ? View.GONE : View.VISIBLE);
        isFilterVisible = !isFilterVisible;
    }

    private void setupCategoryFilter() {
        categoryGrid.removeAllViews();

        new Thread(() -> {
            try {
                URL url = new URL("https://affectionate-mcclintock.89-35-125-20.plesk.page/src/helpers/requestreader.php?platform=mobile&action=get_training_type");
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

                JSONArray schedule = new JSONArray(sb.toString());
                List<String> categories = new ArrayList<>();

                for (int i = 0; i < schedule.length(); i++) {
                    JSONObject item = schedule.getJSONObject(i);
                    String name = item.getString("name");
                    categories.add(name);
                }

                // UI-обновление в главном потоке
                runOnUiThread(() -> {
                    for (String category : categories) {
                        CheckBox checkBox = new CheckBox(this);
                        checkBox.setText(category);
                        checkBox.setTextSize(16);
                        checkBox.setTextColor(Color.BLACK);
                        checkBox.setPadding(8, 8, 8, 8);
                        checkBox.setChecked(selectedCategories.contains(category));

                        checkBox.setOnCheckedChangeListener((buttonView, isChecked) -> {
                            if (isChecked) {
                                selectedCategories.add(category);
                            } else {
                                selectedCategories.remove(category);
                            }
                            filterTreners();
                        });

                        GridLayout.LayoutParams params = new GridLayout.LayoutParams();
                        params.setMargins(8, 8, 8, 8);
                        categoryGrid.addView(checkBox, params);
                    }
                });

            } catch (Exception e) {
                runOnUiThread(() ->
                        Toast.makeText(this, "Ошибка запроса: " + e.getMessage(), Toast.LENGTH_LONG).show()
                );
            }
        }).start();
    }


    private void setupSearch() {
        searchBar.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {}

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {
                filterTreners();
            }

            @Override
            public void afterTextChanged(Editable editable) {}
        });
    }

    private void filterTreners() {
        if (trenersList == null) return;

        String query = searchBar.getText().toString().toLowerCase().trim();
        filteredList.clear();

        for (TrenerModel trener : trenersList) {
            boolean matchesCategory = selectedCategories.isEmpty() ||
                    selectedCategories.contains(trener.getTrainingType());
            boolean matchesQuery = trener.getName().toLowerCase().contains(query) ||
                    trener.getTrainingType().toLowerCase().contains(query);

            if (matchesCategory && matchesQuery) {
                filteredList.add(trener);
            }
        }

        adapter.notifyDataSetChanged();
    }

    private void setupBottomNavigation() {
        BottomNavigationView bottomNavigationView = findViewById(R.id.bottom_navigation);
        bottomNavigationView.setOnItemSelectedListener(item -> {
            int itemId = item.getItemId();
            if (itemId == R.id.nav_home) {
                startActivity(new Intent(this, Main.class));
                overridePendingTransition(0, 0);
                finish();
                return true;
            } else if (itemId == R.id.nav_profile) {
                startActivity(new Intent(this, Profile.class));
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
            }
            return false;
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }

    public void GoBack(View view) {
        finish();
        overridePendingTransition(0, 0);
    }
}
