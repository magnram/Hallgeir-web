import type { User } from "./user.server";
import { supabase } from "./user.server";

export type Account = {
  id: string;
  name: string;
};


export async function getAccountListItems({ user_id }: { user_id: User["id"] }) {
  const { data } = await supabase
    .from("accounts")
    .select("id, name")
    .eq("user_id", user_id);
  return data;
}

export async function addAccount({
  name,
  user_id,
}: Pick<Account, "name"> & { user_id: User["id"] }) {
  const { data, error } = await supabase
    .from("accounts")
    .insert([{ name, user_id: user_id }])
    .single();

  if (!error) {
    return data;
  }

  return null;
}

export async function deleteAccount({
  id,
  user_id,
}: Pick<Account, "id"> & { user_id: User["id"] }) {
  const { error } = await supabase
    .from("notes")
    .delete({ returning: "minimal" })
    .match({ id, user_id: user_id });

  if (!error) {
    return {};
  }

  return null;
}

export async function getAccount({
  id,
  user_id,
}: Pick<Account, "id"> & { user_id: User["id"] }) {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user_id)
    .eq("id", id)
    .single();

  if (!error) {
    return {
      user_id: data.user_id,
      id: data.id,
      name: data.name,
    };
  }

  return null;
}
