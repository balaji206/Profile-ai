const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyDmH9ILwHXT7g4HBVjbkYLgkI_MunIdfg4');

async function run() {
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-pro'];
    let log = '';
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            await model.generateContent('hello');
            log += m + ': Success!\n';
        } catch (e) {
            log += m + ': ERROR ' + e.message + '\n';
        }
    }
    fs.writeFileSync('gemini_err.txt', log);
}
run();
