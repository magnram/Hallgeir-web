import type { CSVData } from "~/routes/upload"

interface ColumnPreviewProps {
	data: CSVData[]
	requiredColumns: string[]
	selectedColumns: string[]
}

const ColumnPreview = ({data, requiredColumns, selectedColumns}: ColumnPreviewProps) => (
		<div className="relative pt-2 sm:pt-4 w-full">
			<h1 className="text-xl sm:pb-2">Forhåndsvisning ({data.length} transaksjoner) </h1>
			<div className="overflow-x-auto max-h-60">
				<table className="w-full text-sm text-left text-gray-500">
					<thead className="text-xs text-gray-700 uppercase bg-gray-50">
						<tr>
							{ requiredColumns.map((columnName, idx) => (
								<th key={idx} scope="col" className="px-3 py-3">
									{columnName}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{ data.map((row, idx) => (
							<tr key={idx} className="bg-white border-b">
									{selectedColumns.map((columnName, idx) => (
										<td key={idx} className="px-3 py-4">
											{row[columnName]}
										</td>
									))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
);

export default ColumnPreview;