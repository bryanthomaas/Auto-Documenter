import React from 'react';

/**
 * AsciiClouds Component
 * Ambient monospace ASCII cloud formations rendered behind the landing hero.
 */
export default function AsciiClouds() {
  const cloud1 = [
    "                _                                      ",
    "              (`  ).                   _               ",
    "             (     ).                .:(`  )`.         ",
    "            _(       '`.          .:(`        )        ",
    "        .=(`(      .   )     .--(`  .        ) )       ",
    "       ((    (..__.:'-'   .+(   )   ` _`  ) )          ",
    "       `(       ) )       (   .  )     (   )  )        ",
    "         `.__.-'           `.__.'       `.__.'         "
  ].join('\n');

  const cloud2 = [
    "             _ . - - - . _",
    "          . '             ' .",
    "       . '                   ' .",
    "     (                           )",
    "    (                             )",
    "     (       _ . - - - . _       )",
    "       ' . '               ' . '"
  ].join('\n');

  const cloud3 = [
    "      . - ~ ~ ~ - .                                    . - ~ ~ - .",
    "  . '               ' .                            . '             ' .",
    "(                       )                        (                     )",
    " (       . - ~ ~ - .       )                      (       . - ~ - .     )",
    "  ( . '             ' . )                           ' . '           ' '"
  ].join('\n');

  return (
    <div 
      aria-hidden="true" 
      className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-10"
    >
      {/* Top-Left Atmospheric Cloud Formation */}
      <pre className="absolute -top-4 -left-6 md:top-2 md:left-4 font-mono text-[9px] sm:text-[11px] leading-tight text-[#FEFDFE] opacity-[0.15] pointer-events-none select-none">
        {cloud1}
      </pre>

      {/* Top-Right Ambient Drift */}
      <pre className="absolute top-8 -right-8 md:top-6 md:right-8 font-mono text-[9px] sm:text-[11px] leading-tight text-[#FEFDFE] opacity-[0.15] pointer-events-none select-none">
        {cloud2}
      </pre>

      {/* Mid-Background Distant Horizon Layer */}
      <pre className="hidden md:block absolute top-[440px] left-1/2 -translate-x-1/2 font-mono text-[9px] sm:text-[11px] leading-tight text-[#FEFDFE] opacity-[0.15] pointer-events-none select-none">
        {cloud3}
      </pre>
    </div>
  );
}
