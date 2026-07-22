package com.example.ff;

import android.content.Context;
import android.content.SharedPreferences;

public class SessionManager {
    private static final String PREF_NAME = "UserSession";
    private static final String KEY_IS_LOGGED_IN = "isLoggedIn";
    private static final String KEY_USER_NAME = "userName";
    private static final String KEY_PHONE = "phone";
    private static final String KEY_MEMBERSHIP_NAME = "membershipName";
    private static final String KEY_VISITS_LEFT = "visitsLeft";

    private SharedPreferences pref;
    private SharedPreferences.Editor editor;
    private Context context;

    public SessionManager(Context context) {
        this.context = context;
        pref = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        editor = pref.edit();
    }

    public void createLoginSession(String userName, String phone) {
        editor.putBoolean(KEY_IS_LOGGED_IN, true);
        editor.putString(KEY_USER_NAME, userName);
        editor.putString(KEY_PHONE, phone);
        editor.commit();
    }

    public void saveMembershipInfo(String membershipName, int visitsLeft) {
        editor.putString(KEY_MEMBERSHIP_NAME, membershipName);
        editor.putInt(KEY_VISITS_LEFT, visitsLeft);
        editor.commit();
    }

    public boolean isLoggedIn() {
        return pref.getBoolean(KEY_IS_LOGGED_IN, false);
    }

    public String getUserName() {
        return pref.getString(KEY_USER_NAME, null);
    }

    public String getPhone() {
        return pref.getString(KEY_PHONE, null);
    }

    public String getMembershipName() {
        return pref.getString(KEY_MEMBERSHIP_NAME, "Абонемент не активен");
    }

    public int getVisitsLeft() {
        return pref.getInt(KEY_VISITS_LEFT, 0);
    }

    public void logoutUser() {
        editor.clear();
        editor.commit();
    }
}