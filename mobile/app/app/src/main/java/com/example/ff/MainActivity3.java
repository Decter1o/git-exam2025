package com.example.ff;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

public class MainActivity3 extends AppCompatActivity {

    private String phoneNumber;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main3);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        sessionManager = new SessionManager(this);
        phoneNumber = getIntent().getStringExtra("PHONE_NUMBER");

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                Intent intent = new Intent(MainActivity3.this, MainActivity2.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
                overridePendingTransition(0, 0);
                finish();
            }
        });
    }

    public void startBackActivity(View view) {
        onBackPressed();
    }

    public void startActivity(View view) {
        EditText otpEditText = findViewById(R.id.textPhone);
        String otpCode = otpEditText.getText().toString().trim();

        if (otpCode.isEmpty() || otpCode.length() < 4) {
            Toast.makeText(this, "Введите корректный код из SMS", Toast.LENGTH_SHORT).show();
            return;
        }

        String phoneToSend = phoneNumber.replace("+", "");

        Toast.makeText(this, "Проверка кода...", Toast.LENGTH_SHORT).show();

        new Thread(() -> {
            try {
                JSONObject json = new JSONObject();
                json.put("platform", "mobile");
                json.put("action", "verify");
                json.put("phone", phoneToSend);
                json.put("OTP", otpCode);

                HttpURLConnection connection = (HttpURLConnection) new URL("https://affectionate-mcclintock.89-35-125-20.plesk.page/src/helpers/requestreader.php").openConnection();
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setDoOutput(true);
                connection.setConnectTimeout(5000);
                connection.setReadTimeout(5000);

                try (OutputStream os = connection.getOutputStream()) {
                    byte[] input = json.toString().getBytes(StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                }

                int responseCode = connection.getResponseCode();
                InputStream inputStream = responseCode == 200 ? connection.getInputStream() : connection.getErrorStream();
                String response = new BufferedReader(new InputStreamReader(inputStream))
                        .lines().collect(Collectors.joining("\n"));

                Log.d("SERVER_RESPONSE", "Code: " + responseCode + ", Body: " + response);

                runOnUiThread(() -> {
                    try {
                        JSONObject responseJson = new JSONObject(response);

                        if (responseJson.getBoolean("success")) {
                            JSONObject user = responseJson.getJSONObject("user");
                            String fullName = user.getString("name") + " " + user.getString("surname");

                            sessionManager.createLoginSession(fullName, phoneNumber);

                            if (responseJson.has("visitors_memberships") && responseJson.has("gym_memberships")) {
                                JSONObject membership = responseJson.getJSONObject("visitors_memberships");
                                JSONArray gymMemberships = responseJson.getJSONArray("gym_memberships");

                                int visitsLeft = membership.getInt("visitsLeft");
                                String membershipId = membership.getString("membershipId");
                                String membershipName = "Стандартный абонемент";

                                for (int i = 0; i < gymMemberships.length(); i++) {
                                    JSONObject gymMembership = gymMemberships.getJSONObject(i);
                                    if (gymMembership.getString("id").equals(membershipId)) {
                                        membershipName = gymMembership.getString("type");
                                        break;
                                    }
                                }

                                sessionManager.saveMembershipInfo(membershipName, visitsLeft);
                            }

                            startActivity(new Intent(MainActivity3.this, Main.class));
                            finish();
                        } else {
                            Toast.makeText(MainActivity3.this,
                                    responseJson.optString("message", "Неверный код"),
                                    Toast.LENGTH_SHORT).show();
                        }
                    } catch (Exception e) {
                        Toast.makeText(MainActivity3.this,
                                "Ошибка: " + e.getMessage(),
                                Toast.LENGTH_SHORT).show();
                        Log.e("PARSE_ERROR", "Error parsing response", e);
                    }
                });

            } catch (Exception e) {
                runOnUiThread(() -> {
                    Toast.makeText(MainActivity3.this,
                            "Ошибка сети: " + e.getMessage(),
                            Toast.LENGTH_SHORT).show();
                    Log.e("NETWORK_ERROR", "Network error", e);
                });
            }
        }).start();
    }
}