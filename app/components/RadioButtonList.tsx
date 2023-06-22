import { useState } from "react";
import RadioButton from "./RadioButton";

import type { ChangeEvent} from "react";
import type { NameAmountItem } from "~/models/transaction.server";

interface RadioButtonListProps {
	listItems: NameAmountItem[]
	transactionItems: NameAmountItem[];
	onChange: (id: string) => void;
	name: string;
	includeUnassigned?: boolean;
}

const RadioButtonList = ({ listItems, transactionItems, onChange, name, includeUnassigned }: RadioButtonListProps) => {
	const [selectedAccount, setSelectedAccount] = useState<string>("0");

	const sum = (listItems: NameAmountItem[]): number => {
		return listItems.reduce((partialSum, a) => partialSum + (a.amount || 0), 0);
	}

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const id = event.target.value;
		setSelectedAccount(id);
		onChange(id);
	}

	return (
		<div className="flex overflow-x-scroll items-center">
			<RadioButton
				id={"0"}
				name={name}
				title="Alle"
				onChange={handleChange}
				isChecked={selectedAccount === "0"}
				amount={sum(transactionItems)}
			/>
			{listItems.map((item) => {
				const amount = sum(transactionItems.filter((a) => item.id == a.id));
				return (
					<RadioButton
						id={item.id || item.description + item.amount}
						key={item.id}
						name="account"
						title={item.description}
						onChange={handleChange}
						isChecked={selectedAccount === item.id}
						amount={amount}
					/>
				);
			})}
			{includeUnassigned && (
				<RadioButton
					id={(listItems.length+1).toString()}
					name={name}
					title="?"
					onChange={handleChange}
					isChecked={selectedAccount === (listItems.length+1).toString()}
					amount={sum(transactionItems.filter((a) => !a.id))}
				/>
			)}
		</div>
	)
};

export default RadioButtonList;