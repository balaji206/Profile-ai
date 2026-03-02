import React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Pencil, Save, X, Loader2, Mail, Calendar, Phone, MapPin, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { useToast } from "../hooks/use-toast";
import { useProfileStore } from "../store/profileStore";
import DashboardLayout from "../components/DashboardLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import InlineChatWidget from "../components/InlineChatWidget";

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
import { useAuth } from "../hooks/useAuth";

const ProfilePage = () => {
  const [editing, setEditing] = useState(false);
  const { updateProfile } = useProfileStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!user?.email) return null;
      const res = await fetch(`/api/profile/${user.email}`);
      if (!res.ok) throw new Error("Profile not found");
      const profileData = await res.json();
      updateProfile(profileData);
      return profileData;
    },
    enabled: !!user?.email,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: data || undefined,
  });

  const onSubmit = async (formData: ProfileForm) => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/profile/${user.email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        updateProfile(formData);
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        setEditing(false);
        toast({ title: "Profile updated!", description: "Your changes have been saved." });
      } else {
        throw new Error("Failed to save changes.");
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    }
  };

  const handleCancel = () => {
    reset();
    setEditing(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="h-16 w-64" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-[600px] w-full rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 max-w-7xl mx-auto">
        {/* Left Column - Profile Details */}
        <div className="lg:col-span-3 space-y-8">
          <motion.div {...fadeIn} className="flex flex-col gap-1">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">HI,</h2>
            <div className="flex items-center gap-3">
              {editing ? (
                <div className="flex items-center gap-2 w-full max-w-md">
                   <Input {...register("full_name")} className="text-2xl font-bold h-12" placeholder="Full Name" />
                   <Button variant="outline" onClick={handleCancel} size="icon"><X className="w-5 h-5" /></Button>
                   <Button onClick={handleSubmit(onSubmit)} size="icon" className="gradient-primary text-primary-foreground" disabled={isSubmitting}>
                     {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                   </Button>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{data?.full_name || "Student Name"}</h1>
                  <button onClick={() => setEditing(true)} className="p-2 mt-1 text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* Details sections */}
          <div className="space-y-6">
            <motion.div {...fadeIn}>
              <h3 className="text-lg font-semibold mb-3">Personal Details:</h3>
              <div className="glass-card rounded-2xl p-6 sm:p-8 border-2 border-border/60">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    {editing ? <Input {...register("email")} placeholder="Email" /> : <span className="font-medium text-[15px]">{data?.email || "—"}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                     {editing ? <Input {...register("date_of_birth")} placeholder="Date of Birth" /> : <span className="font-medium text-[15px]">{data?.date_of_birth || "—"}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    {editing ? <Input {...register("phone")} placeholder="Phone number" /> : <span className="font-medium text-[15px]">{data?.phone || "—"}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    {editing ? <Input {...register("city")} placeholder="City" /> : <span className="font-medium text-[15px]">{data?.city || "—"}</span>}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeIn}>
              <h3 className="text-lg font-semibold mb-3">Education Details:</h3>
              <div className="glass-card rounded-2xl p-6 sm:p-8 border-2 border-border/60">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <span className="text-muted-foreground font-medium w-28">10th board:</span>
                    {editing ? (
                      <div className="flex gap-2 w-full sm:w-auto flex-1">
                        <Input {...register("tenth_board")} placeholder="Board" className="flex-1" />
                        <Input {...register("tenth_percentage")} placeholder="%" className="w-24" />
                      </div>
                    ) : (
                      <div className="flex flex-1 justify-between font-medium text-[15px]">
                        <span>{data?.tenth_board || "—"}</span>
                        <span>{data?.tenth_percentage || "—"}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <span className="text-muted-foreground font-medium w-28">12th board:</span>
                    {editing ? (
                      <div className="flex gap-2 w-full sm:w-auto flex-1">
                        <Input {...register("twelfth_board")} placeholder="Board" className="flex-1" />
                        <Input {...register("twelfth_percentage")} placeholder="%" className="w-24" />
                      </div>
                    ) : (
                      <div className="flex flex-1 justify-between font-medium text-[15px]">
                        <span>{data?.twelfth_board || "—"}</span>
                        <span>{data?.twelfth_percentage || "—"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeIn}>
              <div className="flex items-center justify-between mb-3 w-full pr-2">
                <h3 className="text-lg font-semibold">Enrolled Courses:</h3>
                <button type="button" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 text-muted-foreground">
                  add courses <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="glass-card rounded-2xl p-6 sm:px-8 sm:py-6 border-2 border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-h-[5rem]">
                {editing ? (
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Input {...register("course")} placeholder="Course Name & Duration" className="flex-1" />
                    <Input {...register("status")} placeholder="Fee details / Status" className="sm:w-48" />
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-lg lg:text-xl">{data?.course || "—"}</span>
                    <span className="font-medium text-muted-foreground whitespace-nowrap">{data?.status || "—"}</span>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column - Chat Widget */}
        <div className="lg:col-span-2 mt-4 lg:mt-0 lg:pt-8 h-full">
          <InlineChatWidget />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
