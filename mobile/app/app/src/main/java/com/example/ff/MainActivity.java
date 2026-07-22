package com.example.ff;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class MainActivity extends AppCompatActivity {

    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);

        // Инициализация менеджера сессии
        sessionManager = new SessionManager(this);

        // Проверка, авторизован ли пользователь
        if (sessionManager.isLoggedIn()) {
            // Если авторизован, переходим сразу в Main
            Intent intent = new Intent(MainActivity.this, Main.class);
            intent.putExtra("USER_NAME", sessionManager.getUserName());
            startActivity(intent);
            overridePendingTransition(0, 0);
            finish();
            return;
        }

        // Если не авторизован, показываем экран входа
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }

    public void startNewActivity(View view) {
        Intent intent = new Intent(this, MainActivity2.class);
        startActivity(intent);
        overridePendingTransition(0, 0);
        finish();
    }
}