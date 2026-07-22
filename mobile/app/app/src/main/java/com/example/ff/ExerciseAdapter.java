package com.example.ff;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class ExerciseAdapter extends RecyclerView.Adapter<ExerciseAdapter.ViewHolder> {
    private List<ExerciseModel> exercises;
    private Context context;

    public ExerciseAdapter(Context context, List<ExerciseModel> exercises) {
        this.context = context;
        this.exercises = exercises;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_exercise, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        ExerciseModel exercise = exercises.get(position);

        holder.title.setText(exercise.getTitle());
        holder.description.setText(exercise.getDescription());
        holder.time.setText(exercise.getDuration() + " мин");
        holder.image.setImageResource(exercise.getImageResId());
        holder.cardView.setCardBackgroundColor(exercise.getBackgroundColor());

        holder.itemView.setOnClickListener(v -> {
            Intent intent = new Intent(context, VideoActivity.class);
            intent.putExtra("videoId", exercise.getVideoId());
            intent.putExtra("title", exercise.getTitle());
            intent.putExtra("description", exercise.getDescription());
            intent.putExtra("color", exercise.getBackgroundColor());
            context.startActivity(intent);
        });

        // Отключаем анимацию
        if (context instanceof Activity) {
            ((Activity) context).overridePendingTransition(0, 0);
        }
    }

    @Override
    public int getItemCount() { return exercises.size(); }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView title, description, time;
        ImageView image;
        CardView cardView;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            title = itemView.findViewById(R.id.exerciseTitle);
            description = itemView.findViewById(R.id.exerciseDescription);
            time = itemView.findViewById(R.id.exerciseTime);
            image = itemView.findViewById(R.id.exerciseImage);
            cardView = itemView.findViewById(R.id.cardView);
        }
    }
}