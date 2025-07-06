"use server";

import { revalidateTag } from "next/cache";
import {
  saveWorkdayOnServer,
  deleteWorkdayOnServer,
  updateUserProfileOnServer,
  deleteProfileOnServer,
} from "@/lib/data";
import { RegistrationComplition, Workday } from "@/types";

export async function saveWorkdayAction(workday: Workday) {
  try {
    console.log("Saving workday:", workday);
    await saveWorkdayOnServer(workday);
    // Revalidate the 'workdays' tag. This will refresh data on all pages
    // that use the getUserWorkdays() function.
    revalidateTag("workdays");
    return { success: true };
  } catch (error) {
    console.error("Server Action Error (saveWorkdayAction):", error);
    return { success: false, error: "Failed to save workday." };
  }
}

export async function deleteWorkdayAction(date: string) {
  try {
    await deleteWorkdayOnServer(date);
    revalidateTag("workdays");
    return { success: true };
  } catch (error) {
    console.error("Server Action Error (deleteWorkdayAction):", error);
    return { success: false, error: "Failed to delete workday." };
  }
}

// ** Profile page actions **
export async function updateUserProfileAction(
  profileData: RegistrationComplition
) {
  try {
    await updateUserProfileOnServer(profileData);

    revalidateTag("userProfile");

    return { success: true };
  } catch (error) {
    console.error("Server Action Error (updateUserProfileAction):", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Profiilin päivitys epäonnistui." };
  }
}

export async function deleteUserAccountAction() {
  try {
    await deleteProfileOnServer();
    // No need to revalidate after delete, the user will be signed out.
    return { success: true };
  } catch (error) {
    console.error("Server Action Error (deleteUserAccountAction):", error);
    return { success: false, error: "Käyttäjän poisto epäonnistui." };
  }
}
