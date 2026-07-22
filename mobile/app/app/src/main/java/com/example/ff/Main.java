package com.example.ff;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.viewpager2.widget.ViewPager2;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import java.util.Arrays;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONObject;

import android.widget.Toast;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import android.graphics.Color;


public class Main extends AppCompatActivity {
    private ViewPager2 viewPager;
    private List<Integer> images = Arrays.asList(
            R.drawable.scroll3,
            R.drawable.scroll2,
            R.drawable.scroll1
    );
    private Handler handler = new Handler(Looper.getMainLooper());
    private Runnable slideRunnable;
    private View notificationBadge;
    private boolean hasNotifications = false;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.main);

        // Инициализация менеджера сессии
        sessionManager = new SessionManager(this);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, 0);
            return insets;
        });

        // Получаем имя пользователя из сессии
        String userName = sessionManager.getUserName();

        BottomNavigationView bottomNavigationView = findViewById(R.id.bottom_navigation);
        bottomNavigationView.setOnItemSelectedListener(item -> {
            int itemId = item.getItemId();
            if (itemId == R.id.nav_home) {
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
                            Intent intent = new Intent(Main.this, ScheduleActivity.class);
                            intent.putExtra("schedule_json", schedule.toString());
                            startActivity(intent);
                            overridePendingTransition(0, 0);
                        });


                    } catch (Exception e) {
                        runOnUiThread(() ->
                                Toast.makeText(Main.this, "Ошибка запроса: " + e.getMessage(), Toast.LENGTH_LONG).show()
                        );
                    }
                }).start();
                return true;
            } else if (itemId == R.id.nav_profile) {
                Intent profileIntent = new Intent(Main.this, Profile.class);
                if (userName != null) {
                    profileIntent.putExtra("USER_NAME", userName);
                }
                startActivity(profileIntent);
                overridePendingTransition(0, 0);
                finish();
                return true;
            }
            return false;
        });

        viewPager = findViewById(R.id.viewPager);
        viewPager.setAdapter(new ImageAdapter(images, this));
        viewPager.setOffscreenPageLimit(3);

        viewPager.setPageTransformer((page, position) -> {
            float absPos = Math.abs(position);
            page.setAlpha(1.0f - absPos * 0.3f);
            page.setScaleY(1.0f - 0.05f * absPos);
        });

        startAutoSlide();

        notificationBadge = findViewById(R.id.notification_badge);
        updateNotificationBadge();
    }

    private void startAutoSlide() {
        slideRunnable = new Runnable() {
            @Override
            public void run() {
                int nextItem = (viewPager.getCurrentItem() + 1) % images.size();
                viewPager.setCurrentItem(nextItem, true);
                handler.postDelayed(this, 7000);
            }
        };
        handler.postDelayed(slideRunnable, 7000);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        handler.removeCallbacks(slideRunnable);
    }

    private void updateNotificationBadge() {
        if (hasNotifications) {
            notificationBadge.setVisibility(View.VISIBLE);
        } else {
            notificationBadge.setVisibility(View.GONE);
        }
    }

    public void onNewNotification() {
        hasNotifications = true;
        updateNotificationBadge();
    }

    public void clearNotifications() {
        hasNotifications = false;
        updateNotificationBadge();
    }

    public void startExercise(View view) {
        Intent intent = new Intent(this, Exercises.class);
        startActivity(intent);
        overridePendingTransition(0, 0);
    }

    public void startTreners(View view) {
        new Thread(() -> {
            try {
                URL url = new URL("https://affectionate-mcclintock.89-35-125-20.plesk.page/src/helpers/requestreader.php?platform=mobile&action=get_trainer");
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
                JSONArray trainers = root.getJSONArray("trainers");

                runOnUiThread(() -> {
                    Intent intent = new Intent(Main.this, activity_treners.class);
                    intent.putExtra("trainers_json", trainers.toString());
                    startActivity(intent);
                    overridePendingTransition(0, 0);
                });

            } catch (Exception e) {
                runOnUiThread(() ->
                        Toast.makeText(Main.this, "Ошибка запроса: " + e.getMessage(), Toast.LENGTH_LONG).show()
                );
            }
        }).start();
    }


    public void startAboniment(View view) {
        new Thread(() -> {
            try {
                URL url = new URL("https://affectionate-mcclintock.89-35-125-20.plesk.page/src/helpers/requestreader.php?platform=mobile&action=get_membership");
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

                JSONArray gymMemberships = new JSONArray(sb.toString());

                runOnUiThread(() -> {
                    Intent intent = new Intent(Main.this, SubscriptionsActivity.class);
                    intent.putExtra("memberships_json", gymMemberships.toString());
                    startActivity(intent);
                    overridePendingTransition(0, 0);
                });


            } catch (Exception e) {
                runOnUiThread(() ->
                        Toast.makeText(Main.this, "Ошибка запроса: " + e.getMessage(), Toast.LENGTH_LONG).show()
                );
            }
        }).start();
    }


    public void startAboutClub(View view) {
        Intent intent = new Intent(this, AboutClub.class);
        startActivity(intent);
        overridePendingTransition(0, 0);
    }

    @Override
    public void onBackPressed() {
        new androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Выход из приложения")
                .setMessage("Вы уверены, что хотите выйти?")
                .setPositiveButton("Да", (dialog, which) -> {
                    super.onBackPressed();
                    finishAffinity();
                })
                .setNegativeButton("Нет", (dialog, which) -> dialog.dismiss())
                .show();
    }
}