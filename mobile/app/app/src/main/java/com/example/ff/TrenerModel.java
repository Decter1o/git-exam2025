package com.example.ff;

import java.util.List;

public class TrenerModel {
    private String id;
    private String name;
    private String surname;
    private String phoneNumber;
    private String trainingType;
    private String instagramUrl;
    private String whatsappNumber;
    private String telegramUrl;
    private String description;
    private int cardColor;
    private List<String> photoUrls;

    public TrenerModel(String id, String name, String surname, String phoneNumber,
                       String trainingType, String instagramUrl, String whatsappNumber,
                       String telegramUrl, String description, int cardColor, List<String> photoUrls) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.phoneNumber = phoneNumber;
        this.trainingType = trainingType;
        this.instagramUrl = instagramUrl;
        this.whatsappNumber = whatsappNumber;
        this.telegramUrl = telegramUrl;
        this.description = description;
        this.cardColor = cardColor;
        this.photoUrls = photoUrls;
    }

    // Геттеры
    public String getId() { return id; }
    public String getName() { return name; }
    public String getSurname() { return surname; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getTrainingType() { return trainingType; }
    public String getInstagramUrl() { return instagramUrl; }
    public String getWhatsappNumber() { return whatsappNumber; }
    public String getTelegramUrl() { return telegramUrl; }
    public String getDescription() { return description; }
    public int getCardColor() { return cardColor; }
    public List<String> getPhotoUrls() { return photoUrls; }
}
