fetch('http://127.0.0.1:5000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'demo@forge.ai',
        message: 'Add Web Development course to enrolled course'
    })
}).then(r => r.json()).then(console.log).catch(console.error);
