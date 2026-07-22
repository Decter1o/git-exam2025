package com.example.ff;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.AsyncTask;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.RecyclerView;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class TrenersAdapter extends RecyclerView.Adapter<TrenersAdapter.TrenerViewHolder> {
    private Context context;
    private List<TrenerModel> trenersList;

    public TrenersAdapter(Context context, List<TrenerModel> trenersList) {
        this.context = context;
        this.trenersList = trenersList;
    }

    @NonNull
    @Override
    public TrenerViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_treners, parent, false);
        return new TrenerViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull TrenerViewHolder holder, int position) {
        TrenerModel trener = trenersList.get(position);

        holder.title.setText(trener.getName() + " " + trener.getSurname());
        holder.description.setText(trener.getDescription());

        // Загружаем первое фото без сторонних библиотек
        if (trener.getPhotoUrls() != null && !trener.getPhotoUrls().isEmpty()) {
            new LoadImageTask(holder.image).execute(trener.getPhotoUrls().get(0));
        } else {
            holder.image.setImageResource(R.drawable.almaz); // если фото нет
        }

        holder.cardView.setCardBackgroundColor(trener.getCardColor());

        holder.itemView.setOnClickListener(v -> {
            Intent intent = new Intent(context, TrenerProfileActivity.class);
            intent.putExtra("name", trener.getName());
            intent.putExtra("surname", trener.getSurname());
            intent.putExtra("description", trener.getDescription());
            intent.putExtra("instagramUrl", trener.getInstagramUrl());
            intent.putExtra("whatsappNumber", trener.getWhatsappNumber());
            intent.putExtra("telegramUrl", trener.getTelegramUrl());
            intent.putExtra("cardColor", trener.getCardColor());

            if (trener.getPhotoUrls() != null) {
                intent.putStringArrayListExtra("photos", new ArrayList<>(trener.getPhotoUrls()));
            }
            // Отключаем анимацию
            if (context instanceof Activity) {
                ((Activity) context).overridePendingTransition(0, 0);
            }

            context.startActivity(intent);
        });
    }

    @Override
    public int getItemCount() {
        return trenersList.size();
    }

    public static class TrenerViewHolder extends RecyclerView.ViewHolder {
        TextView title, description;
        ImageView image;
        CardView cardView;

        public TrenerViewHolder(@NonNull View itemView) {
            super(itemView);
            title = itemView.findViewById(R.id.exerciseTitle);
            description = itemView.findViewById(R.id.exerciseDescription);
            image = itemView.findViewById(R.id.exerciseImage);
            cardView = itemView.findViewById(R.id.cardView);
        }
    }

    // Вложенный AsyncTask для загрузки изображений
    private static class LoadImageTask extends AsyncTask<String, Void, Bitmap> {
        private final ImageView imageView;

        public LoadImageTask(ImageView imageView) {
            this.imageView = imageView;
        }

        @Override
        protected Bitmap doInBackground(String... urls) {
            String imageUrl = urls[0];
            Bitmap bitmap = null;
            try {
                URL url = new URL(imageUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setDoInput(true);
                conn.connect();
                InputStream input = conn.getInputStream();
                bitmap = BitmapFactory.decodeStream(input);
            } catch (Exception e) {
                e.printStackTrace();
            }
            return bitmap;
        }

        @Override
        protected void onPostExecute(Bitmap result) {
            if (result != null) {
                imageView.setImageBitmap(result);
            } else {
                imageView.setImageResource(R.drawable.almaz);
            }
        }
    }
}
