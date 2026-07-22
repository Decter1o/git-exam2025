package com.example.ff;

public class ScheduleItem {
    private final String day;
    private final String time;
    private final String title;
    private final String instructor;
    private final String location;
    private final String category;
    private int cardColor;

    public ScheduleItem(String dayOfWeek, String startTime, String endTime,
                        String trainingType, String trainer, String roomName, int cardColor, String category) {
        this.day = dayOfWeek;
        this.time = startTime + " - " + endTime;
        this.title = trainingType;
        this.instructor = trainer;
        this.location = "Зал " + roomName;
        this.cardColor = cardColor;
        this.category = category;
    }

    public String getDay() {
        return day;
    }
    public String getTime() {
        return time;
    }
    public String getTitle() {
        return title;
    }
    public String getInstructor() {
        return instructor;
    }
    public String getLocation() {
        return location;
    }
    public int getCardColor() {
        return cardColor;
    }
    public String getCategory() {
        return category;
    }
}
