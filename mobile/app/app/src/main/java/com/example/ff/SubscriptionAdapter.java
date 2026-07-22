package com.example.ff;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class SubscriptionAdapter extends RecyclerView.Adapter<SubscriptionAdapter.ViewHolder> {
    private List<SubscriptionModel> subscriptions;
    private Context context;

    public SubscriptionAdapter(Context context, List<SubscriptionModel> subscriptions) {
        this.context = context;
        this.subscriptions = subscriptions;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_subscription, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        SubscriptionModel subscription = subscriptions.get(position);
        holder.title.setText(subscription.getTitle());
        holder.price.setText(subscription.getPrice());
        holder.specialGroup.setText(subscription.getSpecialGroup());
        holder.duration.setText(subscription.getDuration());
        holder.cardView.setCardBackgroundColor(subscription.getBackgroundColor());
    }

    @Override
    public int getItemCount() {
        return subscriptions.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView title, price, duration, specialGroup;
        CardView cardView;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            title = itemView.findViewById(R.id.subscriptionTitle);
            price = itemView.findViewById(R.id.subscriptionPrice);
            specialGroup = itemView.findViewById(R.id.subscriptionSpecialGroup);
            duration = itemView.findViewById(R.id.subscriptionDuration);
            cardView = itemView.findViewById(R.id.cardView);
        }
    }

}
