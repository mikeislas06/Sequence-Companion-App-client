interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
}

export function Input({ label, className = "", id, ...props }: InputProps) {
	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label htmlFor={id} className="text-sm text-text-muted">
					{label}
				</label>
			)}
			<input
				id={id}
				className={`min-h-[48px] px-4 py-3 rounded-lg bg-surface-dark border border-text-muted text-text-primary placeholder:text-text-muted focus:outline-none focus:border-team-green ${className}`}
				{...props}
			/>
		</div>
	);
}
