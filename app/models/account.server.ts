import { supabase } from "./user.server";

import type { NameAmountItem } from "./transaction.server";
import type { User } from "./user.server";

export interface Account extends NameAmountItem {
  id: string
  description: string
	amount?: number
};


export async function getAccountListItems({ user_id }: { user_id: User["id"] }) {
  const { data } = await supabase
    .from("accounts")
    .select("id, description")
    .eq("user_id", user_id);
  return data;
}

export async function addAccount({
  description,
  user_id,
}: Pick<Account, "description"> & { user_id: User["id"] }) {
  const { data, error } = await supabase
    .from("accounts")
    .insert([{ description, user_id: user_id }])
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
    .from("accounts")
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
      description: data.description,
    };
  }

  return null;
}
