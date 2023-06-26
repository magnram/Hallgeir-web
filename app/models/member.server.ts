import { supabase } from "./user.server";

import type { NameAmountItem } from "./transaction.server";
import type { User } from "./user.server";

export interface Member extends NameAmountItem {
  id: string
  description: string
	amount?: number
	order?: number
	active: boolean
};

export async function getMemberListItems({ user_id }: { user_id: User["id"] }) {
  const { data } = await supabase
    .from("members")
    .select("id, description, active, order")
    .eq("user_id", user_id);
  return data;
}

export async function updateAndInsertMembers(members: Member[], user_id: User["id"]) {
	const inactiveMembers = members.filter(member => !member.active).map(member => member.id);
	
	if (inactiveMembers.length > 0) {
		for (const memberId of inactiveMembers) {
			const { error: transactionsError } = await supabase
				.from("transactions")
				.update({ member_id: null })
				.eq("member_id", memberId);

			// Handle any errors during transactions update
			if (transactionsError) {
				console.error(transactionsError);
				return { error: transactionsError };
			}
		}
}

	const { data, error } = await supabase
		.from("members")
		.upsert(members.map((item) => {
			const newItem: any = { 
				id: item.id,
				description: item.description,
				active: item.active,
				order: item.order,
				user_id: user_id
			}
			return newItem;
		}));
	if (!error) return { data, inactiveMembers };
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
