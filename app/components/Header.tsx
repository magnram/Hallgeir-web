import { Form, NavLink, useLocation, useNavigate } from "@remix-run/react";
import { useUser } from "~/utils";

export default function Header () {
  const user = useUser();
	const navigate = useNavigate()
	const location = useLocation();
	const goBack = () => navigate(-1);

	return (
    <header className="bg-violet-800 w-full">
			<div className="flex items-center justify-between p-2 text-white max-w-3xl m-auto">
				<p>{location.pathname === "/home" ? user.email : <button
					onClick={goBack}
					className="flex flex-col items-center rounded bg-violet-600 py-1 px-5 text text-white hover:bg-white-500 active:bg-blue-600"
				> 
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
						<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
					</svg>
				</button>}</p>
				<div className="flex gap-4">

					
					<NavLink to="/upload">
						<button
							type="submit"
							className="flex flex-col items-center rounded bg-violet-600 py-1 px-5 text text-white hover:bg-white-500 active:bg-blue-600"
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
								<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
							</svg>
						</button>
					</NavLink>
					<Form action="/logout" method="post">
						<button
							type="submit"
							className="rounded bg-violet-600 py-1 px-2 text-white hover:bg-white-500 active:bg-blue-600"
						>
							Logg ut
						</button>
					</Form>
				</div>
			</div>
    </header>
  );
}