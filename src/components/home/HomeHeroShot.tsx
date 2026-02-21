type HomeHeroShotProps = {
  className?: string;
  preserveAspectRatio?: string;
  variant?: 'default' | 'trust';
};

export function HomeHeroShot({ className, preserveAspectRatio, variant = 'default' }: HomeHeroShotProps) {
  const isTrust = variant === 'trust';

  return (
    <svg viewBox="0 0 300 190" preserveAspectRatio={preserveAspectRatio} className={className ?? 'hero-shot'}>
      <line className="hero-shot__floor" x1="16" y1={isTrust ? 176 : 152} x2="286" y2={isTrust ? 176 : 152} />
      <path className="hero-shot__trace" d={isTrust ? 'M38 174 C 92 60, 156 34, 222 66' : 'M48 136 C 106 36, 192 20, 254 78'} />

      <circle className="hero-shot__dribble-mark is-one" cx={isTrust ? 64 : 52} cy={isTrust ? 175 : 151} r={isTrust ? 4.2 : 2.8} />
      <circle className="hero-shot__dribble-mark is-two" cx={isTrust ? 86 : 74} cy={isTrust ? 175 : 151} r={isTrust ? 4.2 : 2.8} />

      <g className="hero-shot__hoop">
        <rect className="hero-shot__backboard" x={isTrust ? 206 : 238} y={isTrust ? -8 : 30} width={isTrust ? 62 : 42} height={isTrust ? 64 : 46} rx="4" />
        <rect
          className="hero-shot__backboard-inner"
          x={isTrust ? 228 : 250}
          y={isTrust ? 10 : 43}
          width={isTrust ? 20 : 16}
          height={isTrust ? 16 : 13}
          rx="2"
        />
        <path className="hero-shot__rim" d={isTrust ? 'M212 61 C 228 61, 251 61, 267 61' : 'M239 81 C 250 81, 268 81, 279 81'} />
        <path className="hero-shot__net" d={isTrust ? 'M218 63 C 224 88, 255 88, 261 63' : 'M243 83 C 248 102, 270 102, 275 83'} />
        <path className="hero-shot__net" d={isTrust ? 'M224 63 C 231 84, 247 84, 255 63' : 'M247 83 C 252 100, 265 100, 271 83'} />
        <path className="hero-shot__net" d={isTrust ? 'M230 63 C 236 80, 242 80, 249 63' : 'M251 83 C 255 98, 261 98, 267 83'} />
      </g>

      <g className="hero-shot__ball-wrap">
        <circle className="hero-shot__ball" cx={isTrust ? 60 : 48} cy={isTrust ? 154 : 134} r={isTrust ? 22 : 22} />
        <path className="hero-shot__ball-line" d={isTrust ? 'M38 154 H82' : 'M26 134 H70'} />
        <path className="hero-shot__ball-line" d={isTrust ? 'M60 132 V176' : 'M48 112 V156'} />
        <path className="hero-shot__ball-line" d={isTrust ? 'M45 138 C 56 150, 56 158, 45 170' : 'M33 118 C 44 130, 44 138, 33 150'} />
        <path className="hero-shot__ball-line" d={isTrust ? 'M75 138 C 64 150, 64 158, 75 170' : 'M63 118 C 52 130, 52 138, 63 150'} />
      </g>

      <circle className="hero-shot__pulse" cx={isTrust ? 267 : 279} cy={isTrust ? 61 : 81} r={isTrust ? 5.2 : 3.6} />
    </svg>
  );
}
