interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export default function Logo({
  size = 32,
  className = '',
  showText = true,
  textClassName = 'text-xl font-bold text-gray-900'
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 배경 원 */}
        <circle cx="256" cy="256" r="240" fill="#3B82F6"/>

        {/* 왼쪽 눈 < */}
        <path
          d="M140 180 L100 220 L140 260"
          stroke="white"
          strokeWidth="28"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 오른쪽 눈 > */}
        <path
          d="M372 180 L412 220 L372 260"
          stroke="white"
          strokeWidth="28"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 큰 미소 */}
        <path
          d="M140 320 Q256 420 372 320"
          stroke="white"
          strokeWidth="28"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {showText && (
        <span className={textClassName}>CodeBuddy</span>
      )}
    </div>
  );
}
