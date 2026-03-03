fetch('http://127.0.0.1:5000/api/profile/demo@forge.ai')
    .then(r => r.json())
    .then(console.log)
    .catch(console.error);
