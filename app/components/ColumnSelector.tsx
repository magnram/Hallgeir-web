import type { ChangeEvent } from "react";
import React from "react";
import MinusIcon from "~/icons/MinusIcon";
import PlusIcon from "~/icons/PlusIcon";
import type { CSVData, ColumnData } from "~/routes/upload";

interface ColumnSelectorProps {
  data: CSVData[];
	columns: ColumnData[];
	setActive: (name: string, active: boolean) => void;
	setColumnValue: (name: string, value: string) => void;
}


const ColumnSelector: React.FC<ColumnSelectorProps> = ({ data, columns, setActive, setColumnValue }) => (
	<div className="w-full flex flex-col gap-3">
		{columns.map((column, idx) => (
			<ColumnSelectorSelect 
				required={column.required}
				active={column.active}
				setActive={(active: boolean) => setActive(column.name!, active)}
				key={idx}
				columnName={ column.name! } 
				col={ column.value }
				setColumn={setColumnValue} 
				columns={ column.csvColumns } 
				sampleData={ data.slice(0, 2) }				
			/>
		))}
	</div>
);

export default ColumnSelector;

interface ColumnSelectorSelectProps {
	columnName: string
	col: string
	setColumn: (name: string, value: string) => void
	columns: string[]
	sampleData: CSVData[]
	required: boolean
	active: boolean
	setActive: (active: boolean) => void;
}

const ColumnSelectorSelect = ({ columnName, col, setColumn, columns, sampleData, required, active, setActive }: ColumnSelectorSelectProps) => {

	const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setColumn(columnName, event.target.value);
	}

	const disabled = columns.length == 1;
	if(disabled) return null;


	if(!active) return (
		<button onClick={() => setActive(true)} className="text-gray-400 flex items-center p-2 gap-3 w-full">
			<PlusIcon className="w-3 h-3 text-gray-400 dark:text-white"/> <p>Legg til { columnName }-kolonne</p>
		</button>
	);

	return (
		<div>
			<label className="font-bold text-xs" htmlFor="dateCol"> Velg { columnName }-kolonne </label><br/>
			<div className="flex gap-3">
				<select value={col} onChange={handleChange} disabled={disabled} className="disabled:bg-gray-200 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
					{columns.length > 1 ? <option value=""> Velg en kolonne </option> : null }
					{columns.map((col, idx) => 
						<option key={idx} value={col} className="w-full">
							{col} ({ sampleData.map(row => row[col]).join(', ') + ", ..." })
						</option>
					)}
				</select>
				{!required && <button onClick={() => setActive(false)}>
					<MinusIcon className="w-6 h-6 text-gray-400 dark:text-white"/>
				</button>}
			</div>
		</div>
	);

};