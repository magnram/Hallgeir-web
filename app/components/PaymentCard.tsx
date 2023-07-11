import type { Payment } from "~/models/payment.server";
import { sum } from "./RadioButtonList";
import { useNavigate } from "@remix-run/react";

interface PaymentCardProps {
	payment: Payment;
}

const PaymentCard = ({ payment }: PaymentCardProps) => {
	const navigate = useNavigate();

	const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

	return (
		<div className="flex bg-white shadow cursor-pointer hover:bg-gray-50 rounded-sm overflow-hidden" onClick={() => navigate("/payments/" + payment.id)}>
			<div className={`w-1 ${payment.completed ? "bg-green-700" : "bg-violet-700"}`}></div>
			<div className="flex flex-col flex-1 gap-3 p-3">
				<div className="flex justify-between">
					<p className="text-gray-500 "> { payment.account.description } </p>
					<p className="font-bold text-lg"> {payment.transactions ? sum(payment.transactions) : "?"} kr </p>
				</div>
				<div className="flex">
					<p className="text-4xl"> {payment.name} </p>
				</div>
				<div className="flex justify-between">
					<p className="text-gray-500 italic"> {payment.transactions && payment.transactions.length} kjøp </p>
					<p className="text-gray-500"> Lastet opp {new Date(payment.created_at).toLocaleDateString("no-NO", dateOptions)} </p>
				</div>
			</div>
			<div className="flex items-center p-2">
				<svg width="14" height="30" viewBox="0 0 14 38" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M1 36.6364L12.4018 20.8198C12.5901 20.5667 12.7407 20.2578 12.8437 19.9131C12.9468 19.5683 13 19.1953 13 18.8182C13 18.441 12.9468 18.068 12.8437 17.7233C12.7407 17.3785 12.5901 17.0697 12.4018 16.8166L1 1" stroke="#B6B6B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			</div>
		</div>
	)
}

export default PaymentCard;