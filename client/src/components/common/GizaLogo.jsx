export default function GizaLogo({ size = 40, className = '' }) {
  const h = size;
  const w = size * 1.1;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 110 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Geometric G - Giza Systems logo */}
      {/* Outer hexagonal G shape */}
      <path
        d="M55 2 L98 25 L98 65 L55 88 L55 68 L78 55 L78 35 L55 22 L32 35 L32 55 L55 68 L55 88 L12 65 L12 25 Z"
        fill="#1B3A5C"
      />
      {/* Lower/inner accent in lighter blue */}
      <path
        d="M55 88 L12 65 L12 45 L55 68 Z"
        fill="#2B98D6"
      />
      <path
        d="M55 68 L32 55 L32 35 L55 48 Z"
        fill="#2B98D6"
      />
      <path
        d="M55 68 L55 88 L40 80 L40 60 Z"
        fill="#2188C4"
      />
    </svg>
  );
}
