import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Save, X, Loader2, Mail, Calendar, Phone, MapPin, Camera, GraduationCap, ChevronDown, LogOut, BookOpen, Award, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { useProfileStore } from "../store/profileStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import InlineChatWidget from "../components/InlineChatWidget";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

const profileSchema = z.any();

interface ProfileForm {
  full_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  city?: string;
  tenth_board?: string;
  tenth_percentage?: string | number;
  twelfth_board?: string;
  twelfth_percentage?: string | number;
  course?: string;
  status?: string;
  profile_image?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "https://profile-ai-t3ea.onrender.com";

const ProfilePage = () => {
  const [editingField, setEditingField] = useState<(keyof ProfileForm & string) | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updateProfile } = useProfileStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [viewAllCourses, setViewAllCourses] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!user?.email) return null;
      const res = await fetch(`${API_BASE}/api/profile/${user.email}`);
      if (!res.ok) throw new Error("Profile not found");
      const profileData = await res.json();
      updateProfile(profileData);
      return profileData;
    },
    enabled: !!user?.email,
  });

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: data || undefined,
  });

  const onSubmit = async (formData: ProfileForm) => {
    if (!user?.email) return;
    try {
      const res = await fetch(`${API_BASE}/api/profile/${user.email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        updateProfile(formData as any);
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        setEditingField(null);
        toast({ title: "Updated!", description: "Changes saved successfully." });
      } else {
        throw new Error("Failed to save changes.");
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    }
  };

  const handleCancel = () => {
    reset();
    setEditingField(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please select an image under 2MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("profile_image", reader.result as string, { shouldDirty: true, shouldValidate: true });
        // Small delay to ensure state update before submit
        setTimeout(() => handleSubmit(onSubmit)(), 50);
      };
      reader.readAsDataURL(file);
    }
  };

  const EditableField = ({ name, label, value, type = "text", placeholder = "", icon: Icon }: { name: keyof ProfileForm & string, label?: string, value: any, type?: string, placeholder?: string, icon?: any }) => {
    const isEditing = editingField === name;
    return (
      <div className="flex items-center gap-3 w-full group">
        {Icon && <Icon className="w-4 h-4 text-gray-400 shrink-0" />}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative min-h-[32px]">
          {isEditing ? (
            <div className="flex items-center gap-2 w-full">
              <Input {...register(name)} placeholder={placeholder} type={type} className="h-8 text-xs bg-white border-gray-200 flex-1" autoFocus />
              <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0 hover:bg-gray-100" onClick={handleCancel}><X className="w-3.5 h-3.5" /></Button>
              <Button type="button" size="icon" className="h-8 w-8 shrink-0 bg-gradient-to-r from-[#fc6a38] to-[#f24726] text-white hover:opacity-90" disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              {label ? (
                <>
                  <span className="text-gray-500 font-bold text-[11px] w-24 uppercase">{label}</span>
                  <span className="font-semibold text-[13px] text-gray-800 truncate flex-1">{value || "—"}</span>
                </>
              ) : (
                <span className="font-semibold text-[13px] text-gray-800 truncate flex-1">{value || "—"}</span>
              )}
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ml-1 mr-2 shrink-0" onClick={() => setEditingField(name)}>
                <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-[#fc6a38]" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e9ece6] p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#fc6a38]" />
      </div>
    );
  }

  const initials = user?.email?.substring(0, 2).toUpperCase() || "DU";

  return (
    <div className="min-h-screen relative font-sans p-4 sm:p-8 overflow-x-hidden" style={{ backgroundColor: '#e9ece6' }}>
      <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2070&auto=format&fit=crop')" }}></div>

      {/* Top Standalone Header */}
      <header className="relative z-20 w-full max-w-[1400px] mx-auto mb-8 flex items-center justify-between bg-white/60 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:inline text-gray-900 tracking-tight">Gradia AI</span>
        </Link>

        <div className="relative">
          <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 hover:bg-white/50 px-3 py-1.5 rounded-full transition-colors">
            <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
              <AvatarFallback className="bg-gray-800 text-white text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-gray-800 hidden sm:inline">{user?.full_name || user?.email}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl p-1 border border-border/50 shadow-lg z-50"
              >
                <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* Left Column (col-span-3) */}
        <div className="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left">

          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img
              src={data?.profile_image || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&auto=format&fit=crop"}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white transition-all group-hover:brightness-75 group-hover:border-[#fc6a38]"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
              <Camera className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>

          <div className="mt-5 w-full max-w-[200px] lg:max-w-[220px]">
            <EditableField name="full_name" value={data?.full_name} placeholder="Full Name" />
            <p className="text-[13px] text-gray-500 font-black mt-1 uppercase tracking-wider text-center lg:text-left">Student</p>
          </div>

          <div className="flex gap-6 mt-8 w-full justify-center lg:justify-start">
            <div>
              <div className="font-black text-2xl text-gray-900">{data?.tenth_percentage || '--'}%</div>
              <div className="text-[10px] text-gray-500 font-black mt-1 uppercase tracking-widest">10th Mark</div>
            </div>
            <div>
              <div className="font-black text-2xl text-gray-900">{data?.twelfth_percentage || '--'}%</div>
              <div className="text-[10px] text-gray-500 font-black mt-1 uppercase tracking-widest">12th Mark</div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-300 mt-8 mb-6"></div>

          <div className="w-full flex flex-col items-center lg:items-start">
            <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Course Breakdown</h4>
            <div className="w-full h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {(() => {
                    const courses = data?.course ? data.course.split(',').map((c: string) => c.trim()).filter(Boolean) : [];
                    const colors = ['#3b82f6', '#2563eb', '#1e40af', '#60a5fa', '#93c5fd'];

                    let pieData = [];
                    if (courses.length === 0) {
                      pieData = [{ name: 'No Courses', value: 1, color: '#e5e7eb' }];
                    } else {
                      pieData = courses.map((course: string, i: number) => ({
                        name: course,
                        value: 1,
                        color: colors[i % colors.length]
                      }));
                    }

                    return (
                      <Pie
                        data={pieData}
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    )
                  })()}
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Dynamic Legend */}
            <div className="flex flex-wrap gap-4 mt-2 justify-center lg:justify-start w-full text-[10px] font-bold text-gray-600 uppercase">
              {(() => {
                const courses = data?.course ? data.course.split(',').map((c: string) => c.trim()).filter(Boolean) : [];
                const colors = ['#3b82f6', '#2563eb', '#1e40af', '#60a5fa', '#93c5fd'];

                if (courses.length === 0) return <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-200"></div> None</div>;

                return courses.slice(0, 3).map((course: string, i: number) => (
                  <div key={i} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></div> <span className="truncate max-w-[80px]">{course}</span></div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Middle Column (col-span-6) */}
        <div className="lg:col-span-6 flex flex-col gap-3 w-full">
          <div className="relative w-full h-36 sm:h-40 rounded-[2rem] overflow-hidden shadow-sm flex flex-col items-center justify-center">
            <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop" alt="Mountains" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10"></div>
            <h2 className="relative z-10 text-white text-[28px] sm:text-[40px] font-black tracking-tighter drop-shadow-lg text-center px-4">PROFILE</h2>
            <button className="relative z-10 mt-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:opacity-90 transition-opacity text-white text-[10px] font-black tracking-wider uppercase px-5 py-2 rounded-full shadow-lg">
              LMS Management
            </button>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-[1rem] p-4 shadow-sm border border-white/50">
            <h3 className="text-[10px] font-black text-gray-800 mb-2 uppercase tracking-widest">Personal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
              <EditableField name="email" icon={Mail} value={data?.email} placeholder="Email" />
              <EditableField name="date_of_birth" icon={Calendar} value={data?.date_of_birth} placeholder="Date of Birth" />
              <EditableField name="phone" icon={Phone} value={data?.phone} placeholder="Phone number" />
              <EditableField name="city" icon={MapPin} value={data?.city} placeholder="City" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-[1rem] p-4 shadow-sm border border-white/50">
            <h3 className="text-[10px] font-black text-gray-800 mb-2 uppercase tracking-widest">Education Details</h3>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                <EditableField name="tenth_board" label="10th Board" value={data?.tenth_board} placeholder="Board Name" />
                <EditableField name="tenth_percentage" label="10th %" value={data?.tenth_percentage} placeholder="Percentage" />
              </div>
              <div className="h-px bg-gray-200 w-full my-1"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                <EditableField name="twelfth_board" label="12th Board" value={data?.twelfth_board} placeholder="Board Name" />
                <EditableField name="twelfth_percentage" label="12th %" value={data?.twelfth_percentage} placeholder="Percentage" />
              </div>
            </div>
          </div>

          {(() => {
            const coursesList = data?.course ? data.course.split(',').map((c: string) => c.trim()).filter(Boolean) : [];
            const displayedCourses = coursesList.slice(0, 2);

            return (
              <div className="bg-white/90 backdrop-blur-md rounded-[1rem] p-4 shadow-sm border border-white/50 relative">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Course Enrollments</h3>
                  {coursesList.length > 2 && (
                    <button onClick={() => setViewAllCourses(true)} className="text-[10px] font-bold text-[#fc6a38] hover:underline cursor-pointer">VIEW ALL ({coursesList.length})</button>
                  )}
                </div>

                {coursesList.length === 0 ? (
                  <p className="text-sm text-gray-500 font-medium">No courses enrolled yet.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {displayedCourses.map((c: string, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50/80 p-3 rounded-xl border border-gray-100 hover:border-[#fc6a38]/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#fc6a38]/10 to-[#f24726]/10 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-[#fc6a38]" />
                          </div>
                          <span className="text-[14px] font-bold text-gray-800 tracking-tight">{c}</span>
                        </div>
                        <span className="text-[10px] font-black bg-green-100/80 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-wide">Submitted</span>
                      </div>
                    ))}
                  </div>
                )}

                <Dialog open={viewAllCourses} onOpenChange={setViewAllCourses}>
                  <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black text-gray-900 tracking-tight">All Enrolled Courses</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[350px] w-full rounded-md mt-4 pr-4">
                      <div className="flex flex-col gap-3">
                        {coursesList.map((c: string, i: number) => (
                          <div key={i} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fc6a38]/10 to-[#f24726]/10 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-[#fc6a38]" />
                              </div>
                              <span className="text-base font-bold text-gray-800 tracking-tight">{c}</span>
                            </div>
                            <span className="text-[10px] font-black bg-green-100 text-green-700 px-3 py-1.5 rounded-full uppercase tracking-widest">Submitted</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            );
          })()}

        </div>

        {/* Right Column (col-span-3) - Chat Widget */}
        <div className="lg:col-span-3 flex flex-col justify-start h-full space-y-4 mt-6 lg:mt-0">

          <div className="w-full flex-grow flex items-start justify-center lg:justify-end">
            <div className="w-full h-[500px] lg:h-[620px] shadow-lg rounded-3xl overflow-hidden [&>div]:h-full border-none">
              <InlineChatWidget />
            </div>
          </div>



        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
