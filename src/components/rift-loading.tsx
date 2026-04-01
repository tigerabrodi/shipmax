import './rift-loading.css'

function RiftLoading() {
  return (
    <div className="rift-loading">
      <div>
        <svg
          className="rift-svg"
          width="220"
          height="220"
          viewBox="0 0 220 220"
          fill="none"
        >
          {/* Outer ring group */}
          <g className="rift-ring-outer">
            <circle
              cx="110"
              cy="110"
              r="100"
              stroke="#3B82F633"
              strokeWidth="0.5"
            />
            <path
              d="M110 15 A95 95 0 0 1 205 110"
              stroke="#60A5FA80"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M205 110 A95 95 0 0 1 110 205"
              stroke="#8B5CF666"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M110 205 A95 95 0 0 1 15 110"
              stroke="#60A5FA80"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M15 110 A95 95 0 0 1 110 15"
              stroke="#8B5CF666"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* Mid ring group */}
          <g className="rift-ring-mid">
            <circle
              cx="110"
              cy="110"
              r="72"
              stroke="#7B2FF266"
              strokeDasharray="12 8"
            />
            <path
              d="M110 45 A65 65 0 0 1 175 110"
              stroke="#A78BFA99"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M45 110 A65 65 0 0 1 110 45"
              stroke="#3B82F64D"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M175 110 A65 65 0 0 1 110 175"
              stroke="#3B82F64D"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M110 175 A65 65 0 0 1 45 110"
              stroke="#A78BFA99"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* Inner ring group */}
          <g className="rift-ring-inner">
            <circle
              cx="110"
              cy="110"
              r="40"
              stroke="#60A5FA80"
              strokeWidth="1.5"
            />
          </g>

          {/* Core group */}
          <g className="rift-ring-core">
            <circle
              cx="110"
              cy="110"
              r="22"
              stroke="#A78BFAB3"
              strokeWidth="2"
            />
            <circle
              cx="110"
              cy="110"
              r="22"
              stroke="#C4B5FD33"
              strokeWidth="8"
            />
          </g>

          {/* Center */}
          <circle cx="110" cy="110" r="10" fill="#5B21F24D" />
          <circle
            className="rift-center-dot"
            cx="110"
            cy="110"
            r="4"
            fill="#C4B5FDCC"
          />

          {/* Orbit dots */}
          <circle
            className="rift-orbit-dot"
            cx="110"
            cy="15"
            r="3"
            fill="#60A5FACC"
          />
          <circle
            className="rift-orbit-dot"
            cx="205"
            cy="110"
            r="2.5"
            fill="#8B5CF6B3"
            style={{ animationDelay: '0.5s' }}
          />
          <circle
            className="rift-orbit-dot"
            cx="175"
            cy="110"
            r="2.5"
            fill="#A78BFACC"
            style={{ animationDelay: '1s' }}
          />
          <circle
            className="rift-orbit-dot"
            cx="110"
            cy="175"
            r="2"
            fill="#60A5FA99"
            style={{ animationDelay: '1.5s' }}
          />
        </svg>
      </div>
    </div>
  )
}

export { RiftLoading }
