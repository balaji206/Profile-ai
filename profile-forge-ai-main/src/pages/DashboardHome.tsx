import React from "react";
import { motion } from "framer-motion";
import { Bot, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import DashboardLayout from "../components/DashboardLayout";

const cards = [
  { title: "Profile", description: "View and edit your academic profile", icon: User, path: "/dashboard/profile", color: "bg-primary/10 text-primary" },
  { title: "AI Assistant", description: "Update profile with natural language", icon: Bot, path: "/dashboard/assistant", color: "bg-secondary/10 text-secondary" },
];

const DashboardHome = () => (
  <DashboardLayout>
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Welcome back! 👋</h1>
        <p className="text-muted-foreground mt-1">Manage your profile or chat with our AI assistant.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.path}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={card.path} className="block glass-card rounded-2xl p-6 hover:shadow-glow transition-shadow group">
              <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{card.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
              <div className="flex items-center text-sm font-medium text-primary gap-1 group-hover:gap-2 transition-all">
                Open <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>


    </div>
  </DashboardLayout>
);

export default DashboardHome;
