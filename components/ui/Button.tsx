interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "danger";
	fullWidth?: boolean;
}

export function Button({
	variant = "primary",
	fullWidth,
	className = "",
	children,
	...props
}: ButtonProps) {
	const base =
		"min-h-[48px] px-6 py-3 rounded-lg font-body font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed";
	const variants = {
		primary: "bg-team-green text-white hover:brightness-110",
		secondary:
			"bg-board-green-light text-text-primary border border-text-muted hover:brightness-110",
		danger: "bg-danger text-white hover:brightness-110",
	};
	return (
		<button
			className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
}
