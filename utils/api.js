const BASE_URL = 'http://localhost:3000';

const fetchUserTok = async function() {
    try {
        const response = await fetch('/getUserTok');

        if(!response.ok) {
            throw new Error('Error getting user cookie data');
        }
        const data = await response.json();
        return data;
    } catch (err) {
        console.error('Failed to fetch data');
        return null;
    }
}

const fetchUserData = async function(user_uid) {
    try {
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