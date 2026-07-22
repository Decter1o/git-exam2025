package com.example.ff;

public class ExerciseModel {
    private String title;
    private String description;
    private int duration;
    private int imageResId;
    private int backgroundColor;
    private Class<?> activityClass;
    private String category;
    private String videoId;

    public ExerciseModel(String title, String description, int duration, int imageResId,
                         int backgroundColor, Class<?> activityClass, String category, String videoId) {
        this.title = title;
        this.description = description;
        this.duration = duration;
        this.imageResId = imageResId;
        this.backgroundColor = backgroundColor;
        this.activityClass = activityClass;
        this.category = category;
        this.videoId = videoId;
    }

    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public int getDuration() { return duration; }
    public int getImageResId() { return imageResId; }
    public int getBackgroundColor() { return backgroundColor; }
    public Class<?> getActivityClass() { return activityClass; }
    public String getCategory() { return category; }
    public String getVideoId() { return videoId; }
}