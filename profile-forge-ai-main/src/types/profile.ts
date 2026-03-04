export interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  city: string;
  tenth_board: string;
  tenth_percentage: string;
  twelfth_board: string;
  twelfth_percentage: string;
  course: string;
  status: string;
  profile_image?: string;
}

export const defaultProfile: StudentProfile = {
  id: "1",
  full_name: "Demo User",
  email: "demo@forge.ai",
  phone: "9876543210",
  date_of_birth: "2000-01-01",
  city: "New Delhi",
  tenth_board: "CBSE",
  tenth_percentage: "92.4",
  twelfth_board: "CBSE",
  twelfth_percentage: "89.6",
  course: "Full Stack Development",
  status: "submitted",
  profile_image: "",
};
