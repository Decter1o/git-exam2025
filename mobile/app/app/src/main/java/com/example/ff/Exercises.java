package com.example.ff;

import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.GridLayout;
import android.widget.ImageView;
import android.widget.ScrollView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.bottomnavigation.BottomNavigationView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Exercises extends AppCompatActivity {
    private RecyclerView recyclerView;
    private ExerciseAdapter adapter;
    private List<ExerciseModel> exerciseList;
    private List<ExerciseModel> filteredList;
    private EditText searchBar;
    private ScrollView categoryScrollView;
    private GridLayout categoryGrid;
    private boolean isFilterVisible = false;
    private Set<String> selectedCategories = new HashSet<>();
    private DatabaseHelper databaseHelper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_exercises);

        databaseHelper = new DatabaseHelper(this);

        recyclerView = findViewById(R.id.recyclerViewExercises);
        searchBar = findViewById(R.id.searchBar);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        categoryScrollView = findViewById(R.id.categoryScrollView);
        categoryGrid = findViewById(R.id.categoryGrid);
        ImageView menuIcon = findViewById(R.id.menuIcon);

        menuIcon.setOnClickListener(v -> toggleCategoryFilter());

        exerciseList = databaseHelper.getAllExercises();
        filteredList = new ArrayList<>(exerciseList);
        adapter = new ExerciseAdapter(this, filteredList);
        recyclerView.setAdapter(adapter);

        setupSearch();
        setupCategoryFilter();
        setupBottomNavigation();
    }

    private void toggleCategoryFilter() {
        if (isFilterVisible) {
            categoryScrollView.setVisibility(View.GONE);
        } else {
            categoryScrollView.setVisibility(View.VISIBLE);
        }
        isFilterVisible = !isFilterVisible;
    }

    private void setupCategoryFilter() {
        categoryGrid.removeAllViews();
        String[] categories = {"Растяжка", "Кардио", "Силовые"};

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
                filterExercises();
            });

            GridLayout.LayoutParams params = new GridLayout.LayoutParams();
            params.setMargins(8, 8, 8, 8);
            categoryGrid.addView(checkBox, params);
        }
    }

    private void setupSearch() {
        searchBar.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {}

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {
                filterExercises();
            }

            @Override
            public void afterTextChanged(Editable editable) {}
        });
    }

    private void filterExercises() {
        String query = searchBar.getText().toString().toLowerCase().trim();
        filteredList.clear();

        for (ExerciseModel exercise : exerciseList) {
            boolean matchesCategory = selectedCategories.isEmpty() || selectedCategories.contains(exercise.getCategory());
            boolean matchesQuery = exercise.getTitle().toLowerCase().contains(query) ||
                    exercise.getDescription().toLowerCase().contains(query);

            if (matchesCategory && matchesQuery) {
                filteredList.add(exercise);
            }
        }

        adapter.notifyDataSetChanged();
    }

    private void setupBottomNavigation() {
        BottomNavigationView bottomNavigationView = findViewById(R.id.bottom_navigation);
        bottomNavigationView.setOnItemSelectedListener(item -> {
            int itemId = item.getItemId();
            if (itemId == R.id.nav_home) {
                startActivity(new Intent(Exercises.this, Main.class));
                overridePendingTransition(0, 0);
                finish();
                return true;
            } else if (itemId == R.id.nav_profile) {
                startActivity(new Intent(Exercises.this, Profile.class));
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
        overridePendingTransition(0, 0);
    }

    @Override
    protected void onDestroy() {
        databaseHelper.close();
        super.onDestroy();
    }
}