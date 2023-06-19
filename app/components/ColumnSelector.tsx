import type { ChangeEvent } from "react";
import React from "react";
import type { CSVData } from "~/routes/upload";

interface ColumnSelectorProps {
  data: CSVData[];
	requiredColumns: string[];
	csvColumns: string[];
	cols: string[];
	setCols: React.Dispatch<React.SetStateAction<string>>[];
}


const ColumnSelector: React.FC<ColumnSelectorProps> = ({ data, requiredColumns, csvColumns, cols, setCols }) => {

	return (
		<div className="w-full">
			{requiredColumns.map((requiredColumn, idx) => (
				<ColumnSelectorSelect 
					key={idx}
					columnName={ requiredColumn } 
					col={ cols[idx] }
					setCol={ setCols[idx] } 
					columns={ csvColumns } 
					sampleData={ data.slice(0, 2) }				
				/>
			))}
		</div>
	);
};

export default ColumnSelector;

interface ColumnSelectorSelectProps {
	columnName: string
	col: string
	setCol: React.Dispatch<React.SetStateAction<string>>
	columns: string[]
	sampleData: CSVData[]
}

const ColumnSelectorSelect = ({ columnName, col, setCol, columns, sampleData }: ColumnSelectorSelectProps) => {
	
	const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
		setCol(event.target.value);
	}

	return (
		<div>
			<label className="font-bold text-xs" htmlFor="dateCol"> Velg { columnName }-kolonne </label><br/>
			<select value={col} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
				{columns.length > 1 ? <option value=""> Velg en kolonne </option> : null }
				{columns.map((col, idx) => 
					<option key={idx} value={col} className="w-full">
						{col} ({ sampleData.map(row => row[col]).join(', ') + ", ..." })
					</option>
				)}
			</select>
		</div>
	);

};