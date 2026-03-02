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
app.get('/api/profile/:email', (req, res) => {
    const email = req.params.email;
    db.get('SELECT * FROM students WHERE email = ?', [email], (err, student) => {
        if (err || !student)
            return res.status(404).json({ error: "Profile not found" });
        db.get('SELECT * FROM education_details WHERE student_id = ?', [student.id], (err, edu) => {
            db.get('SELECT * FROM applications WHERE student_id = ? LIMIT 1', [student.id], (err, appRec) => {
                let courseId = appRec?.course_id || null;
                db.get('SELECT * FROM courses WHERE id = ?', [courseId], (err, course) => {
                    res.json({
                        full_name: student.full_name,
                        email: student.email,
                        phone: student.phone || '',
                        date_of_birth: student.date_of_birth || '',
                        city: student.city || '',
                        tenth_board: edu?.tenth_board || '',
                        tenth_percentage: edu?.tenth_percentage || '',
                        twelfth_board: edu?.twelfth_board || '',
                        twelfth_percentage: edu?.twelfth_percentage || '',
                        course: course?.title || '',
                        status: appRec?.status || ''
                    });
                });
            });
        });
    });
});
app.put('/api/profile/:email', (req, res) => {
    const email = req.params.email;
    const data = req.body;
    db.get('SELECT id FROM students WHERE email = ?', [email], (err, student) => {
        if (err || !student)
            return res.status(404).json({ error: "Profile not found" });
        db.run(`UPDATE students SET full_name = ?, phone = ?, date_of_birth = ?, city = ? WHERE id = ?`, [data.full_name, data.phone, data.date_of_birth, data.city, student.id], () => {
            db.run(`UPDATE education_details SET tenth_board = ?, tenth_percentage = ?, twelfth_board = ?, twelfth_percentage = ? WHERE student_id = ?`, [data.tenth_board, data.tenth_percentage, data.twelfth_board, data.twelfth_percentage, student.id], () => {
                res.json({ success: true, updates: data });
            });
        });
    });
});
const generative_ai_1 = require("@google/generative-ai");
// Initialize Gemini with the provided API Key
const genAI = new generative_ai_1.GoogleGenerativeAI('AIzaSyB2oINLU96RTGwmJZRQl_ICyPNnNYtyKSA');
// Mock Chatbot AI Endpoint (Gemini-based)
app.post('/api/chat', async (req, res) => {
    const { message, email } = req.body;
    db.get('SELECT * FROM students WHERE email = ?', [email], async (err, student) => {
        if (err)
            return res.json({ reply: "Database error occurred.", updates: null });
        if (!student) {
            db.run('INSERT INTO students (full_name, email) VALUES (?, ?)', ['New User', email], function (err) {
                if (err)
                    return res.json({ reply: "Failed to initialize your profile.", updates: null });
                const newStudentId = this.lastID;
                db.run('INSERT INTO education_details (student_id) VALUES (?)', [newStudentId], (err) => {
                    return res.json({ reply: "Welcome! Your profile has been initialized. How can I help you update it?", updates: null });
                });
            });
            return;
        }
        db.get('SELECT * FROM education_details WHERE student_id = ?', [student.id], async (err, edu) => {
            db.get('SELECT * FROM applications WHERE student_id = ? LIMIT 1', [student.id], async (err, appRec) => {
                let courseId = appRec?.course_id || null;
                db.get('SELECT * FROM courses WHERE id = ?', [courseId], async (err, course) => {
                    const profileContext = `Current Profile:
- Full Name: ${student.full_name}
- Email: ${student.email}
- Phone: ${student.phone || 'N/A'}
- Date of Birth: ${student.date_of_birth || 'N/A'}
- City: ${student.city || 'N/A'}
- 10th Board: ${edu?.tenth_board || 'N/A'}
- 10th Percentage: ${edu?.tenth_percentage || 'N/A'}
- 12th Board: ${edu?.twelfth_board || 'N/A'}
- 12th Percentage: ${edu?.twelfth_percentage || 'N/A'}
- Enrolled Course: ${course?.title || 'N/A'}
- Application Status: ${appRec?.status || 'N/A'}`;
                    try {
                        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                        const prompt = `You are an AI Profile Assistant.
Your job is to understand natural language and update or retrieve user profile data accurately.

User may:
- Use typos
- Use informal language
- Mix commands in one sentence
- Ask multiple updates
- Ask to view profile
- Give partial information

You must:
1. Detect user intent correctly
2. Extract correct fields (name, email, phone, etc.)
3. Perform updates when requested
4. Return clear confirmation messages
5. Handle invalid inputs gracefully (e.g. wrong email format, short phone)
6. Never fall back unless truly unclear

Supported update fields:
- full_name (name)
- email (mail id)
- phone (mobile)
- date_of_birth
- city (location)
- tenth_board
- tenth_percentage
- twelfth_board
- twelfth_percentage
- course

Current Profile:
${profileContext}

The user says: "${message}"

Based on the user's message, determine if they want to view information or update information.
Respond ONLY with a valid JSON object (no markdown, no backticks, just the raw JSON text) in this EXACT format:
{
  "reply": "A helpful conversational reply answering their query, confirming the updates, or returning a helpful error if the input was invalid/wrong format.",
  "updates": {
    "field_name": "new_value"
  }
}
If there are multiple valid updates, include all of them in the "updates" object. If no valid updates exist or if an error occurred, set "updates" to strictly null.
Keep the reply concise, friendly, and use markdown for bolding important values.`;
                        const result = await model.generateContent(prompt);
                        const responseText = result.response.text();
                        // Parse JSON safely
                        let aiResponse;
                        try {
                            const jsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
                            aiResponse = JSON.parse(jsonStr);
                        }
                        catch (e) {
                            console.error("Failed to parse Gemini JSON:", responseText);
                            return res.json({ reply: "I couldn't quite understand that. Please try rephrasing.", updates: null });
                        }
                        // Apply updates if any
                        if (aiResponse.updates && Object.keys(aiResponse.updates).length > 0) {
                            const updates = aiResponse.updates;
                            const updatePromises = [];
                            // Students table updates
                            ["full_name", "email", "phone", "date_of_birth", "city"].forEach(field => {
                                if (updates[field]) {
                                    updatePromises.push(new Promise((resolve) => {
                                        db.run(`UPDATE students SET ${field} = ? WHERE id = ?`, [updates[field], student.id], resolve);
                                    }));
                                }
                            });
                            // Education Details updates
                            ["tenth_board", "tenth_percentage", "twelfth_board", "twelfth_percentage"].forEach(field => {
                                if (updates[field]) {
                                    updatePromises.push(new Promise((resolve) => {
                                        db.run(`UPDATE education_details SET ${field} = ? WHERE student_id = ?`, [updates[field], student.id], resolve);
                                    }));
                                }
                            });
                            // Course updates
                            if (updates.course) {
                                updatePromises.push(new Promise((resolve) => {
                                    db.get('SELECT id FROM courses WHERE LOWER(title) LIKE ?', [`%${updates.course.toLowerCase()}%`], (err, c) => {
                                        const applyCourse = (courseId) => {
                                            if (appRec) {
                                                db.run('UPDATE applications SET course_id = ? WHERE student_id = ?', [courseId, student.id], resolve);
                                            }
                                            else {
                                                db.run('INSERT INTO applications (student_id, course_id, status) VALUES (?, ?, ?)', [student.id, courseId, 'submitted'], resolve);
                                            }
                                        };
                                        if (c) {
                                            applyCourse(c.id);
                                        }
                                        else {
                                            db.run('INSERT INTO courses (title, duration_months, fee) VALUES (?, ?, ?)', [updates.course, 6, 0], function (err) {
                                                if (!err)
                                                    applyCourse(this.lastID);
                                                else
                                                    resolve(undefined);
                                            });
                                        }
                                    });
                                }));
                            }
                            await Promise.all(updatePromises);
                        }
                        return res.json(aiResponse);
                    }
                    catch (error) {
                        console.error("Gemini AI error:", error);
                        return res.json({ reply: "Sorry, I'm having trouble connecting to my AI brain.", updates: null });
                    }
                });
            });
        });
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map