import React from 'react';
import type { LunaMood } from './luna';
import './LunaOwl.scss';

interface LunaOwlProps {
  mood?: LunaMood;
  size?: number;
  talking?: boolean;
  onClick?: () => void;
  title?: string;
}

/**
 * Ms. Luna, drawn rather than emoji'd, so she can actually react:
 * her eyes, brows, beak, wings and blush all change with her mood.
 */
export const LunaOwl: React.FC<LunaOwlProps> = ({
  mood = 'idle',
  size = 96,
  talking = false,
  onClick,
  title
}) => {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      className={`luna-owl mood-${mood} ${talking ? 'is-talking' : ''} ${onClick ? 'is-tappable' : ''}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      title={title ?? (onClick ? 'Tap Ms. Luna' : undefined)}
      aria-label={onClick ? 'Ms. Luna, tap to hear again' : undefined}
      type={onClick ? 'button' : undefined}
    >
      <svg viewBox="0 0 120 124" className="luna-svg" role="img" aria-hidden="true">
        {/* branch shadow */}
        <ellipse className="luna-shadow" cx="60" cy="116" rx="30" ry="5" />

        <g className="luna-body-group">
          {/* wings */}
          <path className="wing wing-left" d="M28 58c-8 6-10 22-4 32 4 7 10 8 13 4 3-5 2-24 0-33-1-4-6-5-9-3z" />
          <path className="wing wing-right" d="M92 58c8 6 10 22 4 32-4 7-10 8-13 4-3-5-2-24 0-33 1-4 6-5 9-3z" />

          {/* tufts */}
          <path className="tuft" d="M32 26c2-9 9-14 14-12 4 2 3 9-1 14-3 4-9 6-13-2z" />
          <path className="tuft" d="M88 26c-2-9-9-14-14-12-4 2-3 9 1 14 3 4 9 6 13-2z" />

          {/* body */}
          <path
            className="body"
            d="M60 14c24 0 38 19 38 44 0 29-16 48-38 48S22 87 22 58c0-25 14-44 38-44z"
          />
          {/* belly */}
          <path
            className="belly"
            d="M60 56c14 0 23 12 23 26 0 13-10 22-23 22s-23-9-23-22c0-14 9-26 23-26z"
          />
          <g className="belly-specks">
            <circle cx="52" cy="76" r="2" />
            <circle cx="68" cy="76" r="2" />
            <circle cx="60" cy="86" r="2" />
          </g>

          {/* face disc */}
          <ellipse className="face-disc" cx="60" cy="48" rx="33" ry="27" />

          {/* eyes */}
          <g className="eye eye-left">
            <circle className="eye-white" cx="46" cy="47" r="13" />
            <circle className="pupil" cx="46" cy="47" r="6" />
            <circle className="glint" cx="43.5" cy="44" r="2.3" />
            <path className="lid" d="M33 47a13 13 0 0 1 26 0z" />
          </g>
          <g className="eye eye-right">
            <circle className="eye-white" cx="74" cy="47" r="13" />
            <circle className="pupil" cx="74" cy="47" r="6" />
            <circle className="glint" cx="71.5" cy="44" r="2.3" />
            <path className="lid" d="M61 47a13 13 0 0 1 26 0z" />
          </g>

          {/* reading glasses */}
          <g className="glasses">
            <circle cx="46" cy="47" r="14.5" />
            <circle cx="74" cy="47" r="14.5" />
            <path d="M60.5 47h-1" />
            <path d="M31.5 45l-7-4" />
            <path d="M88.5 45l7-4" />
          </g>

          {/* brows */}
          <path className="brow brow-left" d="M34 30c6-4 14-4 20 0" />
          <path className="brow brow-right" d="M66 30c6-4 14-4 20 0" />

          {/* blush */}
          <ellipse className="blush blush-left" cx="35" cy="62" rx="7" ry="4.5" />
          <ellipse className="blush blush-right" cx="85" cy="62" rx="7" ry="4.5" />

          {/* beak */}
          <path className="beak" d="M60 55l9 9-9 8-9-8z" />

          {/* feet */}
          <path className="foot" d="M48 106l-5 6M48 106l0 7M48 106l5 6" />
          <path className="foot" d="M72 106l-5 6M72 106l0 7M72 106l5 6" />
        </g>

        {/* mood sparkles, only visible when cheering or surprised */}
        <g className="mood-sparks">
          <path d="M14 30l2.5 5.5L22 38l-5.5 2.5L14 46l-2.5-5.5L6 38l5.5-2.5z" />
          <path d="M106 26l2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2z" />
        </g>

        {/* question marks, only when thinking */}
        <g className="mood-think">
          <text x="99" y="26">?</text>
        </g>

        {/* sleepy z */}
        <g className="mood-zzz">
          <text x="95" y="24">z</text>
        </g>
      </svg>
    </Tag>
  );
};
