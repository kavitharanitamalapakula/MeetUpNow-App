import { auth } from './firebaseConfig';
import { GoogleAuthProvider, signInWithPopup, signInAnonymously, sendPasswordResetEmail as firebaseSendPasswordResetEmail } from 'firebase/auth';

const provider = new GoogleAuthProvider();

export const googleSignIn = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        return { user, token };
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData?.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        throw { errorCode, errorMessage, email, credential };
    }
};

export const anonymousSignIn = async () => {
    try {
        const result = await signInAnonymously(auth);
        const user = result.user;
        return { user };
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        throw { errorCode, errorMessage };
    }
};

// New function to send password reset email
export const sendPasswordResetEmail = async (email) => {
    try {
        await firebaseSendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        throw { errorCode, errorMessage };
    }
};
