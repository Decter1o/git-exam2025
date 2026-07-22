package com.example.ff;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import androidx.annotation.NonNull;
import java.util.ArrayList;
import android.graphics.Color;
import java.util.List;

public class DatabaseHelper extends SQLiteOpenHelper {
    private static final String DATABASE_NAME = "fitness_app.db";
    private static final int DATABASE_VERSION = 10;

    // Таблица упражнений
    private static final String TABLE_EXERCISES = "exercises";
    private static final String COLUMN_EX_ID = "id";
    private static final String COLUMN_EX_TITLE = "title";
    private static final String COLUMN_EX_DESCRIPTION = "description";
    private static final String COLUMN_EX_DURATION = "duration";
    private static final String COLUMN_EX_IMAGE_RES = "image_res";
    private static final String COLUMN_EX_BACKGROUND_COLOR = "background_color";
    private static final String COLUMN_EX_CATEGORY = "category";
    private static final String COLUMN_EX_VIDEO_ID = "video_id";


    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(@NonNull SQLiteDatabase db) {
        // Создание таблицы упражнений
        String CREATE_EXERCISES_TABLE = "CREATE TABLE " + TABLE_EXERCISES + "("
                + COLUMN_EX_ID + " INTEGER PRIMARY KEY AUTOINCREMENT,"
                + COLUMN_EX_TITLE + " TEXT,"
                + COLUMN_EX_DESCRIPTION + " TEXT,"
                + COLUMN_EX_DURATION + " INTEGER,"
                + COLUMN_EX_IMAGE_RES + " INTEGER,"
                + COLUMN_EX_BACKGROUND_COLOR + " INTEGER,"
                + COLUMN_EX_CATEGORY + " TEXT,"
                + COLUMN_EX_VIDEO_ID + " TEXT)";
        db.execSQL(CREATE_EXERCISES_TABLE);


        // Заполняем таблицы начальными данными
        addInitialExercises(db);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_EXERCISES);
        onCreate(db);
    }

    // Методы для работы с упражнениями
    private void addInitialExercises(SQLiteDatabase db) {
        insertExercise(db, "Йога", "Йога — гармония тела, разума и души", 26,
                R.drawable.joga, Color.parseColor("#FFE0B2"), "Растяжка", "LTWYnDD9PiM");
        insertExercise(db, "Бег", "Бег — ритм свободы, силы и вдохновения.", 9,
                R.drawable.running, Color.parseColor("#C5CAE9"), "Кардио", "h2gzHGnFH7k");
        insertExercise(db, "Скакалка", "Скакалка — энергия движения, лёгкость и выносливость.", 12,
                R.drawable.skalka, Color.parseColor("#B2DFDB"), "Кардио", "-Y8m2cBueLY");
        insertExercise(db, "Жим лёжа", "Жим лёжа — это сила, контроль и выносливость.", 6,
                R.drawable.zhim, Color.parseColor("#C5E1A5"), "Силовые", "rIZirGYcbD8");
    }

    private void insertExercise(SQLiteDatabase db, String title, String description, int duration,
                                int imageRes, int backgroundColor, String category, String videoId) {
        ContentValues values = new ContentValues();
        values.put(COLUMN_EX_TITLE, title);
        values.put(COLUMN_EX_DESCRIPTION, description);
        values.put(COLUMN_EX_DURATION, duration);
        values.put(COLUMN_EX_IMAGE_RES, imageRes);
        values.put(COLUMN_EX_BACKGROUND_COLOR, backgroundColor);
        values.put(COLUMN_EX_CATEGORY, category);
        values.put(COLUMN_EX_VIDEO_ID, videoId);
        db.insert(TABLE_EXERCISES, null, values);
    }

    public List<ExerciseModel> getAllExercises() {
        List<ExerciseModel> exercises = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(TABLE_EXERCISES, null, null, null, null, null, null);

        if (cursor.moveToFirst()) {
            do {
                exercises.add(new ExerciseModel(
                        cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_EX_TITLE)),
                        cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_EX_DESCRIPTION)),
                        cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_EX_DURATION)),
                        cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_EX_IMAGE_RES)),
                        cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_EX_BACKGROUND_COLOR)),
                        VideoActivity.class,
                        cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_EX_CATEGORY)),
                        cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_EX_VIDEO_ID))
                ));
            } while (cursor.moveToNext());
        }

        cursor.close();
        db.close();
        return exercises;
    }
}