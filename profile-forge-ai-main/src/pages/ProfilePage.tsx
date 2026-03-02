import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { User, GraduationCap, BookOpen, Pencil, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useProfileStore } from "@/store/profileStore";
import DashboardLayout from "@/components/DashboardLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ChatWidget from "@/components/ChatWidget";

const profileSchema = z.object({
  full_name: z.string().min(1, "Required").max(100),
  email: z.string().email().max(255),
  phone: z.string().min(10).max(15),
  date_of_birth: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  tenth_board: z.string().min(1).max(100),
  tenth_percentage: z.string().min(1).max(10),
  twelfth_board: z.string().min(1).max(100),
  twelfth_percentage: z.string().min(1).max(10),
  course: z.string().min(1).max(200),
  status: z.string().min(1).max(50),
});

type ProfileForm = z.infer<typeof profileSchema>;

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const ProfilePage = () => {
  const [editing, setEditing] = useState(false);
  const { profile, updateProfile } = useProfileStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 400));
      return profile;
    },
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: data || undefined,
  });

  const onSubmit = async (formData: ProfileForm) => {
    await new Promise((r) => setTimeout(r, 500));
    updateProfile(formData);
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    setEditing(false);
    toast({ title: "Profile updated!", description: "Your changes have been saved." });
  };

  const handleCancel = () => {
    reset();
    setEditing(false);
  };

  const Section = ({ title, icon: Icon, children }: { title: string; icon: typeof User; children: React.ReactNode }) => (
    <motion.div {...fadeIn} className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <Icon className="w-4 h-4 text-accent-foreground" />
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </motion.div>
  );

  const Field = ({ label, name, error }: { label: string; name: keyof ProfileForm; error?: string }) => (
    <div className="space-y-1.5">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {editing ? (
        <>
          <Input {...register(name)} className="h-10" />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </>
      ) : (
        <p className="text-sm font-medium h-10 flex items-center px-3 rounded-lg bg-muted/50">{data?.[name] || "—"}</p>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div {...fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Student Profile</h1>
            <p className="text-muted-foreground">Manage your academic information</p>
          </div>
          {!editing ? (
            <Button onClick={() => setEditing(true)} className="gradient-primary text-primary-foreground gap-2">
              <Pencil className="w-4 h-4" /> Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="gap-2">
                <X className="w-4 h-4" /> Cancel
              </Button>
              <Button onClick={handleSubmit(onSubmit)} className="gradient-primary text-primary-foreground gap-2" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </Button>
            </div>
          )}
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Section title="Personal Information" icon={User}>
            <Field label="Full Name" name="full_name" error={errors.full_name?.message} />
            <Field label="Email" name="email" error={errors.email?.message} />
            <Field label="Phone" name="phone" error={errors.phone?.message} />
            <Field label="Date of Birth" name="date_of_birth" error={errors.date_of_birth?.message} />
            <Field label="City" name="city" error={errors.city?.message} />
          </Section>

          <Section title="Educational Information" icon={GraduationCap}>
            <Field label="10th Board" name="tenth_board" error={errors.tenth_board?.message} />
            <Field label="10th Percentage" name="tenth_percentage" error={errors.tenth_percentage?.message} />
            <Field label="12th Board" name="twelfth_board" error={errors.twelfth_board?.message} />
            <Field label="12th Percentage" name="twelfth_percentage" error={errors.twelfth_percentage?.message} />
          </Section>

          <Section title="Course Information" icon={BookOpen}>
            <Field label="Course Name" name="course" error={errors.course?.message} />
            <Field label="Status" name="status" error={errors.status?.message} />
          </Section>
        </form>
      </div>
      <ChatWidget />
    </DashboardLayout>
  );
};

export default ProfilePage;
