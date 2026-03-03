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
            db.all('SELECT courses.title, applications.status FROM applications JOIN courses ON applications.course_id = courses.id WHERE applications.student_id = ?', [student.id], (err, appRows) => {
                const courseTitles = appRows?.map(r => r.title).join(', ') || '';
                const courseStatuses = appRows?.map(r => r.status).join(', ') || '';
                res.json({
                    full_name: student.full_name,
                    email: student.email,
                    phone: student.phone || '',
                    profile_image: student.profile_image || '',
                    date_of_birth: student.date_of_birth || '',
                    city: student.city || '',
                    tenth_board: edu?.tenth_board || '',
                    tenth_percentage: edu?.tenth_percentage || '',
                    twelfth_board: edu?.twelfth_board || '',
                    twelfth_percentage: edu?.twelfth_percentage || '',
                    course: courseTitles,
                    status: courseStatuses
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
        db.run(`UPDATE students SET full_name = ?, phone = ?, date_of_birth = ?, city = ?, profile_image = ? WHERE id = ?`, [data.full_name, data.phone, data.date_of_birth, data.city, data.profile_image, student.id], () => {
            db.run(`UPDATE education_details SET tenth_board = ?, tenth_percentage = ?, twelfth_board = ?, twelfth_percentage = ? WHERE student_id = ?`, [data.tenth_board, data.tenth_percentage, data.twelfth_board, data.twelfth_percentage, student.id], () => {
                res.json({ success: true, updates: data });
            });
        });
    });
});
app.post('/api/register', (req, res) => {
    const { full_name, email, password } = req.body;
    db.get('SELECT id FROM students WHERE email = ?', [email], (err, student) => {
        if (err)
            return res.status(500).json({ error: "Database error" });
        if (student)
            return res.status(400).json({ error: "Email already registered" });
        db.run('INSERT INTO students (full_name, email, password) VALUES (?, ?, ?)', [full_name, email, password], function (err) {
            if (err)
                return res.status(500).json({ error: "Failed to register profile" });
            const newStudentId = this.lastID;
            db.run('INSERT INTO education_details (student_id) VALUES (?)', [newStudentId], (err) => {
                res.json({ success: true, message: "Registered successfully" });
            });
        });
    });
});
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    // Demo Account Fallback
    if (email === "demo@forge.ai" && password === "password123") {
        return res.json({ id: "1", full_name: "Demo User", email: "demo@forge.ai" });
    }
    db.get('SELECT * FROM students WHERE email = ? AND password = ?', [email, password], (err, student) => {
        if (err)
            return res.status(500).json({ error: "Database error" });
        if (!student)
            return res.status(401).json({ error: "Invalid credentials" });
        res.json({ id: student.id.toString(), full_name: student.full_name, email: student.email });
    });
});
const generative_ai_1 = require("@google/generative-ai");
// Initialize Gemini with the API Key from environment variables
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in the environment.");
}
const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey || 'AIzaSyB2oINLU96RTGwmJZRQl_ICyPNnNYtyKSA');
// Fallback LLM Engine for robustness against quotas
async function callLLMWithFallback(prompt, model) {
    // 1. Try Groq (Fastest)
    if (process.env.GROQ_API_KEY) {
        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: prompt }]
                })
            });
            if (res.ok) {
                const data = await res.json();
                return data.choices[0].message.content;
            }
        }
        catch (e) {
            console.error("Groq fallback failed:", e);
        }
    }
    // 2. Try OpenAI
    if (process.env.OPENAI_API_KEY) {
        try {
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }]
                })
            });
            if (res.ok) {
                const data = await res.json();
                return data.choices[0].message.content;
            }
        }
        catch (e) {
            console.error("OpenAI fallback failed:", e);
        }
    }
    // 3. Try Gemini (Original)
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    }
    catch (e) {
        console.error("Gemini failed:", e);
    }
    throw new Error("All LLM providers failed.");
}
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
                        const responseText = await callLLMWithFallback(prompt, model);
                        // Parse JSON safely
                        let aiResponse;
                        try {
                            const jsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
                            aiResponse = JSON.parse(jsonStr);
                        }
                        catch (e) {
                            console.error("Failed to parse LLM JSON:", responseText);
                            return res.json({ reply: "I couldn't quite understand that. Please try rephrasing.", updates: null });
                        }
                        // Apply updates if any
                        if (aiResponse.updates && typeof aiResponse.updates === 'object' && Object.keys(aiResponse.updates).length > 0) {
                            const updates = aiResponse.updates;
                            // Align LLM aliases to strict DB schema format
                            if (updates.name)
                                updates.full_name = updates.name;
                            if (updates.mail || updates.mail_id)
                                updates.email = updates.mail || updates.mail_id;
                            if (updates.mobile)
                                updates.phone = updates.mobile;
                            if (updates.location || updates.address)
                                updates.city = updates.location || updates.address;
                            if (updates.dob || updates.birthday)
                                updates.date_of_birth = updates.dob || updates.birthday;
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
                            const courseValue = updates.course || updates.enrolled_course || updates["enrolled course"] || updates.course_name;
                            if (courseValue) {
                                updatePromises.push(new Promise((resolve) => {
                                    db.get('SELECT id FROM courses WHERE LOWER(title) LIKE ?', [`%${courseValue.toLowerCase()}%`], (err, c) => {
                                        if (err)
                                            console.error("Error finding course:", err);
                                        const applyCourse = (courseId) => {
                                            db.get('SELECT id FROM applications WHERE student_id = ? AND course_id = ?', [student.id, courseId], (err, existing) => {
                                                if (!existing) {
                                                    db.run('INSERT INTO applications (student_id, course_id, status) VALUES (?, ?, ?)', [student.id, courseId, 'submitted'], (err) => {
                                                        if (err)
                                                            console.error("Error inserting application:", err);
                                                        resolve(undefined);
                                                    });
                                                }
                                                else {
                                                    resolve(undefined);
                                                }
                                            });
                                        };
                                        if (c) {
                                            applyCourse(c.id);
                                        }
                                        else {
                                            db.run('INSERT INTO courses (title, duration_months, fee) VALUES (?, ?, ?)', [courseValue, 6, 0], function (err) {
                                                if (err)
                                                    console.error("Error inserting course:", err);
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