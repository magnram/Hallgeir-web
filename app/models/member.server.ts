import { supabase } from "./user.server";

import type { NameAmountItem } from "./transaction.server";
import type { User } from "./user.server";

export interface Member extends NameAmountItem {
  id: string
  description: string
	amount?: number
};


export async function getMemberListItems({ user_id }: { user_id: User["id"] }) {
  const { data } = await supabase
    .from("members")
    .select("id, description")
    .eq("user_id", user_id);
  return data;
}

export async function addMember({
  description,
  user_id,
}: Pick<Member, "description"> & { user_id: User["id"] }) {
  const { data, error } = await supabase
    .from("members")
    .insert([{ description, user_id }])
    .single();

  if (!error) {
    return data;
  }

  return null;
}

export async function deleteMember({
  id,
  user_id,
}: Pick<Member, "id"> & { user_id: User["id"] }) {
  const { error } = await supabase
    .from("members")
    .delete({ returning: "minimal" })
    .match({ id, user_id: user_id });

  if (!error) {
    return {};
  }

  return null;
}

export async function getMember({
  id,
  user_id,
}: Pick<Member, "id"> & { user_id: User["id"] }) {
  const { data, error } = await supabase
    .from("members")
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
