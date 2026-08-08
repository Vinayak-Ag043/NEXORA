export default function NexoraMark({ size = 48, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield */}
      <path
        d="M50 8
           L82 21
           V45
           C82 66 69 82 50 92
           C31 82 18 66 18 45
           V21
           L50 8Z"
        stroke="#9B6CFF"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* N */}
      <path
        d="M34 64V36L66 64V36"
        stroke="#22D3EE"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Small connection nodes */}
      <circle
        cx="34"
        cy="36"
        r="3.5"
        fill="#22D3EE"
      />

      <circle
        cx="66"
        cy="36"
        r="3.5"
        fill="#22D3EE"
      />
    </svg>
  );
}