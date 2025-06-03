import { fetchWithToken } from './fetchWithToken';

export const getMeetings = async () => {
    try {
        const data = await fetchWithToken('/meetings');
        return data;
    } catch (error) {
        console.error('Error fetching meetings:', error);
        throw error;
    }
};

export const startMeeting = async (meetingId) => {
    try {
        const data = await fetchWithToken(`/meetings/startmeet/${meetingId}`, {
            method: 'POST',
        });
        return data;
    } catch (error) {
        console.error('Error starting meeting:', error);
        throw error;
    }
};
