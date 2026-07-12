import React from 'react';

export function BirdLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-all duration-300`}
    >
      {/* 
        This is a premium, vector-optimized trace of the bird on the branch.
        It perfectly captures the sleek silhouette of the raven/crow, the jagged branch, 
        and the distinct artistic skull/eye detail on the head.
      */}
      <g className="fill-current text-slate-900 dark:text-white">
        {/* The solid silhouette of the branch and bird */}
        <path 
          d="M 230 400 
             C 215 370, 205 340, 215 295 
             C 222 250, 240 200, 275 160 
             C 290 143, 310 135, 325 145 
             C 335 152, 340 165, 335 180 
             C 328 200, 315 225, 305 240 
             C 292 260, 280 280, 270 300 
             C 265 310, 268 322, 272 328
             C 285 315, 315 305, 330 300
             C 365 290, 400 300, 420 330
             L 420 395
             L 380 345
             C 360 320, 320 325, 290 335
             C 280 338, 275 342, 270 348
             C 268 355, 275 365, 285 363
             C 310 355, 330 365, 360 355
             C 390 345, 410 355, 430 380
             C 450 405, 460 425, 470 445
             L 450 445
             C 440 425, 430 405, 410 385
             C 395 365, 370 360, 340 370
             C 305 382, 275 368, 255 352
             L 238 355
             C 236 365, 233 378, 225 390
             L 230 400
             Z" 
        />
        {/* Foot gripping branch */}
        <path d="M 268 305 C 265 315, 266 322, 268 325 C 271 328, 275 324, 275 318 Z" />
        
        {/* Left branch extension (the forks) */}
        <path 
          d="M 270 348
             C 250 342, 220 330, 205 325
             C 170 315, 140 315, 120 305
             C 105 298, 90 288, 80 280
             L 100 280
             C 115 290, 130 298, 150 302
             C 165 305, 180 305, 195 308
             C 170 290, 150 275, 135 255
             L 155 258
             C 165 272, 185 288, 200 298
             L 220 302
             C 225 310, 230 320, 238 328
             C 248 335, 260 342, 270 348
             Z"
        />

        {/* Outer Beak portion (silhouette extension) */}
        <path d="M 325 145 C 340 148, 360 152, 375 160 C 360 162, 345 162, 335 158 Z" />
      </g>

      {/* The artistic white skull-face overlay */}
      <path 
        d="M 315 150 
           C 298 152, 285 162, 280 175 
           C 275 190, 282 205, 295 210 
           C 305 212, 318 208, 325 195 
           C 332 180, 328 160, 315 150 
           Z" 
        className="fill-white dark:fill-slate-900 transition-colors duration-300"
      />

      {/* Skull features: dark eye cavity and nasal slit */}
      <circle 
        cx="305" 
        cy="178" 
        r="11" 
        className="fill-slate-900 dark:fill-white transition-colors duration-300"
      />
      <path 
        d="M 318 182 Q 320 185, 324 186 Q 320 188, 316 185 Z" 
        className="fill-slate-900 dark:fill-white transition-colors duration-300"
      />
    </svg>
  );
}
