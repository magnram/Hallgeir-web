import type { User } from "./user.server";
import { supabase } from "./user.server";

export type Note = {
  id: string;
  title: string;
  body: string;
  profile_id: string;
};

export async function getNoteListItems({ user_id }: { user_id: User["id"] }) {
  const { data } = await supabase
    .from("notes")
    .select("id, title")
    .eq("user_id", user_id);

  return data;
}

export async function createNote({
  title,
  body,
  user_id,
}: Pick<Note, "body" | "title"> & { user_id: User["id"] }) {
  const { data, error } = await supabase
    .from("notes")
    .insert([{ title, body, user_id: user_id }])
    .single();

  if (!error) {
    return data;
  }

  return null;
}

export async function deleteNote({
  id,
  user_id,
}: Pick<Note, "id"> & { user_id: User["id"] }) {
  const { error } = await supabase
    .from("notes")
    .delete({ returning: "minimal" })
    .match({ id, profile_id: user_id });

  if (!error) {
    return {};
  }

  return null;
}

export async function getNote({
  id,
  user_id,
}: Pick<Note, "id"> & { user_id: User["id"] }) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("profile_id", user_id)
    .eq("id", id)
    .single();

  if (!error) {
    return {
      user_id: data.profile_id,
      id: data.id,
      title: data.title,
      body: data.body,
    };
  }

  return null;
}
