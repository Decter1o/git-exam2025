package com.example.ff;

public class SubscriptionModel {
    private String id;
    private String type;
    private String duration;
    private String price;
    private String specialGroup;
    private int backgroundColor;

    public SubscriptionModel(String id, String type, String duration, String price, String specialGroup, int backgroundColor) {
        this.id = id;
        this.type = type;
        this.duration = duration;
        this.price = price;
        this.specialGroup = specialGroup;
        this.backgroundColor = backgroundColor;
    }

    public String getId() { return id; }
    public String getTitle() { return type; }
    public String getPrice() { return price; }
    public String getDuration() { return duration; }
    public String getSpecialGroup() { return specialGroup; }
    public int getBackgroundColor() { return backgroundColor; }
}
