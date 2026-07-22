package com.example.ff;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

public class ScheduleAdapter extends RecyclerView.Adapter<ScheduleAdapter.ScheduleViewHolder> {

    private List<ScheduleItem> scheduleList;
    private List<ScheduleItem> scheduleListFull; // полный список для поиска

    public ScheduleAdapter(List<ScheduleItem> scheduleList) {
        this.scheduleList = scheduleList;
        this.scheduleListFull = new ArrayList<>(scheduleList); // копия для фильтрации
    }

    @NonNull
    @Override
    public ScheduleViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.schedule_item, parent, false);
        return new ScheduleViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ScheduleViewHolder holder, int position) {
        ScheduleItem item = scheduleList.get(position);

        holder.title.setText(item.getTitle());
        holder.time.setText(item.getTime());
        holder.instructor.setText(item.getInstructor());
        holder.location.setText(item.getLocation());

        holder.itemView.findViewById(R.id.schedule_card).setBackgroundColor(item.getCardColor());
    }

    @Override
    public int getItemCount() {
        return scheduleList.size();
    }

    // Метод для фильтрации по строке
    public void filter(String query) {
        if (query.isEmpty()) {
            scheduleList = new ArrayList<>(scheduleListFull); // если строка поиска пустая, возвращаем полный список
        } else {
            List<ScheduleItem> filteredList = new ArrayList<>();
            for (ScheduleItem item : scheduleListFull) {
                if (item.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                        item.getInstructor().toLowerCase().contains(query.toLowerCase())) {
                    filteredList.add(item);
                }
            }
            scheduleList = filteredList;
        }
        notifyDataSetChanged();
    }

    static class ScheduleViewHolder extends RecyclerView.ViewHolder {
        TextView title, time, instructor, location;

        public ScheduleViewHolder(@NonNull View itemView) {
            super(itemView);
            title = itemView.findViewById(R.id.scheduleTitle);
            time = itemView.findViewById(R.id.scheduleTime);
            instructor = itemView.findViewById(R.id.scheduleInstructor);
            location = itemView.findViewById(R.id.scheduleLocation);
        }
    }
}
