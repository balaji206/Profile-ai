# Gradia - AI Profile Updater

An **AI-powered profile management system** where users can update their profile simply by **chatting with an AI assistant**.  
Instead of manually editing profile fields, users describe the changes in natural language and the AI automatically updates the relevant sections.

Built using **React, Tailwind CSS, and SQLite** for a lightweight and modern full-stack experience.

---

## 🚀 Features

- 💬 **AI Chat Interface**
  - Users can interact with an AI assistant to modify profile details.

- 🧠 **Natural Language Profile Updates**
  - Example:  
  `"Update my bio to Full Stack Developer passionate about AI"`  
  The AI automatically updates the **bio field**.

- 👤 **Dynamic Profile Management**
  - Update fields like:
  - Name
  - Bio
  - Skills
  - Location
  - Experience

- ⚡ **Real-time UI Updates**
  - Profile updates instantly after AI processing.

- 🎨 **Modern UI**
  - Built with **React + Tailwind CSS** for a clean and responsive design.

- 🗄 **Lightweight Database**
  - Uses **SQLite** for simple and efficient data storage.

---

## 🛠 Tech Stack

| Technology | Usage |
|------------|-------|
| **React** | Frontend UI |
| **Tailwind CSS** | Styling |
| **Node.js / Express** | Backend API |
| **SQLite** | Database |
| **AI Integration** | Chat-based profile updates |

---

## 📂 Project Structure

```
AI-Profile-Updater
│
├── client
│ ├── components
│ ├── pages
│ └── App.js
│
├── server
│ ├── routes
│ ├── controllers
│ └── database
│
├── README.md
└── package.json
```

---

## ⚙️ Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/ai-profile-updater.git
cd ai-profile-updater
``` 
### 2️⃣ Install Dependencies

#### Frontend
```bash
cd client
npm install
```
#### Backend
```bash
cd server
npm install
```
### 3️⃣ Run the Project
Start Backend
```bash
npm start
```
Start Frontend
```bash
npm run dev

```
### 💡 Example Usage

User message in chat:
```
"Add React, Node.js and TypeScript to my skills"
```
AI response:
```
Skills updated successfully!
```

### 🌟 Future Improvements

- AI context understanding for complex updates
- Voice based profile updates
- Multi-user authentication
- Cloud database integration
- AI suggestions for profile improvement
