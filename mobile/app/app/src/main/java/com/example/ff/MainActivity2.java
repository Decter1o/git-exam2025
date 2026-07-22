package com.example.ff;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.TextPaint;
import android.text.method.LinkMovementMethod;
import android.text.style.ClickableSpan;
import android.view.View;
import androidx.annotation.NonNull;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.activity.EdgeToEdge;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import android.graphics.Color;

import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class MainActivity2 extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main2);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        // Настройка кликабельных ссылок
        TextView textView = findViewById(R.id.textView3);
        String text = "Продолжая, вы соглашаетесь с обработкой Персональных данных и Пользовательским соглашением";
        SpannableString spannableString = new SpannableString(text);

        ClickableSpan personalDataClick = new ClickableSpan() {
            @Override
            public void onClick(@NonNull View widget) {
                Toast.makeText(MainActivity2.this, "Персональные данные", Toast.LENGTH_SHORT).show();
            }
            @Override
            public void updateDrawState(@NonNull TextPaint ds) {
                super.updateDrawState(ds);
                ds.setUnderlineText(false);
                ds.setColor(Color.parseColor("#F98346"));
            }
        };

        ClickableSpan userAgreementClick = new ClickableSpan() {
            @Override
            public void onClick(@NonNull View widget) {
                Toast.makeText(MainActivity2.this, "Пользовательское соглашение", Toast.LENGTH_SHORT).show();
            }
            @Override
            public void updateDrawState(@NonNull TextPaint ds) {
                super.updateDrawState(ds);
                ds.setUnderlineText(false);
                ds.setColor(Color.parseColor("#F98346"));
            }
        };

        spannableString.setSpan(personalDataClick, 40, 59, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        spannableString.setSpan(userAgreementClick, 62, 90, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);

        textView.setText(spannableString);
        textView.setMovementMethod(LinkMovementMethod.getInstance());
        textView.setHighlightColor(Color.TRANSPARENT);

        // Настройка поля ввода телефона
        EditText editTextPhone = findViewById(R.id.TextPhone);
        editTextPhone.addTextChangedListener(new android.text.TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence charSequence, int start, int before, int count) {
                if (!charSequence.toString().startsWith("+7")) {
                    String phone = charSequence.toString()
                            .replaceAll("[^0-9]", "");
                    if (phone.length() > 0) {
                        phone = "+7" + (phone.length() > 1 ? phone.substring(1) : "");
                        editTextPhone.setText(phone);
                        editTextPhone.setSelection(phone.length());
                    }
                }
            }

            @Override
            public void afterTextChanged(Editable editable) {}
        });

        // Обработка кнопки "Назад"
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                Intent intent = new Intent(MainActivity2.this, MainActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
                overridePendingTransition(0, 0);
                finish();
            }
        });
    }

    public void startNewActivity(View view) {
        EditText phoneEditText = findViewById(R.id.TextPhone);
        String phoneNumber = phoneEditText.getText().toString().trim();

        if (phoneNumber.isEmpty() || phoneNumber.length() < 12) {
            Toast.makeText(this, "Введите корректный номер телефона", Toast.LENGTH_SHORT).show();
            return;
        }

        // Убираем + из номера для отправки
        String phoneToSend = phoneNumber.replace("+", "");

        // Показываем уведомление о отправке
        Toast.makeText(this, "Отправка кода...", Toast.LENGTH_SHORT).show();

        new Thread(() -> {
            try {
                JSONObject json = new JSONObject();
                json.put("platform", "mobile");
                json.put("action", "auth");
                json.put("phone", phoneToSend);

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
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    runOnUiThread(() -> {
                        Intent intent = new Intent(MainActivity2.this, MainActivity3.class);
                        intent.putExtra("PHONE_NUMBER", phoneNumber);
                        startActivity(intent);
                        overridePendingTransition(0, 0);
                        finish();
                    });
                } else {
                    runOnUiThread(() ->
                            Toast.makeText(MainActivity2.this, "Ошибка: сервер вернул код " + responseCode, Toast.LENGTH_SHORT).show());
                }
            } catch (Exception e) {
                runOnUiThread(() ->
                        Toast.makeText(MainActivity2.this, "Ошибка сети: " + e.getMessage(), Toast.LENGTH_SHORT).show());
            }
        }).start();
    }
}