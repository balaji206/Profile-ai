import DashboardLayout from "@/components/DashboardLayout";
import ChatWidget from "@/components/ChatWidget";
import { motion } from "framer-motion";
import { Bot, MessageSquare, Pencil, Search } from "lucide-react";

const examples = [
  { icon: Search, text: "What is my 10th percentage?" },
  { icon: Pencil, text: "Update my phone to 9876543210" },
  { icon: MessageSquare, text: "Show my full profile" },
  { icon: Pencil, text: "Change my city to Mumbai" },
];

const AssistantPage = () => (
  <DashboardLayout>
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold">AI Profile Assistant</h1>
        <p className="text-muted-foreground mt-2">Use natural language to query or update your profile. Click the chat button in the bottom-right corner to get started.</p>
      </motion.div>


    </div>
    <ChatWidget />
  </DashboardLayout>
);

export default AssistantPage;
