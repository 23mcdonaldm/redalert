const BASE_URL = 'http://localhost:3000';

async function fetchUserTok() {
    try {
        const response = await fetch('/getUserTok');

        if(!response.ok) {
            throw new Error('Error getting user cookie data');
        }
        const data = await response.json();
        console.log('User data: ', data);

        return data;
    } catch (err) {
        console.error('Failed to fetch data');
        return null;
    }
}

async function fetchUserData(user_uid) {
    try {
        console.log("UID: " + user_uid);
        const response = await fetch(`${BASE_URL}/fetchUserData/${user_uid}`);
        if(!response.ok) {
            throw new Error('Error getting user details');
        }
        const user = await response.json();
        return user;
    } catch (err) {
        console.error('Failed to fetch user details', err);
        return null;
    }
}

export { fetchUserData, fetchUserTok }