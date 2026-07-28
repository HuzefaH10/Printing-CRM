import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  sendPasswordResetEmail,
  updatePassword,
  deleteUser
} from "firebase/auth";
import { auth } from "@/config/firebase";
import { UserService } from "./user.service";

export class AuthService {
  static async loginWithEmail(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await UserService.updateLastLogin(userCredential.user.uid);
    return userCredential.user;
  }

  static async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // Check if profile exists, if not create one (Owner by default for the first user, but Viewer normally)
    // For this OS foundation, we'll default to Viewer, but since it's the owner's OS, we might want Owner.
    let profile = await UserService.getProfile(userCredential.user.uid);
    if (!profile) {
      profile = await UserService.createProfile(userCredential.user, "Owner");
    } else {
      await UserService.updateLastLogin(userCredential.user.uid);
    }
    
    return userCredential.user;
  }

  static async logout() {
    await signOut(auth);
  }

  static async resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  static async changePassword(newPassword: string) {
    if (auth.currentUser) {
      await updatePassword(auth.currentUser, newPassword);
    }
  }

  static async deleteAccount() {
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
  }
}
