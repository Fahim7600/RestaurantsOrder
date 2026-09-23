export type DietaryTag = "vegetarian" | "vegan" | "gluten-free" | "nut-free" | "none";

export interface Category {
  id: string;
  name: string;
}

export interface Cuisine {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // in BDT
  image: string;
  cuisineId: string;
  categoryId: string;
  dietaryTags: DietaryTag[];
}

export interface TimeSlot {
  time: string; // e.g. "12:00", "13:00", "19:00"
  totalSeats: number;
  bookedSeats: number;
}

export interface DayAvailability {
  date: string; // ISO date string "YYYY-MM-DD"
  slots: TimeSlot[];
}
