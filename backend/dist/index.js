"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const dbPath = path_1.default.join(__dirname, '../kalviumlabs_forge.sqlite');
const db = new sqlite3_1.default.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to SQLite:', err);
    }
    else {
        console.log('Connected to SQLite database.');
    }
});
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running healthily' });
});
// Mock Chatbot AI Endpoint (Rule-based)
app.post('/api/chat', (req, res) => {
    const { message, email } = req.body;
    const lower = message.toLowerCase();
    db.get('SELECT * FROM students WHERE email = ?', [email], (err, student) => {
        if (err || !student) {
            return res.json({ reply: "I couldn't find your profile. Please check your login.", updates: null });
        }
        db.get('SELECT * FROM education_details WHERE student_id = ?', [student.id], (err, edu) => {
            db.get('SELECT * FROM applications WHERE student_id = ? LIMIT 1', [student.id], (err, appRec) => {
                let courseId = appRec?.course_id || null;
                let status = appRec?.status || 'unknown';
                db.get('SELECT * FROM courses WHERE id = ?', [courseId], (err, course) => {
                    const profile = {
                        full_name: student.full_name,
                        email: student.email,
                        phone: student.phone || 'N/A',
                        date_of_birth: student.date_of_birth || 'N/A',
                        city: student.city || 'N/A',
                        tenth_board: edu?.tenth_board || 'N/A',
                        tenth_percentage: edu?.tenth_percentage || 'N/A',
                        twelfth_board: edu?.twelfth_board || 'N/A',
                        twelfth_percentage: edu?.twelfth_percentage || 'N/A',
                        course: course?.title || 'N/A',
                        status: status
                    };
                    // Queries
                    if (lower.includes("name") && (lower.includes("what") || lower.includes("my")))
                        return res.json({ reply: `Your name is **${profile.full_name}**.` });
                    if (lower.includes("email") && (lower.includes("what") || lower.includes("my")))
                        return res.json({ reply: `Your email is **${profile.email}**.` });
                    if (lower.includes("phone") && (lower.includes("what") || lower.includes("my")))
                        return res.json({ reply: `Your phone number is **${profile.phone}**.` });
                    if (lower.includes("dob") || lower.includes("birth") || lower.includes("date of birth"))
                        return res.json({ reply: `Your date of birth is **${profile.date_of_birth}**.` });
                    if (lower.includes("city"))
                        return res.json({ reply: `Your city is **${profile.city}**.` });
                    if ((lower.includes("10th") || lower.includes("tenth")) && lower.includes("percentage"))
                        return res.json({ reply: `Your 10th percentage is **${profile.tenth_percentage}%**.` });
                    if ((lower.includes("12th") || lower.includes("twelfth")) && lower.includes("percentage"))
                        return res.json({ reply: `Your 12th percentage is **${profile.twelfth_percentage}%**.` });
                    if ((lower.includes("10th") || lower.includes("tenth")) && lower.includes("board"))
                        return res.json({ reply: `Your 10th board is **${profile.tenth_board}**.` });
                    if ((lower.includes("12th") || lower.includes("twelfth")) && lower.includes("board"))
                        return res.json({ reply: `Your 12th board is **${profile.twelfth_board}**.` });
                    if (lower.includes("course") && !lower.includes("status"))
                        return res.json({ reply: `Your course is **${profile.course}**.` });
                    if (lower.includes("status"))
                        return res.json({ reply: `Your course status is **${profile.status}**.` });
                    if (lower.includes("profile") && (lower.includes("show") || lower.includes("all") || lower.includes("details"))) {
                        return res.json({ reply: `Here's your profile:\n• **Name:** ${profile.full_name}\n• **Email:** ${profile.email}\n• **Phone:** ${profile.phone}\n• **DOB:** ${profile.date_of_birth}\n• **City:** ${profile.city}\n• **10th:** ${profile.tenth_board} - ${profile.tenth_percentage}%\n• **12th:** ${profile.twelfth_board} - ${profile.twelfth_percentage}%\n• **Course:** ${profile.course} (${profile.status})` });
                    }
                    // Updates
                    const updatePatterns = [
                        { keys: ["phone", "number", "mobile"], field: "phone", label: "phone number", table: "students" },
                        { keys: ["name"], field: "full_name", label: "name", table: "students" },
                        { keys: ["email"], field: "email", label: "email", table: "students" },
                        { keys: ["dob", "date of birth", "birth"], field: "date_of_birth", label: "date of birth", table: "students" },
                        { keys: ["city"], field: "city", label: "city", table: "students" },
                        { keys: ["10th board", "tenth board"], field: "tenth_board", label: "10th board", table: "education_details" },
                        { keys: ["12th board", "twelfth board"], field: "twelfth_board", label: "12th board", table: "education_details" },
                        { keys: ["10th percentage", "tenth percentage"], field: "tenth_percentage", label: "10th percentage", table: "education_details" },
                        { keys: ["12th percentage", "twelfth percentage"], field: "twelfth_percentage", label: "12th percentage", table: "education_details" },
                    ];
                    if (lower.includes("update") || lower.includes("change") || lower.includes("set")) {
                        for (const pattern of updatePatterns) {
                            if (pattern.keys.some((k) => lower.includes(k))) {
                                const toMatch = message.match(/(?:to|as|=)\s+["']?(.+?)["']?\s*$/i);
                                if (toMatch) {
                                    const value = toMatch[1].trim();
                                    // Make actual DB update
                                    if (pattern.table === 'students') {
                                        db.run(`UPDATE students SET ${pattern.field} = ? WHERE id = ?`, [value, student.id], () => {
                                            res.json({ reply: `✅ Updated your ${pattern.label} to **${value}** successfully!`, updates: { [pattern.field]: value } });
                                        });
                                    }
                                    else if (pattern.table === 'education_details') {
                                        db.run(`UPDATE education_details SET ${pattern.field} = ? WHERE student_id = ?`, [value, student.id], () => {
                                            res.json({ reply: `✅ Updated your ${pattern.label} to **${value}** successfully!`, updates: { [pattern.field]: value } });
                                        });
                                    }
                                    return;
                                }
                                return res.json({ reply: `Please specify the new value. Example: "Update my ${pattern.label} to [new value]"` });
                            }
                        }
                    }
                    res.json({ reply: "I can help you view or update your profile! Please specify what you want to query or change." });
                });
            });
        });
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map