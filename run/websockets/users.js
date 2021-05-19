const users = new Map();

function addUser(id, name, room) {
    // const existingUser = users.find(user => user.name.trim().toLowerCase() === name.trim().toLowerCase())
    
    // if (existingUser) return { error: "Username has already been taken" }
    // if (!name && !room) return { error: "Username and room are required" }
    // if (!name) return { error: "Username is required" }
    // if (!room) return { error: "Room is required" }

    users.set(id, {user: name, room})
}

function getUser(id) {
    return users.get(id) || {};
}

function deleteUser(id) {
    const user = getUser(id);
    users.delete(id);
    return user;
}


module.exports = { addUser, getUser, deleteUser }