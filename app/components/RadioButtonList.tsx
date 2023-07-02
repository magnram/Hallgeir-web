import { useState } from "react";
import RadioButton from "./RadioButton";

import type { ChangeEvent} from "react";
import type { NameAmountItem } from "~/models/transaction.server";

interface RadioButtonListProps {
	listItems: NameAmountItem[]
	transactionItems: NameAmountItem[];
	onChange: (id: string) => void;
	onManageClick: (name: string) => void;
	name: string;
	includeUnassigned?: boolean;
	includeManageButton?: boolean;
}

export const sum = (listItems: NameAmountItem[]): number => {
	return Math.round(100 * listItems.reduce((partialSum, a) => partialSum + (a.amount || 0), 0))/100
}

const RadioButtonList = ({ listItems, transactionItems, onChange, onManageClick, name, includeUnassigned, includeManageButton }: RadioButtonListProps) => {
	const [selectedAccount, setSelectedAccount] = useState<string>("0");

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const id = event.target.value;
		setSelectedAccount(id);
		onChange(id);
	}

	if(!transactionItems) return null;
	if(listItems !== null && !listItems.filter((item) => item.active).length) return <p> Ingen {name} funnet. <button className="underline text-violet-500" onClick={() => onManageClick(name)}> Vennligst legg til {name} </button> </p>;

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
			{listItems.filter((a) => a.active).sort((a, b) => (a.order || 1000) - (b.order || 1000)).map((item) => {
				const amount = sum(transactionItems.filter((a) => item.id == a.id));
				return (
					<RadioButton
						id={item.id || item.description + item.amount}
						key={item.id}
						name={name}
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
			{includeManageButton && (
				<RadioButton
					id={(listItems.length+2).toString()}
					name={name}
					title={`Administrer ${name}`}
					onChange={() => {}}
					onClick={() => {
						if (onManageClick) onManageClick(name)
					}}
					isChecked={selectedAccount === (listItems.length+2).toString()}
					amount={sum(transactionItems.filter((a) => !a.id))}
					isManageButton={true}
				/>
			)}
		</div>
	)
};

export default RadioButtonList;
