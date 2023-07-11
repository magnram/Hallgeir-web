import type { ChangeEvent, MouseEventHandler } from "react";

interface RadioButtonProps {
  id: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onClick?: MouseEventHandler<HTMLInputElement>;
  isChecked: boolean;
	name: string;
	title: string;
	amount?: number;
	isManageButton?: boolean;
	showAmount?: boolean;
}

const RadioButton = ({ id, name, onChange, onClick, isChecked, title, amount, isManageButton, showAmount }: RadioButtonProps) => {
	const disabled = !amount && !isManageButton && showAmount;

	return (
		<label
			className={`${disabled ? '' : 'cursor-pointer'} ${isManageButton ? "bg-gray-200 text-sm" : "bg-white"} ${isChecked && 'border-violet-500'} h-[62px] justify-center flex text-center flex-col rounded-md items-center p-1 m-1 border-[1px] min-w-[4rem] space-y-1 max-w-[6rem]`}
			htmlFor={name + id.toString()}
		>
			<input
				disabled={disabled}
				type={!isManageButton ? "radio" : "button"}
				id={name + id.toString()}
				name={name}
				value={id}
				checked={isChecked}
				onChange={onChange}
				onClick={onClick}
				className="hidden"
			/>
			<p className="text-m text-gray-600">{title}</p>
			{!isManageButton && amount && <p className={`text-xs font-bold ${amount ? "text-violet-900" : "text-gray-500"}`}>{Math.round(amount*100)/100}&nbsp;kr</p>}
		</label>
	)
};

export default RadioButton;