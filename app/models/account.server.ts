import type { User } from "./user.server";
import { supabase } from "./user.server";

export type Account = {
  id: string;
  title: string;
};

export async function getAccountListItems({ userId }: { userId: User["id"] }) {
  const { data } = await supabase
    .from("accounts")
    .select("id, title")
    .eq("profile_id", userId);

  return data;
}

export async function addAccount({
  title,
  userId,
}: Pick<Account, "title"> & { userId: User["id"] }) {
  const { data, error } = await supabase
    .from("notes")
    .insert([{ title, profile_id: userId }])
    .single();

  if (!error) {
    return data;
  }

  return null;
}

export async function deleteAccount({
  id,
  userId,
}: Pick<Account, "id"> & { userId: User["id"] }) {
  const { error } = await supabase
    .from("notes")
    .delete({ returning: "minimal" })
    .match({ id, profile_id: userId });

  if (!error) {
    return {};
  }

  return null;
}

export async function getAccount({
  id,
  userId,
}: Pick<Account, "id"> & { userId: User["id"] }) {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("profile_id", userId)
    .eq("id", id)
    .single();

  if (!error) {
    return {
      userId: data.profile_id,
      id: data.id,
      title: data.title,
    };
  }

  return null;
}
