import type { User } from "./user.server";
import { supabase } from "./user.server";

export type Member = {
  id: string;
  name: string;
};


export async function getMemberListItems({ user_id }: { user_id: User["id"] }) {
  const { data } = await supabase
    .from("members")
    .select("id, name")
    .eq("user_id", user_id);
  return data;
}

export async function addMember({
  name,
  user_id,
}: Pick<Member, "name"> & { user_id: User["id"] }) {
  const { data, error } = await supabase
    .from("members")
    .insert([{ name, user_id: user_id }])
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
    .from("notes")
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
      name: data.name,
    };
  }

  return null;
}
