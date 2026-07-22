package com.example.ff;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;

public class TrenerPhotosAdapter extends RecyclerView.Adapter<TrenerPhotosAdapter.PhotoViewHolder> {

    private Context context;
    private List<String> photos;  // Список URL изображений

    public TrenerPhotosAdapter(Context context, List<String> photos) {
        this.context = context;
        this.photos = photos;
    }

    @NonNull
    @Override
    public PhotoViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_trener_photo, parent, false);
        return new PhotoViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull PhotoViewHolder holder, int position) {
        String imageUrl = photos.get(position);

        // Загрузим изображение с помощью AsyncTask
        new LoadImageTask(holder.imageView).execute(imageUrl);

        // Закругление углов с помощью фонового drawable
        holder.imageView.setBackgroundResource(R.drawable.photorounded);
        holder.imageView.setClipToOutline(true);

        // Установка отступов с обеих сторон
        ViewGroup.MarginLayoutParams params = (ViewGroup.MarginLayoutParams) holder.itemView.getLayoutParams();
        int margin = 20;  // Увеличьте это значение для большего отступа
        params.setMargins(margin, 0, margin, 0);  // Отступы с левой и правой сторон
        holder.itemView.setLayoutParams(params);
    }

    @Override
    public int getItemCount() {
        return photos.size();
    }

    static class PhotoViewHolder extends RecyclerView.ViewHolder {
        ImageView imageView;

        PhotoViewHolder(@NonNull View itemView) {
            super(itemView);
            imageView = itemView.findViewById(R.id.photoImageView);
        }
    }

    // Вложенный AsyncTask для загрузки изображений с URL
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
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setDoInput(true);
                connection.connect();
                InputStream inputStream = connection.getInputStream();
                bitmap = BitmapFactory.decodeStream(inputStream);
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
                imageView.setImageResource(R.drawable.almaz);  // Резервное изображение в случае ошибки
            }
        }
    }
}
