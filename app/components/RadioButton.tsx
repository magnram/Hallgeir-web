import type { ChangeEvent } from "react";

interface RadioButtonProps {
  id: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isChecked: boolean;
	name: string;
	title: string;
	amount: number;
}

const RadioButton = ({ id, name, onChange, isChecked, title, amount }: RadioButtonProps) => (
  <label
    className={`${!amount ? 'bg-gray-100' : 'bg-white cursor-pointer'} flex flex-col items-center p-1 m-1 border-[1px] space-y-1 max-w-[6rem] ${isChecked && 'border-violet-500'}`}
    htmlFor={name + id.toString()}
  >
    <input
      disabled={!amount}
      type="radio"
      id={name + id.toString()}
      name={name}
      value={id}
      checked={isChecked}
      onChange={onChange}
      className="hidden"
    />
		<p className="text-m text-gray-600">{title}</p>
		<p className={`text-sm font-bold ${amount ? "text-violet-900" : "text-gray-500"}`}>{Math.round(amount*100)/100}&nbsp;kr</p>
  </label>
);

export default RadioButton;