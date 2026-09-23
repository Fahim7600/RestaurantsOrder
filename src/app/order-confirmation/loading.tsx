import FoodLoader from "@/components/shared/FoodLoader";

export default function OrderConfirmationLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 min-h-[60vh] flex flex-col items-center justify-center space-y-6">
      <FoodLoader message="Fetching order receipt..." />
    </div>
  );
}
